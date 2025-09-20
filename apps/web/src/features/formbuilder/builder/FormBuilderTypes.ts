// 1) Base shared across all fields
export type FieldKind = 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'radio' | 'date' | 'file';

type FieldBase = {
   id: string;
   name: string;
   label: string;
   description?: string;
   required?: boolean;
   disabled?: boolean;
   readOnly?: boolean;
   defaultValue?: unknown;
   placeholder?: string;
   helpText?: string;
   ariaLabel?: string;
   debounceMs?: number;
};

// 2) Type-specific extensions
type TextLike = FieldBase & {
   type: 'text' | 'textarea';
   minLength?: number;
   maxLength?: number;
   pattern?: string;
   trim?: boolean;
   normalize?: 'lower' | 'upper' | 'none';
};

type NumberField = FieldBase & {
   type: 'number';
   min?: number;
   max?: number;
   step?: number;
   integer?: boolean;
   positive?: boolean;
   negative?: boolean;
};

type DateField = FieldBase & {
   type: 'date';
   // store as ISO strings, or switch to Date if your pipeline supports it
   minDate?: string;
   maxDate?: string;
   noPast?: boolean;
   noFuture?: boolean;
};

type FileField = FieldBase & {
   type: 'file';
   accept?: string[];
   maxSizeMB?: number;
   maxFiles?: number;
   imageMaxWidth?: number;
   imageMaxHeight?: number;
};

type Option = { label: string; value: string; disabled?: boolean };

type SelectField = FieldBase & {
   type: 'select';
   options: Option[];
   multiple?: boolean;
   minSelected?: number;
   maxSelected?: number;
};

type RadioField = FieldBase & {
   type: 'radio';
   options: Option[];
};

type CheckboxField = FieldBase & {
   type: 'checkbox';
};

export type FieldConfig =
   | TextLike
   | NumberField
   | DateField
   | FileField
   | SelectField
   | RadioField
   | CheckboxField;

export type FieldType = FieldConfig['type']; // 'text' | 'textarea' | 'number' | ...

// 3) Utilities
export type FieldByType<K extends FieldKind> = Extract<FieldConfig, { type: K }>;
export type FieldPatch<K extends FieldKind> = Partial<Omit<FieldByType<K>, 'id' | 'type' | 'name'>>;
