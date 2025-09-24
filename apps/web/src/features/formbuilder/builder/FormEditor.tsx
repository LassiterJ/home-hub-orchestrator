import { FormSchema } from '@/stores/formBuilder.store'
import { useFormBuilder } from '@/stores/FormBuilderProvider'
import { cn } from '@/utils'
import { UseFormProps } from 'react-hook-form/dist/types'
import invariant from 'tiny-invariant'
import { FieldConfigPanel } from './FieldConfigPanel'
import { FieldByType, FieldKind } from '@/features/formbuilder/builder/FormBuilderTypes'

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


export interface FormEditorProps {
   schema: FormSchema;                      // your existing schema
   defaults: UseFormProps['defaultValues']; // RHF
   className?: string;
   onFieldChange?: (patch: Partial<Omit<FieldByType<FieldKind>, 'id' | 'type' | 'name'>>) => void
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
export const FormEditor = ({ className, schema, onFieldChange }: FormEditorProps) => {


   const removeField = useFormBuilder(s => s.removeField)
   const selectedFieldId = useFormBuilder(s => s.selectedFieldId)
   const { fieldsById } = schema

   const handleSubmit = () => {
      // Update schema
   }

   const handleCancel = () => {
      // TODO: complete component with reverting schema to initial value
   }


   const handleRemoveField = (fieldId: string) => {
      invariant(fieldId, 'should have a fieldId')
      removeField(fieldId)
   }


   return (
      <div className={cn(className, ' border-2 flex h-auto')}>
         <div className={''}>
            {selectedFieldId &&
               <FieldConfigPanel selectedFieldId={selectedFieldId}
                                 fieldData={fieldsById[selectedFieldId]}
                                 onChange={onFieldChange}
                                 onRemoveField={handleRemoveField}
                  // onAddField={handleAddField}
               />}
         </div>
      </div>
   )
}
