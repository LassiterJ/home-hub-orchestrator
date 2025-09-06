import React from 'react';

// v1 core --------------------------------------------------------------------

export type SchemaVersion = '1.0.0';

export type FormSchema = {
  schemaVersion: SchemaVersion;
  id: string;
  title?: string;
  description?: string;
  layout?: FormLayout;
  /** top-level form options (submit text, etc.) */
  options?: FormOptions;
  fields: FieldSchema[];
  /** computed defaultValues for RHF (optional cache) */
  defaultValues?: Record<string, unknown>;
  /** arbitrary metadata for app-specific features */
  meta?: Record<string, unknown>;
};

export type FormOptions = {
  submitLabel?: string;
  resetLabel?: string;
  /** RHF mode passthrough */
  mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'all' | 'onTouched';
  /** set to true to emit zodResolver in codegen when validation.zod exists */
  useZodResolver?: boolean;
};

export type FormLayout =
  | { kind: 'stack' } // vertical list
  | { kind: 'grid'; cols: 2 | 3 | 4; gap?: number }
  | {
    kind: 'sections';
    sections: SectionSpec[];
  };

export type SectionSpec = {
  id: string;
  title?: string;
  description?: string;
  layout?: Omit<FormLayout, 'sections'>;
  fields: string[]; // field ids contained in this section
};

// fields ---------------------------------------------------------------------

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'combobox'
  | 'date'
  | 'switch'
  | 'slider'
  | 'custom';

export type BaseField = {
  id: string;
  type: FieldType;
  /** form field name */
  name: string;
  label?: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: unknown;
  required?: boolean;
  /** UI/UX hints for renderer and codegen */
  ui?: UIProps;
  /** Conditional behavior */
  deps?: Dependency[];
  /** Per-field actions (advanced; optional) */
  actions?: FieldAction[];
  /** Validation rules */
  validation?: ValidationRules;
  /** Non-serialized data for builder only */
  _editor?: EditorOnly;
};

export type TextField = BaseField & {
  type: 'text' | 'textarea';
  /** text input mode hints */
  textKind?: 'default' | 'email' | 'password' | 'url' | 'search' | 'tel';
  /** textarea only */
  rows?: number;
};

export type NumberField = BaseField & {
  type: 'number';
  step?: number;
  min?: number;
  max?: number;
};

export type BooleanField = BaseField & {
  type: 'checkbox' | 'switch';
};

export type RadioField = BaseField & {
  type: 'radio';
  options: Option[];
  /** radio group id (implicitly = name if omitted) */
  groupId?: string;
};

export type SelectField = BaseField & {
  type: 'select' | 'combobox';
  options: Option[];
  multiple?: boolean;
};

export type DateField = BaseField & {
  type: 'date';
  /** ISO date format hint or preset like 'date' | 'datetime' */
  mode?: 'date' | 'datetime';
  minDate?: string; // ISO
  maxDate?: string; // ISO
};

export type SliderField = BaseField & {
  type: 'slider';
  min: number;
  max: number;
  step?: number;
};

export type CustomField = BaseField & {
  type: 'custom';
  /** module path or registry key used by runtime/Codegen */
  componentKey: string;
  /** arbitrary props forwarded to custom component */
  props?: Record<string, unknown>;
};

export type FieldSchema =
  | TextField
  | NumberField
  | BooleanField
  | RadioField
  | SelectField
  | DateField
  | SliderField
  | CustomField;

export type Option = {
  value: string | number;
  label: string;
  disabled?: boolean;
};

// validation -----------------------------------------------------------------

export type ValidationRules = {
  /** built-in primitive rules (RHF/native) */
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string; // JS regex string (without delimiters)
  email?: boolean;
  url?: boolean;
  /** zod source as string; optional and codegen-only */
  zod?: string;
  /** custom message overrides */
  messages?: Partial<Record<keyof Omit<ValidationRules, 'zod' | 'messages'>, string>>;
};

// ui props and conditional logic ---------------------------------------------

export type UIProps = {
  width?: 'full' | '1/2' | '1/3' | '1/4' | 'auto';
  className?: string;
  /** shadcn style options: variant/size when supported by component */
  variant?: string;
  size?: string;
  /** placeholder for icon support, etc. */
  adornments?: { leftIcon?: string; rightIcon?: string };
};

export type Dependency = {
  /** watched field name */
  watch: string;
  /** simple operators for v1 */
  op: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not-in' | 'truthy' | 'falsy';
  /** comparison value; lists allowed for in/not-in */
  value?: unknown;
  /** effect on the dependent field */
  effect: 'show' | 'hide' | 'disable' | 'enable' | 'setDefault';
  /** optional default when effect = setDefault */
  nextDefault?: unknown;
};

export type FieldAction = {
  kind: 'submit' | 'reset' | 'custom';
  label?: string;
  /** event payload to emit or codegen hook name */
  payload?: Record<string, unknown>;
};

// registry contracts ---------------------------------------------------------

