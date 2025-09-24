import { List } from '@/components/ui/List/ReorderableList'
import { Button } from '@/components/ui/Button'
import { CirclePlus } from 'lucide-react'
import { ChangeEvent, MouseEventHandler, useCallback, useMemo } from 'react'
import { FormSchema } from '@/stores/formBuilder.store'
import { DraggableField } from '@/features/formbuilder/builder/DraggableField'


type FieldOrder = FormSchema['fieldOrder'];
type FieldByID = FormSchema['fieldsById'];

export interface EditFieldSelectorProps {
   formId: string,
   fieldsById: FieldByID,
   fieldOrder: FieldOrder,
   selectedFieldId: string,
   onSelectField: (id: string) => void,
   onFieldChange: (e: ChangeEvent) => void,
   onAddNewField: MouseEventHandler<HTMLButtonElement> | undefined,
   onReorderFields: (from: number, to: number) => void,

}

export const EditFieldSelector = ({
                                     formId,
                                     fieldOrder,
                                     fieldsById,
                                     selectedFieldId = '',
                                     onSelectField,
                                     onFieldChange,
                                     onAddNewField,
                                     onReorderFields,
                                  }: EditFieldSelectorProps) => {
   const handleReorder = useCallback((next) => {
      // Compute single-move indices (from -> to) and sync to FB store
      try {
         const prevIds = fieldOrder
         const nextIds = next.map((f) => f.id)
         if (prevIds.length === nextIds.length && prevIds.join(',') !== nextIds.join(',')) {
            const movedId = nextIds.find((id, idx) => prevIds[idx] !== id)
            if (movedId) {
               const from = prevIds.indexOf(movedId)
               const to = nextIds.indexOf(movedId)
               if (from !== -1 && to !== -1 && from !== to) {
                  onReorderFields(from, to)
                  console.debug('Reordered field', { movedId, from, to })
               }
            }
         }
      } catch (err) {
         console.warn('Failed to compute reorder diff; skipping FB sync', err)
      }
   }, [fieldOrder, formId])

   const fields = useMemo(() => {
      return fieldOrder.map((id, index) => {
         const field = fieldsById[id]
         const isSelected = id === selectedFieldId
         // TODO: use below somewhere to handle outside clicks.
         // useOnClickOutside(ref, handleClickOutside)
         return (
            <List.Item key={id} id={id} value={field} asChild>
               <div className={`rounded border p-2 ${isSelected ? 'ring-1 ring-blue-400' : ''}`}
                    onClick={() => onSelectField(id)}>
                  <DraggableField
                     index={index}
                     field={field}
                     onChange={onFieldChange}
                  />
               </div>

            </List.Item>)
      })
   }, [fieldOrder, fieldsById])
   return (<div className={'p-4'}>
      <div className={'pb-1'}>Manage Layout</div>
      <List
         className={'border-2 border-t-0'}
         onReorder={handleReorder as any}
         listClassName="flex flex-col gap-2"
      >
         {fields}
      </List>
      <div className={'flex w-full justify-center p-0'}>
         <Button variant={'ghost'} className={'self-center flex p-0 rounded-full'} onClick={onAddNewField}>
            <CirclePlus className={'h-6 w-6'} />
         </Button>
      </div>
   </div>)
}
