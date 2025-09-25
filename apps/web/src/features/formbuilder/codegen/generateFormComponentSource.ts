import { FieldConfig } from '@/features/formbuilder/builder/FormBuilderTypes';
import { FormSchema } from '@/stores/formBuilder.store';
import { formatDefaultValueForCode, indentBlock } from './schemaUtils';

type ComponentImport = { name: string; from: string; isDefault?: boolean }

type ImportBucket = Map<string, { default?: string; named: Set<string> }>

type GenerateOptions = {
  componentName?: string;
}

/**
 * @description Produces a ready-to-copy TSX component that mirrors the current
 * form builder preview. Consumers can drop the output into any `tsx` file with
 * the same design-system primitives available on the import paths referenced
 * below.
 */
export function generateFormComponentSource(schema: FormSchema, options: GenerateOptions = {}): string {
  const componentName = options.componentName ?? inferComponentName(schema)
  const importBucket: ImportBucket = new Map()

  // Base imports shared across every generated form component.
  addImport(importBucket, { name: 'useForm', from: 'react-hook-form' })
  addImport(importBucket, { name: 'Form', from: '@/components/ui/Form' })
  addImport(importBucket, { name: 'FormField', from: '@/components/ui/Form' })
  addImport(importBucket, { name: 'FormItem', from: '@/components/ui/Form' })
  addImport(importBucket, { name: 'FormLabel', from: '@/components/ui/Form' })
  addImport(importBucket, { name: 'FormControl', from: '@/components/ui/Form' })
  addImport(importBucket, { name: 'FormMessage', from: '@/components/ui/Form' })
  addImport(importBucket, { name: 'Button', from: '@/components/ui/Button' })

  const fieldBlocks = schema.fieldOrder
    .map((fieldId) => {
      const fieldConfig = schema.fieldsById[fieldId]
      if (!fieldConfig) return null
      return buildFieldBlock(fieldConfig, importBucket)
    })
    .filter((block): block is string => Boolean(block))

  const typeShape = schema.fieldOrder
    .map((fieldId) => {
      const fieldConfig = schema.fieldsById[fieldId]
      const typeLiteral = resolveFieldTypeLiteral(fieldConfig)
      return `   '${fieldId}': ${typeLiteral};`
    })
    .join('\n')

  const defaultsLiteral = schema.fieldOrder
    .map((fieldId) => `      '${fieldId}': ${formatDefaultValueForCode(schema.fieldsById[fieldId])},`)
    .join('\n')

  const prioritizedImports = ['react-hook-form', '@/components/ui/Form']
  const sortedEntries = Array.from(importBucket.entries()).sort(([fromA], [fromB]) => {
    const idxA = prioritizedImports.indexOf(fromA)
    const idxB = prioritizedImports.indexOf(fromB)
    if (idxA !== -1 && idxB !== -1) return idxA - idxB
    if (idxA !== -1) return -1
    if (idxB !== -1) return 1
    return fromA.localeCompare(fromB)
  })

  const importBlock = sortedEntries
    .map(([from, spec]) => formatImport(from, spec))
    .join('\n')

  const renderedFields = fieldBlocks.length
    ? fieldBlocks.map((block) => indentBlock(block, 3)).join('\n\n')
    : indentBlock('{/* TODO: add fields to this form */}', 3)

  return `/**\n * @description Auto-generated form component from SimpleFormBuilder.\n * Customize naming, defaults, and submission logic before shipping.\n */\n${importBlock}\n\ntype ${componentName}Values = {\n${typeShape || "   // Add fields to define values"}\n}\n\nexport function ${componentName}() {\n   // Initialize React Hook Form with builder-derived defaults.\n   const form = useForm<${componentName}Values>({\n      defaultValues: {\n${defaultsLiteral || '         // No fields defined yet'}\n      },\n      mode: 'onChange',\n   })\n\n   // Replace with domain-specific submission behavior.\n   const handleSubmit = (values: ${componentName}Values) => {\n      console.log(values)\n   }\n\n   return (\n      <Form {...form}>\n         <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">\n${renderedFields}\n\n            <Button type="submit" size="sm">Submit</Button>\n         </form>\n      </Form>\n   )\n}\n`
}

/**
 * @description Emits the JSX block for a single field while accumulating the
 * component imports required for the entire generated module.
 */
