// // apps/web/src/routes/workflows.tsx
// import { useCallback, useMemo, useState } from "react";
// import  {
//    ReactFlow,
//    Background,
//    Controls,
//    MiniMap,
//    addEdge,
//    useEdgesState,
//    useNodesState,
//    Connection,
//    Edge,
//    Node,
// } from "@xyflow/react";
// import '@xyflow/react/dist/style.css';
import { createFileRoute } from '@tanstack/react-router'
import {WorkflowBuilder} from "../components/features/workflow/WorkflowBuilder"
// import type {NodeData} from '../types'
//
// /** ---- Minimal shared types matching your Zod schema.ts ---- */
// type Runtime = "ts" | "http" | "process" | "wasm";
// type Effect = "pure" | "effect";
// type EdgeType = "data" | "control";
//
// type NodeInstance = {
//    id: string;
//    kind: string;
//    version?: string;
//    runtime: Runtime;
//    effect: Effect;
//    config: Record<string, unknown>;
//    inputs: string[];
//    outputs: string[];
//    concurrency?: number;
//    stream?: boolean;
//    label?: string;
//    ui?: { x?: number; y?: number };
// };
//
// type WfEdge = {
//    id: string;
//    type: EdgeType;
//    from: { nodeId: string; port: string };
//    to: { nodeId: string; port: string };
// };
//
// type Workflow = {
//    id: string;
//    name: string;
//    description?: string;
//    nodes: NodeInstance[];
//    edges: WfEdge[];
//    queue: { size: number; policy: "block" | "drop-oldest" | "drop-newest" | "sample" };
// };
//
// /** ---- Sample workflow (CV-flavored) ---- */
// const sampleWorkflow: Workflow = {
//    id: "yolo_draw_save",
//    name: "YOLO → Draw → Save",
//    description: "Demo graph for the editor",
//    nodes: [
//       {
//          id: "fileIn",
//          kind: "FileIn",
//          version: "1.0.0",
//          runtime: "ts",
//          effect: "pure",
//          config: {},
//          inputs: [],
//          outputs: ["out"],
//          stream: false,
//          label: "File In",
//          ui: { x: 50, y: 120 },
//       },
//       {
//          id: "detect",
//          kind: "YOLODetect_HTTP",
//          version: "1.0.0",
//          runtime: "http",
//          effect: "effect",
//          config: { endpoint: "http://localhost:9001/infer/object_detection" },
//          inputs: ["in"],
//          outputs: ["out"],
//          stream: false,
//          label: "Detect",
//          ui: { x: 320, y: 120 },
//       },
//       {
//          id: "draw",
//          kind: "DrawBoxes",
//          version: "1.0.0",
//          runtime: "ts",
//          effect: "pure",
//          config: { thickness: 2 },
//          inputs: ["in"],
//          outputs: ["out"],
//          stream: false,
//          label: "Draw Boxes",
//          ui: { x: 590, y: 120 },
//       },
//       {
//          id: "save",
//          kind: "FileOut",
//          version: "1.0.0",
//          runtime: "ts",
//          effect: "effect",
//          config: { path: "out/result.png" },
//          inputs: ["in"],
//          outputs: [],
//          stream: false,
//          label: "Save",
//          ui: { x: 860, y: 120 },
//       },
//    ],
//    edges: [
//       { id: "e1", type: "data", from: { nodeId: "fileIn", port: "out" }, to: { nodeId: "detect", port: "in" } },
//       { id: "e2", type: "data", from: { nodeId: "detect", port: "out" }, to: { nodeId: "draw", port: "in" } },
//       { id: "e3", type: "data", from: { nodeId: "draw", port: "out" }, to: { nodeId: "save", port: "in" } },
//    ],
//    queue: { size: 64, policy: "block" },
// };
//
export const Route = createFileRoute('/workflows')({
   component: WorkflowBuilder,
})
//
// /** ---- Mapping helpers: Workflow <-> React Flow ---- */
// function wfToRfNodes(wf: Workflow): Node<NodeData>[] {
//    return wf.nodes.map((n) => ({
//       id: n.id,
//       position: { x: n.ui?.x ?? 0, y: n.ui?.y ?? 0 },
//       data: {
//          label: n.label ?? n.kind,
//          description: n.description,
//          kind: n.kind,
//          runtime: n.runtime,
//          effect: n.effect,
//          inputs: n.inputs,
//          outputs: n.outputs,
//       },
//       type: "default",
//       selectable: true,
//    }));
// }
//
// function wfToRfEdges(wf: Workflow): Edge[] {
//    return wf.edges.map((e) => ({
//       id: e.id,
//       source: e.from.nodeId,
//       target: e.to.nodeId,
//       label: e.type === "control" ? "control" : undefined,
//       animated: e.type === "control",
//       data: { portFrom: e.from.port, portTo: e.to.port, edgeType: e.type },
//    }));
// }
//
// /** Optional: persist to localStorage so you don’t lose edits on refresh */
// const LS_KEY = "workflow_editor_graph_v1";
// function loadInitial() {
//    try {
//       const raw = localStorage.getItem(LS_KEY);
//       if (!raw) return null;
//       const parsed: { nodes: Node[]; edges: Edge[] } = JSON.parse(raw);
//       return parsed;
//    } catch {
//       return null;
//    }
// }
//
// /** ---- Page component at /workflows ---- */
// export default function WorkflowsPage() {
//    const initial = useMemo(() => loadInitial() ?? {
//       nodes: wfToRfNodes(sampleWorkflow),
//       edges: wfToRfEdges(sampleWorkflow),
//    }, []);
//
//
//    const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>(
//       initial.nodes as Node<NodeData>[]
//    );
//    const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges as Edge[]);
//    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
//
//    const onConnect = useCallback(
//       (conn: Connection) => setEdges((eds) => addEdge({ ...conn, id: crypto.randomUUID() }, eds)),
//       [setEdges]
//    );
//
//    const onNodeClick = useCallback((_: any, node: Node) => setSelectedNodeId(node.id), []);
//
//    const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId) ?? null, [nodes, selectedNodeId]);
//
//    const resetGraph = useCallback(() => {
//       const n = wfToRfNodes(sampleWorkflow);
//       const e = wfToRfEdges(sampleWorkflow);
//       setNodes(n);
//       setEdges(e);
//       setSelectedNodeId(null);
//       localStorage.setItem(LS_KEY, JSON.stringify({ nodes: n, edges: e }));
//    }, [setNodes, setEdges]);
//
//    const saveLocal = useCallback(() => {
//       localStorage.setItem(LS_KEY, JSON.stringify({ nodes, edges }));
//    }, [nodes, edges]);
// const RFProps = `nodes={[]}
//                edges={}
//                onNodesChange={(changes) => { onNodesChange(changes); }}
//                onEdgesChange={(changes) => { onEdgesChange(changes); }}
//                onConnect={onConnect}
//                onNodeClick={onNodeClick}
//                fitView`;
//    return (
//       <div className="w-full h-[calc(100vh-0px)] grid grid-cols-[1fr_320px]">
//          {/* Canvas */}
//          <div className="relative">
//             <ReactFlow
//
//             >
//                <MiniMap pannable zoomable />
//                <Controls />
//                <Background />
//             </ReactFlow>
//          </div>
//
//          {/* Inspector */}
//          <aside className="border-l p-3 flex flex-col gap-3">
//             <header className="flex items-center justify-between">
//                <h2 className="text-lg font-semibold">Workflow Editor</h2>
//                <div className="flex gap-2">
//                   <button className="px-2 py-1 border rounded" onClick={resetGraph}>Reset</button>
//                   <button className="px-2 py-1 border rounded" onClick={saveLocal}>Save</button>
//                </div>
//             </header>
//
//             <section className="text-sm">
//                <div className="mb-2">
//                   <div className="font-medium">Workflow</div>
//                   <div className="text-neutral-600">{sampleWorkflow.name}</div>
//                   <div className="text-neutral-500">{sampleWorkflow.description}</div>
//                </div>
//
//                <div className="mt-3">
//                   <div className="font-medium">Selected Node</div>
//                   {!selectedNode && <div className="text-neutral-500">none</div>}
//                   {selectedNode && (
//                      <div className="space-y-1">
//                         <div><span className="font-mono text-xs">{selectedNode.id}</span></div>
//                         <div>Label: {String(selectedNode.data?.label ?? "")}</div>
//                         <div>Kind: {String(selectedNode.data?.kind ?? "")}</div>
//                         <div>Runtime: {String(selectedNode.data?.runtime ?? "")}</div>
//                         <div>Effect: {String(selectedNode.data?.effect ?? "")}</div>
//                         <div>Inputs: {(selectedNode.data?.inputs ?? []).join(", ")}</div>
//                         <div>Outputs: {(selectedNode.data?.outputs ?? []).join(", ")}</div>
//                      </div>
//                   )}
//                </div>
//
//                <div className="mt-4">
//                   <button
//                      className="px-2 py-1 border rounded w-full"
//                      onClick={() => {
//                         const payload = JSON.stringify({ nodes, edges }, null, 2);
//                         navigator.clipboard.writeText(payload);
//                         alert("Graph JSON copied to clipboard.");
//                      }}
//                   >
//                      Copy Graph JSON
//                   </button>
//                </div>
//             </section>
//          </aside>
//       </div>
//    );
// }
