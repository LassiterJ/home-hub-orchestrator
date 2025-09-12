import { WorkflowSidebar } from '@/components/features/workflow/WorkflowSidebar'
import { render } from '@testing-library/react'
import { ReactFlowProvider } from '@xyflow/react'
import { describe, expect, it } from 'vitest'

describe('WorkflowSidebar', () => {
  it('renders groups and items', () => {
    const { getByText } = render(
      <ReactFlowProvider>
        <WorkflowSidebar />
      </ReactFlowProvider>,
    )
    // Assert a few known section titles from data
    expect(getByText('Input Nodes')).toBeInTheDocument()
    expect(getByText('Model Nodes')).toBeInTheDocument()
  })
})


