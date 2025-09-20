import * as React from 'react'
import { useStore } from 'zustand'
import { createFormBuilderStore, type State } from './formBuilder.store'

/**
 * FormBuilderProvider
 *
 * Provides a per-instance Form Builder store via React Context. The provider
 * creates the store once (scoped by the given id) and exposes hooks for
 * selective subscriptions and an imperative API escape hatch.
 */

type Store = ReturnType<typeof createFormBuilderStore>

const FormBuilderContext = React.createContext<Store | null>(null)

export function FormBuilderProvider({ id, children }: { id: string; children: React.ReactNode }) {
  const ref = React.useRef<Store | null>(null)
  if (ref.current == null) {
    ref.current = createFormBuilderStore(id)
  }
  return <FormBuilderContext.Provider value={ref.current}>{children}</FormBuilderContext.Provider>
}

/**
 * useFormBuilder
 *
 * Subscribe to a slice of the Form Builder store using a selector for
 * fine-grained updates.
 */
export function useFormBuilder<T>(selector: (s: State) => T): T {
  const store = React.useContext(FormBuilderContext)
  if (!store) throw new Error('useFormBuilder must be used inside FormBuilderProvider')
  return useStore(store, selector)
}

/**
 * useFormBuilderApi
 *
 * Escape hatch to access the underlying store instance (for RF bridges, DnD, etc.).
 */
export function useFormBuilderApi() {
  const store = React.useContext(FormBuilderContext)
  if (!store) throw new Error('useFormBuilderApi must be used inside FormBuilderProvider')
  return store
}


