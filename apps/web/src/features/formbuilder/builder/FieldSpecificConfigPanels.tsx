// Utils
import { FieldConfig } from '@/features/formbuilder/builder/FormBuilderTypes'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { CirclePlus } from 'lucide-react'
import { useState } from 'react'

const toNum = (v: string) => (v === '' ? undefined : Number(v))
const toCSV = (v: string) => v.split(',').map(s => s.trim()).filter(Boolean)

type CommonProps<T> = {
   field: T;
   onPatch: (p: Partial<T>) => void; // never patch discriminant/id/name
};

type PanelOf<K extends FieldConfig['type']> =
   React.FC<CommonProps<Extract<FieldConfig, { type: K }>>>;

type TextLike = Extract<FieldConfig, { type: 'text' | 'textarea' }>;
const TextLikePanel: React.FC<CommonProps<TextLike>> = ({ field, onPatch }) => (
   <div className="grid grid-cols-2 gap-2">
      <div>
         <Label>Min length</Label>
         <Input type="number" value={field.minLength ?? ''}
            onChange={e => onPatch({ minLength: toNum(e.target.value) })} />
      </div>
      <div>
         <Label>Max length</Label>
         <Input type="number" value={field.maxLength ?? ''}
            onChange={e => onPatch({ maxLength: toNum(e.target.value) })} />
      </div>
      <div className="col-span-2">
         <Label>Pattern (regex)</Label>
         <Input value={field.pattern ?? ''} onChange={e => onPatch({ pattern: e.target.value || undefined })} />
      </div>
   </div>
)

type NumberField = Extract<FieldConfig, { type: 'number' }>;
const NumberPanel: React.FC<CommonProps<NumberField>> = ({ field, onPatch }) => (
   <div className="grid grid-cols-2 gap-2">
      <div><Label>Min</Label><Input type="number" value={field.min ?? ''}
         onChange={e => onPatch({ min: toNum(e.target.value) })} /></div>
      <div><Label>Max</Label><Input type="number" value={field.max ?? ''}
         onChange={e => onPatch({ max: toNum(e.target.value) })} /></div>
      <div><Label>Step</Label><Input type="number" value={field.step ?? ''}
         onChange={e => onPatch({ step: toNum(e.target.value) })} /></div>
   </div>
)

type FileField = Extract<FieldConfig, { type: 'file' }>;
const FilePanel: React.FC<CommonProps<FileField>> = ({ field, onPatch }) => (
   <div className="grid grid-cols-2 gap-2">
      <div className="col-span-2">
         <Label>Accept (comma-separated)</Label>
         <Input value={(field.accept ?? []).join(',')}
            onChange={e => onPatch({ accept: e.target.value ? toCSV(e.target.value) : [] })} />
      </div>
      <div><Label>Max size (MB)</Label><Input type="number" value={field.maxSizeMB ?? ''}
         onChange={e => onPatch({ maxSizeMB: toNum(e.target.value) })} /></div>
      <div><Label>Max files</Label><Input type="number" value={field.maxFiles ?? ''}
         onChange={e => onPatch({ maxFiles: toNum(e.target.value) })} /></div>
   </div>
)

type SelectField = Extract<FieldConfig, { type: 'select' }>;
type RadioField = Extract<FieldConfig, { type: 'radio' }>;
const OptionsPanel: React.FC<CommonProps<SelectField | RadioField>> = { field, onPatch }) => {
   const [options, setOptions] = useState([]);
   const handleAddOption = () => {
      const newOption = { value: "", label: "" }
      setOptions([...options, newOption])
   }
   // TODO: Finish this Options panel
   return (
      <div className="grid grid-cols-2 gap-2">
         <div className="col-span-2">
            <Label>Options (JSON)</Label>
            <div>
               <Input type={"text"} name={"value"} className={""} />
            </div>
            <div className={'flex w-full justify-center p-0'}>
               <Button variant={'ghost'} className={'self-center flex p-0 rounded-full'} onClick={ }>
                  <CirclePlus className={'h-6 w-6'} />
               </Button>
            </div>
         </div>
      </div>
   )
}


export const FIELD_PANELS: {
   [K in FieldConfig['type']]?: PanelOf<K>
} = {
   text: TextLikePanel,
   textarea: TextLikePanel,
   number: NumberPanel,
   file: FilePanel,
   select: OptionsPanel as PanelOf<'select'>,
   radio: OptionsPanel as PanelOf<'radio'>,
   // date etc. add when needed
}

