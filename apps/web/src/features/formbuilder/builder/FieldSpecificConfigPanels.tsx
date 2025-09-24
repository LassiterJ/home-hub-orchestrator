import { Plus, Trash2 } from 'lucide-react'
import { Fragment } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { FieldConfig } from '@/features/formbuilder/builder/FormBuilderTypes'
import { FieldConfigFormValues } from './FieldConfigFormSchema'

const toOptionalNumber = (value: string) => (value === '' ? undefined : Number(value))
const EMPTY_OPTION = { label: '', value: '', disabled: false }

const TextLikePanel: React.FC = () => {
   const { control } = useFormContext<FieldConfigFormValues>()

   return (
      <div className="grid grid-cols-2 gap-2">
         <FormField
            control={control}
            name="minLength"
            render={({ field }) => (
               <FormItem>
                  <FormLabel>Min length</FormLabel>
                  <FormControl>
                     <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(toOptionalNumber(event.target.value))}
                     />
                  </FormControl>
                  <FormMessage />
               </FormItem>
            )}
         />
         <FormField
            control={control}
            name="maxLength"
            render={({ field }) => (
               <FormItem>
                  <FormLabel>Max length</FormLabel>
                  <FormControl>
                     <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(toOptionalNumber(event.target.value))}
                     />
                  </FormControl>
                  <FormMessage />
               </FormItem>
            )}
         />
         <div className="col-span-2">
            <FormField
               control={control}
               name="pattern"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>Pattern (regex)</FormLabel>
                     <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />
         </div>
      </div>
   )
}

const NumberPanel: React.FC = () => {
   const { control } = useFormContext<FieldConfigFormValues>()

   return (
      <div className="grid grid-cols-2 gap-2">
         <FormField
            control={control}
            name="min"
            render={({ field }) => (
               <FormItem>
                  <FormLabel>Min</FormLabel>
                  <FormControl>
                     <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(toOptionalNumber(event.target.value))}
                     />
                  </FormControl>
                  <FormMessage />
               </FormItem>
            )}
         />
         <FormField
            control={control}
            name="max"
            render={({ field }) => (
               <FormItem>
                  <FormLabel>Max</FormLabel>
                  <FormControl>
                     <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(toOptionalNumber(event.target.value))}
                     />
                  </FormControl>
                  <FormMessage />
               </FormItem>
            )}
         />
         <FormField
            control={control}
            name="step"
            render={({ field }) => (
               <FormItem>
                  <FormLabel>Step</FormLabel>
                  <FormControl>
                     <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(toOptionalNumber(event.target.value))}
                     />
                  </FormControl>
                  <FormMessage />
               </FormItem>
            )}
         />
         <FormField
            control={control}
            name="integer"
            render={({ field }) => (
               <FormItem className="flex items-center justify-between">
                  <FormLabel>Integer only</FormLabel>
                  <FormControl>
                     <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                  </FormControl>
               </FormItem>
            )}
         />
         <FormField
            control={control}
            name="positive"
            render={({ field }) => (
               <FormItem className="flex items-center justify-between">
                  <FormLabel>Positive only</FormLabel>
                  <FormControl>
                     <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                  </FormControl>
               </FormItem>
            )}
         />
         <FormField
            control={control}
            name="negative"
            render={({ field }) => (
               <FormItem className="flex items-center justify-between">
                  <FormLabel>Negative allowed</FormLabel>
                  <FormControl>
                     <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                  </FormControl>
               </FormItem>
            )}
         />
      </div>
   )
}

const FilePanel: React.FC = () => {
   const { control } = useFormContext<FieldConfigFormValues>()

   return (
      <div className="grid grid-cols-2 gap-2">
         <div className="col-span-2">
            <FormField
               control={control}
               name="accept"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>Accept (comma separated)</FormLabel>
                     <FormControl>
                        <Input
                           value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                           onChange={(event) => field.onChange(
                              event.target.value
                                 .split(',')
                                 .map((token) => token.trim())
                                 .filter(Boolean),
                           )}
                        />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />
         </div>
         <FormField
            control={control}
            name="maxSizeMB"
            render={({ field }) => (
               <FormItem>
                  <FormLabel>Max size (MB)</FormLabel>
                  <FormControl>
                     <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(toOptionalNumber(event.target.value))}
                     />
                  </FormControl>
                  <FormMessage />
               </FormItem>
            )}
         />
         <FormField
            control={control}
            name="maxFiles"
            render={({ field }) => (
               <FormItem>
                  <FormLabel>Max files</FormLabel>
                  <FormControl>
                     <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(toOptionalNumber(event.target.value))}
                     />
                  </FormControl>
                  <FormMessage />
               </FormItem>
            )}
         />
         <FormField
            control={control}
            name="imageMaxWidth"
            render={({ field }) => (
               <FormItem>
                  <FormLabel>Image max width</FormLabel>
                  <FormControl>
                     <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(toOptionalNumber(event.target.value))}
                     />
                  </FormControl>
                  <FormMessage />
               </FormItem>
            )}
         />
         <FormField
            control={control}
            name="imageMaxHeight"
            render={({ field }) => (
               <FormItem>
                  <FormLabel>Image max height</FormLabel>
                  <FormControl>
                     <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(toOptionalNumber(event.target.value))}
                     />
                  </FormControl>
                  <FormMessage />
               </FormItem>
            )}
         />
      </div>
   )
}

const OptionsPanel: React.FC = () => {
   const { control } = useFormContext<FieldConfigFormValues>()
   const { fields, append, remove } = useFieldArray({ control, name: 'options' })

   return (
      <div className="space-y-3">
         {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">No options yet. Add one to get started.</p>
         ) : (
            <div className="space-y-4">
               {fields.map((option, index) => (
                  <Fragment key={option.id ?? index}>
                     <div className="grid grid-cols-2 gap-2 rounded border p-2">
                        <FormField
                           control={control}
                           name={`options.${index}.label` as const}
                           render={({ field }) => (
                              <FormItem>
                                 <FormLabel>Label</FormLabel>
                                 <FormControl>
                                    <Input {...field} value={field.value ?? ''} />
                                 </FormControl>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                        <FormField
                           control={control}
                           name={`options.${index}.value` as const}
                           render={({ field }) => (
                              <FormItem>
                                 <FormLabel>Value</FormLabel>
                                 <FormControl>
                                    <Input {...field} value={field.value ?? ''} />
                                 </FormControl>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                        <FormField
                           control={control}
                           name={`options.${index}.disabled` as const}
                           render={({ field }) => (
                              <FormItem className="col-span-2 flex items-center justify-between">
                                 <FormLabel>Disabled</FormLabel>
                                 <FormControl>
                                    <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                                 </FormControl>
                              </FormItem>
                           )}
                        />
                        <Button
                           type="button"
                           variant="ghost"
                           className="col-span-2 justify-end gap-2 text-destructive"
                           onClick={() => remove(index)}
                        >
                           <Trash2 className="h-4 w-4" />
                           Remove option
                        </Button>
                     </div>
                  </Fragment>
               ))}
            </div>
         )}

         <Button
            type="button"
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => append(EMPTY_OPTION)}
         >
            <Plus className="h-4 w-4" />
            Add option
         </Button>
      </div>
   )
}

type PanelOf<K extends FieldConfig['type']> = React.FC

export const FIELD_PANELS: {
   [K in FieldConfig['type']]?: PanelOf<K>
} = {
   text: TextLikePanel,
   textarea: TextLikePanel,
   number: NumberPanel,
   file: FilePanel,
   select: OptionsPanel,
   radio: OptionsPanel,
}

