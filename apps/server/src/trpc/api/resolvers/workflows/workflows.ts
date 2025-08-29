import { privateProcedure, router } from "trpc";
import { z } from "zod";
import { WorkflowSchema } from "workflows/schema";
import { listWorkflowsSvc, getWorkflowSvc, saveWorkflowSvc, deleteWorkflowSvc } from "workflows/service";

export const listWorkflowsProc = privateProcedure.query(() => listWorkflowsSvc());

export const getWorkflowProc = privateProcedure
   .input(z.object({ id: z.string() }))
   .query(({ input }) => getWorkflowSvc(input));

export const saveWorkflowProc = privateProcedure
   .input(WorkflowSchema)
   .mutation(({ input }) => saveWorkflowSvc(input));

export const deleteWorkflowProc = privateProcedure
   .input(z.object({ id: z.string() }))
   .mutation(({ input }) => deleteWorkflowSvc(input));

export const workflowsRouter = router({
   list: listWorkflowsProc,
   get: getWorkflowProc,
   save: saveWorkflowProc,
   delete: deleteWorkflowProc,
});
