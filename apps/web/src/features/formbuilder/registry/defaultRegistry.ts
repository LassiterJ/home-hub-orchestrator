import React from 'react'
import { CodegenArgs, FieldRegistry, FieldRegistryEntry, FieldSchema, RenderArgs } from '../form-schema'

// Import shadcn components
import { Checkbox } from '@/components/ui/Checkbox/Checkbox'
import { Combobox } from '@/components/ui/Combobox/combobox'
import { DatePicker } from '@/components/ui/DatePicker/DatePicker'
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input/Input'
import { Label } from '@/components/ui/Label/Label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup/RadioGroup'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select/Select'
import { Switch } from '@/components/ui/Switch/Switch'
import { Textarea } from '@/components/ui/Textarea/Textarea'

/**
 * Utility function to generate Tailwind grid classes based on UI props
 */
const gridClassFor = (ui?: { width?: string; className?: string }): string => {
   if (!ui?.width || ui.width === 'full') return 'col-span-full'
   if (ui.width === '1/2') return 'col-span-6'
   if (ui.width === '1/3') return 'col-span-4'
   if (ui.width === '1/4') return 'col-span-3'
   return 'col-span-auto'
}

/**
 * Common form field wrapper that handles FormItem, FormLabel, FormControl, etc.
 */
const FormFieldWrapper = ({
                             field,
                             children,
                             error,
                          }: {
   field: FieldSchema;
   children: React.ReactNode;
   error?: string;
}) => {
   return React.createElement(FormItem, { className: gridClassFor(field.ui) }, [
      field.label && React.createElement(FormLabel, { key: 'label' }, field.label),
      React.createElement(FormControl, { key: 'control' }, children),
      field.helpText && React.createElement(FormDescription, { key: 'description' }, field.helpText),
      error && React.createElement(FormMessage, { key: 'message' }, error),
   ])
}

/**
 * Text field registry entry
 */
const textFieldEntry: FieldRegistryEntry = {
   binding: 'register',
   imports: [
      'import { Input } from \'@/components/ui/Input/Input\'',
      'import { FormItem, FormLabel, FormControl, FormDescription, FormMessage } from \'@/components/ui/Form\'',
   ],
   render: ({ field, rhf }: RenderArgs) => {
      const textField = field as any // Type assertion for text field
      const error = rhf.errors[field.name]?.message as string

      return React.createElement(FormFieldWrapper, { field, error },
         React.createElement(Input, {
            ...rhf.register(field.name, {
               required: field.required,
               minLength: field.validation?.minLength,
               maxLength: field.validation?.maxLength,
               pattern: field.validation?.pattern ? new RegExp(field.validation.pattern) : undefined,
               ...(field.validation?.email && { type: 'email' }),
               ...(field.validation?.url && { type: 'url' }),
            }),
            type: textField.textKind === 'default' ? 'text' : textField.textKind,
            placeholder: field.placeholder,
            className: field.ui?.className,
         }),
      )
   },
   toTsx: ({ field, vars }: CodegenArgs) => {
      const textField = field as any
      const validationRules = []

      if (field.required) validationRules.push('required: true')
      if (field.validation?.minLength) validationRules.push(`minLength: ${field.validation.minLength}`)
      if (field.validation?.maxLength) validationRules.push(`maxLength: ${field.validation.maxLength}`)
      if (field.validation?.pattern) validationRules.push(`pattern: /${field.validation.pattern}/`)
      if (field.validation?.email) validationRules.push('type: \'email\'')
      if (field.validation?.url) validationRules.push('type: \'url\'')

      return `
      <FormItem className="${gridClassFor(field.ui)}">
        <FormLabel>${field.label || ''}</FormLabel>
        <FormControl>
          <Input
            {...${vars.dataName}.register('${field.name}', {
              ${validationRules.join(',\n              ')}
            })}
            type="${textField.textKind === 'default' ? 'text' : textField.textKind}"
            placeholder="${field.placeholder || ''}"
            className="${field.ui?.className || ''}"
          />
        </FormControl>
        ${field.helpText ? `<FormDescription>${field.helpText}</FormDescription>` : ''}
        <FormMessage />
      </FormItem>`.trim()
   },
   propsSpec: {
      type: 'object',
      properties: {
         textKind: { type: 'string', enum: ['default', 'email', 'password', 'url', 'search', 'tel'] },
         placeholder: { type: 'string' },
         required: { type: 'boolean' },
         validation: {
            type: 'object',
            properties: {
               minLength: { type: 'number' },
               maxLength: { type: 'number' },
               pattern: { type: 'string' },
               email: { type: 'boolean' },
               url: { type: 'boolean' },
            },
         },
      },
   },
}

