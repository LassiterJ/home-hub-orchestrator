import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { FIELD_PANELS } from '@/features/formbuilder/builder/FieldSpecificConfigPanels'
import { FieldByType, FieldPatch } from '@/features/formbuilder/builder/FormBuilderTypes'
import { Label } from '@home-hub-orchestrator/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash } from 'lucide-react'
import {
   fieldConfigFormSchema,
   FieldConfigFormValues,
   toFieldConfigFormValues,
   toFieldConfigPatch,
} from './FieldConfigFormSchema'
import type { FieldKind } from './FormBuilderTypes'

type TypeScaffoldFactory = Record<FieldKind, () => Partial<FieldConfigFormValues>>

/**
 * @description Provides zeroed-out scaffolds per field type so when the user
 * switches the discriminant we seed only the relevant controls while keeping
 * the base metadata intact.
 */
const TYPE_DEFAULT_SCAFFOLD: TypeScaffoldFactory = {
   text: () => ({ minLength: undefined, maxLength: undefined, pattern: '' }),
   textarea: () => ({ minLength: undefined, maxLength: undefined, pattern: '' }),
   number: () => ({
      min: undefined,
      max: undefined,
      step: undefined,
      integer: false,
      positive: false,
      negative: false,
   }),
   select: () => ({ options: [], multiple: false, minSelected: undefined, maxSelected: undefined }),
   checkbox: () => ({}),
   radio: () => ({ options: [] }),
   date: () => ({}),
   file: () => ({
      accept: [],
      maxSizeMB: undefined,
      maxFiles: undefined,
      imageMaxWidth: undefined,
      imageMaxHeight: undefined,
   }),
}

export type FieldConfigPanelProps<K extends FieldKind = FieldKind> = {
   selectedFieldId: string;
   fieldData: FieldByType<K>;
   onChange: (patch: FieldPatch<K>) => void;
   onAddField?: (fieldData: FieldByType<K>) => void;
   onRemoveField: (id: string) => void
};

/**
 * @description RHF-backed configuration panel used to edit the metadata for a
 * selected form field. Persists changes via the Form Builder store once the
 * user submits, ensuring undo/redo history remains intact.
 */
export function FieldConfigPanel({
   selectedFieldId,
   fieldData,
   onChange,
   onAddField,
   onRemoveField,
}: FieldConfigPanelProps) {
   const initialValues = useMemo(() => toFieldConfigFormValues(fieldData), [fieldData])

   const form = useForm<FieldConfigFormValues>({
      resolver: zodResolver(fieldConfigFormSchema),
      defaultValues: initialValues,
      mode: 'onSubmit',
      reValidateMode: 'onChange',
   })

   useEffect(() => {
      form.reset(toFieldConfigFormValues(fieldData))
   }, [fieldData, form])

   const watchedType = form.watch('type', fieldData.type) as FieldKind

   const PanelComponent = FIELD_PANELS[watchedType]
   const title = selectedFieldId ? 'Edit Field' : 'Add Field'

   /**
    * @description Resets the form with type-specific defaults while preserving
    * shared metadata (name, label, etc.) whenever the type selector changes.
    */
   const handleTypeChange = (nextType: FieldKind) => {
      const baseValues = form.getValues()
      const scaffold = TYPE_DEFAULT_SCAFFOLD[nextType]?.() ?? {}
      const commonFields: Pick<FieldConfigFormValues, 'name' | 'label' | 'description' | 'required' | 'disabled' | 'placeholder' | 'helpText'> = {
         name: baseValues.name,
         label: baseValues.label,
         description: baseValues.description ?? '',
         required: baseValues.required,
         disabled: baseValues.disabled,
         placeholder: baseValues.placeholder ?? '',
         helpText: baseValues.helpText ?? '',
      }

      form.reset({ ...commonFields, ...scaffold, type: nextType })
   }

   /**
    * @description Emits the sanitized patch back to the store. Strips the type
    * discriminator from the payload unless the user explicitly switched types.
    */
   const handleSubmit = (values: FieldConfigFormValues) => {
      const nextType = (values.type as FieldKind) ?? fieldData.type
      const patch = toFieldConfigPatch(nextType, values)

      const { type: patchType, ...rest } = patch
      if (Object.keys(rest).length) {
         onChange(rest as unknown as FieldPatch<FieldKind>)
      }

      if (patchType && patchType !== fieldData.type) {
         onChange({ type: patchType } as unknown as FieldPatch<FieldKind>)
      }
   }

   return (
      <div className="relative border p-2 space-y-3">
         <Label>{title}</Label>
         <Trash onClick={() => onRemoveField(selectedFieldId)}
            className="absolute top-4 right-4 cursor-pointer hover:text-red-600" />

         <Form {...form}>
            <form className="space-y-3" onSubmit={form.handleSubmit(handleSubmit)}>
               <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                           <Input {...field} />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />
               <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Label</FormLabel>
                        <FormControl>
                           <Input {...field} />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />
               <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                           <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />
               <FormField
                  control={form.control}
                  name="required"
                  render={({ field }) => (
                     <FormItem className="flex items-center justify-between">
                        <FormLabel>Required</FormLabel>
                        <FormControl>
                           <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                     </FormItem>
                  )}
               />
               <FormField
                  control={form.control}
                  name="disabled"
                  render={({ field }) => (
                     <FormItem className="flex items-center justify-between">
                        <FormLabel>Disabled</FormLabel>
                        <FormControl>
                           <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                     </FormItem>
                  )}
               />
               <FormField
                  control={form.control}
                  name="placeholder"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Placeholder</FormLabel>
                        <FormControl>
                           <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />
               <FormField
                  control={form.control}
                  name="helpText"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Help text</FormLabel>
                        <FormControl>
                           <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />
               <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select value={field.value} onValueChange={(value) => {
                           field.onChange(value)
                           handleTypeChange(value as FieldKind)
                        }}>
                           <FormControl>
                              <SelectTrigger>
                                 <SelectValue placeholder="Type" />
                              </SelectTrigger>
                           </FormControl>
                           <SelectContent>
                              {['text', 'textarea', 'number', 'select', 'checkbox', 'radio', 'date', 'file'].map((option) => (
                                 <SelectItem key={option} value={option}>
                                    {option}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </FormItem>
                  )}
               />

               {PanelComponent ? <PanelComponent /> : null}

               <div className="flex justify-end gap-2 pt-2">
                  <Button size="sm" type="submit">
                     Apply changes
                  </Button>
                  <Button
                     size="sm"
                     type="button"
                     variant="ghost"
                     onClick={() => form.reset(initialValues)}
                  >
                     Reset
                  </Button>
               </div>
            </form>
         </Form>
      </div>
   )
}