function buildFieldBlock(def: FieldConfig, importBucket: ImportBucket): string {
  switch (def.type) {
    case 'text':
      addImport(importBucket, { name: 'Input', from: '@/components/ui/Input' })
      return wrapWithFormField(def, buildTextControl(def, 'Input'))
    case 'textarea':
      addImport(importBucket, { name: 'Textarea', from: '@/components/ui/Textarea' })
      return wrapWithFormField(def, buildTextControl(def, 'Textarea'))
    case 'number':
      addImport(importBucket, { name: 'Input', from: '@/components/ui/Input' })
      return wrapWithFormField(def, buildNumberControl(def))
    case 'select':
      addImport(importBucket, { name: 'Select', from: '@/components/ui/Select' })
      addImport(importBucket, { name: 'SelectTrigger', from: '@/components/ui/Select' })
      addImport(importBucket, { name: 'SelectContent', from: '@/components/ui/Select' })
      addImport(importBucket, { name: 'SelectItem', from: '@/components/ui/Select' })
      addImport(importBucket, { name: 'SelectValue', from: '@/components/ui/Select' })
      return wrapWithFormField(def, buildSelectControl(def))
    case 'radio':
      addImport(importBucket, { name: 'RadioGroup', from: '@/components/ui/RadioGroup' })
      addImport(importBucket, { name: 'RadioGroupItem', from: '@/components/ui/RadioGroup' })
      addImport(importBucket, { name: 'Label', from: '@/components/ui/Label' })
      return wrapWithFormField(def, buildRadioControl(def))
    case 'checkbox':
      addImport(importBucket, { name: 'Checkbox', from: '@/components/ui/Checkbox' })
      return wrapWithFormField(def, buildCheckboxControl(def), { hideLabel: true })
    case 'date':
      addImport(importBucket, { name: 'DatePicker', from: '@/components/ui/DatePicker' })
      return wrapWithFormField(def, buildDateControl(def))
    case 'file':
      addImport(importBucket, { name: 'Input', from: '@/components/ui/Input' })
      return wrapWithFormField(def, buildFileControl(def))
    default:
      return `         {/* Unsupported field type: ${def.type} */}`
  }
}

type WrapOptions = { hideLabel?: boolean }

/**
 * @description Wraps a field-specific control with the shared `FormField`
 * structure used across the generated output. Optionally suppresses the outer
 * label if the control renders its own (e.g., checkboxes).
 */
function wrapWithFormField(def: FieldConfig, innerControl: string, options: WrapOptions = {}): string {
  const labelLiteral = JSON.stringify(def.label ?? def.name ?? def.id)
  const lines: string[] = [
    `<FormField`,
    `   control={form.control}`,
    `   name="${def.id}"`,
    `   render={({ field }) => (`,
    `      <FormItem>`,
  ]

  if (!options.hideLabel) {
    lines.push(`         <FormLabel>{${labelLiteral}}</FormLabel>`)
  }

  lines.push(
    `         <FormControl>`,
  )
  lines.push(indentBlock(innerControl, 3))
  lines.push(`         </FormControl>`)
  lines.push(`         <FormMessage />`)
  lines.push(`      </FormItem>`)
  lines.push(`   )}`)
  lines.push(`/>`)

  return lines.join('\n')
}

/**
 * @description Produces the JSX for text-based inputs, ensuring placeholders
 * mirror builder configuration while forwarding React Hook Form bindings.
 */
function buildTextControl(def: Extract<FieldConfig, { type: 'text' | 'textarea' }>, componentName: 'Input' | 'Textarea'): string {
  const placeholder = JSON.stringify(def.placeholder ?? '')
  return [
    `<${componentName}`,
    `   placeholder={${placeholder}}`,
    `   {...field}`,
    `/>`,
  ].join('\n')
}

/**
 * @description Renders numeric inputs including optional min/max/step validations.
 */
function buildNumberControl(def: Extract<FieldConfig, { type: 'number' }>): string {
  const lines = [
    `<Input`,
    `   type="number"`,
    `   placeholder={${JSON.stringify(def.placeholder ?? '')}}`,
  ]

  if (typeof def.min === 'number') {
    lines.push(`   min={${def.min}}`)
  }
  if (typeof def.max === 'number') {
    lines.push(`   max={${def.max}}`)
  }
  lines.push(`   step={${def.step !== undefined ? def.step : JSON.stringify('any')}}`)
  lines.push(`   {...field}`)
  lines.push('/>')
  return lines.join('\n')
}

/**
 * @description Builds the select control along with each option element.
 */