/**
 * Textarea field registry entry
 */
const textareaFieldEntry: FieldRegistryEntry = {
   binding: 'register',
   imports: [
      'import { Textarea } from \'@/components/ui/Textarea/Textarea\'',
      'import { FormItem, FormLabel, FormControl, FormDescription, FormMessage } from \'@/components/ui/Form\'',
   ],
   render: ({ field, rhf }: RenderArgs) => {
      const textareaField = field as any
      const error = rhf.errors[field.name]?.message as string

      return React.createElement(FormFieldWrapper, { field, error },
         React.createElement(Textarea, {
            ...rhf.register(field.name, {
               required: field.required,
               minLength: field.validation?.minLength,
               maxLength: field.validation?.maxLength,
            }),
            placeholder: field.placeholder,
            rows: textareaField.rows || 3,
            className: field.ui?.className,
         }),
      )
   },
   toTsx: ({ field, vars }: CodegenArgs) => {
      const textareaField = field as any
      const validationRules = []

      if (field.required) validationRules.push('required: true')
      if (field.validation?.minLength) validationRules.push(`minLength: ${field.validation.minLength}`)
      if (field.validation?.maxLength) validationRules.push(`maxLength: ${field.validation.maxLength}`)

      return `
      <FormItem className="${gridClassFor(field.ui)}">
        <FormLabel>${field.label || ''}</FormLabel>
        <FormControl>
          <Textarea
            {...${vars.dataName}.register('${field.name}', {
              ${validationRules.join(',\n              ')}
            })}
            placeholder="${field.placeholder || ''}"
            rows={${textareaField.rows || 3}}
            className="${field.ui?.className || ''}"
          />
        </FormControl>
        ${field.helpText ? `<FormDescription>${field.helpText}</FormDescription>` : ''}
        <FormMessage />
      </FormItem>`.trim()
   },
   propsSpec: {
      type: 'object',
      properties: {
         rows: { type: 'number', minimum: 1, maximum: 20 },
         placeholder: { type: 'string' },
         required: { type: 'boolean' },
         validation: {
            type: 'object',
            properties: {
               minLength: { type: 'number' },
               maxLength: { type: 'number' },
            },
         },
      },
   },
}

/**
 * Number field registry entry
 */
const numberFieldEntry: FieldRegistryEntry = {
   binding: 'register',
   imports: [
      'import { Input } from \'@/components/ui/Input/Input\'',
      'import { FormItem, FormLabel, FormControl, FormDescription, FormMessage } from \'@/components/ui/Form\'',
   ],
   render: ({ field, rhf }: RenderArgs) => {
      const numberField = field as any
      const error = rhf.errors[field.name]?.message as string

      return React.createElement(FormFieldWrapper, { field, error },
         React.createElement(Input, {
            ...rhf.register(field.name, {
               required: field.required,
               min: field.validation?.min || numberField.min,
               max: field.validation?.max || numberField.max,
            }),
            type: 'number',
            step: numberField.step || 1,
            min: numberField.min,
            max: numberField.max,
            placeholder: field.placeholder,
            className: field.ui?.className,
         }),
      )
   },
   toTsx: ({ field, vars }: CodegenArgs) => {
      const numberField = field as any
      const validationRules = []

      if (field.required) validationRules.push('required: true')
      if (field.validation?.min !== undefined) validationRules.push(`min: ${field.validation.min}`)
      if (field.validation?.max !== undefined) validationRules.push(`max: ${field.validation.max}`)

      return `
      <FormItem className="${gridClassFor(field.ui)}">
        <FormLabel>${field.label || ''}</FormLabel>
        <FormControl>
          <Input
            {...${vars.dataName}.register('${field.name}', {
              ${validationRules.join(',\n              ')}
            })}
            type="number"
            step={${numberField.step || 1}}
            min={${numberField.min || 0}}
            max={${numberField.max || 100}}
            placeholder="${field.placeholder || ''}"
            className="${field.ui?.className || ''}"
          />
        </FormControl>
        ${field.helpText ? `<FormDescription>${field.helpText}</FormDescription>` : ''}
        <FormMessage />
      </FormItem>`.trim()
   },
   propsSpec: {
      type: 'object',
      properties: {
         step: { type: 'number' },
         min: { type: 'number' },
         max: { type: 'number' },
         placeholder: { type: 'string' },
         required: { type: 'boolean' },
         validation: {
            type: 'object',
            properties: {
               min: { type: 'number' },
               max: { type: 'number' },
            },
         },
      },
   },
}

