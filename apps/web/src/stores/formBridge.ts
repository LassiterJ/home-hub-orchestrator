export type { FieldDef } from './formBuilder.store'
import { type useFormBuilderApi } from './FormBuilderProvider'

/**
 * FormBridge
 *
 * A tiny adapter layer to keep React Flow concerns decoupled from the
 * FormBuilder store domain while enabling directional interactions.
 */
export type FormBridge = {
  /** Called when adding a field via an RF interaction (e.g., drop into Form node) */
  addFieldFromRF: (def: import('./formBuilder.store').FieldDef, targetFormId: string, index?: number) => void
  /** RF can mirror selection state for highlighting */
  selectFieldInRF: (fieldId: string) => void
}

/**
 * createFormBridge
 *
 * @param getFbState - The FormBuilder store getState function (imperative)
 * @param rfActions - Minimal RF actions consumed by the bridge
 */
export function createFormBridge(
  getFbState: ReturnType<typeof useFormBuilderApi>['getState'],
  rfActions: { focusNode: (id: string) => void },
): FormBridge {
  return {
    addFieldFromRF: (def, _targetFormId, index) => getFbState().addField(def, index),
    selectFieldInRF: (fieldId) => rfActions.focusNode(fieldId),
  }
}
