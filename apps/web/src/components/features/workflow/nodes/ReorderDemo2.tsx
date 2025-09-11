import { memo, useMemo, useRef } from 'react'
import { NodeProps, useReactFlow } from '@xyflow/react'
import {
   axis,
   bounds,
   BoundsFrom,
   ControlFrom,
   controls,
   events,
   threshold,
   touchAction,
   useDraggable,
} from '@neodrag/react'
import { getNewUUID } from '@/utils'

type ListNodeData = { items: { id: string; label: string }[] };

const list = [{ id: getNewUUID({}), label: 'testItem1' }, {
   id: getNewUUID({}),
   label: 'testItem2',
}, { id: getNewUUID({}), label: 'testItem3' }]
export const ReorderDemoNode2 = memo(({ id, data }: NodeProps<{
   items: ListNodeData['items']
}>) => {
   const rf = useReactFlow()
   const listRef = useRef<HTMLUListElement>(null)

   return (
      <div className="node-shell">
         <ul ref={listRef} className="list nodrag nopan nowheel" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {list.map((item, index) => ( //TODO: change to data prop
               <HitTestRow
                  key={item.id}
                  nodeId={id}
                  index={index}
                  listRef={listRef}
                  onCommit={(from, to) => {
                     if (from === to) return
                     rf.updateNodeData(id, (node) => {
                        const copy = node.data.items.slice()
                        const [it] = copy.splice(from, 1)
                        copy.splice(to, 0, it)
                        return { items: copy }
                     })
                  }}
               >
                  {item.label}
               </HitTestRow>
            ))}
         </ul>
      </div>
   )
})

export function HitTestRow({ nodeId, index, listRef, onCommit, children }: {
   nodeId: string;
   index: number;
   listRef: React.RefObject<HTMLUListElement>;
   onCommit: (from: number, to: number) => void;
   children: React.ReactNode;
}) {
   const ref = useRef<HTMLLIElement>(null)
   const startIndexRef = useRef(index)
   const startTopRef = useRef(0)
   const heightRef = useRef(0)

   const getSiblings = () => Array.from(listRef.current?.querySelectorAll<HTMLLIElement>('li.row') ?? [])

   const plugins = useMemo(() => [
      axis('y'),
      bounds(BoundsFrom.parent()),
      controls({ allow: ControlFrom.selector('[data-drag-handle]') }),
      threshold({ distance: 3 }),
      touchAction('none'),
      events({
         onDragStart: () => {
            startIndexRef.current = index
            const rect = ref.current?.getBoundingClientRect()
            startTopRef.current = rect?.top ?? 0
            heightRef.current = rect?.height ?? 0
         },
         onDrag: ({ currentNode, offset }) => {
            if (!(currentNode instanceof HTMLElement)) return
            const currentCenter = startTopRef.current + (heightRef.current / 2) + offset.y
            const siblings = getSiblings()
            const mids = siblings.map((el) => {
               const r = el.getBoundingClientRect()
               return (r.top + r.bottom) / 2
            })
            // Determine target index by first midpoint greater than current center
            let to = mids.findIndex((mid) => currentCenter < mid)
            if (to === -1) to = mids.length - 1
            onCommit(startIndexRef.current, to)
            currentNode.style.transform = ''
         },
      }),
   ], [index])

   useDraggable(ref, plugins)

   return (
      <li ref={ref} className="row nodrag nopan nowheel" style={{ display: 'flex', alignItems: 'center' }}>
         <span data-drag-handle style={{ cursor: 'grab', paddingRight: 8 }}>⋮⋮</span>
         <span>{children}</span>
      </li>
   )
}
