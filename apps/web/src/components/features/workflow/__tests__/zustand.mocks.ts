import { act } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Auto-mock zustand create APIs so we can reset stores between tests
vi.mock('zustand', async (importOriginal) => {
  const mod: any = await importOriginal()
  const { create: actualCreate, createStore: actualCreateStore } = mod

  const storeResetFns = new Set<() => void>()

  const createUncurried = <T,>(stateCreator: any) => {
    const store = actualCreate(stateCreator)
    const initial = store.getInitialState()
    storeResetFns.add(() => store.setState(initial, true))
    return store
  }

  const create = ((sc: any) =>
    typeof sc === 'function' ? createUncurried(sc) : createUncurried) as typeof mod.create

  const createStoreUncurried = <T,>(stateCreator: any) => {
    const store = actualCreateStore(stateCreator)
    const initial = store.getInitialState()
    storeResetFns.add(() => store.setState(initial, true))
    return store
  }
  const createStore = ((sc: any) =>
    typeof sc === 'function' ? createStoreUncurried(sc) : createStoreUncurried) as typeof mod.createStore

  afterEach(() => {
    act(() => {
      storeResetFns.forEach((reset) => reset())
    })
  })

  return { ...mod, create, createStore }
})