/**
 * Checkbox field registry entry
 */
const checkboxFieldEntry: FieldRegistryEntry = {
   binding: 'register',
   imports: [
      'import { Checkbox } from \'@/components/ui/Checkbox/Checkbox\'',
      'import { FormItem, FormLabel, FormControl, FormDescription, FormMessage } from \'@/components/ui/Form\'',
   ],
   render: ({ field, rhf }: RenderArgs) => {
      const error = rhf.errors[field.name]?.message as string

      return React.createElement(FormFieldWrapper, { field, error },
         React.createElement('div', { className: 'flex items-center space-x-2' }, [
            React.createElement(Checkbox, {
               key: 'checkbox',
               ...rhf.register(field.name, {
                  required: field.required,
               }),
               id: field.id,
               className: field.ui?.className,
            }),
            React.createElement(Label, {
               key: 'label',
               htmlFor: field.id,
               className: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            }, field.label),
         ]),
      )
   },
   toTsx: ({ field, vars }: CodegenArgs) => {
      const validationRules = []
      if (field.required) validationRules.push('required: true')

      return `
      <FormItem className="${gridClassFor(field.ui)}">
        <FormControl>
          <div className="flex items-center space-x-2">
            <Checkbox
              {...${vars.dataName}.register('${field.name}', {
                ${validationRules.join(',\n                ')}
              })}
              id="${field.id}"
              className="${field.ui?.className || ''}"
            />
            <Label htmlFor="${field.id}" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              ${field.label || ''}
            </Label>
          </div>
        </FormControl>
        ${field.helpText ? `<FormDescription>${field.helpText}</FormDescription>` : ''}
        <FormMessage />
      </FormItem>`.trim()
   },
   propsSpec: {
      type: 'object',
      properties: {
         required: { type: 'boolean' },
      },
   },
}

/**
 * Switch field registry entry
 */
const switchFieldEntry: FieldRegistryEntry = {
   binding: 'register',
   imports: [
      'import { Switch } from \'@/components/ui/Switch/Switch\'',
      'import { FormItem, FormLabel, FormControl, FormDescription, FormMessage } from \'@/components/ui/Form\'',
   ],
   render: ({ field, rhf }: RenderArgs) => {
      const error = rhf.errors[field.name]?.message as string

      return React.createElement(FormFieldWrapper, { field, error },
         React.createElement('div', { className: 'flex items-center space-x-2' }, [
            React.createElement(Switch, {
               key: 'switch',
               ...rhf.register(field.name, {
                  required: field.required,
               }),
               id: field.id,
               className: field.ui?.className,
            }),
            React.createElement(Label, {
               key: 'label',
               htmlFor: field.id,
               className: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            }, field.label),
         ]),
      )
   },
   toTsx: ({ field, vars }: CodegenArgs) => {
      const validationRules = []
      if (field.required) validationRules.push('required: true')

      return `
      <FormItem className="${gridClassFor(field.ui)}">
        <FormControl>
          <div className="flex items-center space-x-2">
            <Switch
              {...${vars.dataName}.register('${field.name}', {
                ${validationRules.join(',\n                ')}
              })}
              id="${field.id}"
              className="${field.ui?.className || ''}"
            />
            <Label htmlFor="${field.id}" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              ${field.label || ''}
            </Label>
          </div>
        </FormControl>
        ${field.helpText ? `<FormDescription>${field.helpText}</FormDescription>` : ''}
        <FormMessage />
      </FormItem>`.trim()
   },
   propsSpec: {
      type: 'object',
      properties: {
         required: { type: 'boolean' },
      },
   },
}

