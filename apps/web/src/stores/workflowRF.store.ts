import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from '@xyflow/react'
import { createWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/vanilla/shallow'

/**
 * useWorkflowRFStore
 *
 * Central source of truth for React Flow graph state and handlers.
 * - Controls nodes/edges
 * - Exposes RF handlers (onNodesChange, onEdgesChange, onConnect)
 * - Provides immutable, optimistic updates for node.data via updateNodeData
 * - Includes updateNodes to enable functional updates across the node array
 */
export type RFState = {
  /** Current React Flow nodes */
  nodes: Node[]
  /** Current React Flow edges */
  edges: Edge[]

  /** Controlled handlers for <ReactFlow> */
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void

  /** Graph mutations */
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  addNodes: (...nodes: Node[]) => void

  /**
   * Update a node's data by id.
   * Accepts an updater function or a partial object to shallow-merge into data.
   */
  updateNodeData: (id: string, update: ((data: any) => any) | Record<string, unknown>) => void

  /**
   * Apply a functional update to the entire nodes array.
   * Useful for bulk transforms (e.g., drag highlight mapping, multi-node updates).
   */
  updateNodes: (updater: (nodes: Node[]) => Node[]) => void
}

export const useWorkflowRFStore = createWithEqualityFn<RFState>()(
  (set, get) => ({
    nodes: [],
    edges: [],

    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),

    onNodesChange: (changes) => set({ nodes: applyNodeChanges(changes, get().nodes) }),
    onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),
    onConnect: (connection) => set({ edges: addEdge(connection, get().edges) }),

    addNodes: (...newNodes) => set({ nodes: [...get().nodes, ...newNodes] }),

    updateNodeData: (id, update) =>
      set({
        nodes: get().nodes.map((n) =>
          n.id === id
            ? { ...n, data: typeof update === 'function' ? (update as any)(n.data) : { ...n.data, ...update } }
            : n,
        ),
      }),

    updateNodes: (updater) => set({ nodes: updater(get().nodes) }),
  }),
  /**
   * Equality function used by the hook to avoid unnecessary re-renders for multi-field selectors.
   * Note: components should still select minimal slices for best performance.
   */
  shallow,
)


