import { NodeTypes } from '@xyflow/react'
import { ModelNode, OutputNode, ProcessingNode, TextInputNode } from '@/components/features/workflow/nodes'
import DatabaseSchemaDemo from '@/components/features/workflow/nodes/documentation/DatabaseSchemaNode'
import { Input } from '@/components/ui/Input'
import { FormNode } from '@/components/features/workflow/nodes/FormNodeV2'

export const nodeTypes: NodeTypes = {
   input: TextInputNode,
   model: ModelNode,
   processing: ProcessingNode,
   output: OutputNode,
   schema: DatabaseSchemaDemo,
   form: FormNode,
}
export const formNodeFormControlMap = {
   input: Input,

}
export type FormControlRendererKey = keyof typeof formNodeFormControlMap