/**
 * Select field registry entry
 */
const selectFieldEntry: FieldRegistryEntry = {
   binding: 'Controller',
   imports: [
      'import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from \'@/components/ui/Select/Select\'',
      'import { FormItem, FormLabel, FormControl, FormDescription, FormMessage } from \'@/components/ui/Form\'',
   ],
   render: ({ field, rhf }: RenderArgs) => {
      const selectField = field as any
      const error = rhf.errors[field.name]?.message as string

      return React.createElement(FormFieldWrapper, { field, error },
         React.createElement(rhf.Controller, {
            name: field.name,
            control: rhf.control,
            rules: {
               required: field.required,
            },
            render: ({ field: controllerField }) =>
               React.createElement(Select, {
                  value: controllerField.value,
                  onValueChange: controllerField.onChange,
                  disabled: controllerField.disabled,
               }, [
                  React.createElement(SelectTrigger, {
                     key: 'trigger',
                     className: field.ui?.className,
                  }, React.createElement(SelectValue, { placeholder: field.placeholder || 'Select an option' })),
                  React.createElement(SelectContent, {
                     key: 'content',
                  }, selectField.options?.map((option: any) =>
                     React.createElement(SelectItem, {
                        key: option.value,
                        value: String(option.value),
                        disabled: option.disabled,
                     }, option.label),
                  )),
               ]),
         }),
      )
   },
   toTsx: ({ field, vars }: CodegenArgs) => {
      const selectField = field as any
      const validationRules = []
      if (field.required) validationRules.push('required: true')

      const options = selectField.options?.map((option: any) =>
         `                <SelectItem key="${option.value}" value="${option.value}" ${option.disabled ? 'disabled' : ''}>
                  ${option.label}
                </SelectItem>`,
      ).join('\n') || ''

      return `
      <FormItem className="${gridClassFor(field.ui)}">
        <FormLabel>${field.label || ''}</FormLabel>
        <FormControl>
          <${vars.controlName}
            name="${field.name}"
            control={${vars.controlName}}
            rules={{
              ${validationRules.join(',\n              ')}
            }}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={field.disabled}
              >
                <SelectTrigger className="${field.ui?.className || ''}">
                  <SelectValue placeholder="${field.placeholder || 'Select an option'}" />
                </SelectTrigger>
                <SelectContent>
${options}
                </SelectContent>
              </Select>
            )}
          />
        </FormControl>
        ${field.helpText ? `<FormDescription>${field.helpText}</FormDescription>` : ''}
        <FormMessage />
      </FormItem>`.trim()
   },
   propsSpec: {
      type: 'object',
      properties: {
         options: {
            type: 'array',
            items: {
               type: 'object',
               properties: {
                  value: { type: 'string' },
                  label: { type: 'string' },
                  disabled: { type: 'boolean' },
               },
            },
         },
         placeholder: { type: 'string' },
         required: { type: 'boolean' },
      },
   },
}

/**
 * Combobox field registry entry
 */
