import { BaseHandle } from '@/components/features/workflow/handles/BaseHandle'
import { NodeAppendix } from '@/components/features/workflow/NodeAppendix'
import { Button } from '@/components/ui/Button/'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { List } from '@/components/ui/List/ReorderableList'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/ToggleGroup'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { getLogger } from '@/lib/logger'
import { FormBuilderProvider, useFormBuilder, useFormBuilderApi } from '@/stores/FormBuilderProvider'
import { useWorkflowRFStore } from '@/stores/workflowRF.store'
import { type Node, NodeProps, NodeToolbar, Position, useReactFlow } from '@xyflow/react'
import { Edit, FileText, GripVertical, Info, Maximize2 } from 'lucide-react'
import { memo, type MouseEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { BaseNode, BaseNodeContent, BaseNodeFooter, BaseNodeHeader, BaseNodeHeaderTitle } from './BaseNode'
import { type FieldConfig, FieldConfigPanel } from './FieldConfigPanel'
import { PreviewForm } from '@/features/formbuilder/PreviewForm'

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

interface FieldRowEditorProps {
   index: number
   field: FieldConfig
   onChange: (id: string, patch: Partial<FieldForSchema<T>>) => void
   // onFieldSelect: MouseEventHandler
}

export function FieldRowEditor<T extends z.ZodTypeAny>({
                                                          index,
                                                          field,
                                                          onChange,
                                                          // onFieldSelect,
                                                       }: FieldRowEditorProps) {
   return (
      <div id={field.id} className="flex items-stretch gap-2 py-2 border-b last:border-b-0 curor-pointer"
      >
         {/* Drag handle column fills full row height via self-stretch; background bar is absolute */}
         <List.Handle asChild>
            <div
               className="relative w-6 self-stretch select-none cursor-grab active:cursor-grabbing draggable bg-neutral-200/60"
            >
               <div
                  className="relative z-10 flex h-full items-center justify-center ">
                  <GripVertical className="h-4 w-4 text-neutral-500" />
               </div>
            </div>
         </List.Handle>

         {/* Editable inputs: name, label, description */}
         <div>
            <div>
               {field.name}
            </div>
            <div>
               {field.label}
            </div>
            <div>
               {field.description}
            </div>
         </div>
      </div>
   )
}

export function FormNodeV2({ id, data, selected }: NodeProps<FormNodeV2>) {
   /**
    * Integrations:
    * - React Flow: maintains node.data for UI/editor state parity.
    * - FormBuilder store: authoritative operations for selection and reorder.
    *
    * Notes:
    * - We intentionally keep existing node-based features (e.g., FieldConfigPanel config)
    *   and mark schema synchronization gaps with TODOs to avoid feature loss.
    */
   const log = getLogger('FormNodeV2')

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
   const fbApi = useFormBuilderApi()
   const selectedFieldId = useFormBuilder((s) => s.selectedFieldId)
   const [formSchema] = useState<z.ZodTypeAny>(() => z.object({}))

   const presentSchema = useFormBuilder((s) => s.schema.present)
   useEffect(() => {
      console.log('[FormBuilder] schema', { nodeId: id, schema: presentSchema })
   }, [id, presentSchema])

   const Icon = icon
   const isEditing = data?.isEditing ?? false

   /** Update edit/resize flags via toolbar */
   function handleToggleGroupValueChange(values: string[]) {
      const nextIsEditing = values.includes('edit')
      // Persist flag into node data for consistency with other nodes
      setNodes((ns) => ns.map((n) => n.id === id ? ({ ...n, data: { ...n.data, isEditing: nextIsEditing } }) : n))
   }

   /**
    * Reorder handler for List (controlled mode)
    * - Updates RF node data for UI
    * - ALSO syncs to FormBuilder store history via reorderFields(from, to)
    */
   const handleReorder = useCallback((next: FieldForSchema<z.ZodTypeAny>[]) => {
      // Update RF node data for immediate UI feedback
      updateNodeData(id, (d: any) => ({ ...d, fieldsData: next }))

      // Compute single-move indices (from -> to) and sync to FB store
      try {
         const prevIds = ((fieldsData ?? []) as Array<FieldForSchema<z.ZodTypeAny>>).map((f) => f.id)
         const nextIds = next.map((f) => f.id)
         if (prevIds.length === nextIds.length && prevIds.join(',') !== nextIds.join(',')) {
            const movedId = nextIds.find((id, idx) => prevIds[idx] !== id)
            if (movedId) {
               const from = prevIds.indexOf(movedId)
               const to = nextIds.indexOf(movedId)
               if (from !== -1 && to !== -1 && from !== to) {
                  fbApi.getState().reorderFields(from, to)
                  log.debug('Reordered field', { movedId, from, to })
               }
            }
         }
      } catch (err) {
         log.warn('Failed to compute reorder diff; skipping FB sync', err)
      }
   }, [fieldsData, id, fbApi, log, updateNodeData])

   /**
    * Edit handler for inline field changes
    * - Keeps RF node data updated for editor controls
    * - Partially syncs to FB store (label/placeholder) to align schema progressively
    */
   const handleFieldChange = useCallback((index: number, patch: Partial<FieldForSchema<z.ZodTypeAny>>) => {
      updateNodeData(id, (d: any) => {
         const prev = (d.fieldsData as FieldForSchema<z.ZodTypeAny>[] | undefined) ?? []
         const next = prev.slice()
         if (!next[index]) return d
         const updated = { ...next[index], ...patch }
         next[index] = updated
         return { ...d, fieldsData: next }
      })

      // Best-effort schema sync: label/placeholder map to FieldDef
      try {
         const currentId = ((fieldsData ?? [])[index] as FieldForSchema<z.ZodTypeAny> | undefined)?.id
         if (currentId) {
            const fbPatch: Partial<import('@/stores/formBuilder.store').FieldDef> = {}
            if (typeof patch.label === 'string') fbPatch.label = patch.label
            if (typeof patch.placeholder === 'string') {
               // Only applies to text fields in our schema; harmless for others.
               ;(fbPatch as any).placeholder = patch.placeholder
            }
            if (Object.keys(fbPatch).length > 0) {
               fbApi.getState().updateField(currentId, fbPatch)
               log.debug('Updated field in FB store', { id: currentId, fbPatch })
            }
         }
      } catch (err) {
         log.warn('Failed to sync inline edit to FB store', err)
      }
   }, [id, fieldsData, fbApi, log, updateNodeData])

   const handleFieldConfigChange = useCallback((patch: Partial<FieldConfig>) => {
      updateNodeData(id, (d: any) => ({
         ...d,
         fieldsData: (d.fieldsData as any[]).map((f: any) =>
            f.id === selectedFieldId
               ? { ...f, config: { ...(f.config ?? { type: 'text' }), ...patch } }
               : f,
         ),
      }))
      // TODO: Persist field config into FormBuilder schema (meta) once schema supports config.
   }, [updateNodeData, id, selectedFieldId])

   /**
    * Reflect selection into the FormBuilder store for cross-surface highlighting.
    */
   const handleSelectField = useCallback((e: MouseEvent<HTMLElement>) => {
      const el = e.currentTarget as HTMLElement
      const fieldId = (el as any).dataset?.fieldId ?? (el as any).dataset?.fieldid
      if (fieldId) {
         fbApi.getState().selectField(fieldId)
         log.debug('Selected field', { fieldId })
      }
   }, [fbApi, log])

   return (

      <BaseNode className={className} status={'initial'}>
         {isEditing && (
            <NodeAppendix position="left" className="p-2">
               <PreviewForm />
            </NodeAppendix>
         )}
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

const FormSwitch = (props) => {
   const { isEditing, id, ...restProps } = props
   const { form } = useFormBuilder(id) //handles saving data to store.
   if (isEditing) <FormBuilder {...restProps} form={form} />
   return (<FormView {...restProps} form={form} />)
}

type FormBuilderProps = FormNodeV2 & typeof FormBuilderProvider
export const FormNode = memo(({ id, ...props }: FormBuilderProps) => {
   return (<FormBuilderProvider id={id}>
      <FormSwitch />
   </FormBuilderProvider>)
})
