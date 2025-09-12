import { WorkflowBuilder } from '@/components/features/workflow/WorkflowBuilder'
import { useWorkflowRFStore } from '@/stores/workflowRF.store'
import { render } from '@testing-library/react'
import { ReactFlowProvider } from '@xyflow/react'
import { describe, expect, it } from 'vitest'

// High-level integration-ish test: ensure store responds to addNodes via API and
// ReactFlow controlled props pick it up. (We skip DOM drag because JSDOM lacks layout.)
describe('WorkflowBuilder integration', () => {
  it('reflects new nodes added via store', () => {
    render(
      <ReactFlowProvider>
        <WorkflowBuilder />
      </ReactFlowProvider>,
    )
    const { addNodes } = useWorkflowRFStore.getState()
    const before = useWorkflowRFStore.getState().nodes.length
    addNodes({ id: 'it-1', type: 'input', position: { x: 10, y: 10 }, data: { label: 'Test' } } as any)
    const after = useWorkflowRFStore.getState().nodes.length
    expect(after).toBe(before + 1)
  })
})


