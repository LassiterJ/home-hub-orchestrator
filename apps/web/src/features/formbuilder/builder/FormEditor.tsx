import { cn, getNewUUID } from '@/utils'
import { UseFormProps } from 'react-hook-form/dist/types'
import { FormSchema } from '@/stores/formBuilder.store'
import { List } from '@/components/ui/List/ReorderableList'
import { useCallback, useMemo, useState } from 'react'
import { useFormBuilder } from '@/stores/FormBuilderProvider'
import { FieldRowEditor } from '@/components/features/workflow/nodes/FormNodeV2'
import invariant from 'tiny-invariant'
import { FormConfigPanel } from './FormConfigPanel'
import { FieldConfig } from '@/features/formbuilder/builder/FormBuilderTypes'

export interface FormDataItem {
   name: string
   type: string
   required: boolean
   max: string
   min: string
   maxLength: string
   minLength: string
   pattern: string
   /** Available when type is `select` or `radio` */
   options?: string
}

type FormFieldDefinitionItem = Partial<FormDataItem> & { toggle?: boolean }

const defaultValue: FormFieldDefinitionItem = {
   max: undefined,
   min: undefined,
   pattern: undefined,
   maxLength: undefined,
   minLength: undefined,
   required: undefined,
   name: '',
   type: '',
   options: '',
}


export interface FormEditorProps {
   schema: FormSchema;                      // your existing schema
   defaults: UseFormProps['defaultValues']; // RHF
   className?: string;
}

/**
 *
 * Used to update schema of a Form using GUI.
 * A 2 pane component consisting of a dynamic form and a contextual config panel.
 * ConfigPanel the form and it's felds(content changes based on click.Can click form or specific fields)
 * updates onChange rather than submit.
 * On Cancel click (or exit in other way) form resets to initial state
 *
 * */
export const FormEditor = ({ className, schema }: FormEditorProps) => {
   const addField = useFormBuilder(s => s.addField)
   const updateField = useFormBuilder(s => s.updateField)
   const reorderFields = useFormBuilder(s => s.reorderFields)
   const undo = useFormBuilder(s => s.undo)
   const redo = useFormBuilder(s => s.redo)
   const selectedFieldId = useFormBuilder(s => s.selectedFieldId)
   const selectField = useFormBuilder(s => s.selectField)
   const [newFieldData, setNewFieldData] = useState(defaultValue)
   const { fieldsById, fieldOrder, id: FormId } = schema
   // const fieldsData = Array.from(fieldsById)
   const handleSubmit = () => {
      // Update schema
   }


   const handleCancel = () => {
      // TODO: complete component with reverting schema to initial value
   }
   const handleSelectField = (fieldId: string) => {
      console.log('handleSelectedField, fieldId: ', fieldId)
      invariant(fieldId, 'All fields should have an ID ')// TODO: should this use "name" of field instead?
      selectField(fieldId)
   }

   const handleReorder = useCallback((next) => {
      // Compute single-move indices (from -> to) and sync to FB store
      try {
         const prevIds = fieldOrder
         const nextIds = next.map((f) => f.id)
         if (prevIds.length === nextIds.length && prevIds.join(',') !== nextIds.join(',')) {
            const movedId = nextIds.find((id, idx) => prevIds[idx] !== id)
            if (movedId) {
               const from = prevIds.indexOf(movedId)
               const to = nextIds.indexOf(movedId)
               if (from !== -1 && to !== -1 && from !== to) {
                  reorderFields(from, to)
                  console.debug('Reordered field', { movedId, from, to })
               }
            }
         }
      } catch (err) {
         console.warn('Failed to compute reorder diff; skipping FB sync', err)
      }
   }, [fieldOrder, FormId])
   const handleFieldChange = (patch: Partial<FormDataItem>) => {
      // If no selectedFieldId then user is adding new field so we populate the newField data.
      // TODO: enhance this patch check.
      if (!patch) {
         console.error('No patch on field change.')
      }
      if (!selectedFieldId) {
         console.log('handleFieldChange, patch: ', patch)
         setNewFieldData({ ...newFieldData, ...patch })
         return
      }
      // Should have a selectedFieldId and patch by here.
      invariant(!!selectedFieldId && !!patch, 'Should have SelectedFieldId and patch')
      updateField(selectedFieldId, patch)
   }
   const handleAddField = (fieldConfig: FieldConfig) => {
      console.log('handleAddField, fieldConfig: ', fieldConfig)
      // const addToIndex = fieldOrder.length
      // console.log('handleAddField, addToIndex: ', addToIndex)
      addField({ ...fieldConfig, id: getNewUUID({ prefix: 'fieldId' }) })
      setNewFieldData(defaultValue)
   }

   const fields = useMemo(() => {
      return fieldOrder.map((id, index) => {
         const field = fieldsById[id]
         const isSelected = id === selectedFieldId
         // TODO: use below somewhere to handle outside clicks.
         // useOnClickOutside(ref, handleClickOutside)
         return (
            <List.Item key={id} id={id} value={field} asChild>
               <div className={`rounded border p-2 ${isSelected ? 'ring-1 ring-blue-400' : ''}`}
                    onClick={() => handleSelectField(id)}>
                  <FieldRowEditor
                     index={index}
                     field={field}
                     onChange={handleFieldChange as any}
                  />
               </div>

            </List.Item>)
      })
   }, [fieldOrder, fieldsById])


   return (
      <div className={cn(className, 'container min-w-24 border-2 flex')}>
         <div className={'text-left w-full'}>Header</div>
         <div className={'form-container'}>
            <List
               onReorder={handleReorder as any}
               listClassName="flex flex-col gap-2"
            >
               {fields}
            </List>
         </div>
         <div className={'config-panel'}>
            <FormConfigPanel selectedFieldId={selectedFieldId}
                             fieldData={fieldsById[selectedFieldId] || newFieldData}
                             onChange={handleFieldChange}
                             onAddField={handleAddField}
            />
         </div>

      </div>
   )
}
