import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { Label } from '@home-hub-orchestrator/ui'
import { FieldByType, FieldPatch } from '@/features/formbuilder/builder/FormBuilderTypes'
import type { FieldKind } from './FormBuilderTypes'
import { Button } from '@/components/ui/Button'
import { FIELD_PANELS } from '@/features/formbuilder/builder/FieldSpecificConfigPanels'

// export type FieldConfig = {
//    type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'radio' | 'date' | 'file'
//    required?: boolean
//    disabled?: boolean
//    readOnly?: boolean
//    defaultValue?: unknown
//    placeholder?: string
//    helpText?: string
//    ariaLabel?: string
//    debounceMs?: number
//
//    minLength?: number
//    maxLength?: number
//    pattern?: string
//    trim?: boolean
//    normalize?: 'lower' | 'upper' | 'none'
//
//    min?: number
//    max?: number
//    step?: number
//    integer?: boolean
//    positive?: boolean
//    negative?: boolean
//
//    minDate?: string
//    maxDate?: string
//    noPast?: boolean
//    noFuture?: boolean
//
//    accept?: string[]
//    maxSizeMB?: number
//    maxFiles?: number
//    imageMaxWidth?: number
//    imageMaxHeight?: number
//
//    options?: Array<{ label: string; value: string; disabled?: boolean }>
//    multiple?: boolean
//    minSelected?: number
//    maxSelected?: number
// }

export type FieldConfigPanelProps<K extends FieldKind = FieldKind> = {
   selectedFieldId?: string;
   fieldData: FieldByType<K>;
   onChange: (patch: FieldPatch<K>) => void;
   onAddField: (fieldData: FieldByType<K>) => void;
};

export function FormConfigPanel({ selectedFieldId, fieldData, onChange, onAddField }: FieldConfigPanelProps) {
   const type = fieldData?.type ?? 'text'
   console.log('FieldConfigPanel, type: ', type)
   console.log('FieldConfigPanel, selectedFieldId: ', selectedFieldId)
   console.log('FieldConfigPanel, fieldData: ', fieldData)

   const Panel = FIELD_PANELS[type]
   const title = selectedFieldId ? 'Edit Field' : 'Add Field'

   return (
      <div className=" p-2 space-y-3">
         <Label>{title}</Label>
         <div>
            <Label>Name</Label>
            <Input value={fieldData.name}
                   onChange={(e) => onChange({ name: e.target.value as any })}
                   placeholder="fieldData_name" />
         </div>
         <div>
            <Label>Label</Label>
            <Input value={fieldData.label}
                   onChange={(e) => onChange({ label: e.target.value })}
                   placeholder="Label" />
         </div>
         <div>
            <Label>Description</Label>
            <Input value={fieldData.description ?? ''}
                   onChange={(e) => onChange({ description: e.target.value })}
                   placeholder="Add a helpful description" />
         </div>
         <div className="flex items-center justify-between">
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
            <Select value={type} onValueChange={(v) => onChange({ type: v })}>
               <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
               <SelectContent>
                  {['text', 'textarea', 'number', 'select', 'checkbox', 'radio', 'date', 'file'].map(t => (
                     <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
               </SelectContent>
            </Select>
         </div>

         {Panel &&
            <Panel field={fieldData} onPatch={(p) => onChange(p as any)} />
         }

         {!selectedFieldId &&
            <Button className={''} onClick={() => onAddField(fieldData)}>
               Add Field
            </Button>
         }
      </div>
   )
}


