import { type ChangeEvent, memo, useCallback } from 'react'
import { type Node, type NodeProps, Position, useReactFlow } from '@xyflow/react'
import { Database } from 'lucide-react'
import {
   BaseNode,
   BaseNodeContent,
   BaseNodeFooter,
   BaseNodeHeader,
   BaseNodeHeaderTitle,
} from '@/components/features/workflow/nodes/BaseNode'
import { Input } from '@/components/ui/Input'
import { BaseHandle } from '@/components/features/workflow/handles/BaseHandle'
import { NodeData } from '@/types'

type TexInputData = NodeData & { text?: string };
export type TextInputNode = Node<TexInputData, 'text'>
export const TextInputNode = memo(({ id, data, ...restProps }: NodeProps<TextInputNode>) => {
   const { updateNodeData } = useReactFlow()

   const handleOnChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, { text: e.target.value })
   }, [])

   return (
      <BaseNode {...restProps}>
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
            <Input type={'text'} className="w-full" onChange={handleOnChange} />
         </BaseNodeContent>

         <BaseNodeFooter className="flex justify-end">
            <div className="text-xs bg-node-input/10 text-node-input px-2 py-1 rounded-full">

            </div>
         </BaseNodeFooter>


         <BaseHandle
            type="target"
            position={Position.Left}
            className=" !bg-node-input !border-2 !border-white"
         />
         <BaseHandle
            type="source"
            position={Position.Right}
            className="!bg-node-input !border-2 !border-white"
         />
      </BaseNode>
   )
})

TextInputNode.displayName = 'TextInputNode'
