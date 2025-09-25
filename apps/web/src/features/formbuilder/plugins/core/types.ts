import { FieldConfig, FieldKind } from '@/features/formbuilder/builder/FormBuilderTypes';

/**
 * @description Context passed to strategies while rendering preview/editor output.
 * Keeps React Hook Form bindings generic to avoid coupling to specific component libs.
 */
export interface PreviewContext {
  control: unknown;
}

/**
 * @description Context passed to strategies when generating TSX snippets.
 * Contains helpers for import registration and utility access.
 */
export interface CodegenContext {
  registerImport: (specifier: string, from: string, isDefault?: boolean) => void;
}

/**
 * @description Strategy contract for rendering and generating a field type.
 * Strategies are provided by plugins and consumed by runtime preview/editor and codegen.
 */
export interface FieldStrategy {
  renderPreview: (def: FieldConfig, ctx: PreviewContext) => React.ReactNode;
  renderEditorControls?: (def: FieldConfig, ctx: PreviewContext) => React.ReactNode;
  generateCode: (def: FieldConfig, ctx: CodegenContext) => string;
}

/**
 * @description Definition for plugin modules registering strategies and optional helpers.
 */
export interface FormBuilderPlugin {
  id: string;
  label: string;
  fields: Partial<Record<FieldKind, FieldStrategy>>;
  adapters?: Record<string, unknown>;
}

/**
 * @description Resolver interface used by runtime components to access strategies.
 */
export interface ComponentResolver {
  getStrategy: (kind: FieldKind, overrides?: ResolverOverrides) => FieldStrategy | undefined;
  listPlugins: () => string[];
}

/**
 * @description Allows per-field overrides when retrieving strategies.
 */
export interface ResolverOverrides {
  pluginId?: string;
}


