import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { createStore, type StoreApi } from 'zustand/vanilla'
import { getNewUUID } from '@/utils'
import { FieldConfig } from '@/features/formbuilder/builder/FormBuilderTypes'

/**
 * Form Builder Zustand Store (per-instance)
 *
 * Architecture notes:
 * - This store manages ONLY the form builder schema domain and related UI state
 *   (e.g., mode and selection). React Flow state remains in its own store.
 * - Store instances are created via factory `createFormBuilderStore(key)` and are
 *   intended to be scoped to a React Context Provider for isolation.
 * - Schema changes are versioned and wrapped in an undo/redo history buffer.
 *
 * Performance:
 * - Use selectors when consuming state to minimize re-renders.
 * - Persist only the schema history; transient UI state is excluded.
 *
 * Logging/DevTools:
 * - Action names are annotated for easy tracing in Redux DevTools.
 * - Avoids heavyweight frontend loggers by design per project preference [[memory:8479903]].
 */

// ────────────────────────────────────────────────────────────────────────────────
// Types: Schema Model (normalized, versioned)
// ────────────────────────────────────────────────────────────────────────────────

// Keep FieldId
export type FieldId = string;

// Schema uses the union directly
export type FormSchema = {
   schemaVersion: 1;
   id: string;
   title?: string;
   fieldOrder: FieldId[];
   fieldsById: Record<FieldId, FieldConfig>; // <- swap in the union
   config?: Record<string, unknown>;
   meta?: Record<string, unknown>;
};

// PATCH type: allow partial edits but never the discriminant or id/name
export type FieldPatch = Partial<Omit<FieldConfig, 'type' | 'id' | 'name'>>;


// ────────────────────────────────────────────────────────────────────────────────
// Types: Store State & History
// ────────────────────────────────────────────────────────────────────────────────

export type History<T> = { past: T[]; present: T; future: T[] }

export type FormBuilderMode = 'edit' | 'run'

// ── State API updates ──────────────────────────────────────────────────────────
export type State = {
   schema: History<FormSchema>;
   mode: 'edit' | 'run';
   selectedFieldId?: FieldId;

   setMode: (m: 'edit' | 'run') => void;
   addField: (f: FieldConfig, index?: number) => void;
   updateField: (id: FieldId, patch: FieldPatch) => void; // <- typed patch
   removeField: (id: FieldId) => void;
   reorderFields: (from: number, to: number) => void;
   selectField: (id?: FieldId) => void;
   undo: () => void;
   redo: () => void;
   loadSchema: (s: FormSchema) => void;
};
// ────────────────────────────────────────────────────────────────────────────────
// Initial State
// ────────────────────────────────────────────────────────────────────────────────

export const initialSchema: FormSchema = {
   schemaVersion: 1,
   id: getNewUUID({ prefix: 'form' }),
   fieldOrder: [],
   fieldsById: {},
   config: {},
}

const initialHistory: History<FormSchema> = { past: [], present: initialSchema, future: [] }

const noop = () => {
}

const initialState: State = {
   schema: initialHistory,
   mode: 'edit',
   selectedFieldId: undefined,
   setMode: noop,
   addField: noop,
   updateField: noop,
   removeField: noop,
   reorderFields: noop,
   selectField: noop,
   undo: noop,
   redo: noop,
   loadSchema: noop,
}

// ────────────────────────────────────────────────────────────────────────────────
// Reducer helpers
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Commit a new present state into the history, truncating future for correct redo semantics.
 */
const commit = (history: History<FormSchema>, next: FormSchema): History<FormSchema> => ({
   past: [...history.past, history.present],
   present: next,
   future: [],
})

// ────────────────────────────────────────────────────────────────────────────────
// Store Factory (per-instance)
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Create a new per-instance Form Builder store.
 *
 * @param key - Unique persistence key to isolate instances (e.g., builder id)
 * @returns A Zustand vanilla store instance for use via React Context
 */
