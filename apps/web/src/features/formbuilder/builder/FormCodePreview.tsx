import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { useGeneratedFormSource } from '@/features/formbuilder/codegen/useGeneratedFormSource'
import { FormSchema } from '@/stores/formBuilder.store'
import { Copy } from 'lucide-react'

interface FormCodePreviewProps {
  schema: FormSchema;
}

/**
 * @description Presents the generated TSX with a copy affordance so builders can
 * grab a ready-to-use React component mirroring the current form.
 */
export function FormCodePreview({ schema }: FormCodePreviewProps) {
  const { source, copyToClipboard, isCopying } = useGeneratedFormSource(schema)

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Generated TSX</span>
        <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!source || isCopying}>
          <Copy className="size-4" />
          {isCopying ? 'Copying…' : 'Copy'}
        </Button>
      </div>
      <Textarea
        value={source}
        readOnly
        className="h-full min-h-[260px] font-mono text-xs"
      />
    </div>
  )
}


