import { FormBuilderProvider, useFormBuilder } from '@/stores/FormBuilderProvider'
import * as React from 'react'
import { cn, getNewUUID } from '@/utils'
import { FormDataItem, FormEditor } from '@/features/formbuilder/builder/FormEditor'
import invariant from 'tiny-invariant'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/ResizeablePanel'
import { Paintbrush } from 'lucide-react'
import { Toggle } from '@/components/ui/Toggle'
import { EditFieldSelector } from '@/features/formbuilder/builder/EditFieldSelector'
import { PreviewForm } from '@/features/formbuilder/PreviewForm'

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


type FormFieldDefinitionItem = Partial<FormDataItem> & { toggle?: boolean }

const createNewFieldValue = (): FormFieldDefinitionItem => {
   const newId = getNewUUID({ prefix: 'field' })
   return {
      id: newId,
      max: undefined,
      min: undefined,
      pattern: undefined,
      maxLength: undefined,
      minLength: undefined,
      required: undefined,
      name: `New Field ${newId}`,
      type: 'text',
      placeholder: 'placeholder',
      label: 'New Field',
      options: [],
   }
}

function SimpleInner({ onSchemaChange, className, debug }: SimpleInnerProps) {
   const schema = useFormBuilder((s) => s.schema.present)
   const mode = useFormBuilder(s => s.mode)
   const setMode = useFormBuilder(s => s.setMode)
   const addField = useFormBuilder(s => s.addField)
   const updateField = useFormBuilder(s => s.updateField)
   const defaults = React.useMemo(() => Object.fromEntries(schema.fieldOrder.map((id) => [id, ''])), [schema])
   const reorderFields = useFormBuilder(s => s.reorderFields)
   const selectedFieldId = useFormBuilder(s => s.selectedFieldId)
   const selectField = useFormBuilder(s => s.selectField)
   console.log('defaults: ')
   console.log('SimpleInner schema: ', schema)
   React.useEffect(() => {
      onSchemaChange?.(schema)
   }, [schema, onSchemaChange])


   const handleSelectField = (fieldId: string) => {
      console.log('handleSelectedField, fieldId: ', fieldId)
      invariant(fieldId, 'All fields should have an ID ') // TODO: should this use "name" of field instead?
      selectField(fieldId)
   }

   const handleAddNewField = () => {
      // const addToIndex = fieldOrder.length
      // console.log('handleAddField, addToIndex: ', addToIndex)
      const newField = createNewFieldValue()
      addField(newField)
      selectField(newField.id)
   }

   const handleFieldChange = (patch: Partial<FormDataItem>) => {

      // TODO: enhance this patch check.
      if (!patch) {
         console.error('No patch on field change.')
      }

      invariant(!!selectedFieldId && !!patch, 'Should have SelectedFieldId and patch')
      updateField(selectedFieldId, patch)
   }

   const toggleMode = (pressed: boolean) => {
      // const newMode = mode === 'edit' ? 'preview' : 'edit'
      const newMode = pressed ? 'edit' : 'preview'
      console.log('NewMode: ', newMode)
      const modeShouldChange = newMode !== mode
      if (modeShouldChange) {
         setMode(newMode)
      }
   }
   return (
      <div className={cn('w-full', className)}>
         <div className="">
            <ResizablePanelGroup
               key={mode} // reset sizes when mode changes
               direction="horizontal"
               className="rounded-lg border transition-all duration-200 ease-out"
            >
               {/* JSON column (always visible, 1/4) */}
               <ResizablePanel
                  defaultSize={25}
                  minSize={15}
                  className="transition-[flex-basis] duration-200 ease-out"
               >
                  <div className="h-full p-4">
                     <pre className="p-2 text-xs bg-muted/40 overflow-auto">{JSON.stringify(schema, null, 2)}</pre>
                  </div>
               </ResizablePanel>

               <ResizableHandle className="transition-all duration-200 ease-out" />

               {/* Preview column: 3/4 in preview, 1/4 in edit */}
               <ResizablePanel
                  defaultSize={mode === 'preview' ? 75 : 25}
                  minSize={mode === 'preview' ? 20 : 20}
                  className="transition-[flex-basis] duration-200 ease-out"
               >
                  <div className="h-full p-4">
                     {/* Toolbar + content live here */}
                     <div id={'formToolbar'} className={'flex backdrop-blur bg-muted'}>
                        <Toggle className={''} pressed={mode === 'edit'} onPressedChange={toggleMode}
                                defaultPressed={true}>
                           <Paintbrush />
                        </Toggle>
                     </div>
                     {/* Mode switch toolbar goes here */}
                     {mode === 'preview' && <div>
                        <PreviewForm schema={schema} defaults={defaults} className={'max-w-60'} />
                     </div>}
                     {mode === 'edit' && <div>
                        <EditFieldSelector fieldOrder={schema.fieldOrder}
                                           fieldsById={schema.fieldsById}
                                           onReorderFields={reorderFields} formId={schema.id}
                                           selectedFieldId={selectedFieldId || ''}
                                           onSelectField={handleSelectField}
                                           onAddNewField={handleAddNewField}
                                           onFieldChange={handleFieldChange}
                        /></div>}
                  </div>
               </ResizablePanel>

               {/* Third column only in edit mode */}
               {mode === 'edit' && (
                  <>
                     <ResizableHandle className="transition-all duration-200 ease-out" />
                     <ResizablePanel
                        defaultSize={50} // 1/2 screen in edit
                        minSize={30}
                        className="transition-[flex-basis] duration-200 ease-out"
                     >
                        <div className="h-full p-4"><FormEditor schema={schema} defaults={defaults} /></div>
                     </ResizablePanel>
                  </>
               )}
            </ResizablePanelGroup>
         </div>
      </div>
   )
   //
   // return (
   //    <div className={cn(className, `flex justify-center`)}>
   //       {debug ?
   //          <pre className="p-2 text-xs bg-muted/40 overflow-auto">{JSON.stringify(schema, null, 2)}</pre> : null
   //       }
   //       <div className="p-4 max-w-2xl mx-auto">
   //          <div className={'flex-col p-0 '}>
   //             {/*TODO change to shadcn toolbar*/}
   //             <Toggle className={''} onPressedChange={toggleMode}>
   //                <Paintbrush />
   //             </Toggle>
   //             {mode === 'preview' &&
   //                <PreviewForm schema={schema} defaults={defaults} />
   //             }
   //          </div>
   //          {mode === 'edit' &&
   //             <EditFieldSelector fieldOrder={schema.fieldOrder}
   //                                fieldsById={schema.fieldsById}
   //                                onReorderFields={reorderFields} formId={schema.id}
   //                                selectedFieldId={selectedFieldId || ''}
   //                                onSelectField={handleSelectField}
   //                                onAddNewField={handleAddNewField}
   //                                onFieldChange={handleFieldChange}
   //             />
   //          }
   //       </div>
   //       {mode === 'edit' &&
   //          <FormEditor schema={schema} defaults={defaults} />
   //       }
   //
   //    </div>
   // )
}

