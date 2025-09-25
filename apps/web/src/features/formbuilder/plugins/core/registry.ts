import { FieldKind } from '@/features/formbuilder/builder/FormBuilderTypes'
import * as React from 'react'
import { ComponentResolver, FieldStrategy, FormBuilderPlugin, ResolverOverrides } from './types'

/**
 * @description Lightweight plugin registry storing strategies contributed by plugins.
 * Pure infrastructure; consumer side wires it into builder runtime when ready.
 */
export class PluginRegistry implements ComponentResolver {
  private readonly plugins = new Map<string, FormBuilderPlugin>()

  register(plugin: FormBuilderPlugin) {
    if (this.plugins.has(plugin.id)) {
      console.warn(`[FormBuilderPluginRegistry] Duplicate plugin id detected: ${plugin.id}`)
      return
    }
    this.plugins.set(plugin.id, plugin)
  }

  getStrategy(kind: FieldKind, overrides?: ResolverOverrides): FieldStrategy | undefined {
    const pluginCandidates = overrides?.pluginId
      ? [overrides.pluginId]
      : Array.from(this.plugins.keys())

    for (const pluginId of pluginCandidates) {
      const plugin = this.plugins.get(pluginId)
      if (!plugin) {
        continue
      }
      const strategy = plugin.fields?.[kind]
      if (strategy) {
        return strategy
      }
    }

    return undefined
  }

  listPlugins(): string[] {
    return Array.from(this.plugins.keys())
  }
}

/**
 * @description Convenience helper for consumers to create a registry and hydrate with plugins.
 */
export function createPluginRegistry(initialPlugins: FormBuilderPlugin[] = []): PluginRegistry {
  const registry = new PluginRegistry()
  initialPlugins.forEach((plugin) => registry.register(plugin))
  return registry
}

/**
 * @description React context to expose the registry to runtime consumers.
 */
export const PluginRegistryContext = React.createContext<ComponentResolver | null>(null)


