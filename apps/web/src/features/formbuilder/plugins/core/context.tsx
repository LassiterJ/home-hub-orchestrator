import * as React from 'react';
import { PluginRegistryContext } from './registry';
import { ComponentResolver } from './types';

interface PluginProviderProps {
  resolver: ComponentResolver;
  children: React.ReactNode;
}

/**
 * @description Provider component wrapping consumers that need plugin registry access.
 */
export function FormBuilderPluginProvider({ resolver, children }: PluginProviderProps) {
  return (
    <PluginRegistryContext.Provider value={resolver}>
      {children}
    </PluginRegistryContext.Provider>
  )
}

/**
 * @description Hook to access the current component resolver.
 */
export function useFormBuilderPlugins(): ComponentResolver {
  const resolver = React.useContext(PluginRegistryContext)
  if (!resolver) {
    throw new Error('useFormBuilderPlugins must be used within a FormBuilderPluginProvider')
  }
  return resolver
}


