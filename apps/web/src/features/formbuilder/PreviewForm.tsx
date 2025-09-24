import { Button } from '@/components/ui/Button'
import { Form } from '@/components/ui/Form'
import * as React from 'react'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { FieldRenderer } from './FieldRenderer'
import { FormSchema } from '@/stores/formBuilder.store'
import { UseFormProps } from 'react-hook-form/dist/types'
import { cn } from '@/utils'

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
   className?: string
   // getFormInstance?: (form) => void
}

// const schema = useFormBuilder((s) => s.schema.present)
// const defaults = React.useMemo(() => Object.fromEntries(_schema.fieldOrder.map((id) => [id, ''])), [_schema])
/**
 * Shows Form component using useForm from a passed schema(state with zustland)
 * Defaults should be applied to Form schema before passing in.
 * */
export function PreviewForm({ schema, defaults, onSubmit, className }: PreviewFormProps) {
   const [formData, setFormData] = useState()
   const handleSubmit = onSubmit || ((data) => {
      setFormData(data)
   })

   const form = useForm<Record<string, unknown>>({ defaultValues: defaults, mode: 'onChange' })
   const formOutput = JSON.stringify(formData, null, 2)
   return (
      <div className={cn('preview-container', className)}>
         <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
               {schema.fieldOrder.map((id) => (
                  <FieldRenderer key={id} def={schema.fieldsById[id]} control={form.control} />
               ))}
               <Button type="submit" size="sm">Submit</Button>
            </form>
         </Form>
         <div>
         </div>
         <pre className="p-2 text-xs bg-muted/40 overflow-auto">{formOutput}</pre>

      </div>
   )
}


