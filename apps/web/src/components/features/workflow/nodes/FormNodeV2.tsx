import { BaseHandle } from '@/components/features/workflow/handles/BaseHandle'
import { Button } from '@/components/ui/Button/'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { List } from '@/components/ui/List/ReorderableList'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/ToggleGroup'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { Label } from '@home-hub-orchestrator/ui'
import { type Node, NodeProps, NodeToolbar, Position, useReactFlow } from '@xyflow/react'
import { Edit, FileText, GripVertical, Info, Maximize2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { BaseNode, BaseNodeContent, BaseNodeFooter, BaseNodeHeader, BaseNodeHeaderTitle } from './BaseNode'

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
}

/**
 * View-only rendering of fields as a form (minimal demo).
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
                                                }: {
   index: number
   field: FieldForSchema<T>
   onChange: (index: number, patch: Partial<FieldForSchema<T>>) => void
}) {
   return (
      <div className="inline-flex items-start gap-2 py-2 border-b last:border-b-0">
         {/* Drag handle + keyboard fallback controls */}
         <div className="flex items-center gap-1 pt-2 select-none">
            <List.Handle>
               <GripVertical className="h-4 w-4 text-muted-foreground" />
            </List.Handle>
         </div>

         {/* Editable inputs: name, label, description */}
         <div className="grid grid-cols-1 gap-2 flex-1">
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

   const Icon = icon
   const { setNodes } = useReactFlow()
   const isEditing = data?.isEditing ?? false

   const [formSchema] = useState<z.ZodTypeAny>(() => z.object({}))

   /** Update edit/resize flags via toolbar */
   function handleToggleGroupValueChange(values: string[]) {
      const nextIsEditing = values.includes('edit')
      // Persist flag into node data for consistency with other nodes
      setNodes((ns) => ns.map((n) => n.id === id ? ({ ...n, data: { ...n.data, isEditing: nextIsEditing } }) : n))
   }

   /** Reorder handler for List (controlled mode) */
   const handleReorder = useCallback((next: FieldForSchema<z.ZodTypeAny>[]) => {
      setNodes((ns) => ns.map((n) => n.id === id ? ({ ...n, data: { ...n.data, fieldsData: next } }) : n))
   }, [id, setNodes])

   /** Edit handler for inline field changes */
   const handleFieldChange = useCallback((index: number, patch: Partial<FieldForSchema<z.ZodTypeAny>>) => {
      setNodes((ns) => ns.map((n) => {
         if (n.id !== id) return n
         const prev = ((n.data as any).fieldsData as FieldForSchema<z.ZodTypeAny>[] | undefined) ?? []
         const next = prev.slice()
         if (!next[index]) return n
         next[index] = { ...next[index], ...patch }
         return { ...n, data: { ...n.data, fieldsData: next } }
      }))
   }, [id, setNodes])

   return (
      <BaseNode className={className} status={'initial'}>
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

         <BaseNodeContent>
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
                  {((fieldsData ?? []) as any).map((field: FieldForSchema<z.ZodTypeAny>, index: number) => (
                     <List.Item key={field.id} id={field.id} value={field} asChild>
                        <div className="rounded border p-2">
                           <FieldRowEditor index={index} field={field} onChange={handleFieldChange as any} />
                        </div>
                     </List.Item>
                  ))}
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


