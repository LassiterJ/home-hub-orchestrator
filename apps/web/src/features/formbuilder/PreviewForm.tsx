import { Button } from '@/components/ui/Button'
import { Form } from '@/components/ui/Form'
import * as React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { FieldRenderer } from './FieldRenderer'
import { FormSchema } from '@/stores/formBuilder.store'
import { UseFormProps } from 'react-hook-form/dist/types'

/**
 * PreviewForm
 *
 * Runtime-only preview bound to FormBuilder store's current schema.
 * - Derives default values from fieldOrder/fieldsById
 * - Resets RHF when structure changes to avoid stale fields
 */
interface PreviewFormProps {
   schema: FormSchema;
   defaults: UseFormProps['defaultValues'];
   values?: UseFormProps['defaultValues']; //TODO: not sure if this is typed correctly
   onChange?: () => void; // TODO: make stricter Types
   onSubmit?: SubmitHandler<T>;
   // getFormInstance?: (form) => void
}

// const schema = useFormBuilder((s) => s.schema.present)
// const defaults = React.useMemo(() => Object.fromEntries(_schema.fieldOrder.map((id) => [id, ''])), [_schema])
/**
 * Shows Form component using useForm from a passed schema(state with zustland)
 * Defaults should be applied to Form schema before passing in.
 * */
export function PreviewForm({ schema, defaults, onSubmit }: PreviewFormProps) {

   const handleSubmit = onSubmit || (() => {
      console.log('No onSubmit passed to PreviewForm component.')
   })
   
   const form = useForm<Record<string, unknown>>({ defaultValues: defaults, mode: 'onChange' })
   console.log('form: ', form)
   return (
      <Form {...form}>
         <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {schema.fieldOrder.map((id) => (
               <FieldRenderer key={id} def={schema.fieldsById[id]} control={form.control} />
            ))}
            <Button type="submit" size="sm">Submit</Button>
         </form>
      </Form>
   )
}


