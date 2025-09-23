import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { FIELD_PANELS } from '@/features/formbuilder/builder/FieldSpecificConfigPanels'
import { FieldByType, FieldPatch } from '@/features/formbuilder/builder/FormBuilderTypes'
import { Label } from '@home-hub-orchestrator/ui'
import type { FieldKind } from './FormBuilderTypes'
import { Trash } from 'lucide-react'

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
   selectedFieldId: string;
   fieldData: FieldByType<K>;
   onChange: (patch: FieldPatch<K>) => void;
   onAddField?: (fieldData: FieldByType<K>) => void;
   onRemoveField: (id: string) => void
};

export function FieldConfigPanel({
                                    selectedFieldId,
                                    fieldData,
                                    onChange,
                                    onAddField,
                                    onRemoveField,
                                 }: FieldConfigPanelProps) {
   const type = fieldData?.type ?? 'text'
   console.log('FieldConfigPanel, type: ', type)
   console.log('FieldConfigPanel, selectedFieldId: ', selectedFieldId)
   console.log('FieldConfigPanel, fieldData: ', fieldData)

   const Panel = FIELD_PANELS[type]
   const title = selectedFieldId ? 'Edit Field' : 'Add Field'

   return (
      <div className=" p-2 space-y-3 border relative ">
         <Label>{title}</Label>
         <Trash onClick={() => onRemoveField(selectedFieldId)}
                className={'absolute top-4 right-4 cursor-pointer hover:text-red-600'} />
         <div>
            <Label>Name</Label>
            {/* Ensure a stable controlled input by coercing undefined to empty string */}
            <Input
               name="fieldName" value={fieldData.name ?? ''}
               onChange={(e) => onChange({ name: e.target.value as any })}
               placeholder="fieldData_name" />
         </div>
         <div>
            <Label>Label</Label>
            {/* Keep input controlled across renders to avoid uncontrolled→controlled warnings */}
            <Input value={fieldData.label ?? ''}
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

      </div>
   )
}