const comboboxFieldEntry: FieldRegistryEntry = {
   binding: 'Controller',
   imports: [
      'import { Combobox } from \'@/components/ui/Combobox/combobox\'',
      'import { FormItem, FormLabel, FormControl, FormDescription, FormMessage } from \'@/components/ui/Form\'',
   ],
   render: ({ field, rhf }: RenderArgs) => {
      const comboboxField = field as any
      const error = rhf.errors[field.name]?.message as string

      return React.createElement(FormFieldWrapper, { field, error },
         React.createElement(rhf.Controller, {
            name: field.name,
            control: rhf.control,
            rules: {
               required: field.required,
            },
            render: ({ field: controllerField }) =>
               React.createElement(Combobox, {
                  options: comboboxField.options || [],
                  value: controllerField.value,
                  onValueChange: controllerField.onChange,
                  placeholder: field.placeholder || 'Select an option',
                  className: field.ui?.className,
               }),
         }),
      )
   },
   toTsx: ({ field, vars }: CodegenArgs) => {
      const comboboxField = field as any
      const validationRules = []
      if (field.required) validationRules.push('required: true')

      const options = comboboxField.options?.map((option: any) =>
         `{ value: "${option.value}", label: "${option.label}"${option.disabled ? ', disabled: true' : ''} }`,
      ).join(',\n      ') || ''

      return `
      <FormItem className="${gridClassFor(field.ui)}">
        <FormLabel>${field.label || ''}</FormLabel>
        <FormControl>
          <${vars.controlName}
            name="${field.name}"
            control={${vars.controlName}}
            rules={{
              ${validationRules.join(',\n              ')}
            }}
            render={({ field }) => (
              <Combobox
                options={[
                  ${options}
                ]}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="${field.placeholder || 'Select an option'}"
                className="${field.ui?.className || ''}"
              />
            )}
          />
        </FormControl>
        ${field.helpText ? `<FormDescription>${field.helpText}</FormDescription>` : ''}
        <FormMessage />
      </FormItem>`.trim()
   },
   propsSpec: {
      type: 'object',
      properties: {
         options: {
            type: 'array',
            items: {
               type: 'object',
               properties: {
                  value: { type: 'string' },
                  label: { type: 'string' },
                  disabled: { type: 'boolean' },
               },
            },
         },
         placeholder: { type: 'string' },
         required: { type: 'boolean' },
      },
   },
}

/**
 * Radio field registry entry
 */
const radioFieldEntry: FieldRegistryEntry = {
   binding: 'Controller',
   imports: [
      'import { RadioGroup, RadioGroupItem } from \'@/components/ui/RadioGroup/RadioGroup\'',
      'import { FormItem, FormLabel, FormControl, FormDescription, FormMessage } from \'@/components/ui/Form\'',
   ],
   render: ({ field, rhf }: RenderArgs) => {
      const radioField = field as any
      const error = rhf.errors[field.name]?.message as string

      return React.createElement(FormFieldWrapper, { field, error },
         React.createElement(rhf.Controller, {
            name: field.name,
            control: rhf.control,
            rules: {
               required: field.required,
            },
            render: ({ field: controllerField }) =>
               React.createElement(RadioGroup, {
                  value: controllerField.value,
                  onValueChange: controllerField.onChange,
                  disabled: controllerField.disabled,
                  className: field.ui?.className,
               }, radioField.options?.map((option: any) =>
                  React.createElement('div', {
                     key: option.value,
                     className: 'flex items-center space-x-2',
                  }, [
                     React.createElement(RadioGroupItem, {
                        key: 'radio',
                        value: String(option.value),
                        id: `${field.id}-${option.value}`,
                        disabled: option.disabled,
                     }),
                     React.createElement(Label, {
                        key: 'label',
                        htmlFor: `${field.id}-${option.value}`,
                        className: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                     }, option.label),
                  ]),
               )),
         }),
      )
   },
   toTsx: ({ field, vars }: CodegenArgs) => {
      const radioField = field as any
      const validationRules = []
      if (field.required) validationRules.push('required: true')

      const options = radioField.options?.map((option: any) =>
         `                <div key="${option.value}" className="flex items-center space-x-2">
                  <RadioGroupItem value="${option.value}" id="${field.id}-${option.value}" ${option.disabled ? 'disabled' : ''} />
                  <Label htmlFor="${field.id}-${option.value}" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    ${option.label}
                  </Label>
                </div>`,
      ).join('\n') || ''

      return `
      <FormItem className="${gridClassFor(field.ui)}">
        <FormLabel>${field.label || ''}</FormLabel>
        <FormControl>
          <${vars.controlName}
            name="${field.name}"
            control={${vars.controlName}}
            rules={{
              ${validationRules.join(',\n              ')}
            }}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                disabled={field.disabled}
                className="${field.ui?.className || ''}"
              >
${options}
              </RadioGroup>
            )}
          />
        </FormControl>
        ${field.helpText ? `<FormDescription>${field.helpText}</FormDescription>` : ''}
        <FormMessage />
      </FormItem>`.trim()
   },
   propsSpec: {
      type: 'object',
      properties: {
         options: {
            type: 'array',
            items: {
               type: 'object',
               properties: {
                  value: { type: 'string' },
                  label: { type: 'string' },
                  disabled: { type: 'boolean' },
               },
            },
         },
         required: { type: 'boolean' },
      },
   },
}

