import { FieldConfig } from '@/features/formbuilder/builder/FormBuilderTypes'
import { FormSchema } from '@/stores/formBuilder.store'

const INDENT = '   '

/**
 * @description Derives a stable default value map keyed by field id. Mirrors the
 * runtime preview defaults while keeping the logic shared for the TSX generator.
 */
export function deriveSchemaDefaults(schema: FormSchema): Record<string, unknown> {
  return Object.fromEntries(schema.fieldOrder.map((id) => [id, initialFieldValue(schema.fieldsById[id])]))
}

/**
 * @description Produces the literal string representation for a field's default
 * value. Returned strings are meant to be inlined directly within generated TSX.
 */
export function formatDefaultValueForCode(def: FieldConfig): string {
  const defaultValue = initialFieldValue(def)

  if (typeof defaultValue === 'string') {
    return '""'
  }

  if (defaultValue === null) {
    return 'null'
  }

  return String(defaultValue)
}

/**
 * @description Helper that returns the runtime default value used for RHF.
 */
function initialFieldValue(def?: FieldConfig): unknown {
  if (!def) return ''

  switch (def.type) {
    case 'checkbox':
      return false
    case 'number':
    case 'date':
    case 'file':
      return null
    default:
      return ''
  }
}

/**
 * @description Utility to indent string blocks in the generator for readability.
 */
export function indentBlock(block: string, depth: number): string {
  const prefix = INDENT.repeat(depth)
  return block
    .split('\n')
    .map((line) => (line.length ? `${prefix}${line}` : line))
    .join('\n')
}