/** how a field maps to RHF and shadcn during runtime render */
export type FieldRegistryEntry = {
  /** 'register' for simple inputs; 'Controller' for controlled shadcn components */
  binding: 'register' | 'Controller';
  /** required imports for renderer/codegen */
  imports: string[]; // e.g., ["import { Input } from '@/components/ui/Input'"]
  /** runtime renderer: creates React elements from schema */
  render: (args: RenderArgs) => React.ReactNode;
  /** generate TSX for this field type */
  toTsx: (args: CodegenArgs) => string;
  /** JSON schema for the inspector (builder UI) */
  propsSpec?: Record<string, unknown>;
};

export type FieldRegistry = Record<FieldType, FieldRegistryEntry>;

export type RenderArgs = {
  field: FieldSchema;
  /** RHF utils provided by renderer */
  rhf: {
    register: (name: string, rules?: unknown) => unknown;
    Controller: React.ComponentType<any>;
    control: unknown;
    errors: Record<string, unknown>;
    watch: (name: string) => unknown;
  };
  /** convenience to compose Tailwind grid width */
  gridClassFor: (ui?: UIProps) => string;
};

export type CodegenArgs = {
  field: FieldSchema;
  /** variable names used in templates */
  vars: {
    dataName: string; // e.g., "form"
    controlName: string; // e.g., "control"
    errorsName: string; // e.g., "errors"
  };
};

// renderer/codegen context ---------------------------------------------------

export type RenderOptions = {
  registry: FieldRegistry;
  components?: {
    FormRootImport?: string; // e.g., your shadcn <Form /> wrapper import
  };
};

export type CodegenOptions = {
  registry: FieldRegistry;
  /** when true, include zod + resolver if present */
  preferZod?: boolean;
  /** header comment/banner */
  banner?: string;
};

// builder state (UI/editor) --------------------------------------------------

export type BuilderState = {
  schema: FormSchema;
  /** selected field id for inspector */
  selection?: string;
  /** dirty flag for persistence prompts */
  dirty?: boolean;
};

export type BuilderEvents =
  | { type: 'addField'; field: FieldSchema; index?: number }
  | { type: 'removeField'; id: string }
  | { type: 'reorderField'; id: string; toIndex: number }
  | { type: 'updateField'; id: string; patch: Partial<FieldSchema> }
  | { type: 'updateLayout'; patch: Partial<FormLayout> }
  | { type: 'select'; id?: string }
  | { type: 'reset'; to?: FormSchema };

export type EditorOnly = {
  /** not serialized; used by the canvas to position/edit */
  canvas?: { x?: number; y?: number };
};

// persistence/export ---------------------------------------------------------

export type ExportBundle = {
  json: FormSchema;       // import/export
  tsx: string;            // copy-paste TSX
  files?: Array<{ path: string; contents: string }>; // optional multi-file emit
};

// utility types for builder -------------------------------------------------

export type FieldTypeInfo = {
  type: FieldType;
  label: string;
  description: string;
  icon?: string;
  category: 'input' | 'selection' | 'date' | 'custom';
};

// default field creators -----------------------------------------------------

export const createDefaultField = (type: FieldType, overrides: Partial<FieldSchema> = {}): FieldSchema => {
  const baseField: BaseField = {
    id: `field_${Date.now()}`,
    type,
    name: `field_${Date.now()}`,
    label: '',
    required: false,
    ...overrides,
  };

  switch (type) {
    case 'text':
      return { ...baseField, type: 'text', textKind: 'default' } as TextField;
    case 'textarea':
      return { ...baseField, type: 'textarea', rows: 3 } as TextField;
    case 'number':
      return { ...baseField, type: 'number', step: 1 } as NumberField;
    case 'checkbox':
      return { ...baseField, type: 'checkbox' } as BooleanField;
    case 'switch':
      return { ...baseField, type: 'switch' } as BooleanField;
    case 'radio':
      return { ...baseField, type: 'radio', options: [] } as RadioField;
    case 'select':
      return { ...baseField, type: 'select', options: [] } as SelectField;
    case 'combobox':
      return { ...baseField, type: 'combobox', options: [] } as SelectField;
    case 'date':
      return { ...baseField, type: 'date', mode: 'date' } as DateField;
    case 'slider':
      return { ...baseField, type: 'slider', min: 0, max: 100, step: 1 } as SliderField;
    case 'custom':
      return { ...baseField, type: 'custom', componentKey: '' } as CustomField;
    default:
      throw new Error(`Unknown field type: ${type}`);
  }
};

export const createDefaultSchema = (): FormSchema => ({
  schemaVersion: '1.0.0',
  id: `form_${Date.now()}`,
  title: 'Untitled Form',
  description: '',
  layout: { kind: 'stack' },
  options: {
    submitLabel: 'Submit',
    resetLabel: 'Reset',
    mode: 'onSubmit',
    useZodResolver: false,
  },
  fields: [],
  defaultValues: {},
  meta: {},
});
