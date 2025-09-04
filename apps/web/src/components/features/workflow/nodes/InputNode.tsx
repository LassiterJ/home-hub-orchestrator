import { memo } from 'react'
import { Handle, type NodeProps, Position } from '@xyflow/react'
import { Database } from 'lucide-react'
import {
   BaseNode,
   BaseNodeContent,
   BaseNodeFooter,
   BaseNodeHeader,
   BaseNodeHeaderTitle,
} from '@/components/features/workflow/nodes/BaseNode'
import { type NodeData } from '@/types'

export const InputNode = memo(({ data }: NodeProps & { data: NodeData }) => {
   return (
      <BaseNode>
         <BaseNodeHeader>
            <div className="flex items-center gap-2">
               <div className="p-1.5 rounded bg-node-input/20">
                  <Database size={14} className="text-node-input" />
               </div>
               <BaseNodeHeaderTitle className="text-sm">
                  {data.label}
               </BaseNodeHeaderTitle>
            </div>
         </BaseNodeHeader>

         <BaseNodeContent>
            <p className="text-xs text-left text-muted-foreground">{data.description}</p>
         </BaseNodeContent>

         <BaseNodeFooter className="flex justify-end">
            <div className="text-xs bg-node-input/10 text-node-input px-2 py-1 rounded-full">
               INPUT
            </div>
         </BaseNodeFooter>


         <Handle
            type="target"
            position={Position.Left}
            className="!w-2 !h-2 !bg-node-input !border-2 !border-white"
         />
         <Handle
            type="source"
            position={Position.Right}
            className="!w-2 !h-2 !bg-node-input !border-2 !border-white"
         />
      </BaseNode>
   )
})

InputNode.displayName = 'InputNode'
