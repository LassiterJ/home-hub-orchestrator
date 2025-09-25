/**
 * @description Auto-generated form component from SimpleFormBuilder.
 * Customize naming, defaults, and submission logic before shipping.
 */
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { DatePicker } from '@/components/ui/DatePicker'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'

type SampleForm = {
   'field-14741b90-0fda-454d-84f4-989e005454f8': string;
   'field-6ab4dc0c-c8bd-4ea6-966a-bb7149671652': Date | null;
   'field-e0cc9ab7-ee8d-40de-ae62-26f339460d1b': string;
   'field-f782a930-e674-4866-847f-71ab1c3decf7': boolean;
   'field-4f7011b8-f358-4f06-88e9-45b186e427f0': FileList | null;
}

export function SampleForm() {
   // Initialize React Hook Form with builder-derived defaults.
   const form = useForm<SampleForm>({
      defaultValues: {
         'field-14741b90-0fda-454d-84f4-989e005454f8': '',
         'field-6ab4dc0c-c8bd-4ea6-966a-bb7149671652': null,
         'field-e0cc9ab7-ee8d-40de-ae62-26f339460d1b': '',
         'field-f782a930-e674-4866-847f-71ab1c3decf7': false,
         'field-4f7011b8-f358-4f06-88e9-45b186e427f0': null,
      },
      mode: 'onChange',
   })

   // Replace with domain-specific submission behavior.
   const handleSubmit = (values: SampleForm) => {
      console.log(values)
   }

   return (
      <Form {...form}>
         <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
               control={form.control}
               name="field-14741b90-0fda-454d-84f4-989e005454f8"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>{'Email'}</FormLabel>
                     <FormControl>
                        <Input
                           placeholder={'johndoe@gmail.com'}
                           {...field}
                        />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />

            <FormField
               control={form.control}
               name="field-6ab4dc0c-c8bd-4ea6-966a-bb7149671652"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>{'Date of Birth'}</FormLabel>
                     <FormControl>
                        <DatePicker
                           date={(field.value as Date | undefined) ?? undefined}
                           setDate={field.onChange}
                        />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />

            <FormField
               control={form.control}
               name="field-e0cc9ab7-ee8d-40de-ae62-26f339460d1b"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>{'Radio'}</FormLabel>
                     <FormControl>
                        <RadioGroup value={field.value ?? ''} onValueChange={field.onChange} className="space-y-2">
                           <div className="flex items-center gap-2">
                              <RadioGroupItem id="field-e0cc9ab7-ee8d-40de-ae62-26f339460d1b-TEST" value="TEST" />
                              <Label htmlFor="field-e0cc9ab7-ee8d-40de-ae62-26f339460d1b-TEST"
                                     className="font-normal">{'test1'}</Label>
                           </div>
                           <div className="flex items-center gap-2">
                              <RadioGroupItem id="field-e0cc9ab7-ee8d-40de-ae62-26f339460d1b-TEST2" value="TEST2" />
                              <Label htmlFor="field-e0cc9ab7-ee8d-40de-ae62-26f339460d1b-TEST2"
                                     className="font-normal">{'Test2'}</Label>
                           </div>
                        </RadioGroup>
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />

            <FormField
               control={form.control}
               name="field-f782a930-e674-4866-847f-71ab1c3decf7"
               render={({ field }) => (
                  <FormItem>
                     <FormControl>
                        <div className="flex items-center gap-2">
                           <Checkbox checked={!!field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />
                           <FormLabel className="!m-0">{'Terms and Conditions'}</FormLabel>
                        </div>
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />

            <FormField
               control={form.control}
               name="field-4f7011b8-f358-4f06-88e9-45b186e427f0"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>{'New Field'}</FormLabel>
                     <FormControl>
                        <Input
                           type="file"
                           onChange={(event) => field.onChange(event.target.files)}
                        />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />

            <Button type="submit" size="sm">Submit</Button>
         </form>
      </Form>
   )
}
