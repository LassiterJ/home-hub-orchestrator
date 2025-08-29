import { router } from '../trpc'
import { userRouter, workflowsRouter, computerVisionRouter  } from './resolvers'

import {Application} from "express";
import * as trpcExpress from '@trpc/server/adapters/express';
import {createExpressMiddleware} from "@trpc/server/adapters/express";

const appRouter = router({
   user: userRouter,
   cv: computerVisionRouter,
   workflows: workflowsRouter,
})

export type AppRouter = typeof appRouter

const createContext = ({
                           req,
                           res,
                       }: trpcExpress.CreateExpressContextOptions) => ({res,req}); // no context

export type Context = Awaited<ReturnType<typeof createContext>>;
export const initializeTrpc = async (app: Application) => {
   app.use(
      '/trpc',
      createExpressMiddleware({
         router: appRouter,
         createContext,
      })
   )
}


