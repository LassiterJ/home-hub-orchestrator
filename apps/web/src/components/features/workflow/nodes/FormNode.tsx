'use client'

import { BaseHandle } from '@/components/features/workflow/handles/BaseHandle'
import { GroupNode, type GroupNodeProps } from '@/components/features/workflow/nodes/GroupNode'
import { NodeStatus } from '@/components/features/workflow/NodeStatusIndicator'
import { Button } from '@/components/ui/Button/'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/ToggleGroup'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { type NodeData } from '@/types'
import { cn } from '@/utils'
import { Label } from '@home-hub-orchestrator/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { type DragEventData, events, position, useCompartment, useDraggable } from '@neodrag/react'
import { type Node, NodeProps, NodeToolbar, Position, useReactFlow } from '@xyflow/react'
import { ArrowDown, ArrowUp, Edit, FileText, GripVertical, Info, LucideIcon, Maximize2 } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { BaseNode, BaseNodeContent, BaseNodeFooter, BaseNodeHeader, BaseNodeHeaderTitle } from './BaseNode'

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
   /**
    * Array of field definitions rendered by this FormNode.
    * This is the primary source of truth for both view mode and edit mode.
    */
   fieldsData: FieldForSchema<z.ZodTypeAny>[]
   /**
    * Controls whether the node is in edit mode. When true, the editor UI is shown
    * to allow reordering fields and editing name/label/description. This value is
    * expected to be driven by the parent/workflow state and persisted via React Flow.
    */
   isEditing?: boolean
};
export type FormNode = Node<FormInputData, 'text'>

// Field definition is generic over a Zod schema type `T`
// `name` must be a key of the inferred form values from `T`.
// `Control` is any React component that accepts standard input-like props.
// You can tighten this later to your component library’s exact prop types.
type FieldForSchema<T extends z.ZodTypeAny> = {
   id: string //TODO is there a better type for uuid?
   name: keyof z.infer<T> & string
   label: string
   placeholder?: string
   Control: React.ComponentType<React.ComponentProps<typeof Input>>
   description?: string
}

/**
 * Move an item within an array from one index to another, returning a new array.
 * Keeps immutability guarantees for React state updates.
 */
function arrayMoveImmutable<T>(items: readonly T[], fromIndex: number, toIndex: number): T[] {
   const updated = items.slice()
   const [moved] = updated.splice(fromIndex, 1)
   updated.splice(toIndex, 0, moved)
   return updated
}

/**
 * Editor row for a single field. Provides a drag handle (NeoDrag v3) to reorder
 * vertically, along with inline inputs for name, label, and description.
 */
function FieldRowEditor({
                           index,
                           field,
                           registerItemRef,
                           requestMove,
                           requestUpdate,
                        }: {
   index: number
   field: FieldForSchema<any>
   registerItemRef: (index: number, el: HTMLDivElement | null) => void
   requestMove: (from: number, to: number) => void
   requestUpdate: (index: number, patch: Partial<FieldForSchema<any>>) => void
}) {
   const rowRef = useRef<HTMLDivElement>(null)
   const positionComp = useCompartment(() => position({ current: { x: 0, y: 0 } }), [])

   /**
    * Compute the new index for this row based on its vertical center relative
    * to sibling rows. We use DOM measurements for a lightweight approach without
    * a full sortable framework.
    */
   const computeTargetIndex = useCallback((): number => {
      const current = rowRef.current
      if (!current) return index
      const parent = current.parentElement
      if (!parent) return index
      const children = Array.from(parent.children) as HTMLDivElement[]
      // Build list of siblings excluding the dragged element
      const siblings = children.filter((el) => el !== current)
      const currentRect = current.getBoundingClientRect()
      const currentCenterY = currentRect.top + currentRect.height / 2

      // Find the first sibling whose center is below the current center
      const centers = siblings.map((el) => {
         const r = el.getBoundingClientRect()
         return r.top + r.height / 2
      })
      let newIndex = 0
      while (newIndex < centers.length && centers[newIndex] < currentCenterY) {
         newIndex += 1
      }
      // Translate sibling-based index back to full list index
      // If the dragged element moved downward past k siblings, its target index is k
      return newIndex
   }, [index])

   const dragEvents = {
      onDragEnd: (_e: DragEventData) => {
         const toIndex = computeTargetIndex()
         if (toIndex !== index) {
            requestMove(index, toIndex)
         }
         // Clear any inline transform applied by NeoDrag for a fresh layout
         if (rowRef.current) {
            rowRef.current.style.removeProperty('transform')
         }
      },
   }
   useDraggable(rowRef, () => [positionComp, events(dragEvents)])

   useEffect(() => {
      registerItemRef(index, rowRef.current)
      // We intentionally do not depend on rowRef.current to avoid needless reruns
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [index, registerItemRef])

   return (
      <div ref={rowRef}
           className="flex items-start gap-2 py-2 border-b last:border-b-0" data-index={index}>
         {/* Drag handle + keyboard fallback controls */}
         <div className="flex items-center gap-1 pt-2 select-none">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <button type="button" aria-label="Move up"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => requestMove(index, Math.max(0, index - 1))}>
               <ArrowUp className="h-3 w-3" />
            </button>
            <button type="button" aria-label="Move down"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => requestMove(index, index + 1)}>
               <ArrowDown className="h-3 w-3" />
            </button>
         </div>

         {/* Editable inputs: name, label, description */}
         <div className="grid grid-cols-1 gap-2 flex-1">
            <div>
               <Label>Name</Label>
               <Input value={field.name}
                      onChange={(e) => requestUpdate(index, { name: e.target.value as any })}
                      placeholder="field_name" />
            </div>
            <div>
               <Label>Label</Label>
               <Input value={field.label}
                      onChange={(e) => requestUpdate(index, { label: e.target.value })}
                      placeholder="Label" />
            </div>
            <div>
               <Label>Description</Label>
               <Input value={field.description ?? ''}
                      onChange={(e) => requestUpdate(index, { description: e.target.value })}
                      placeholder="Add a helpful description" />
            </div>
         </div>
      </div>
   )
}

