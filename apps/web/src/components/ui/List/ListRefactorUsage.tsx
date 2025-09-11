// @ts-nocheck
/**
 * Proposed usage examples for a refactored, composable List API.
 *
 * - This file does NOT implement behavior; it demonstrates desired DX only.
 * - The API below assumes child-based composition (no render functions):
 *   - <List ...> wraps DnD behavior and manages reorder (controlled or uncontrolled)
 *   - <List.Item id value asChild?> registers an item and wires DnD/drop-indicator
 *   - <List.Handle> marks the drag handle region (optional; defaults to whole item)
 *
 * Why this shape:
 * - Children-first customization lets parent own markup/styles
 * - Clear separation of concerns: List = behavior, children = presentation
 */

import { GripVertical } from 'lucide-react'
import { useMemo, useState } from 'react'
import { List } from './List' // using current name; API below is proposed for refactor
import { Status } from './Status'
import { getTasks, type TTask } from './taskData'

/**
 * Minimal uncontrolled example
 *
 * - Parent provides `defaultItems` and `getId`
 * - Parent renders items as children via <List.Item>
 */
export function UncontrolledListWithChildren() {
   const defaultItems = useMemo(() => getTasks(), [])

   return (
      <List
         /*
          * Proposed props
          * - defaultItems: initial items for uncontrolled mode
          * - getId: identity selector for stable keys and DnD data
          * - className/listClassName: layout styling hooks
          */
         defaultItems={defaultItems}
         getId={(t: TTask) => t.id}
         className="pt-6 my-0 mx-auto w-[420px]"
         listClassName="flex flex-col gap-2 border border-solid rounded p-2"
      >
         {defaultItems.map((task) => (
            <List.Item key={task.id} id={task.id} value={task}>
               <div
                  className="flex text-sm bg-white flex-row items-center border border-solid rounded p-2 pl-0 hover:bg-slate-100">
                  <div className="w-6 flex justify-center">
                     <List.Handle>
                        <GripVertical size={10} />
                     </List.Handle>
                  </div>
                  <span className="truncate grow shrink">{task.content}</span>
                  <Status status={task.status} />
               </div>
            </List.Item>
         ))}
      </List>
   )
}

/**
 * Controlled example
 *
 * - Parent owns state and passes `items` + `onReorder`
 * - Optional callbacks for drag lifecycle
 */
export function ControlledList() {
   const [items, setItems] = useState<TTask[]>(() => getTasks())

   return (
      <List
         items={items}
         getId={(t: TTask) => t.id}
         onReorder={(next: TTask[]) => setItems(next)}
         onDragStart={(item: TTask) => {
            // e.g., analytics or UI hints
            console.debug('drag start', item.id)
         }}
         onDragEnd={({ fromId, toId, closestEdge }) => {
            console.debug('drag end', { fromId, toId, closestEdge })
         }}
      >
         {items.map((task) => (
            <List.Item key={task.id} id={task.id} value={task}>
               <div className="flex text-sm bg-white flex-row items-center border border-dashed rounded p-2 pl-0">
                  <div className="w-6 flex justify-center">
                     <List.Handle>
                        <GripVertical size={10} />
                     </List.Handle>
                  </div>
                  <div className="flex flex-col grow">
                     <span className="truncate font-medium">{task.content}</span>
                     <span className="text-[10px] text-slate-500">id: {task.id}</span>
                  </div>
                  <Status status={task.status} />
               </div>
            </List.Item>
         ))}
      </List>
   )
}

/**
 * Using asChild to fully control the wrapper element
 *
 * - <List.Item asChild> will not render its own wrapper; it will clone the child and wire DnD refs/props
 * - This mirrors Radix UI's `asChild` pattern
 */
export function AsChildItemExample() {
   const items = useMemo(() => getTasks().slice(0, 3), [])

   return (
      <List defaultItems={items} getId={(t: TTask) => t.id}>
         {items.map((task) => (
            <List.Item key={task.id} id={task.id} value={task} asChild>
               <article className="flex items-center justify-between rounded border p-2">
                  <div className="inline-flex items-center gap-2">
                     <List.Handle>
                        <GripVertical size={12} />
                     </List.Handle>
                     <h3 className="m-0 text-xs font-semibold">{task.content}</h3>
                  </div>
                  <Status status={task.status} />
               </article>
            </List.Item>
         ))}
      </List>
   )
}

/**
 * Horizontal list with custom indicator gap/color
 *
 * - axis: 'horizontal' with left/right edges
 * - dropIndicatorGap: spacing calibration between items
 * - dropIndicatorClassName: theming (e.g., brand color)
 */
export function HorizontalListExample() {
   const items = useMemo(() => getTasks().slice(0, 5), [])

   return (
      <List
         defaultItems={items}
         getId={(t: TTask) => t.id}
         axis="horizontal"
         allowedEdges={['left', 'right']}
         listClassName="flex flex-row gap-2 border border-solid rounded p-2"
         dropIndicatorGap="12px"
         dropIndicatorClassName="bg-fuchsia-700 before:border-fuchsia-700"
      >
         {items.map((task) => (
            <List.Item key={task.id} id={task.id} value={task}>
               <div className="min-w-[180px] flex items-center gap-2 rounded border p-2">
                  <List.Handle>
                     <GripVertical size={12} />
                  </List.Handle>
                  <span className="truncate">{task.content}</span>
               </div>
            </List.Item>
         ))}
      </List>
   )
}

/**
 * Disabling flourish and sticky targets
 *
 * - disablePostMoveFlash prevents the flash animation
 * - stickyDropTarget={false} disables stickiness if you prefer precise hitbox-only indicators
 */
export function BehaviorTogglesExample() {
   const items = useMemo(() => getTasks().slice(0, 4), [])

   return (
      <List
         defaultItems={items}
         getId={(t: TTask) => t.id}
         disablePostMoveFlash
         stickyDropTarget={false}
      >
         {items.map((task) => (
            <List.Item key={task.id} id={task.id} value={task}>
               <div className="flex items-center gap-2 rounded border p-2">
                  <List.Handle>
                     <GripVertical size={12} />
                  </List.Handle>
                  <span className="truncate">{task.content}</span>
                  <Status status={task.status} />
               </div>
            </List.Item>
         ))}
      </List>
   )
}

/**
 * Notes on the proposed API surface (for reference during implementation):
 *
 * <List>
 * - items?: T[]                 // controlled
 * - defaultItems?: T[]          // uncontrolled
 * - onReorder?: (next: T[]) => void
 * - axis?: 'vertical' | 'horizontal'
 * - allowedEdges?: Array<'top' | 'bottom' | 'left' | 'right'>
 * - getId: (item: T) => string
 * - className?: string
 * - listClassName?: string
 * - dropIndicatorGap?: string
 * - dropIndicatorClassName?: string
 * - stickyDropTarget?: boolean
 * - disablePostMoveFlash?: boolean
 * - onDragStart?: (item: T) => void
 * - onDragOver?: (overId: string, closest: 'top'|'bottom'|'left'|'right'|null) => void
 * - onDragEnd?: (args: { fromId: string; toId: string; closestEdge: 'top'|'bottom'|'left'|'right'|null }) => void
 *
 * <List.Item>
 * - id: string                  // required for DnD identity
 * - value?: T                   // echoed back in callbacks (optional)
 * - asChild?: boolean           // adopt child element via clone
 * - allowedEdges?: Array<'top' | 'bottom' | 'left' | 'right'> // per-item override
 * - stickyDropTarget?: boolean  // per-item override
 *
 * <List.Handle>
 * - asChild?: boolean           // wrap arbitrary handle element
 */


