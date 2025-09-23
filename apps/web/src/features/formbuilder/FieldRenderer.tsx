import { Checkbox } from '@/components/ui/Checkbox'
import { DatePicker } from '@/components/ui/DatePicker'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
// import { type FieldDef } from '@/stores/formBuilder.store'
import { type Control, type FieldValues } from 'react-hook-form'
import { FormDataItem } from '@/features/formbuilder/builder/FormEditor'

/**
 * FieldRenderer
 *
 * Minimal registry-driven field renderer. Maps FieldDef kinds to UI controls using
 * our design system components. Intended for runtime preview only.
 *
 */
export function FieldRenderer({ def, control }: { def: FormDataItem; control: Control<FieldValues> }) {
   if (!def) return null
   console.log(`Field(${def?.name} def: `, def)
   switch (def.type) {
      case 'text':
         return (
            <FormField
               control={control}
               name={def.id}
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>{def.label}</FormLabel>
                     <FormControl>
                        <Input placeholder={def.placeholder} {...field} />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value as string | undefined}>
                           <SelectTrigger>
                              <SelectValue placeholder="Select an option" />
                           </SelectTrigger>
                           <SelectContent>
                              {def.options.map((opt) => (
                                 <SelectItem key={opt.value} value={opt.value}>
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

      case 'checkbox':
         return (
            <FormField
               control={control}
               name={def.id}
               render={({ field }) => (
                  <FormItem>
                     <div className="flex items-center gap-2">
                        <FormControl>
                           <Checkbox checked={!!field.value} onCheckedChange={field.onChange as any} />
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
                           setDate={(d) => field.onChange(d)}
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


