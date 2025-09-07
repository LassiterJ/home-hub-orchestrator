'use client'

import { BaseHandle } from '@/components/features/workflow/handles/BaseHandle'
import { Button } from '@/components/ui/Button/'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { type NodeData } from '@/types'
import { type Node, NodeProps, NodeToolbar, Position } from '@xyflow/react'
import { Edit, FileText, Info, LucideIcon, Maximize2 } from 'lucide-react'
import { BaseNode, BaseNodeContent, BaseNodeFooter, BaseNodeHeader, BaseNodeHeaderTitle } from './BaseNode'
import { GroupNode, type GroupNodeProps } from '@/components/features/workflow/nodes/GroupNode'
import { memo, useMemo, useState } from 'react'
import { NodeStatus } from '@/components/features/workflow/NodeStatusIndicator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/ToggleGroup'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'

/**
 * Notes:
 * The form node supports an "edit" mode which changes the view to have the window panes and the form display
 * node changes to this group node containing individual input nodes.
 * */
export const EditFormView = memo((props: GroupNodeProps) => <GroupNode {...props} />)

/**
 * FormNode component for workflow forms
 *
 * A specialized node component that displays a form interface within a workflow.
 * Purpose: to allow inputs into the workflow like files or workflow configuration. Anywhere you would need a form.
 * Features a header with form icon, title, and info tooltip, an empty content
 * area for form fields, and a footer with a submit button.
 */


type FormInputData = NodeData & {
   text?: string,
   status?: NodeStatus,
   icon?: LucideIcon,
   onSubmit?: () => void,
   disabled: boolean,
   className: string
};
export type FormNode = Node<FormInputData, 'text'>

// Field definition is generic over a Zod schema type `T`
// `name` must be a key of the inferred form values from `T`.
// `Control` is any React component that accepts standard input-like props.
// You can tighten this later to your component library’s exact prop types.
type FieldForSchema<T extends z.ZodTypeAny> = {
   name: keyof z.infer<T> & string
   label: string
   placeholder?: string
   Control: React.ComponentType<React.ComponentProps<typeof Input>>
   description?: string
}

function FormView<T extends z.ZodTypeAny>(
   {
      formSchema,
      fieldsData,
   }: {
      formSchema: T
      fieldsData: Array<FieldForSchema<T>>
   },
) {
   const form = useForm<z.infer<T>>({
      resolver: zodResolver(formSchema),
      // If you want explicit defaults, compute them from fieldsData.
      defaultValues: {} as z.infer<T>,
   })

   const populatedFields = useMemo(() => {
      return fieldsData.map((fieldDef) => {
         const { name, label, placeholder, Control, description } = fieldDef
         return (
            <FormField
               key={name}
               control={form.control}
               name={name as any}
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>{label}</FormLabel>
                     <FormControl>
                        <Control placeholder={placeholder} {...field} />
                     </FormControl>
                     {description ? (
                        <FormDescription>{description}</FormDescription>
                     ) : null}
                     <FormMessage />
                  </FormItem>
               )}
            />
         )
      })
   }, [fieldsData, form.control])

   function onSubmit(values: z.infer<T>) {
      console.log('onFormSubmit, values: ', values)
   }

   return (
      <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {populatedFields}
            {/*<Button type="submit">Submit</Button>*/}
         </form>
      </Form>
   )
}

export function FormNode({ data, selected }: NodeProps<FormNode>) {
   const {
      label,
      description = 'Form node for data collection and submission',
      status = 'initial',
      icon = FileText,
      onSubmit,
      disabled = false,
      className,
      ...restData
   } = data
   const Icon = icon
   const [isEditing, setIsEditing] = useState(false)
   const [isResizing, setIsResizing] = useState(false)
   // For now, use an empty schema; replace with your real, generated Zod object later.
   const [formSchema, setFormSchema] = useState<z.ZodTypeAny>(() => z.object({}))

   const fieldsData = useMemo(() => {
      return [
         {
            name: 'testName',
            label: 'Test Field Label',
            placeholder: 'Test Placeholder',
            Control: Input,
            description: 'test field description',
         },
      ] as Array<FieldForSchema<typeof formSchema>>
      // Note: when you replace the schema with a concrete z.object({...}), update this typing accordingly.
   }, [formSchema])

   // ToggleGroup passes an array of selected values when type="multiple"
   function handleToggleGroupValueChange(values: string[]) {
      setIsEditing(values.includes('edit'))
      setIsResizing(values.includes('resize'))
   }

   console.log('selected: ', selected)
   return (
      <>
         <NodeToolbar isVisible={selected}>
            <ToggleGroup aria-label="Toggle node editing and resizing modes"
                         onValueChange={handleToggleGroupValueChange} variant="default" type="multiple"
                         className="gap-1">
               <ToggleGroupItem value="resize" aria-label="Resize node">
                  <Maximize2 className="h-4 w-4" />
               </ToggleGroupItem>
               <ToggleGroupItem value="edit" aria-label="Edit node">
                  <Edit className="h-4 w-4" />
               </ToggleGroupItem>
            </ToggleGroup>
         </NodeToolbar>
         <BaseNode className={className} status={status} resizeable={true} isResizing={isResizing} {...restData}>
            {/* Header with form icon, title, and info tooltip */}
            <BaseNodeHeader>
               <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <BaseNodeHeaderTitle>{label}</BaseNodeHeaderTitle>
               </div>

               <Tooltip>
                  <TooltipTrigger asChild>
                     <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Show form description"
                     >
                        <Info className="h-4 w-4" />
                     </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                     <p className="text-sm">{description}</p>
                  </TooltipContent>
               </Tooltip>
            </BaseNodeHeader>

            {/* Empty content area for form fields */}
            <BaseNodeContent>
               {isEditing ? (
                  // EDIT MODE: render an empty placeholder (for now) to indicate builder canvas
                  <div className="min-h-[160px] h-full w-full rounded-md bg-muted/40 border border-dashed" />
               ) : (
                  // DISPLAY MODE
                  <FormView formSchema={formSchema} fieldsData={fieldsData as any} />
               )}
            </BaseNodeContent>

            {/* Footer with submit button */}
            <BaseNodeFooter>
               <Button
                  onClick={onSubmit}
                  disabled={disabled}
                  className="w-full"
                  size="sm"
               >
                  Submit
               </Button>
            </BaseNodeFooter>
            <BaseHandle
               type="source"
               position={Position.Left}
            />
            <BaseHandle
               type="target"
               position={Position.Right}
            />
         </BaseNode>
      </>

   )
}
