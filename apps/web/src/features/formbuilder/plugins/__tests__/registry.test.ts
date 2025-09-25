import { describe, expect, it } from 'vitest'
import { createPluginRegistry } from '../core/registry'
import { shadcnPlugin } from '../presets/shadcn.plugin'

describe('PluginRegistry', () => {
  it('registers plugins and retrieves strategies', () => {
    const registry = createPluginRegistry([shadcnPlugin])
    const strategy = registry.getStrategy('text')
    expect(strategy).toBeDefined()
    const rendered = strategy?.generateCode({
      id: 'field-1',
      name: 'field-1',
      label: 'Field One',
      type: 'text',
    } as never, {
      registerImport: () => undefined,
    })
    expect(rendered).toContain('<Input')
  })
})


