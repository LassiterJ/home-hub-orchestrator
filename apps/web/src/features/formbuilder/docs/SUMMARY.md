### FormBuilder Feature — Detailed Summary

This document explains the structure and behavior of the FormBuilder feature, covering authoring, preview/rendering, and code generation paths. It highlights the types and contracts that hold the system together and the primary extension points.

## Goals
- **Schema-driven authoring**: Build forms by editing a serializable `FormSchema` model.
- **Immediate preview**: Render a live form preview via `FormRenderer` using the same schema.
- **Code generation**: Produce a standalone TSX component via `generateFormTsx` from the schema.
- **Pluggable field registry**: Map schema field types to concrete UI and codegen via a `FieldRegistry`.

## Core Data Model (`form-schema.ts`)
- **FormSchema**: Top-level schema: `schemaVersion`, `id`, `title`, `description`, `layout`, `options`, `fields`, `defaultValues`, `meta`.
- **FieldSchema**: Discriminated union: `text`, `textarea`, `number`, `checkbox`, `switch`, `select`, `combobox`, `radio`, `date`, `slider`, `custom`.
- **ValidationRules**: Primitive constraints and optional Zod-based constraints (string form for codegen/runtime zod conversion).
- **UIProps**: Visual/layout hints used by renderer/codegen (e.g., width, className).
- **Layout**: `stack` | `grid` | `sections` (sections may embed a local layout and reference field ids).
- **Dependencies/Actions (v1 contracts)**: `deps` and `actions` are defined for conditional behavior/extensibility. They are not fully enforced by the current renderer and are intended as a future enhancement.
- **BuilderState + BuilderEvents**: Editing state and the minimal event protocol to mutate schema in the builder UI.

## Builder UIs
- `builder/FormBuilder.tsx`:
  - Self-contained builder that manages state internally (`useState`).
  - Sub-components:
    - `FieldPalette`: Pick a `FieldType` to add; sourced from `fieldTypeInfo`.
    - `FieldList`: Shows fields; supports select/remove/reorder.
    - `FieldInspector`: Edits selected field’s properties (type-specific editors included).
  - Live preview panel renders `<FormRenderer schema />`.
  - Export tabs show JSON and generated TSX via `generateFormTsx(schema)`.

- `builder/SimpleFormBuilder.tsx`:
  - Same UX primitives as above, but delegates all state management to `hooks/useFormBuilder`.
  - `useFormBuilder` adds debouncing, memoized selectors, and a composable API for host apps.

- `hooks/useFormBuilder.ts`:
  - Provides `schema`, `selectedFieldId`, `selectedField`, `dirty`, plus actions: `addField`, `removeField`, `updateField`, `reorderField`, `updateLayout`, `selectField`, `resetSchema`.
  - Debounces schema updates for efficient `onSchemaChange` propagation.

## Rendering (`renderer/FormRenderer.tsx`)
- Uses `react-hook-form` (RHF) and optionally `zodResolver`.
- Builds `defaultValues` from schema and (optionally) a Zod schema from `validation.zod` plus primitive rule hints.
- Uses a `FieldRegistry` (defaults to `registry/defaultRegistry.ts`) to render each field:
  - Each registry entry provides `binding` mode (`register` or `Controller`), required imports, a `render` implementation, and a `toTsx` generator used by codegen.
- Handles `layout`:
  - `stack`: vertical list
  - `grid`: responsive grid with columns/gap
  - `sections`: grouped content; a section references fields by id and may set a local grid
- Shows optional form header, actions (submit/reset), and an optional debug pane.

## Field Registry (`registry/defaultRegistry.ts`)
- Maps each `FieldType` to how it renders and how codegen should emit TSX.
- Integrates shadcn UI primitives (Input, Select, Checkbox, etc.) and RHF (`register` vs `Controller`).
- Centralizes visual wrapper via `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`.
- `fieldTypeInfo` provides UX metadata (label, description, icon, category) for the palette.

## Code Generation (`codegen/generateFormTsx.ts`)
- Produces a fully self-contained TSX React component:
  - Auto-collects needed imports (RHF, optional Zod, shadcn components) from the registry.
  - Emits layout containers, field blocks via each registry entry’s `toTsx`, default values, optional Zod schema, and submit/reset actions.
- Also provides `generateExportBundle` to emit a file bundle and `formatTsx` to prettify if Prettier is present.

## End-to-End Flow
- Authoring:
  1) User adds/edits fields in builder.
  2) Builder mutates `FormSchema` via events or `useFormBuilder` actions.
  3) JSON export reflects the same schema; TSX export uses `generateFormTsx(schema)`.
  4) Preview uses `<FormRenderer schema={schema} />` which renders using the same registry.

- Runtime Rendering:
  1) RHF bootstraps with derived `defaultValues` and optional zod resolver.
  2) Renderer iterates schema fields; for each, resolves registry entry and calls `render`.
  3) Layout container arranges field blocks.
  4) Submit/reset callbacks are forwarded to consumers.

## Extensibility
- Add a new field type:
  - Extend `FieldType`, add a new union branch to `FieldSchema` (or leverage `custom`).
  - Add a registry entry with `render` and `toTsx`.
  - Update `fieldTypeInfo` to expose it in the palette.
- Swap UI kit or RHF binding:
  - Provide a custom `FieldRegistry` via `FormRenderer` options and `generateFormTsx` options.
- Advanced validation:
  - Prefer Zod via `options.useZodResolver` and per-field `validation.zod` hints.

## Current Constraints and Future Enhancements
- `deps` (conditional visibility/enabling) and `actions` are defined in the schema but not yet enforced by the renderer; they are suitable for a future iteration.
- Sections layout uses field id references; the builder UI currently edits fields globally and does not yet provide drag/drop directly into sections.
- Codegen emits a single component file; multi-file emit is supported in the bundle shape but defaults to a single TSX file.


