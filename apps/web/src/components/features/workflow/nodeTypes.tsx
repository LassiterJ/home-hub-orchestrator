import { NodeTypes } from '@xyflow/react'
import { FormNode, ModelNode, OutputNode, ProcessingNode, TextInputNode } from '@/components/features/workflow/nodes'
import DatabaseSchemaDemo from '@/components/features/workflow/nodes/documentation/DatabaseSchemaNode'
import { Input } from '@/components/ui/Input'
import { ReorderDemoNode2 } from '@/components/features/workflow/nodes/ReorderDemo2'

export const nodeTypes: NodeTypes = {
   input: TextInputNode,
   model: ModelNode,
   processing: ProcessingNode,
   output: OutputNode,
   schema: DatabaseSchemaDemo,
   form: FormNode,
   list: ReorderDemoNode2,
}
export const formNodeFormControlMap = {
   input: Input,

}
export type FormControlRendererKey = keyof typeof formNodeFormControlMap
