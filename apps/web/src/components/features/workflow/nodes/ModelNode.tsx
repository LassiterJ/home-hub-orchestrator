import { memo } from 'react'
import { Handle, NodeProps, Position } from '@xyflow/react'
import { Brain } from 'lucide-react'
import { NodeData } from '@/types'
import { BaseNode, BaseNodeContent, BaseNodeFooter, BaseNodeHeader, BaseNodeHeaderTitle } from './BaseNode'

export const ModelNode = memo(({ data }: NodeProps & { data: NodeData }) => {
   return (
      <BaseNode className="min-w-[180px]">
         {/* Header */}
         <BaseNodeHeader>
            <div className="p-1.5 rounded bg-node-model/20">
               <Brain size={14} className="text-node-model" />
            </div>
            <BaseNodeHeaderTitle>{data.label}</BaseNodeHeaderTitle>
         </BaseNodeHeader>

         {/* Description */}
         <BaseNodeContent>
            <p className="text-xs text-muted-foreground">{data.description}</p>
         </BaseNodeContent>

         {/* Footer */}
         <BaseNodeFooter className="flex flex-row justify-between items-center">
            <div className="text-xs bg-node-model/10 text-node-model px-2 py-1 rounded-full">
               MODEL
            </div>
            <div className="text-xs text-muted-foreground">v1.0</div>
         </BaseNodeFooter>

         {/* Handles */}
         <Handle
            type="target"
            position={Position.Left}
            className="w-2! h-2! !bg-node-model border-2! border-white!"
         />
         <Handle
            type="source"
            position={Position.Right}
            className="w-2! h-2! !bg-node-model border-2! border-white!"
         />
      </BaseNode>
   )
})

ModelNode.displayName = 'ModelNode'
