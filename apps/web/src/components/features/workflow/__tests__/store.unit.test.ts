import { useWorkflowRFStore } from '@/stores/workflowRF.store'
import { type Connection, type EdgeChange, type NodeChange } from '@xyflow/react'
import { describe, expect, it } from 'vitest'

describe('useWorkflowRFStore', () => {
  it('adds nodes and updates node data immutably', () => {
    const addNodes = useWorkflowRFStore.getState().addNodes
    const updateNodeData = useWorkflowRFStore.getState().updateNodeData
    addNodes({ id: 'n1', type: 'input', position: { x: 0, y: 0 }, data: { label: 'A' } } as any)
    expect(useWorkflowRFStore.getState().nodes).toHaveLength(1)
    const prevNode = useWorkflowRFStore.getState().nodes[0]
    updateNodeData('n1', { label: 'B' })
    const nextNode = useWorkflowRFStore.getState().nodes[0]
    expect(nextNode.data.label).toBe('B')
    expect(nextNode).not.toBe(prevNode)
  })

  it('onNodesChange applies changes', () => {
    const { nodes, onNodesChange } = useWorkflowRFStore.getState()
    expect(nodes.length).toBeGreaterThan(0)
    const changes: NodeChange[] = [{ id: nodes[0].id, type: 'select', selected: true }]
    onNodesChange(changes)
    expect(useWorkflowRFStore.getState().nodes[0].selected).toBe(true)
  })

  it('onEdgesChange and onConnect modify edges', () => {
    const { setEdges, onEdgesChange, onConnect } = useWorkflowRFStore.getState()
    setEdges([])
    const connection: Connection = { source: 'n1', target: 'n2', sourceHandle: null, targetHandle: null }
    onConnect(connection)
    expect(useWorkflowRFStore.getState().edges).toHaveLength(1)
    const ec: EdgeChange[] = [
      { id: useWorkflowRFStore.getState().edges[0].id, type: 'select', selected: true },
    ]
    onEdgesChange(ec)
    expect(useWorkflowRFStore.getState().edges[0].selected).toBe(true)
  })

  it('updateNodes applies functional mapping', () => {
    const { updateNodes } = useWorkflowRFStore.getState()
    updateNodes((ns) => ns.map((n) => ({ ...n, data: { ...n.data, touched: true } } as any)))
    expect(useWorkflowRFStore.getState().nodes.every((n) => (n.data as any).touched)).toBe(true)
  })
})


