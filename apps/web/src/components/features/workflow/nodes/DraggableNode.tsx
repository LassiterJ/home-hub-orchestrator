import { cn } from '@/utils'
import { events, position, useCompartment, useDraggable } from '@neodrag/react'
import { XYPosition } from '@xyflow/react'
import { useRef } from 'react'

interface DraggableNodeProps {
   className?: string;
   children: React.ReactNode;
   nodeType: string;
   onDrop: (nodeType: string, position: XYPosition) => void;
}


/**
 * DraggableNode
 *
 * Wraps children with NeoDrag's `useDraggable` so sidebar items can be dragged
 * into the workflow canvas. NeoDrag v3 uses a plugin array; passing an options
 * object as the second parameter can cause `plugins.concat is not a function`.
 * We use the `events` plugin to handle drag callbacks correctly.
 */
function DraggableNode({ className, children, nodeType, onDrop }: DraggableNodeProps) {
   const draggableRef = useRef<HTMLDivElement>(null)

   // Static position can be used directly
   const positionComp = useCompartment(
      () => position({ current: { x: 0, y: 0 } }),
      [],
   )


   useDraggable(draggableRef, () => [
      // Use events plugin instead of passing an options object to avoid
      // NeoDrag internally treating it as a plugins array.
      positionComp,
      events({
         onDragEnd: ({ event }: any) => {
            // Emit drop with viewport coordinates so the consumer can translate
            // into flow-space using `screenToFlowPosition`.

            onDrop(nodeType, { x: event.clientX, y: event.clientY })
            console.log('Should Reset')
            positionComp.current = position({ current: { x: 0, y: 0 } })
         },
      }),

   ])

   return (
      <div className={cn('dndnode', className)} ref={draggableRef}>
         {children}
      </div>
   )
}

export { DraggableNode, type DraggableNodeProps }