/**
 * FieldsEditor
 *
 * Renders an editable list of fields for the FormNode. Supports vertical reordering
 * using NeoDrag v3 and inline editing of name/label/description. Changes are
 * propagated via the provided onChange callback.
 */
function FieldsEditor({
                         fields,
                         onChange,
                      }: {
   fields: FieldForSchema<any>[]
   onChange: (next: FieldForSchema<any>[]) => void
}) {
   const itemRefs = useRef<Array<HTMLDivElement | null>>([])

   const registerItemRef = useCallback((index: number, el: HTMLDivElement | null) => {
      itemRefs.current[index] = el
   }, [])

   const requestMove = useCallback((from: number, to: number) => {
      if (from === to) return
      const clampedTo = Math.max(0, Math.min(fields.length - 1, to))
      onChange(arrayMoveImmutable(fields, from, clampedTo))
   }, [fields, onChange])

   const requestUpdate = useCallback((index: number, patch: Partial<FieldForSchema<any>>) => {
      const next = fields.slice()
      next[index] = { ...next[index], ...patch }
      onChange(next)
   }, [fields, onChange])

   return (
      <div className="space-y-2">
         {fields.map((field, index) => (
            <FieldRowEditor
               key={index}
               index={index}
               field={field}
               registerItemRef={registerItemRef}
               requestMove={requestMove}
               requestUpdate={requestUpdate}
            />
         ))}
      </div>
   )
}

function FormView<T extends z.ZodTypeAny>(
   {
      formSchema,
      fieldsData = [],
   }: {
      formSchema: T
      fieldsData: Array<FieldForSchema<T>>
   },
) {
   const form = useForm<z.infer<T>>({
      // Casting schema to any to satisfy resolver's stricter generic signature
      resolver: zodResolver(formSchema as any) as any,
      // TODO: Consider if you want explicit defaults, compute them from fieldsData.
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
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {populatedFields}
            {/*<Button type="submit">Submit</Button>*/}
         </form>
      </Form>
   )
}

export function FormNode({ id, data, selected }: NodeProps<FormNode>) {
   const {
      label,
      description = 'Form node for data collection and submission',
      status = 'initial',
      icon = FileText,
      onSubmit,
      disabled = false,
      className,
      fieldsData,
   } = data
   const Icon = icon
   // Prefer data-driven editing flag provided by parent/workflow state
   const isEditing = data?.isEditing ?? false
   const [, setIsResizing] = useState(false)
   // For now, use an empty schema; replace with your real, generated Zod object later.
   const [formSchema] = useState<z.ZodTypeAny>(() => z.object({}))
   console.log('FieldsData: ', fieldsData)
   const { setNodes } = useReactFlow()
   const baseNodeClassName = cn({ 'nodrag': isEditing }, className)

   // ToggleGroup passes an array of selected values when type="multiple"
   /**
    * Update edit/resize flags. Because `isEditing` is managed via node data,
    * we update the React Flow node in place to persist the value.
    */
   function handleToggleGroupValueChange(values: string[]) {
      const nextIsEditing = values.includes('edit')
      const nextIsResizing = values.includes('resize')
      setIsResizing(nextIsResizing)
      setNodes((ns) => ns.map((n) => n.id === id ? ({
         ...n,
         data: {
            ...n.data,
            isEditing: nextIsEditing,
         },
      }) : n))
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
         <BaseNode className={baseNodeClassName} status={status}>
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
                  /**
                   * Edit mode: present the field list editor with drag-and-drop reordering
                   * and inline editing for name, label, and description. Updates persist
                   * to the node via React Flow's setNodes.
                   */
                  <FieldsEditor
                     fields={(fieldsData as any) ?? []}
                     onChange={(next) => {
                        setNodes((ns) => ns.map((n) => n.id === id ? ({
                           ...n,
                           data: {
                              ...n.data,
                              fieldsData: next,
                           },
                        }) : n))
                     }}
                  />
               ) : (
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
