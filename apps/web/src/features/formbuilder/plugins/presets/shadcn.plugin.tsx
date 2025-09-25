import { Checkbox } from '@/components/ui/Checkbox'
import { DatePicker } from '@/components/ui/DatePicker'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { FieldConfig } from '@/features/formbuilder/builder/FormBuilderTypes'
import { FormBuilderPlugin } from '../core'

const registerInputImport = (registerImport: (specifier: string, from: string, isDefault?: boolean) => void) => {
  registerImport('Input', '@/components/ui/Input')
}

const registerCheckboxImport = (registerImport: (specifier: string, from: string, isDefault?: boolean) => void) => {
  registerImport('Checkbox', '@/components/ui/Checkbox')
}

const registerDatePickerImport = (registerImport: (specifier: string, from: string, isDefault?: boolean) => void) => {
  registerImport('DatePicker', '@/components/ui/DatePicker')
}

const registerTextareaImport = (registerImport: (specifier: string, from: string, isDefault?: boolean) => void) => {
  registerImport('Textarea', '@/components/ui/Textarea')
}

const registerSelectImports = (registerImport: (specifier: string, from: string, isDefault?: boolean) => void) => {
  registerImport('Select', '@/components/ui/Select')
  registerImport('SelectTrigger', '@/components/ui/Select')
  registerImport('SelectContent', '@/components/ui/Select')
  registerImport('SelectItem', '@/components/ui/Select')
  registerImport('SelectValue', '@/components/ui/Select')
}

const registerRadioImports = (registerImport: (specifier: string, from: string, isDefault?: boolean) => void) => {
  registerImport('RadioGroup', '@/components/ui/RadioGroup')
  registerImport('RadioGroupItem', '@/components/ui/RadioGroup')
  registerImport('Label', '@/components/ui/Label')
}

/**
 * @description Render preview helpers mirroring current shadcn implementation.
 * These strategies will be wired into runtime once the builder consumes the plugin registry.
 */
function renderTextField(def: FieldConfig) {
  return <Input placeholder={def.placeholder ?? ''} />
}

function renderCheckboxField(def: FieldConfig) {
  return <Checkbox aria-label={def.label} />
}

export const shadcnPlugin: FormBuilderPlugin = {
  id: 'shadcn-default',
  label: 'shadcn/ui',
  fields: {
    text: {
      renderPreview: (def) => renderTextField(def),
      generateCode: (def, ctx) => {
        registerInputImport(ctx.registerImport)
        return `<Input placeholder={${JSON.stringify(def.placeholder ?? '')}} {...field} />`
      },
    },
    textarea: {
      renderPreview: (def) => <Textarea placeholder={def.placeholder ?? ''} />,
      generateCode: (def, ctx) => {
        registerTextareaImport(ctx.registerImport)
        return `<Textarea placeholder={${JSON.stringify(def.placeholder ?? '')}} {...field} />`
      },
    },
    number: {
      renderPreview: (def) => (
        <Input
          type="number"
          placeholder={def.placeholder ?? ''}
          min={def.min}
          max={def.max}
          step={def.step}
        />
      ),
      generateCode: (def, ctx) => {
        registerInputImport(ctx.registerImport)
        const parts = [
          '<Input type="number"',
          `   placeholder={${JSON.stringify(def.placeholder ?? '')}}`,
        ]
        if (typeof def.min === 'number') {
          parts.push(`   min={${def.min}}`)
        }
        if (typeof def.max === 'number') {
          parts.push(`   max={${def.max}}`)
        }
        if (typeof def.step === 'number') {
          parts.push(`   step={${def.step}}`)
        }
        parts.push('   {...field} />')
        return parts.join('\n')
      },
    },
    checkbox: {
      renderPreview: (def) => renderCheckboxField(def),
      generateCode: (_def, ctx) => {
        registerCheckboxImport(ctx.registerImport)
        return '<Checkbox checked={!!field.value} onCheckedChange={field.onChange} />'
      },
    },
    select: {
      renderPreview: (def) => (
        <Select>
          <SelectTrigger>
            <SelectValue placeholder={def.placeholder ?? 'Select an option'} />
          </SelectTrigger>
          <SelectContent>
            {(def.options ?? []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
      generateCode: (def, ctx) => {
        registerSelectImports(ctx.registerImport)
        const options = (def.options ?? []).map(
          (opt) =>
            `            <SelectItem value="${opt.value}"${opt.disabled ? ' disabled' : ''}>${opt.label}</SelectItem>`,
        )
        return [
          '<Select value={field.value ?? \'\'} onValueChange={field.onChange}>',
          '   <SelectTrigger>',
          `      <SelectValue placeholder={${JSON.stringify(def.placeholder ?? 'Select an option')}} />`,
          '   </SelectTrigger>',
          '   <SelectContent>',
          options.length ? options.join('\n') : '      {/* options */}',
          '   </SelectContent>',
          '</Select>',
        ].join('\n')
      },
    },
    radio: {
      renderPreview: (def) => (
        <RadioGroup>
          {(def.options ?? []).map((opt) => (
            <div key={opt.value} className="flex items-center gap-2">
              <RadioGroupItem id={`${def.id}-${opt.value}`} value={opt.value} />
              <Label htmlFor={`${def.id}-${opt.value}`}>{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
      ),
      generateCode: (def, ctx) => {
        registerRadioImports(ctx.registerImport)
        const options = (def.options ?? []).map((opt) => {
          const id = `${def.id}-${opt.value}`
          return [
            '         <div className="flex items-center gap-2">',
            `            <RadioGroupItem id="${id}" value="${opt.value}" />`,
            `            <Label htmlFor="${id}">${opt.label}</Label>`,
            '         </div>',
          ].join('\n')
        })
        return [
          '<RadioGroup value={field.value ?? \'\'} onValueChange={field.onChange}>',
          options.length ? options.join('\n') : '      {/* radio options */}',
          '</RadioGroup>',
        ].join('\n')
      },
    },
    file: {
      renderPreview: (def) => (
        <Input type="file" multiple={Boolean(def.maxFiles && def.maxFiles > 1)} accept={def.accept?.join(',')} />
      ),
      generateCode: (def, ctx) => {
        registerInputImport(ctx.registerImport)
        const attrs = [
          '<Input type="file"',
          def.accept?.length ? `   accept="${def.accept.join(',')}"` : undefined,
          def.maxFiles && def.maxFiles > 1 ? '   multiple' : undefined,
          '   onChange={(event) => field.onChange(event.target.files)}',
          '/>',
        ].filter(Boolean)
        return attrs.join('\n')
      },
    },
    date: {
      renderPreview: () => <DatePicker date={undefined} setDate={() => undefined} />,
      generateCode: (_def, ctx) => {
        registerDatePickerImport(ctx.registerImport)
        return '<DatePicker date={field.value as Date | undefined} setDate={field.onChange} />'
      },
    },
  },
}


