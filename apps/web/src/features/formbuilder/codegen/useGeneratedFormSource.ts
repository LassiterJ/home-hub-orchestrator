import { FormSchema } from '@/stores/formBuilder.store'
import * as React from 'react'
import { generateFormComponentSource } from './generateFormComponentSource'

/**
 * @description React hook that converts the live schema into a memoized TSX
 * string while exposing copy-to-clipboard affordances for the UI layer.
 */
export function useGeneratedFormSource(schema: FormSchema | undefined) {
  const [isCopying, setIsCopying] = React.useState(false)

  const source = React.useMemo(() => {
    if (!schema) return ''
    return generateFormComponentSource(schema)
  }, [schema])

  const copyToClipboard = React.useCallback(async () => {
    if (!source) return
    try {
      setIsCopying(true)
      await navigator.clipboard.writeText(source)
    } finally {
      setIsCopying(false)
    }
  }, [source])

  return { source, copyToClipboard, isCopying }
}


