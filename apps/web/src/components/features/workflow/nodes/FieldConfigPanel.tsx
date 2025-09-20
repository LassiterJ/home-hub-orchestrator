import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@home-hub-orchestrator/ui'
import { useMemo } from 'react'
import { FieldByType, FieldKind, FieldPatch } from '@/features/formbuilder/builder/FormBuilderTypes'

export type FieldConfig = {
   type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'radio' | 'date' | 'file'
   required?: boolean
   disabled?: boolean
   readOnly?: boolean
   defaultValue?: unknown
   placeholder?: string
   helpText?: string
   ariaLabel?: string
   debounceMs?: number

   minLength?: number
   maxLength?: number
   pattern?: string
   trim?: boolean
   normalize?: 'lower' | 'upper' | 'none'

   min?: number
   max?: number
   step?: number
   integer?: boolean
   positive?: boolean
   negative?: boolean

   minDate?: string
   maxDate?: string
   noPast?: boolean
   noFuture?: boolean

   accept?: string[]
   maxSizeMB?: number
   maxFiles?: number
   imageMaxWidth?: number
   imageMaxHeight?: number

   options?: Array<{ label: string; value: string; disabled?: boolean }>
   multiple?: boolean
   minSelected?: number
   maxSelected?: number
}

export type FieldConfigPanelProps<K extends FieldKind = FieldKind> = {
   selectedFieldId?: string | null;
   fieldData?: FieldByType<K>;
   onChange: (patch: FieldPatch<K>) => void;
};

export function FieldConfigPanel({ selectedFieldId, fieldData, onChange }: FieldConfigPanelProps) {
   const type = fieldData?.type
   console.log('FieldConfigPanel, type: ', type)
   console.log('FieldConfigPanel, selectedFieldId: ', selectedFieldId)
   console.log('FieldConfigPanel, fieldData: ', fieldData)
   // TODO: extract this: adding options to Form Node control components and registering them,  making a config file with json, or some implementation with global state
   const typeSpecific = useMemo(() => {
      switch (type) {
         case 'text':
         case 'textarea':
            return (
               <div className="grid grid-cols-2 gap-2">
                  <div>
                     <Label>Min length</Label>
                     <Input type="number" value={fieldData?.minLength ?? ''}
                            onChange={(e) => onChange({ minLength: e.target.value ? Number(e.target.value) : undefined })} />
                  </div>
                  <div>
                     <Label>Max length</Label>
                     <Input type="number" value={fieldData?.maxLength ?? ''}
                            onChange={(e) => onChange({ maxLength: e.target.value ? Number(e.target.value) : undefined })} />
                  </div>
                  <div className="col-span-2">
                     <Label>Pattern (regex)</Label>
                     <Input value={fieldData?.pattern ?? ''}
                            onChange={(e) => onChange({ pattern: e.target.value || undefined })} />
                  </div>
               </div>
            )
         case 'number':
            return (
               <div className="grid grid-cols-2 gap-2">
                  <div>
                     <Label>Min</Label>
                     <Input type="number" value={fieldData?.min ?? ''}
                            onChange={(e) => onChange({ min: e.target.value ? Number(e.target.value) : undefined })} />
                  </div>
                  <div>
                     <Label>Max</Label>
                     <Input type="number" value={fieldData?.max ?? ''}
                            onChange={(e) => onChange({ max: e.target.value ? Number(e.target.value) : undefined })} />
                  </div>
                  <div>
                     <Label>Step</Label>
                     <Input type="number" value={fieldData?.step ?? ''}
                            onChange={(e) => onChange({ step: e.target.value ? Number(e.target.value) : undefined })} />
                  </div>
               </div>
            )
         case 'file':
            return (
               <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                     <Label>Accept (comma-separated)</Label>
                     <Input value={(fieldData?.accept ?? []).join(',')}
                            onChange={(e) => onChange({ accept: e.target.value ? e.target.value.split(',').map(s => s.trim()) : [] })} />
                  </div>
                  <div>
                     <Label>Max size (MB)</Label>
                     <Input type="number" value={fieldData?.maxSizeMB ?? ''}
                            onChange={(e) => onChange({ maxSizeMB: e.target.value ? Number(e.target.value) : undefined })} />
                  </div>
                  <div>
                     <Label>Max files</Label>
                     <Input type="number" value={fieldData?.maxFiles ?? ''}
                            onChange={(e) => onChange({ maxFiles: e.target.value ? Number(e.target.value) : undefined })} />
                  </div>
               </div>
            )
         case 'select':
         case 'radio':
            return (
               <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                     <Label>Options (JSON)</Label>
                     <Textarea value={JSON.stringify(fieldData?.options ?? [], null, 0)}
                               onChange={(e) => {
                                  try {
                                     const parsed = JSON.parse(e.target.value)
                                     if (Array.isArray(parsed)) onChange({ options: parsed })
                                  } catch {
                                  }
                               }} />
                  </div>
               </div>
            )
         default:
            return null
      }
   }, [type, fieldData, onChange])

   if (!selectedFieldId || !fieldData) {
      return (
         <div className="w-[320px] p-2 text-sm text-muted-foreground">
            Select a field to configure its settings.
         </div>
      )
   }


   return (
      <div className=" p-2 space-y-3">
         <div className="flex items-center justify-between">

            <div>
               <Label>Name</Label>
               <Input value={fieldData.name}
                      onChange={(e) => onChange(fieldData.id, { name: e.target.value as any })}
                      placeholder="fieldData_name" />
            </div>
            <div>
               <Label>Label</Label>
               <Input value={fieldData.label}
                      onChange={(e) => onChange(fieldData.id, { label: e.target.value })}
                      placeholder="Label" />
            </div>
            <div>
               <Label>Description</Label>
               <Input value={fieldData.description ?? ''}
                      onChange={(e) => onChange(fieldData.id, { description: e.target.value })}
                      placeholder="Add a helpful description" />
            </div>

            <Label>Required</Label>
            <Switch checked={!!fieldData.required} onCheckedChange={(v) => onChange({ required: v })} />
         </div>
         <div className="flex items-center justify-between">
            <Label>Disabled</Label>
            <Switch checked={!!fieldData.disabled} onCheckedChange={(v) => onChange({ disabled: v })} />
         </div>
         <div>
            <Label>Placeholder</Label>
            <Input value={fieldData.placeholder ?? ''} onChange={(e) => onChange({ placeholder: e.target.value })} />
         </div>
         <div>
            <Label>Help text</Label>
            <Input value={fieldData.helpText ?? ''} onChange={(e) => onChange({ helpText: e.target.value })} />
         </div>

         <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => onChange({ type: v as FieldConfig['type'] })}>
               <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
               <SelectContent>
                  {['text', 'textarea', 'number', 'select', 'checkbox', 'radio', 'date', 'file'].map(t => (
                     <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
               </SelectContent>
            </Select>
         </div>

         {typeSpecific}
      </div>
   )
}


