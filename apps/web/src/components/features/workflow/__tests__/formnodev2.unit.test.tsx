import { FormNodeV2 } from '@/components/features/workflow/nodes/FormNodeV2'
import { render, screen } from '@testing-library/react'
import { ReactFlowProvider } from '@xyflow/react'
import { describe, expect, it } from 'vitest'

describe('FormNodeV2', () => {
  it('renders header and toggles edit toolbar', () => {
    const data: any = { label: 'Form Node', fieldsData: [], isEditing: true }
    render(
      <ReactFlowProvider>
        {/* Minimal required props for NodeProps */}
        <FormNodeV2
          id="f1"
          data={data}
          selected={true}
          isConnectable={true}
          dragging={false}
          zIndex={0}
          type="form-v2"
          selectable={true}
          deletable={false}
          draggable={false}
          positionAbsoluteX={0}
          positionAbsoluteY={0}
        />
      </ReactFlowProvider>,
    )
    expect(screen.getByText('Form Node')).toBeInTheDocument()
    // Toolbar buttons are present when selected
    expect(screen.getByLabelText('Resize node')).toBeInTheDocument()
    expect(screen.getByLabelText('Edit node')).toBeInTheDocument()
  })
})


