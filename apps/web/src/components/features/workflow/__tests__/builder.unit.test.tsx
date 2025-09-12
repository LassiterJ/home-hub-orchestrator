import { WorkflowBuilder } from '@/components/features/workflow/WorkflowBuilder'
import { useWorkflowRFStore } from '@/stores/workflowRF.store'
import { render, screen } from '@testing-library/react'
import { ReactFlowProvider } from '@xyflow/react'
import { describe, expect, it } from 'vitest'

describe('WorkflowBuilder', () => {
  it('mounts and initializes store with sample graph', () => {
    render(
      <ReactFlowProvider>
        <WorkflowBuilder />
      </ReactFlowProvider>,
    )
    const { nodes, edges } = useWorkflowRFStore.getState()
    expect(nodes.length).toBeGreaterThan(0)
    expect(edges.length).toBeGreaterThanOrEqual(0)
    // SiteHeader renders
    expect(screen.getByRole('banner')).toBeDefined()
  })
})


