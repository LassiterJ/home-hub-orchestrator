import { Checkbox } from '@/components/ui/Checkbox'
import { DatePicker } from '@/components/ui/DatePicker'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { type FieldConfig } from '@/features/formbuilder/builder/FormBuilderTypes'
import { type Control, type FieldValues } from 'react-hook-form'

/**
 * @description Maps a `FieldConfig` node to its respective preview control using
 * design-system primitives. Each branch keeps React Hook Form in sync while
 * respecting type-specific constraints defined in the schema.
 */
export function FieldRenderer({ def, control }: { def: FieldConfig; control: Control<FieldValues> }) {
   if (!def) return null

   switch (def.type) {
      case 'text':
      case 'textarea':
         return (
            <FormField
               control={control}
               name={def.id}
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>{def.label}</FormLabel>
                     <FormControl>
                        {def.type === 'textarea' ? (
                           <Textarea placeholder={def.placeholder} {...field} />
                        ) : (
                           <Input placeholder={def.placeholder} {...field} />
                        )}
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />
         )

      case 'number':
         return (
            <FormField
               control={control}
               name={def.id}
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>{def.label}</FormLabel>
                     <FormControl>
                        <Input
                           type="number"
                           placeholder={def.placeholder}
                           min={def.min}
                           max={def.max}
                           step={def.step ?? 'any'}
                           {...field}
                        />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />
         )

      case 'select':
         return (
            <FormField
               control={control}
               name={def.id}
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>{def.label}</FormLabel>
                     <FormControl>
                        <Select value={(field.value as string) ?? ''} onValueChange={field.onChange}>
                           <SelectTrigger>
                              <SelectValue placeholder={def.placeholder || 'Select an option'} />
                           </SelectTrigger>
                           <SelectContent>
                              {(def.options ?? []).map((opt) => (
                                 <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                                    {opt.label}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />
         )

      case 'radio':
         return (
            <FormField
               control={control}
               name={def.id}
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>{def.label}</FormLabel>
                     <FormControl>
                        <RadioGroup value={(field.value as string) ?? ''} onValueChange={field.onChange} className="space-y-2">
                           {(def.options ?? []).map((option) => (
                              <div key={option.value} className="flex items-center gap-2">
                                 <RadioGroupItem id={`${def.id}-${option.value}`} value={option.value} />
                                 <Label htmlFor={`${def.id}-${option.value}`} className="font-normal">
                                    {option.label}
                                 </Label>
                              </div>
                           ))}
                        </RadioGroup>
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />
         )

      case 'checkbox':
         return (
            <FormField
               control={control}
               name={def.id}
               render={({ field }) => (
                  <FormItem>
                     <div className="flex items-center gap-2">
                        <FormControl>
                           <Checkbox checked={!!field.value} onCheckedChange={field.onChange as (value: boolean) => void} />
                        </FormControl>
                        <FormLabel className="!m-0">{def.label}</FormLabel>
                     </div>
                     <FormMessage />
                  </FormItem>
               )}
            />
         )

      case 'date':
         return (
            <FormField
               control={control}
               name={def.id}
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>{def.label}</FormLabel>
                     <FormControl>
                        <DatePicker
                           date={(field.value as Date | undefined) ?? undefined}
                           setDate={(value) => field.onChange(value)}
                        />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />
         )

      case 'file':
         return (
            <FormField
               control={control}
               name={def.id}
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>{def.label}</FormLabel>
                     <FormControl>
                        <Input
                           type="file"
                           accept={Array.isArray(def.accept) ? def.accept.join(',') : undefined}
                           multiple={Boolean(def.maxFiles && def.maxFiles > 1)}
                           onChange={(event) => field.onChange(event.target.files)}
                        />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />
         )

      default:
         return null
   }
}


