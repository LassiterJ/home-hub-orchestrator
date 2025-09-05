import React from 'react'
import { Card } from '@home-hub-orchestrator/ui/src/Card/Card'
import { BarChart3, Brain, Database, FileText, Image, Settings, Table, Upload, Video, Zap } from 'lucide-react'

const nodeCategories = [
   {
      title: 'Input',
      nodes: [
         { type: 'input', label: 'Image BaseInput', icon: Image, description: 'Load images from various sources' },
         { type: 'input', label: 'Video BaseInput', icon: Video, description: 'Load video streams or files' },
         { type: 'input', label: 'Dataset', icon: Database, description: 'Load annotated datasets' },
         {
            type: 'form',
            label: 'Workflow Config',
            icon: FileText,
            description: 'Update the configuration at your own risk',
         },
      ],
   },
   {
      title: 'Models',
      nodes: [
         { type: 'model', label: 'Object Detection', icon: Brain, description: 'Detect objects in images' },
         { type: 'model', label: 'Classification', icon: Brain, description: 'Classify images or objects' },
         { type: 'model', label: 'Segmentation', icon: Brain, description: 'Segment objects or regions' },
      ],
   },
   {
      title: 'Processing',
      nodes: [
         { type: 'processing', label: 'Filter', icon: Settings, description: 'Filter detections by criteria' },
         { type: 'processing', label: 'Transform', icon: Zap, description: 'Transform image coordinates' },
         { type: 'processing', label: 'Augment', icon: Settings, description: 'Apply data augmentations' },
      ],
   },
   {
      title: 'Output',
      nodes: [
         { type: 'output', label: 'Visualize', icon: BarChart3, description: 'Visualize results and metrics' },
         { type: 'output', label: 'Export', icon: Upload, description: 'Export results to various formats' },
         { type: 'output', label: 'Webhook', icon: Zap, description: 'Send results via webhook' },
      ],
   },
   {
      title: 'Documentation',
      nodes: [
         {
            type: 'documentation',
            label: 'DatabaseSchemaNode',
            icon: Table,
            description: 'A convenient node for documenting schemas',
         },

      ],
   },
]

const NodeSidebar = () => {
   const onDragStart = (event: React.DragEvent, nodeType: string) => {
      event.dataTransfer.setData('application/reactflow', nodeType)
      event.dataTransfer.effectAllowed = 'move'
   }

   return (
      <div
         className="w-80 bg-sidebar-bg text-sidebar-fg p-4 border-r border-border overflow-y-auto shadow-[var(--shadow-sidebar)]">
         <div className="mb-6">
            <h1 className="text-xl font-bold mb-2">Roboflow Workflows</h1>
            <p className="text-sm text-sidebar-muted">Drag blocks to build your computer vision workflow</p>
         </div>

         <div className="space-y-6">
            {nodeCategories.map((category) => (
               <div key={category.title}>
                  <h3 className="text-sm font-semibold mb-3 text-sidebar-fg uppercase tracking-wide">
                     {category.title}
                  </h3>
                  <div className="space-y-2">
                     {category.nodes.map((node, index) => (
                        <Card
                           key={`${node.type}-${index}`}
                           className="p-3 cursor-grab active:cursor-grabbing bg-sidebar-muted border-sidebar-muted hover:bg-sidebar-muted/80 transition-colors"
                           draggable
                           onDragStart={(event: React.DragEvent) => onDragStart(event, node.type)}
                        >
                           <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-md ${
                                 node.type === 'input' ? 'bg-node-input/20 text-node-input' :
                                    node.type === 'model' ? 'bg-node-model/20 text-node-model' :
                                       node.type === 'processing' ? 'bg-node-processing/20 text-node-processing' :
                                          'bg-node-output/20 text-node-output'
                              }`}>
                                 <node.icon size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h4 className="text-sm font-medium text-sidebar-fg">{node.label}</h4>
                                 <p className="text-xs text-sidebar-muted mt-1 line-clamp-2">{node.description}</p>
                              </div>
                           </div>
                        </Card>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      </div>
   )
}

export default NodeSidebar
