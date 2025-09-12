import { BaseHandle } from '@/components/features/workflow/handles/BaseHandle'
import { NodeAppendix } from '@/components/features/workflow/NodeAppendix'
import { Button } from '@/components/ui/Button/'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { List } from '@/components/ui/List/ReorderableList'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/ToggleGroup'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { useWorkflowRFStore } from '@/stores/workflowRF.store'
import { Label } from '@home-hub-orchestrator/ui'
import { type Node, NodeProps, NodeToolbar, Position, useReactFlow } from '@xyflow/react'
import { Edit, FileText, GripVertical, Info, Maximize2 } from 'lucide-react'
import { type MouseEvent, MouseEventHandler, useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { BaseNode, BaseNodeContent, BaseNodeFooter, BaseNodeHeader, BaseNodeHeaderTitle } from './BaseNode'
import { type FieldConfig, FieldConfigPanel } from './FieldConfigPanel'

/**
 * FormNodeV2
 *
 * - A variant of the FormNode that uses the new child-composed `List` from ReorderableList
 *   to reorder form fields when `isEditing` is true.
 * - View mode renders a simple form driven by `fieldsData` for demonstration.
 * - No changes are made to the existing FormNode; this is a parallel implementation.
 */

// Data passed via React Flow node data
type FormNodeData = {
   label: string
   description?: string
   icon?: any
   disabled?: boolean
   className?: string
   /** When true, shows field editor with drag-to-reorder */
   isEditing?: boolean
   /** Array of field definitions rendered and edited by this node */
   fieldsData?: FieldForSchema<z.ZodTypeAny>[]
}
export type FormNodeV2 = Node<FormNodeData, 'form-v2'>

/** Field definition generic over a Zod schema */
type FieldForSchema<T extends z.ZodTypeAny> = {
   id: string
   name: keyof z.infer<T> & string
   label: string
   placeholder?: string
   Control: React.ComponentType<React.ComponentProps<typeof Input>>
   description?: string
   // Optional configuration edited via the NodeAppendix panel
   config?: any
}

/**
 * View-only rendering of fields as a form.
 */
function FieldsView<T extends z.ZodTypeAny>({ fieldsData, formSchema: _formSchema }: {
   fieldsData?: Array<FieldForSchema<T>>;
   formSchema: T
}) {
   const form = useForm<z.infer<T>>({ defaultValues: {} as z.infer<T> })
   const populated = useMemo(() => (fieldsData ?? []).map((def) => {
      const { id, name, label, placeholder, Control, description } = def
      return (
         <FormField key={id} control={form.control} name={name as any} render={({ field }) => (
            <FormItem>
               <FormLabel>{label}</FormLabel>
               <FormControl>
                  <Control placeholder={placeholder} {...field} />
               </FormControl>
               {description ? <FormDescription>{description}</FormDescription> : null}
               <FormMessage />
            </FormItem>
         )} />
      )
   }), [fieldsData, form.control])

   return (
      <Form {...form}>
         <form className="space-y-6">
            {populated}
         </form>
      </Form>
   )
}

/**
 * Inline editor row for a single field, used as the child content of <List.Item>.
 * - Includes a drag handle and simple inputs for name/label/description.
 */
function FieldRowEditor<T extends z.ZodTypeAny>({
   index,
   field,
   onChange,
   onFieldSelect,
}: {
   index: number
   field: FieldForSchema<T>
   onChange: (index: number, patch: Partial<FieldForSchema<T>>) => void
   onFieldSelect: MouseEventHandler
}) {
   return (
      <div className="flex items-stretch gap-2 py-2 border-b last:border-b-0">
         {/* Drag handle column fills full row height via self-stretch; background bar is absolute */}
         <List.Handle asChild>
            <div
               className="relative w-6 self-stretch select-none cursor-grab active:cursor-grabbing draggable bg-neutral-200/60">
               <div
                  className="relative z-10 flex h-full items-center justify-center ">
                  <GripVertical className="h-4 w-4 text-neutral-500" />
               </div>
            </div>
         </List.Handle>

         {/* Editable inputs: name, label, description */}
         <div data-fieldid={field.id} className="grid grid-cols-1 gap-2 flex-1 curor-pointer" onClick={onFieldSelect}>
            <div>
               <Label>Name</Label>
               <Input value={field.name}
                  onChange={(e) => onChange(index, { name: e.target.value as any })}
                  placeholder="field_name" />
            </div>
            <div>
               <Label>Label</Label>
               <Input value={field.label}
                  onChange={(e) => onChange(index, { label: e.target.value })}
                  placeholder="Label" />
            </div>
            <div>
               <Label>Description</Label>
               <Input value={field.description ?? ''}
                  onChange={(e) => onChange(index, { description: e.target.value })}
                  placeholder="Add a helpful description" />
            </div>
         </div>
      </div>
   )
}

export function FormNodeV2({ id, data, selected }: NodeProps<FormNodeV2>) {
   const {
      label = 'File Node V2',
      description = 'Creat a form using drag and drop field. Fields are reorderable and editable in edit mode',
      icon = FileText,
      disabled = false,
      className,
      fieldsData,
   } = data

   const { setNodes } = useReactFlow()
   const updateNodeData = useWorkflowRFStore((s) => s.updateNodeData)
   const [formSchema] = useState<z.ZodTypeAny>(() => z.object({}))
   const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
   const Icon = icon
   const isEditing = data?.isEditing ?? false

   /** Update edit/resize flags via toolbar */
   function handleToggleGroupValueChange(values: string[]) {
      const nextIsEditing = values.includes('edit')
      // Persist flag into node data for consistency with other nodes
      setNodes((ns) => ns.map((n) => n.id === id ? ({ ...n, data: { ...n.data, isEditing: nextIsEditing } }) : n))
   }

   /** Reorder handler for List (controlled mode) */
   const handleReorder = useCallback((next: FieldForSchema<z.ZodTypeAny>[]) => {
      updateNodeData(id, (d: any) => ({ ...d, fieldsData: next }))
   }, [id, updateNodeData])

   /** Edit handler for inline field changes */
   const handleFieldChange = useCallback((index: number, patch: Partial<FieldForSchema<z.ZodTypeAny>>) => {
      updateNodeData(id, (d: any) => {
         const prev = (d.fieldsData as FieldForSchema<z.ZodTypeAny>[] | undefined) ?? []
         const next = prev.slice()
         if (!next[index]) return d
         next[index] = { ...next[index], ...patch }
         return { ...d, fieldsData: next }
      })
   }, [id, updateNodeData])

   const handleFieldConfigChange = useCallback((patch: Partial<FieldConfig>) => {
      updateNodeData(id, (d: any) => ({
         ...d,
         fieldsData: (d.fieldsData as any[]).map((f: any) =>
            f.id === selectedFieldId
               ? { ...f, config: { ...(f.config ?? { type: 'text' }), ...patch } }
               : f,
         ),
      }))
   }, [updateNodeData, id, selectedFieldId])

   const handleSelectField = useCallback((e: MouseEvent<HTMLElement>) => {
      console.log('handleSelectField')
      const el = e.currentTarget as HTMLElement
      const fieldId = (el as any).dataset?.fieldId ?? (el as any).dataset?.fieldid
      console.log('fieldId', fieldId)
      if (fieldId) setSelectedFieldId(fieldId)
   }, [])

   return (
      <BaseNode className={className} status={'initial'}>
         {isEditing && (
            <NodeAppendix position="right" className="p-2">
               <FieldConfigPanel
                  fieldId={selectedFieldId}
                  config={fieldsData?.find((f) => f.id === selectedFieldId)?.config}
                  onChange={handleFieldConfigChange}
               />
            </NodeAppendix>
         )}
         <NodeToolbar isVisible={selected}>
            <ToggleGroup aria-label="Toggle node editing" onValueChange={handleToggleGroupValueChange}
               variant="default" type="multiple" className="gap-1">
               <ToggleGroupItem value="resize" aria-label="Resize node">
                  <Maximize2 className="h-4 w-4" />
               </ToggleGroupItem>
               <ToggleGroupItem value="edit" aria-label="Edit node">
                  <Edit className="h-4 w-4" />
               </ToggleGroupItem>
            </ToggleGroup>
         </NodeToolbar>

         <BaseNodeHeader>
            <div className="flex items-center gap-2">
               <Icon className="h-4 w-4 text-muted-foreground" />
               <BaseNodeHeaderTitle>{label}</BaseNodeHeaderTitle>
            </div>
            <Tooltip>
               <TooltipTrigger asChild>
                  <button type="button" className="text-muted-foreground hover:text-foreground"
                     aria-label="Show description">
                     <Info className="h-4 w-4" />
                  </button>
               </TooltipTrigger>
               <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">{description}</p>
               </TooltipContent>
            </Tooltip>
         </BaseNodeHeader>

         <BaseNodeContent className={'nodrag cursor-auto'}>
            {isEditing ? (
               /**
                * Edit mode: Controlled Reorderable List of fields.
                * - items = fieldsData
                * - getId = field.id
                * - onReorder updates node data
                */
               <List
                  items={(fieldsData ?? []) as any}
                  getId={(f: FieldForSchema<z.ZodTypeAny>) => f.id}
                  onReorder={handleReorder as any}
                  listClassName="flex flex-col gap-2"
               >
                  {((fieldsData ?? []) as any).map((field: FieldForSchema<z.ZodTypeAny>, index: number) => {
                     const isSelected = isEditing && selectedFieldId === field.id
                     return (
                        <List.Item key={field.id} id={field.id} value={field} asChild>
                           <div className={`rounded border p-2 ${isSelected ? 'ring-1 ring-blue-400' : ''}`}>
                              <FieldRowEditor
                                 index={index}
                                 field={field}
                                 onChange={handleFieldChange as any}
                                 onFieldSelect={handleSelectField}
                              />
                           </div>
                        </List.Item>
                     )
                  })}
               </List>
            ) : (
               <FieldsView fieldsData={(fieldsData ?? []) as any} formSchema={formSchema as any} />
            )}
         </BaseNodeContent>

         <BaseNodeFooter>
            <Button disabled={disabled} className="w-full" size="sm">Submit</Button>
         </BaseNodeFooter>

         <BaseHandle type="source" position={Position.Left} />
         <BaseHandle type="target" position={Position.Right} />
      </BaseNode>
   )
}


