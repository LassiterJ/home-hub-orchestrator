
import { deleteWorkflow, getWorkflow, listWorkflows, saveWorkflow } from "./store";

import { WorkflowSchema } from "./schema";

export function listWorkflowsSvc() {
   return listWorkflows();
}
export function getWorkflowSvc({ id }: { id: string }) {
   const wf = getWorkflow(id);
   if (!wf) throw new Error(`Workflow ${id} not found`);
   return wf;
}
export function saveWorkflowSvc(input: unknown) {
   const wf = WorkflowSchema.parse(input);
   return saveWorkflow(wf);
}
export function deleteWorkflowSvc({ id }: { id: string }) {
   return deleteWorkflow(id);
}
