import cookieParser from 'cookie-parser'
import express, { type Application } from 'express'
import cors from 'cors'
import { join, resolve } from 'path'

import { type RequestHandler } from 'express-serve-static-core'

import { isProd } from 'env'

import { initializeTrpc } from 'trpc/api/router'

function getCorsOptions() {
   const defaultOrigins = ['http://localhost:3000']
   const extra = (process.env.CORS_ORIGINS ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
   const allowList = [...new Set([...defaultOrigins, ...extra])]

   return {
      origin: (origin: string | undefined, cb: (err: Error | null, ok?: boolean) => void) => {
         // allow same-origin (no origin header) and any whitelisted origin
         if (!origin || allowList.includes(origin)) return cb(null, true)
         cb(new Error(`Origin ${origin} not allowed by CORS`))
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['content-type', 'authorization', 'trpc-batch-mode'],
      exposedHeaders: ['content-type'],
   } as const
}

export class Middlewares {
   public static config(app: Application) {
      app.use(cookieParser() as RequestHandler)
      app.use(cors(getCorsOptions()) as RequestHandler)
      // (optional) make sure preflight is handled for batched paths too
      // app.options('/trpc/*', cors(getCorsOptions()) as RequestHandler)
      initializeTrpc(app)
      if (isProd) {
         this.serveWeb(app)
      }
   }

   private static serveWeb(app: Application) {
      const buildPath = resolve(__dirname, '../../../../web/dist')

      app.use(express.static(buildPath) as unknown as RequestHandler)

      app.get('*', (_, res) => res.sendFile(join(buildPath, 'index.html')))
   }
}
