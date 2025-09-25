import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/ResizeablePanel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { EditFieldSelector } from '@/features/formbuilder/builder/EditFieldSelector'
import { FormCodePreview } from '@/features/formbuilder/builder/FormCodePreview'
import { FormDataItem, FormEditor } from '@/features/formbuilder/builder/FormEditor'
import { deriveSchemaDefaults } from '@/features/formbuilder/codegen/schemaUtils'
import { PreviewForm } from '@/features/formbuilder/PreviewForm'
import { FormBuilderProvider, useFormBuilder } from '@/stores/FormBuilderProvider'
import { cn, getNewUUID } from '@/utils'
import { Code2, Eye, Paintbrush } from 'lucide-react'
import * as React from 'react'
import invariant from 'tiny-invariant'

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
   const mode = useFormBuilder((s) => s.mode)
   const setMode = useFormBuilder((s) => s.setMode)
   const addField = useFormBuilder((s) => s.addField)
   const updateField = useFormBuilder((s) => s.updateField)
   const defaults = React.useMemo(() => deriveSchemaDefaults(schema), [schema])
   const reorderFields = useFormBuilder((s) => s.reorderFields)
   const selectedFieldId = useFormBuilder((s) => s.selectedFieldId)
   const selectField = useFormBuilder((s) => s.selectField)
   const [activeTab, setActiveTab] = React.useState<'preview' | 'edit' | 'code'>(() => mode)
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

   const handleModeChange = (nextMode: 'edit' | 'preview') => {
      if (nextMode !== mode) {
         setMode(nextMode)
      }
   }

   React.useEffect(() => {
      if (activeTab === 'code') {
         return
      }

      if (mode !== activeTab) {
         setActiveTab(mode)
      }
   }, [mode, activeTab])

   const handleTabChange = (value: string) => {
      const next = value as 'preview' | 'edit' | 'code'
      setActiveTab(next)

      if (next === 'preview' || next === 'edit') {
         handleModeChange(next)
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
                     <Tabs defaultValue={mode} value={activeTab} onValueChange={handleTabChange}>
                        <div id={'formToolbar'} className={'flex items-center justify-between bg-muted px-2 py-1'}>
                           <TabsList>
                              <TabsTrigger value="preview">
                                 <Eye className="mr-2 size-4" />Preview
                              </TabsTrigger>
                              <TabsTrigger value="edit">
                                 <Paintbrush className="mr-2 size-4" />Edit
                              </TabsTrigger>
                              <TabsTrigger value="code">
                                 <Code2 className="mr-2 size-4" />TSX
                              </TabsTrigger>
                           </TabsList>
                        </div>
                        <TabsContent value="preview">
                           <PreviewForm schema={schema} defaults={defaults} className={'max-w-60'} />
                        </TabsContent>
                        <TabsContent value="edit">
                           <EditFieldSelector fieldOrder={schema.fieldOrder}
                                              fieldsById={schema.fieldsById}
                                              onReorderFields={reorderFields} formId={schema.id}
                                              selectedFieldId={selectedFieldId || ''}
                                              onSelectField={handleSelectField}
                                              onAddNewField={handleAddNewField}
                                              onFieldChange={handleFieldChange}
                           />
                        </TabsContent>
                        <TabsContent value="code">
                           <FormCodePreview schema={schema} />
                        </TabsContent>
                     </Tabs>
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

}

