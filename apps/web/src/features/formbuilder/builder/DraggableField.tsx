import { List } from '@/components/ui/List/ReorderableList'
import { Asterisk, GripVertical } from 'lucide-react'


export const DraggableField = ({
                                  index,
                                  field,
                                  onChange,
                                  // onFieldSelect,
                               }) => {
   return (
      <div key={field.id} id={field.id} className="flex items-stretch gap-2 py-2 border-b last:border-b-0 curor-pointer"
      >
         {/* Drag handle column fills full row height via self-stretch;TODO background bar is absolute from cursor and I don't think that is best*/}
         <List.Handle asChild>
            <div
               className="relative w-6 self-stretch select-none cursor-grab active:cursor-grabbing draggable bg-neutral-200/60"
            >
               <div
                  className="relative z-10 flex h-full items-center justify-center ">
                  <GripVertical className="h-4 w-4 text-neutral-500" />
               </div>
            </div>
         </List.Handle>

         {/* Editable inputs: name, label, description */}
         <div className={'text-left'}>
            <div className={''}>
               {field.label}
            </div>
            <div className={'p-2 text-sm'}>
               {field.description}
            </div>
            {field.required &&
               <div className={'absolute right-1 top-1 text-red-600 opacity-40'}>
                  <Asterisk />
               </div>
            }
         </div>
      </div>
   )
}
