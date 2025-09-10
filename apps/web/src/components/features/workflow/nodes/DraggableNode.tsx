import { cn } from '@/utils'
import { type DragEventData, events, position, useCompartment, useDraggable } from '@neodrag/react'
import { useRef } from 'react'
import { type handleNodeDragArgs, type handleNodeDropArgs } from '@/components/features/workflow/WorkflowSidebar'


interface DraggableNodeProps {
   className?: string;
   children: React.ReactNode;
   nodeType: string;
   onDrag: (args: handleNodeDragArgs) => void;
   onDrop: (args: handleNodeDropArgs) => void;
}


/**
 * DraggableNode
 *
 * Wraps children with NeoDrag's `useDraggable` so sidebar items can be dragged
 * into the workflow canvas. NeoDrag v3 uses a plugin array; passing an options
 * object as the second parameter can cause `plugins.concat is not a function`.
 * We use the `events` plugin to handle drag callbacks correctly.
 */
function DraggableNode({ className, children, nodeType, onDrag, onDrop }: DraggableNodeProps) {
   const draggableRef = useRef<HTMLDivElement>(null)
   // Static position can be used directly
   const positionComp = useCompartment(
      () => position({ current: { x: 0, y: 0 } }),
      [],
   )
   const dragEvents = {
      onDrag: ({ event, currentNode: currentDragNode }: DragEventData) => {
         onDrag({ currentDragNode, screenPosition: { x: event.clientX, y: event.clientY } })
      },
      onDragEnd: ({ event, currentNode: currentDragNode }: DragEventData) => {
         onDrop({ nodeType, currentDragNode, screenPosition: { x: event.clientX, y: event.clientY } })
         console.log('Should Reset')
         positionComp.current = position({ current: { x: 0, y: 0 } })
      },
   }
   useDraggable(draggableRef, () => [
      // Use events plugin instead of passing an options object to avoid
      // NeoDrag internally treating it as a plugins array.
      positionComp,
      events(dragEvents),

   ])

   return (
      <div className={cn('dndnode', className)} ref={draggableRef}>
         {children}
      </div>
   )
}

export { DraggableNode, type DraggableNodeProps }