/**
 * Date field registry entry
 */
const dateFieldEntry: FieldRegistryEntry = {
   binding: 'Controller',
   imports: [
      'import { DatePicker } from \'@/components/ui/DatePicker/DatePicker\'',
      'import { FormItem, FormLabel, FormControl, FormDescription, FormMessage } from \'@/components/ui/Form\'',
   ],
   render: ({ field, rhf }: RenderArgs) => {
      const error = rhf.errors[field.name]?.message as string

      return React.createElement(FormFieldWrapper, { field, error },
         React.createElement(rhf.Controller, {
            name: field.name,
            control: rhf.control,
            rules: {
               required: field.required,
            },
            render: ({ field: controllerField }) =>
               React.createElement(DatePicker, {
                  date: controllerField.value ? new Date(controllerField.value) : undefined,
                  setDate: (date) => controllerField.onChange(date?.toISOString()),
                  placeholder: field.placeholder || 'Pick a date',
                  className: field.ui?.className,
               }),
         }),
      )
   },
   toTsx: ({ field, vars }: CodegenArgs) => {
      const validationRules = []
      if (field.required) validationRules.push('required: true')

      return `
      <FormItem className="${gridClassFor(field.ui)}">
        <FormLabel>${field.label || ''}</FormLabel>
        <FormControl>
          <${vars.controlName}
            name="${field.name}"
            control={${vars.controlName}}
            rules={{
              ${validationRules.join(',\n              ')}
            }}
            render={({ field }) => (
              <DatePicker
                date={field.value ? new Date(field.value) : undefined}
                setDate={(date) => field.onChange(date?.toISOString())}
                placeholder="${field.placeholder || 'Pick a date'}"
                className="${field.ui?.className || ''}"
              />
            )}
          />
        </FormControl>
        ${field.helpText ? `<FormDescription>${field.helpText}</FormDescription>` : ''}
        <FormMessage />
      </FormItem>`.trim()
   },
   propsSpec: {
      type: 'object',
      properties: {
         mode: { type: 'string', enum: ['date', 'datetime'] },
         placeholder: { type: 'string' },
         required: { type: 'boolean' },
      },
   },
}

/**
 * Slider field registry entry (placeholder - would need custom slider component)
 */
const sliderFieldEntry: FieldRegistryEntry = {
   binding: 'Controller',
   imports: [
      'import { FormItem, FormLabel, FormControl, FormDescription, FormMessage } from \'@/components/ui/Form\'',
   ],
   render: ({ field, rhf }: RenderArgs) => {
      const sliderField = field as any
      const error = rhf.errors[field.name]?.message as string

      return React.createElement(FormFieldWrapper, { field, error },
         React.createElement(rhf.Controller, {
            name: field.name,
            control: rhf.control,
            rules: {
               required: field.required,
               min: sliderField.min,
               max: sliderField.max,
            },
            render: ({ field: controllerField }) =>
               React.createElement('div', { className: 'space-y-2' }, [
                  React.createElement('input', {
                     key: 'slider',
                     type: 'range',
                     min: sliderField.min,
                     max: sliderField.max,
                     step: sliderField.step || 1,
                     value: controllerField.value || sliderField.min,
                     onChange: (e) => controllerField.onChange(Number(e.target.value)),
                     className: 'w-full',
                  }),
                  React.createElement('div', {
                     key: 'value',
                     className: 'text-sm text-muted-foreground',
                  }, `Value: ${controllerField.value || sliderField.min}`),
               ]),
         }),
      )
   },
   toTsx: ({ field, vars }: CodegenArgs) => {
      const sliderField = field as any
      const validationRules = []
      if (field.required) validationRules.push('required: true')
      if (sliderField.min !== undefined) validationRules.push(`min: ${sliderField.min}`)
      if (sliderField.max !== undefined) validationRules.push(`max: ${sliderField.max}`)

      return `
      <FormItem className="${gridClassFor(field.ui)}">
        <FormLabel>${field.label || ''}</FormLabel>
        <FormControl>
          <${vars.controlName}
            name="${field.name}"
            control={${vars.controlName}}
            rules={{
              ${validationRules.join(',\n              ')}
            }}
            render={({ field }) => (
              <div className="space-y-2">
                <input
                  type="range"
                  min={${sliderField.min}}
                  max={${sliderField.max}}
                  step={${sliderField.step || 1}}
                  value={field.value || ${sliderField.min}}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground">
                  Value: {field.value || ${sliderField.min}}
                </div>
              </div>
            )}
          />
        </FormControl>
        ${field.helpText ? `<FormDescription>${field.helpText}</FormDescription>` : ''}
        <FormMessage />
      </FormItem>`.trim()
   },
   propsSpec: {
      type: 'object',
      properties: {
         min: { type: 'number' },
         max: { type: 'number' },
         step: { type: 'number' },
         required: { type: 'boolean' },
      },
   },
}

