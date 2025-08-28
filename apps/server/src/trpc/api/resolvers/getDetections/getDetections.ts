// server/src/trpc/api/resolvers/getDetections/getDetections.ts
import { publicProcedure } from 'trpc'
import { z } from 'zod'

// If you want typed TRPC errors later:
// import { TRPCError } from '@trpc/server';

// NOTE: With octetInputParser, opts.input will be a Uint8Array (raw bytes).
// We don't need fs or temp files; we stream directly to the CV-API.

// Helper (optional): forward bytes to CV API and return base64
async function forwardToCvApi(bytes: Uint8Array, filename = 'upload.jpg') {
    console.log('***forwardToCvApi***');
    const url = (process.env.CV_API_URL ?? 'http://localhost:8001').replace(/\/$/, '');
    const form = new FormData();

    // Build a spec-compliant Blob for the file part (Node 18+ fetch/FormData/Blob are built-in).
    // Content type can be inferred or set explicitly as 'image/jpeg'.
    form.append('file', new Blob([bytes], { type: 'image/jpeg' }), filename);

    const upstream = await fetch(`${url}/img_object_detection_to_img`, {
        method: 'POST',
        body: form,
        // DO NOT set Content-Type manually — fetch will add the multipart boundary header.
    });

    if (!upstream.ok) {
       console.log("!upstream.ok")
        // This reads upstream error text to aid debugging.
        const text = await upstream.text().catch(() => '');
        const errorMessage =
            `cv-api POST /img_object_detection_to_img failed: ` +
            `${upstream.status} ${upstream.statusText}${text ? ` — ${text}` : ''}`;

        // You can throw TRPCError if you want:
        // throw new TRPCError({ code: 'BAD_REQUEST', message: errorMessage });

        throw new Error(`forwardToCvApi ERROR: ${errorMessage}`);
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    const arr = await upstream.arrayBuffer();
    const base64 = Buffer.from(arr).toString('base64');

    // Your FastAPI route returns only the annotated image (no JSON detections),
    // so we return an empty array for `detections` to satisfy the front-end shape.
    return {
        annotated_image_base64: base64, // frontend will prefix with data: later (or you can do it here)
        contentType,
        detections: [] as Array<{
            label: string; confidence: number; bbox: [number, number, number, number];
        }>,
    };
}

// Exported utility if you want to call it elsewhere:
export async function getDetectionsFromImage(rawBytes: Uint8Array) {
    try {
        // rawBytes are the incoming file bytes from the tRPC client
        return await forwardToCvApi(rawBytes);
    } catch (e: any) {
        // Return a consistent error payload if you prefer not to throw:
        // return { error: e?.message ?? 'Unknown error' };
        throw e;
    }
}


// tRPC procedure: input is application/octet-stream (binary)
// Client must send raw bytes as the mutation input.
export const getDetections = publicProcedure
    .input(z.instanceof(FormData)) // <— THIS makes `opts.input` a Uint8Array
    .mutation(async (opts) => {
        console.log("***getDetections.ts***");
        // console.log("opts: ", opts);
        const formData = opts.input;

       if (!formData?.get('file')) {
          console.log("***formData***: ", formData);
          throw new Error('Missing file field')
       }
       const cvUrl = (process.env.CV_API_URL ?? 'http://0.0.0.0:8001').replace(/\/$/, '');
       const upstream = await fetch(`${cvUrl}/img_object_detection_to_img`, { method: 'POST', body: formData })
       if (!upstream.ok) {
          const text = await upstream.text().catch(() => '')
          throw new Error(`CV-API failed: ${upstream.status} ${upstream.statusText}${text ? ` — ${text}` : ''}`)
       }

       const arr = await upstream.arrayBuffer()
       const base64 = Buffer.from(arr).toString('base64')
       return {
          detections: [],
          annotated_image_base64: base64,
          image_width: undefined,
          image_height: undefined,
          contentType: upstream.headers.get('content-type') ?? 'image/jpeg',
       }

    });
