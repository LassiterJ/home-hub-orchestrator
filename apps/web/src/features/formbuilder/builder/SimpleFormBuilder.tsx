import { FormBuilderProvider, useFormBuilder } from '@/stores/FormBuilderProvider'
import * as React from 'react'
import { cn } from '@/utils'
import { FormEditor } from '@/features/formbuilder/builder/FormEditor'

/**
 * SimpleFormBuilder
 *
 * Minimal shell that provides the FormBuilder store and renders the PreviewForm.
 * Emits schema changes via onSchemaChange when history present changes.
 */
export function SimpleFormBuilder({ id = 'default-form', onSchemaChange, className, debug = false }: {
   id?: string
   onSchemaChange?: (schema: any) => void
   className?: string
   debug?: boolean
}) {
   return (
      <FormBuilderProvider id={id}>
         <SimpleInner onSchemaChange={onSchemaChange} className={className} debug={debug} />
      </FormBuilderProvider>
   )
}

interface SimpleInnerProps {
   onSchemaChange?: (schema: any) => void;
   className?: string;
   debug?: boolean
}

function SimpleInner({ onSchemaChange, className, debug }: SimpleInnerProps) {
   const schema = useFormBuilder((s) => s.schema.present)
   const mode = useFormBuilder(s => s.mode)
   const defaults = React.useMemo(() => Object.fromEntries(schema.fieldOrder.map((id) => [id, ''])), [schema])
   console.log('defaults: ')
   console.log('SimpleInner schema: ', schema)
   React.useEffect(() => {
      onSchemaChange?.(schema)
   }, [schema, onSchemaChange])
   const numColumns = !!debug ? '2' : '3'


   return (
      <div className={cn(className, `grid grid-cols-${numColumns}`)}>
         {debug ?
            <pre className="p-2 text-xs bg-muted/40 overflow-auto">{JSON.stringify(schema, null, 2)}</pre> : null}
         {/*<div className="p-4 max-w-2xl mx-auto">*/}
         {/*   <PreviewForm schema={schema} defaults={defaults} />*/}
         {/*</div>*/}
         {mode === 'edit' &&
            <FormEditor schema={schema} defaults={defaults} />
         }

      </div>
   )
}

