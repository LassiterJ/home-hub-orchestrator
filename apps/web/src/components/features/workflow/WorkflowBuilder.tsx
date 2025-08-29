import React, { useCallback, useState } from 'react';
import {
   ReactFlow,
   addEdge,
   MiniMap,
   Controls,
   Background,
   useNodesState,
   useEdgesState,
   Connection,
   Edge,
   Node,
   BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import NodeSidebar from './NodeSidebar';
import { InputNode, ModelNode, ProcessingNode, OutputNode } from './nodes';
import { sampleNodes, sampleEdges } from './sampleWorkflow';
import { NodeData } from '../../../types';

const nodeTypes = {
   input: InputNode,
   model: ModelNode,
   processing: ProcessingNode,
   output: OutputNode,
};

export const WorkflowBuilder = () => {
   const [nodes, setNodes, onNodesChange] = useNodesState(sampleNodes);
   const [edges, setEdges, onEdgesChange] = useEdgesState(sampleEdges);
   const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

   const onConnect = useCallback(
      (params: Connection) => setEdges((eds) => addEdge(params, eds)),
      [setEdges]
   );

   const onDragOver = useCallback((event: React.DragEvent) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
   }, []);

   const onDrop = useCallback(
      (event: React.DragEvent) => {
         event.preventDefault();

         if (!reactFlowInstance) return;

         const type = event.dataTransfer.getData('application/reactflow');
         if (!type) return;

         const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
         });

         const newNode: Node<NodeData> = {
            id: `${type}-${Date.now()}`,
            type,
            position,
            data: {
               label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
               description: `A ${type} node for your workflow`,
               kind: type,
               runtime: "default", // or whichever runtime string makes sense in your system
               effect: "none",     // replace with your default effect
               inputs: [],
               outputs: [],
            },
         };

         setNodes((nds) => nds.concat(newNode));
      },
      [reactFlowInstance, setNodes]
   );

   return (
      <div className="h-screen flex bg-canvas">
         <NodeSidebar />
         <div className="flex-1 relative">
            <ReactFlow
               nodes={nodes}
               edges={edges}
               onNodesChange={onNodesChange}
               onEdgesChange={onEdgesChange}
               onConnect={onConnect}
               onInit={setReactFlowInstance}
               onDrop={onDrop}
               onDragOver={onDragOver}
               nodeTypes={nodeTypes}
               fitView
               className="bg-canvas"
            >
               <Controls className="!bottom-4 !left-4" />
               <MiniMap
                  className="!bottom-4 !right-4 !w-48 !h-32 border border-border rounded-lg shadow-lg"
                  nodeColor={(node) => {
                     switch (node.type) {
                        case 'input': return 'hsl(var(--node-input))';
                        case 'model': return 'hsl(var(--node-model))';
                        case 'processing': return 'hsl(var(--node-processing))';
                        case 'output': return 'hsl(var(--node-output))';
                        default: return 'hsl(var(--muted))';
                     }
                  }}
               />
               <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            </ReactFlow>
         </div>
      </div>
   );
};