/**
 * Custom field registry entry (placeholder)
 */
const customFieldEntry: FieldRegistryEntry = {
   binding: 'Controller',
   imports: [],
   render: ({ field }: RenderArgs) => {
      const customField = field as any
      return React.createElement('div', {
         className: 'p-4 border border-dashed border-muted-foreground rounded-md',
      }, React.createElement('p', {
         className: 'text-sm text-muted-foreground',
      }, `Custom field: ${customField.componentKey || 'No component specified'}`))
   },
   toTsx: ({ field }: CodegenArgs) => {
      const customField = field as any
      return `
      <FormItem className="${gridClassFor(field.ui)}">
        <FormLabel>${field.label || ''}</FormLabel>
        <FormControl>
          {/* Custom component: ${customField.componentKey || 'No component specified'} */}
          <div className="p-4 border border-dashed border-muted-foreground rounded-md">
            <p className="text-sm text-muted-foreground">
              Custom field: ${customField.componentKey || 'No component specified'}
            </p>
          </div>
        </FormControl>
        ${field.helpText ? `<FormDescription>${field.helpText}</FormDescription>` : ''}
        <FormMessage />
      </FormItem>`.trim()
   },
   propsSpec: {
      type: 'object',
      properties: {
         componentKey: { type: 'string' },
         props: { type: 'object' },
      },
   },
}

/**
 * Default field registry mapping field types to their implementations
 */
export const defaultRegistry: FieldRegistry = {
   text: textFieldEntry,
   textarea: textareaFieldEntry,
   number: numberFieldEntry,
   checkbox: checkboxFieldEntry,
   switch: switchFieldEntry,
   select: selectFieldEntry,
   combobox: comboboxFieldEntry,
   radio: radioFieldEntry,
   date: dateFieldEntry,
   slider: sliderFieldEntry,
   custom: customFieldEntry,
}

/**
 * Field type information for the builder UI
 */
export const fieldTypeInfo: Record<FieldType, {
   label: string;
   description: string;
   icon?: string;
   category: 'input' | 'selection' | 'date' | 'custom'
}> = {
   text: { label: 'Text Input', description: 'Single line text input', icon: '📝', category: 'input' },
   textarea: { label: 'Textarea', description: 'Multi-line text input', icon: '📄', category: 'input' },
   number: { label: 'Number', description: 'Numeric input with validation', icon: '🔢', category: 'input' },
   checkbox: { label: 'Checkbox', description: 'Single checkbox input', icon: '☑️', category: 'selection' },
   switch: { label: 'Switch', description: 'Toggle switch input', icon: '🔘', category: 'selection' },
   select: { label: 'Select', description: 'Dropdown selection', icon: '📋', category: 'selection' },
   combobox: { label: 'Combobox', description: 'Searchable dropdown', icon: '🔍', category: 'selection' },
   radio: { label: 'Radio Group', description: 'Radio button group', icon: '🔘', category: 'selection' },
   date: { label: 'Date Picker', description: 'Date selection input', icon: '📅', category: 'date' },
   slider: { label: 'Slider', description: 'Range slider input', icon: '🎚️', category: 'input' },
   custom: { label: 'Custom', description: 'Custom component field', icon: '⚙️', category: 'custom' },
}
