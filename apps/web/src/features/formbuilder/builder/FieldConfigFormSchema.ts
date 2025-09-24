import { z } from 'zod';

import { FieldConfig, FieldKind } from './FormBuilderTypes';

/**
 * @file FieldConfigFormSchema
 * @description Shapes the react-hook-form contract for the field configuration
 * panel and exposes helpers for converting between persisted schema nodes and
 * transient form values. Keeping this logic centralized ensures both the
 * editor surface and any future wizard flows remain in sync on validation and
 * defaulting behaviour.
 */

/**
 * @description Base schema shared across all field types. Type-specific panels
 * extend this by relying on {@link z.ZodObject.passthrough} to accommodate
 * unions without duplicating constraints.
 */
export const fieldConfigFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    label: z.string().min(1, 'Label is required'),
    description: z.string().optional().nullable(),
    required: z.boolean().optional(),
    disabled: z.boolean().optional(),
    placeholder: z.string().optional().nullable(),
    helpText: z.string().optional().nullable(),
    type: z.enum(['text', 'textarea', 'number', 'select', 'checkbox', 'radio', 'date', 'file']),
  })
  .passthrough()

export type FieldConfigFormValues = z.infer<typeof fieldConfigFormSchema> & {
  minLength?: number | null;
  maxLength?: number | null;
  pattern?: string | null;
  min?: number | null;
  max?: number | null;
  step?: number | null;
  integer?: boolean;
  positive?: boolean;
  negative?: boolean;
  accept?: string[];
  maxSizeMB?: number | null;
  maxFiles?: number | null;
  imageMaxWidth?: number | null;
  imageMaxHeight?: number | null;
  options?: Array<{ label?: string; value?: string; disabled?: boolean }>;
  multiple?: boolean;
  minSelected?: number | null;
  maxSelected?: number | null;
}

/**
 * @description Generates RHF-compatible defaults from the persisted field
 * configuration. Numeric inputs stay numeric, while nullable strings fall back
 * to the empty string to avoid uncontrolled transitions.
 */
export const toFieldConfigFormValues = (field: FieldConfig): FieldConfigFormValues => {
  const base: FieldConfigFormValues = {
    name: field.name,
    label: field.label,
    description: field.description ?? '',
    required: !!field.required,
    disabled: !!field.disabled,
    placeholder: field.placeholder ?? '',
    helpText: field.helpText ?? '',
    type: field.type,
  }

  switch (field.type) {
    case 'text':
    case 'textarea':
      return {
        ...base,
        minLength: field.minLength,
        maxLength: field.maxLength,
        pattern: field.pattern ?? '',
      }
    case 'number':
      return {
        ...base,
        min: field.min,
        max: field.max,
        step: field.step,
        integer: !!field.integer,
        positive: !!field.positive,
        negative: !!field.negative,
      }
    case 'file':
      return {
        ...base,
        accept: field.accept ?? [],
        maxSizeMB: field.maxSizeMB,
        maxFiles: field.maxFiles,
        imageMaxWidth: field.imageMaxWidth,
        imageMaxHeight: field.imageMaxHeight,
      }
    case 'select':
      return {
        ...base,
        options: field.options ?? [],
        multiple: !!field.multiple,
        minSelected: field.minSelected,
        maxSelected: field.maxSelected,
      }
    case 'radio':
      return {
        ...base,
        options: field.options ?? [],
      }
    case 'checkbox':
    case 'date':
    default:
      return base
  }
}

/**
 * @description Converts validated form payloads back into a normalized schema
 * patch, ensuring empty strings are promoted to `undefined` and arrays are
 * cloned for immutability.
 */
export const toFieldConfigPatch = (
  type: FieldKind,
  values: FieldConfigFormValues,
): Partial<FieldConfig> => {
  const basePatch: Partial<FieldConfig> = {
    name: coerceString(values.name),
    label: coerceString(values.label),
    description: coerceOptionalString(values.description),
    required: values.required,
    disabled: values.disabled,
    placeholder: coerceOptionalString(values.placeholder),
    helpText: coerceOptionalString(values.helpText),
    type,
  }

  switch (type) {
    case 'text':
    case 'textarea':
      return {
        ...basePatch,
        minLength: coerceOptionalNumber(values.minLength),
        maxLength: coerceOptionalNumber(values.maxLength),
        pattern: coerceOptionalString(values.pattern),
      }
    case 'number':
      return {
        ...basePatch,
        min: coerceOptionalNumber(values.min),
        max: coerceOptionalNumber(values.max),
        step: coerceOptionalNumber(values.step),
        integer: values.integer,
        positive: values.positive,
        negative: values.negative,
      }
    case 'file':
      return {
        ...basePatch,
        accept: Array.isArray(values.accept) ? [...values.accept] : [],
        maxSizeMB: coerceOptionalNumber(values.maxSizeMB),
        maxFiles: coerceOptionalNumber(values.maxFiles),
        imageMaxWidth: coerceOptionalNumber(values.imageMaxWidth),
        imageMaxHeight: coerceOptionalNumber(values.imageMaxHeight),
      }
    case 'select':
      return {
        ...basePatch,
        options: (values.options as FieldConfig['options'])?.map((option) => ({
          label: coerceString(option?.label ?? ''),
          value: coerceString(option?.value ?? ''),
          disabled: !!option?.disabled,
        })) ?? [],
        multiple: values.multiple,
        minSelected: coerceOptionalNumber(values.minSelected),
        maxSelected: coerceOptionalNumber(values.maxSelected),
      }
    case 'radio':
      return {
        ...basePatch,
        options: (values.options as FieldConfig['options'])?.map((option) => ({
          label: coerceString(option?.label ?? ''),
          value: coerceString(option?.value ?? ''),
          disabled: !!option?.disabled,
        })) ?? [],
      }
    case 'checkbox':
    case 'date':
    default:
      return basePatch
  }
}

const coerceString = (value: unknown): string => (typeof value === 'string' ? value : '')

const coerceOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  return value.trim() === '' ? undefined : value
}

const coerceOptionalNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined
  const numeric = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numeric) ? numeric : undefined
}


