import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'

import { useTRPC } from '../utils/trpc'

type Detection = {
   label: string
   confidence: number
   bbox: [number, number, number, number] // [cx,cy,w,h]
}
type DetectResponse = {
   detections: Detection[]
   annotated_image_base64: string
   image_width?: number
   image_height?: number
}

// helper
const toDataUrl = (b64: string | undefined | null) => {
   if (!b64) return '' // empty -> no img
   if (b64.startsWith('data:')) return b64 // server already prefixed
   return `data:image/jpeg;base64,${b64}` // add prefix exactly once
}

export const Route = createFileRoute('/cv-test')({
   component: CVTest,
})

// const fileToBase64 = (file: File) => {
//     return new Promise<string>((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onerror = () => reject(new Error("FileReader failed"));
//         reader.onload = () => resolve(String(reader.result));
//         reader.readAsDataURL(file);
//     });
// }
function CVTest() {
   const [file, setFile] = React.useState<File | null>(null)
   const [result, setResult] = React.useState<DetectResponse | null>(null)
   const [loading, setLoading] = React.useState(false)
   const [err, setErr] = React.useState('')
   const trpc = useTRPC();
   const getDetectionsOptions = trpc.cv.detect.mutationOptions();
   const detect = useMutation(getDetectionsOptions);

   const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFile(e.target.files?.[0] ?? null)
      setResult(null)
      setErr('')
      detect.reset()
   }

   const onSubmit = async () => {
       if (!file) return
       setLoading(true)
       setErr('')
       setResult(null)
       try {
          const form = new FormData()
          form.append('file', file) // the File from <input type="file"/>
          console.log("Form with appended file: ", form);
           const res = await detect.mutateAsync(form)
           // ^ some tRPC client versions need a cast because this isn’t JSON input

           if (res) {
               setResult(res as unknown as DetectResponse)
           }
       } catch (e: any) {
           setErr(e.message || String(e))
       } finally {
           setLoading(false)
       }
   }

   // const annotatedSrc = result ? `data:image/jpeg;base64,${result.annotated_image_base64}` : ''
   const annotatedSrc = toDataUrl(result?.annotated_image_base64)
   return (
      <div style={{ maxWidth: 960, margin: '32px auto', fontFamily: 'system-ui, sans-serif' }}>
         <h1>CV Test</h1>
         <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <input type="file" accept="image/*" onChange={onFileChange} />
            <button onClick={onSubmit} disabled={!file || loading}>
               {loading ? 'Detecting…' : 'Upload & Detect'}
            </button>
         </div>

         {err && <div style={{ color: '#b00020', whiteSpace: 'pre-wrap' }}>{err}</div>}

         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
               <h3>Original</h3>
               {file ? (
                  <img
                     src={URL.createObjectURL(file)}
                     alt="original"
                     style={{ width: '100%', border: '1px solid #ddd', borderRadius: 8 }}
                  />
               ) : (
                  <div style={{ color: '#666' }}>Choose an image to preview.</div>
               )}
            </div>
            <div>
               <h3>Annotated</h3>
               {result ? (
                  <img
                     src={annotatedSrc}
                     alt="annotated"
                     style={{ width: '100%', border: '1px solid #ddd', borderRadius: 8 }}
                  />
               ) : (
                  <div style={{ color: '#666' }}>{loading ? 'Processing…' : 'Run detection to see overlay.'}</div>
               )}
            </div>
         </div>

         {result && (
            <div style={{ marginTop: 24 }}>
               <h3>Detections</h3>
               {result.detections.length === 0 ? (
                  <div>No objects detected.</div>
               ) : (
                  <ul>
                     {result.detections.map((d, i) => (
                        <li key={i}>
                           <code>{d.label}</code> — {d.confidence.toFixed(2)} — [
                           {d.bbox.map(n => n.toFixed(0)).join(', ')}]
                        </li>
                     ))}
                  </ul>
               )}
            </div>
         )}
      </div>
   )
}
