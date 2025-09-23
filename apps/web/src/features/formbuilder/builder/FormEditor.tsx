import { Button } from '@/components/ui/Button'
import { List } from '@/components/ui/List/ReorderableList'
import { DraggableField } from '@/features/formbuilder/builder/DraggableField'
import { FormSchema } from '@/stores/formBuilder.store'
import { useFormBuilder } from '@/stores/FormBuilderProvider'
import { cn, getNewUUID } from '@/utils'
import { CirclePlus } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { UseFormProps } from 'react-hook-form/dist/types'
import invariant from 'tiny-invariant'
import { FieldConfigPanel } from './FieldConfigPanel'

type SelectOptions = {
   label: string,
   value: string
}

export interface FormDataItem {
   id: string
   name: string
   type: string
   placeholder: string
   label: string
   required: boolean
   max: string
   min: string
   maxLength: string
   minLength: string
   pattern: string
   /** Available when type is `select` or `radio` */
   options: SelectOptions[]
}

type FormFieldDefinitionItem = Partial<FormDataItem> & { toggle?: boolean }

const createNewFieldValue = (): FormFieldDefinitionItem => {
   const newId = getNewUUID({ prefix: 'field' })
   return {
      id: newId,
      max: undefined,
      min: undefined,
      pattern: undefined,
      maxLength: undefined,
      minLength: undefined,
      required: undefined,
      name: `New Field ${newId}`,
      type: 'text',
      placeholder: 'placeholder',
      label: 'New Field',
      options: [],
   }
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
 * ConfigPanel the form and it's fields(content changes based on click.Can click form or specific fields)
 * updates onChange rather than submit.
 * On Cancel click (or exit in other way) form resets to initial state
 *
 * */
export const FormEditor = ({ className, schema }: FormEditorProps) => {
   const addField = useFormBuilder(s => s.addField)
   const updateField = useFormBuilder(s => s.updateField)
   const removeField = useFormBuilder(s => s.removeField)
   const reorderFields = useFormBuilder(s => s.reorderFields)
   const undo = useFormBuilder(s => s.undo)
   const redo = useFormBuilder(s => s.redo)
   const selectedFieldId = useFormBuilder(s => s.selectedFieldId)
   const selectField = useFormBuilder(s => s.selectField)
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
      invariant(fieldId, 'All fields should have an ID ') // TODO: should this use "name" of field instead?
      selectField(fieldId)
   }

   const handleRemoveField = (fieldId: string) => {
      invariant(fieldId, 'should have a fieldId')
      removeField(fieldId)
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

      // TODO: enhance this patch check.
      if (!patch) {
         console.error('No patch on field change.')
      }

      invariant(!!selectedFieldId && !!patch, 'Should have SelectedFieldId and patch')
      updateField(selectedFieldId, patch)
   }
   const handleAddNewField = () => {
      // const addToIndex = fieldOrder.length
      // console.log('handleAddField, addToIndex: ', addToIndex)
      const newField = createNewFieldValue()
      addField(newField)
      selectField(newField.id)
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
                  <DraggableField
                     index={index}
                     field={field}
                     onChange={handleFieldChange as any}
                  />
               </div>

            </List.Item>)
      })
   }, [fieldOrder, fieldsById])


   return (
      <div className={cn(className, ' border-2 flex h-auto')}>
         <div className={'p-4'}>
            <div className={'pb-1'}>Manage Layout</div>
            <List
               className={'border-2 border-t-0'}
               onReorder={handleReorder as any}
               listClassName="flex flex-col gap-2"
            >
               {fields}
            </List>
            <div className={'flex w-full justify-center p-0'}>
               <Button variant={'ghost'} className={'self-center flex p-0 rounded-full'} onClick={handleAddNewField}>
                  <CirclePlus className={'h-6 w-6'} />
               </Button>
            </div>
         </div>
         <div className={'w-40'}>
            {selectedFieldId &&
               <FieldConfigPanel selectedFieldId={selectedFieldId}
                                 fieldData={fieldsById[selectedFieldId]}
                                 onChange={handleFieldChange}
                                 onRemoveField={handleRemoveField}
                  // onAddField={handleAddField}
               />}
         </div>
      </div>
   )
}