export const createFormBuilderStore = (key: string): StoreApi<State> => {
   // Wrap the store with persist + devtools + subscribeWithSelector middlewares.
   const withMiddleware = devtools(
      persist(
         subscribeWithSelector<State>((set, _get) => ({
            ...initialState,

            /** Switch builder mode */
            setMode: (m) => set({ mode: m }, false),

            /** Add a field if id is unique; inserts at index or at end. */
            addField: (f, index) =>
               set(
                  (st) => {
                     const cur = st.schema.present
                     // Idempotency: ignore if field id already exists
                     if (!f?.id || cur.fieldsById[f.id]) return st

                     const insertIndex = index ?? cur.fieldOrder.length
                     const next: FormSchema = {
                        ...cur,
                        fieldsById: { ...cur.fieldsById, [f.id]: f },
                        fieldOrder: [
                           ...cur.fieldOrder.slice(0, insertIndex),
                           f.id,
                           ...cur.fieldOrder.slice(insertIndex),
                        ],
                     }
                     return { schema: commit(st.schema, next) }
                  },
                  false,
               ),

            /** Shallow-merge a field patch by id. No-op if id not found. */
            updateField: (id, patch) =>
               set(
                  (st) => {
                     const cur = st.schema.present
                     const existing = cur.fieldsById[id]
                     if (!existing || !id) return st

                     const next: FormSchema = {
                        ...cur,
                        fieldsById: { ...cur.fieldsById, [id]: ({ ...existing, ...patch }) },
                     }

                     return { schema: commit(st.schema, next) }
                  },
                  false,
               ),

            /** Remove a field by id; clears selection if it pointed to the removed id. */
            removeField: (id) =>
               set(
                  (st) => {
                     const cur = st.schema.present
                     if (!id || !cur.fieldsById[id]) return st

                     // eslint-disable-next-line @typescript-eslint/no-unused-vars
                     const { [id]: _removed, ...rest } = cur.fieldsById
                     const next: FormSchema = {
                        ...cur,
                        fieldsById: rest,
                        fieldOrder: cur.fieldOrder.filter((x) => x !== id),
                     }

                     return {
                        schema: commit(st.schema, next),
                        selectedFieldId: st.selectedFieldId === id ? undefined : st.selectedFieldId,
                     }
                  },
                  false,
               ),

            /** Move a fieldOrder entry from index `from` to index `to`. */
            reorderFields: (from, to) =>
               set(
                  (st) => {
                     if (from === to) return st
                     const cur = st.schema.present
                     if (
                        from < 0 ||
                        to < 0 ||
                        from >= cur.fieldOrder.length ||
                        to >= cur.fieldOrder.length
                     )
                        return st

                     const arr = [...cur.fieldOrder]
                     const [moved] = arr.splice(from, 1)
                     arr.splice(to, 0, moved)
                     return { schema: commit(st.schema, { ...cur, fieldOrder: arr }) }
                  },
                  false,
               ),

            /** Select or clear the active field id. */
            selectField: (id) => set({ selectedFieldId: id }, false),

            /** Undo last schema commit (if any). */
            undo: () =>
               set(
                  (st) => {
                     const { past, present, future } = st.schema
                     if (!past.length) return st
                     const prev = past[past.length - 1]
                     return { schema: { past: past.slice(0, -1), present: prev, future: [present, ...future] } }
                  },
                  false,
               ),

            /** Redo next schema state (if any). */
            redo: () =>
               set(
                  (st) => {
                     const { past, present, future } = st.schema
                     if (!future.length) return st
                     const next = future[0]
                     return { schema: { past: [...past, present], present: next, future: future.slice(1) } }
                  },
                  false,
               ),

            /** Replace the entire schema and reset history and selection. */
            loadSchema: (s) =>
               set(
                  { schema: { past: [], present: s, future: [] }, selectedFieldId: undefined },
                  false,
               ),
         })),
         {
            /**
             * Persist schema history only; exclude transient UI (mode, selection).
             * Each store instance uses a unique key namespace for isolation.
             */
            name: `form-builder:${key}`,
            version: 1,
            partialize: (st) => ({ schema: st.schema }),
            migrate: (state) => state, // add schema migrations on version bumps
         },
      ),
   )

   // TypeScript can get tripped up by middleware composition in vanilla mode.
   // Cast is safe here because `withMiddleware` is a valid state creator.
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   return createStore<State>(withMiddleware as any)
}

// ────────────────────────────────────────────────────────────────────────────────
// Test Helpers
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Reset the schema history to the initial empty schema for a given store.
 * Useful in tests to ensure a clean starting point between cases.
 */
export const resetFormBuilder = (store: StoreApi<State>) => {
   store.setState(
      {
         ...store.getState(),
         schema: { past: [], present: initialSchema, future: [] },
      },
      true,
   )
}

/** Convenience type for consumers that want the store api shape. */
export type FormBuilderStore = ReturnType<typeof createFormBuilderStore>