function buildSelectControl(def: Extract<FieldConfig, { type: 'select' }>): string {
  const options = (def.options ?? []).map((opt) => {
    const disabledProp = opt.disabled ? ' disabled' : ''
    return `            <SelectItem value="${opt.value}"${disabledProp}>{${JSON.stringify(opt.label)}}</SelectItem>`
  })

  return [
    `<Select value={field.value ?? ''} onValueChange={field.onChange}>`,
    `   <SelectTrigger>`,
    `      <SelectValue placeholder={${JSON.stringify(def.placeholder || 'Select an option')}} />`,
    `   </SelectTrigger>`,
    `   <SelectContent>`,
    options.length ? options.join('\n') : '      {/* Add select options */}',
    `   </SelectContent>`,
    `</Select>`,
  ].join('\n')
}

/**
 * @description Renders radio groups using design-system primitives and labels.
 */
function buildRadioControl(def: Extract<FieldConfig, { type: 'radio' }>): string {
  const options = (def.options ?? []).map((opt) => {
    const optionId = `${def.id}-${opt.value}`
    return [
      `         <div className="flex items-center gap-2">`,
      `            <RadioGroupItem id="${optionId}" value="${opt.value}" />`,
      `            <Label htmlFor="${optionId}" className="font-normal">{${JSON.stringify(opt.label)}}</Label>`,
      '         </div>',
    ].join('\n')
  })

  return [
    `<RadioGroup value={field.value ?? ''} onValueChange={field.onChange} className="space-y-2">`,
    options.length ? options.join('\n') : '      {/* Add radio options */}',
    `</RadioGroup>`,
  ].join('\n')
}

/**
 * @description Generates the checkbox control while keeping layout consistent
 * with preview output.
 */
function buildCheckboxControl(_def: Extract<FieldConfig, { type: 'checkbox' }>): string {
  return [
    `<div className="flex items-center gap-2">`,
    `   <Checkbox checked={!!field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />`,
    `   <FormLabel className="!m-0">{${JSON.stringify(_def.label ?? _def.name ?? _def.id)}}</FormLabel>`,
    `</div>`,
  ].join('\n')
}

/**
 * @description Emits the date picker control hooked to React Hook Form.
 */
function buildDateControl(_def: Extract<FieldConfig, { type: 'date' }>): string {
  return [
    `<DatePicker`,
    `   date={(field.value as Date | undefined) ?? undefined}`,
    `   setDate={field.onChange}`,
    `/>`,
  ].join('\n')
}

/**
 * @description Generates an upload input that respects accept/multiple settings.
 */
function buildFileControl(def: Extract<FieldConfig, { type: 'file' }>): string {
  const lines = [
    `<Input`,
    `   type="file"`,
  ]

  if (Array.isArray(def.accept) && def.accept.length) {
    lines.push(`   accept=${JSON.stringify(def.accept.join(','))}`)
  }

  if (def.maxFiles && def.maxFiles > 1) {
    lines.push('   multiple')
  }

  lines.push('   onChange={(event) => field.onChange(event.target.files)}')
  lines.push('/>')
  return lines.join('\n')
}

/**
 * @description Maps schema field types to their TypeScript representation for
 * the generated form value type.
 */
function resolveFieldTypeLiteral(def?: FieldConfig): string {
  if (!def) return 'unknown'

  switch (def.type) {
    case 'checkbox':
      return 'boolean'
    case 'number':
      return 'number | null'
    case 'date':
      return 'Date | null'
    case 'file':
      return 'FileList | null'
    default:
      return 'string'
  }
}

/**
 * @description Ensures a module import is registered for the generated source,
 * consolidating duplicate requests across multiple fields.
 */
function addImport(bucket: ImportBucket, { name, from, isDefault }: ComponentImport) {
  const entry = bucket.get(from) ?? { named: new Set<string>() }
  if (isDefault) {
    entry.default = name
  } else {
    entry.named.add(name)
  }
  bucket.set(from, entry)
}

/**
 * @description Serializes an accumulated import definition to a TSX import line.
 */
function formatImport(from: string, spec: { default?: string; named: Set<string> }): string {
  const pieces: string[] = []
  if (spec.default) {
    pieces.push(spec.default)
  }
  if (spec.named.size) {
    const named = `{ ${Array.from(spec.named).sort().join(', ')} }`
    pieces.push(named)
  }
  return `import ${pieces.join(', ')} from '${from}'`
}

/**
 * @description Derives a PascalCase component name from schema metadata so the
 * generated snippet has a meaningful export.
 */
function inferComponentName(schema: FormSchema): string {
  const base = schema.title ?? schema.id ?? 'GeneratedForm'
  const sanitized = base.replace(/[^a-zA-Z0-9]/g, ' ')
  const pascal = sanitized
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment[0].toUpperCase() + segment.slice(1))
    .join('')
  return pascal || 'GeneratedForm'
}


