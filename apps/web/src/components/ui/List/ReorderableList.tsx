import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash'
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types'
import { reorderWithEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { draggable, dropTargetForElements, monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview'
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview'
import type { ReactElement, ReactNode } from 'react'
import {
   Children,
   cloneElement,
   createContext,
   isValidElement,
   useContext,
   useEffect,
   useId,
   useMemo,
   useRef,
   useState,
} from 'react'
import invariant from 'tiny-invariant'
import { DropIndicator } from './DropIndicator'

/**
 * Reorderable List (child-composed API)
 *
 * - Controlled or uncontrolled via `items` / `defaultItems` + `onReorder`
 * - Child-first composition: <List> wraps behavior, <List.Item> wires DnD to your markup
 * - Optional <List.Handle> restricts drag start to a specific region
 * - Supports `asChild` on Item and Handle to adopt DOM children
 *
 * Notes:
 * - Frontend logging intentionally omitted per project guidance [[memory:8479903]].
 */

// Unique symbol to tag drag data to avoid cross-feature collisions
const listItemDataKey: unique symbol = Symbol('reorderable-list-item')

/**
 * Drag data payload stored in pragmatic's data channel
 */
type ListItemDragData = {
   [listItemDataKey]: true;
   listId: string;
   itemId: string;
}

/** Type guard for our drag data */
function isListItemDragData(data: Record<string | symbol, unknown>): data is ListItemDragData {
   return data[listItemDataKey] === true
}

type Axis = 'vertical' | 'horizontal'

/** Public props for List */
export interface ListProps<T> {
   /** Controlled items */
   items?: T[]
   /** Uncontrolled initial items */
   defaultItems?: T[]
   /** Reorder callback for controlled usage */
   onReorder?: (next: T[]) => void
   /** Derive unique id for each item */
   getId: (item: T) => string
   /** Layout axis */
   axis?: Axis
   /** Allowed edges for insertion (defaults based on axis) */
   allowedEdges?: Edge[]
   /** Container className hooks */
   className?: string
   listClassName?: string
   /** Drop indicator tuning */
   dropIndicatorGap?: string
   dropIndicatorClassName?: string
   /** Behavior flags */
   stickyDropTarget?: boolean
   disablePostMoveFlash?: boolean
   /** Callbacks */
   onDragStart?: (item: T) => void
   onDragEnd?: (args: { fromId: string; toId: string; closestEdge: Edge | null }) => void
   /** Children must be <List.Item> instances */
   children: ReactNode
}

/** Context shared from List to its Items */
interface ListContextShape<T> {
   listId: string
   axis: Axis
   allowedEdges: Edge[]
   stickyDropTarget: boolean
   getItemById: (id: string) => T | undefined
   getIndexById: (id: string) => number
   setItems: (updater: (prev: T[]) => T[]) => void
   setItemsDirect: (next: T[]) => void
   isControlled: boolean
   onDragStart?: (item: T) => void
   onDragEnd?: (args: { fromId: string; toId: string; closestEdge: Edge | null }) => void
   /** element registry for post-move flourish */
   registerItemElement: (id: string, el: HTMLElement | null) => void
   findItemElement: (id: string) => HTMLElement | null
   dropIndicatorGap: string
   dropIndicatorClassName?: string
}

const ListContext = createContext<ListContextShape<any> | null>(null)

/** Item-local context for Handle registration */
interface ItemContextShape {
   setHandleElement: (el: HTMLElement | null) => void
}

const ItemContext = createContext<ItemContextShape | null>(null)

/**
 * List component implementation
 */
export function List<T>(props: ListProps<T>) {
   const {
      items,
      defaultItems,
      onReorder,
      getId,
      axis = 'vertical',
      allowedEdges: allowedEdgesProp,
      className,
      listClassName,
      dropIndicatorGap = '8px',
      dropIndicatorClassName,
      stickyDropTarget = true,
      disablePostMoveFlash = false,
      onDragStart,
      onDragEnd,
      children,
   } = props

   const listId = useId()
   const isControlled = items !== undefined
   const [uncontrolled, setUncontrolled] = useState<T[]>(() => defaultItems ?? [])
   const currentItems = isControlled ? (items as T[]) : uncontrolled

   // Element registry for post move flash (avoid querySelector)
   const registryRef = useRef<Map<string, HTMLElement>>(new Map())

   const allowedEdges: Edge[] = useMemo(() => {
      if (allowedEdgesProp && allowedEdgesProp.length) return allowedEdgesProp
      return axis === 'vertical' ? ['top', 'bottom'] : ['left', 'right']
   }, [allowedEdgesProp, axis])

   const getItemById = (id: string): T | undefined => currentItems.find((i) => getId(i) === id)
   const getIndexById = (id: string): number => currentItems.findIndex((i) => getId(i) === id)

   const setItems = (updater: (prev: T[]) => T[]) => {
      if (isControlled) {
         const next = updater(currentItems)
         onReorder?.(next)
      } else {
         setUncontrolled((prev) => updater(prev))
      }
   }

   const setItemsDirect = (next: T[]) => {
      if (isControlled) {
         onReorder?.(next)
      } else {
         setUncontrolled(next)
      }
   }

   /**
    * Global drop monitor to perform list-level reordering.
    */
   useEffect(() => {
      return monitorForElements({
         canMonitor({ source }) {
            return isListItemDragData(source.data)
         },
         onDrop({ location, source }) {
            const target = location.current.dropTargets[0]
            if (!target) return

            const sourceData = source.data
            const targetData = target.data

            if (!isListItemDragData(sourceData) || !isListItemDragData(targetData)) return
            if (sourceData.listId !== listId || targetData.listId !== listId) return

            const startIndex = getIndexById(sourceData.itemId)
            const indexOfTarget = getIndexById(targetData.itemId)
            if (startIndex < 0 || indexOfTarget < 0) return

            const closestEdgeOfTarget = extractClosestEdge(targetData)

            const next = reorderWithEdge({
               list: currentItems,
               startIndex,
               indexOfTarget,
               closestEdgeOfTarget,
               axis,
            })

            setItemsDirect(next)

            if (!disablePostMoveFlash) {
               const el = registryRef.current.get(sourceData.itemId)
               if (el) triggerPostMoveFlash(el)
            }

            onDragEnd?.({ fromId: sourceData.itemId, toId: targetData.itemId, closestEdge: closestEdgeOfTarget })
         },
      })
   }, [axis, currentItems, disablePostMoveFlash, listId, onDragEnd])

   const ctx = useMemo<ListContextShape<T>>(
      () => ({
         listId,
         axis,
         allowedEdges,
         stickyDropTarget,
         getItemById,
         getIndexById,
         setItems,
         setItemsDirect,
         isControlled,
         onDragStart,
         onDragEnd,
         registerItemElement: (id, el) => {
            if (!el) {
               registryRef.current.delete(id)
            } else {
               registryRef.current.set(id, el)
            }
         },
         findItemElement: (id) => registryRef.current.get(id) ?? null,
         dropIndicatorGap,
         dropIndicatorClassName,
      }), [
         allowedEdges,
         axis,
         dropIndicatorClassName,
         dropIndicatorGap,
         getIndexById,
         getItemById,
         isControlled,
         listId,
         onDragEnd,
         onDragStart,
         stickyDropTarget,
      ],
   )

   return (
      <div className={className}>
         <div className={listClassName}>
            <ListContext.Provider value={ctx}>{children}</ListContext.Provider>
         </div>
      </div>
   )
}

/** Props for List.Item */
export interface ListItemProps<T> {
   id: string
   value?: T
   asChild?: boolean
   allowedEdges?: Edge[]
   stickyDropTarget?: boolean
   children: ReactNode
}

/** Internal visual state for indicator */
type ItemState =
   | { type: 'idle' }
   | { type: 'over'; closest: Edge | null }

/**
 * List.Item wires DnD behavior to an item container.
 *
 * - Registers as a drop target (sticky or not), publishing closest edge metadata
 * - Registers a draggable source on a child handle, or the container when no handle is provided
 * - Renders a DropIndicator when a drag is over this item
 */
function ListItemImpl<T>({ id, value, asChild, allowedEdges, stickyDropTarget, children }: ListItemProps<T>) {
   const list = useContext(ListContext) as ListContextShape<T> | null
   invariant(list)

   const containerRef = useRef<HTMLDivElement | null>(null)
   const handleRef = useRef<HTMLElement | null>(null)
   const [state, setState] = useState<ItemState>({ type: 'idle' })

   // Combine per-item overrides with list defaults
   const edges = allowedEdges && allowedEdges.length ? allowedEdges : list.allowedEdges
   const sticky = stickyDropTarget ?? list.stickyDropTarget

   useEffect(() => {
      const container = containerRef.current
      invariant(container)

      // If a handle exists, drag is bound to the handle; otherwise, the whole container is draggable.
      const dragEl = handleRef.current ?? container

      return combine(
         draggable({
            element: dragEl,
            getInitialData() {
               return { [listItemDataKey]: true, listId: list.listId, itemId: id }
            },
            onGenerateDragPreview({ nativeSetDragImage }) {
               // Small native preview to keep UI responsive
               setCustomNativeDragPreview({
                  nativeSetDragImage,
                  getOffset: pointerOutsideOfPreview({ x: '16px', y: '8px' }),
                  render() {
                  },
               })
            },
            onDragStart() {
               if (value !== undefined) {
                  list.onDragStart?.(value)
               }
            },
         }),
         dropTargetForElements({
            element: container,
            canDrop: ({ source }) => {
               if (!isListItemDragData(source.data)) return false
               if (source.data.listId !== list.listId) return false
               // disallow dropping on yourself
               return source.data.itemId !== id
            },
            getData: ({ input }) => {
               const data: ListItemDragData = { [listItemDataKey]: true, listId: list.listId, itemId: id }
               return attachClosestEdge(data, { element: container, input, allowedEdges: edges })
            },
            getIsSticky: () => sticky,
            onDragEnter: ({ self }) => {
               setState({ type: 'over', closest: extractClosestEdge(self.data) })
            },
            onDrag: ({ self }) => {
               const closest = extractClosestEdge(self.data)
               setState((prev) => (prev.type === 'over' && prev.closest === closest ? prev : { type: 'over', closest }))
            },
            onDragLeave: () => setState({ type: 'idle' }),
            onDrop: () => setState({ type: 'idle' }),
         }),
      )
   }, [edges.join(','), id, list.listId, list.onDragStart, sticky, value])

   // Register element for flourish lookups
   useEffect(() => {
      list.registerItemElement(id, containerRef.current)
      return () => list.registerItemElement(id, null)
   }, [id, list])

   // Provide a means for <List.Handle> to register its element
   const itemCtx = useMemo<ItemContextShape>(() => ({
      setHandleElement: (el) => {
         handleRef.current = el
      },
   }), [])

   // Render wrapper: either adopt child (asChild) or wrap in a div
   const indicator = state.type === 'over' && state.closest ? (
      <DropIndicator edge={state.closest} gap={list.dropIndicatorGap} />
   ) : null

   // Clone child to attach ref when asChild=true
   if (asChild) {
      const only = Children.only(children as ReactElement)
      invariant(isValidElement(only), 'asChild requires a single valid element child')
      const merged = cloneElement(only as any, { ref: containerRef })
      return (
         <ItemContext.Provider value={itemCtx}>
            <div className="relative">
               {merged}
               {/* allow theming via wrapper if needed */}
               <div className={list.dropIndicatorClassName}>{indicator}</div>
            </div>
         </ItemContext.Provider>
      )
   }

   return (
      <ItemContext.Provider value={itemCtx}>
         <div className="relative">
            <div ref={containerRef}>{children}</div>
            <div className={list.dropIndicatorClassName}>{indicator}</div>
         </div>
      </ItemContext.Provider>
   )
}

/**
 * List.Handle restricts drag initiation to a specific region.
 * - If omitted, the whole item container acts as the drag source.
 */
function ListHandle({ asChild, children }: { asChild?: boolean; children: ReactNode }) {
   const item = useContext(ItemContext)
   invariant(item, 'List.Handle must be used within a List.Item')

   const refCb = (el: HTMLElement | null) => item.setHandleElement(el)

   if (asChild) {
      const only = Children.only(children as ReactElement)
      invariant(isValidElement(only), 'asChild requires a single valid element child')
      return cloneElement(only as any, { ref: refCb })
   }

   return <div ref={refCb}>{children}</div>
}

// Attach sub-components
List.Item = ListItemImpl as unknown as <T>(props: ListItemProps<T>) => ReactElement | null
List.Handle = ListHandle as unknown as (props: { asChild?: boolean; children: ReactNode }) => ReactElement | null

export type { Edge }


