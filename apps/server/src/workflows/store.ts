import { Workflow } from "./schema";

const store = new Map<string, Workflow>();

export function listWorkflows() {
   return Array.from(store.values());
}
export function getWorkflow(id: string) {
   return store.get(id);
}
export function saveWorkflow(wf: Workflow) {
   store.set(wf.id, wf);
   return { ok: true, id: wf.id };
}
export function deleteWorkflow(id: string) {
   store.delete(id);
   return { ok: true };
}

// memory store TODO: implement Supabase or other db solutions.

let mem = new Map<string, Workflow>();

export const __reset = () => { mem = new Map(); };

export function list() { return Array.from(mem.values()); }
export function get(id: string) { return mem.get(id); }
export function save(wf: Workflow) { mem.set(wf.id, wf); return { ok: true, id: wf.id }; }
export function remove(id: string) { mem.delete(id); return { ok: true }; }
