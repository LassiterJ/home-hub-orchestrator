import React, { useCallback, useRef, useState } from 'react'
import {
   addEdge,
   Background,
   BackgroundVariant,
   Connection,
   Controls,
   MiniMap,
   Node,
   NodeTypes,
   ReactFlow,
   useEdgesState,
   useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import NodeSidebar from './NodeSidebar'
import { FormNode, InputNode, ModelNode, OutputNode, ProcessingNode } from './nodes'
import { sampleContextMenu, sampleEdges, sampleNodes } from './sampleWorkflow'
import { NodeData } from '@/types'
import DatabaseSchemaDemo from '@/components/features/workflow/nodes/documentation/DatabaseSchemaNode'
import {
   ContextMenu,
   ContextMenuCheckboxItem,
   ContextMenuContent,
   ContextMenuItem,
   ContextMenuLabel,
   ContextMenuRadioGroup,
   ContextMenuRadioItem,
   ContextMenuSeparator,
   ContextMenuShortcut,
   ContextMenuSub,
   ContextMenuSubContent,
   ContextMenuSubTrigger,
   ContextMenuTrigger,
   MenuItemSpec,
} from '@/components/ui/ContextMenu'

const nodeTypes: NodeTypes = {
   input: InputNode,
   model: ModelNode,
   processing: ProcessingNode,
   output: OutputNode,
   schema: DatabaseSchemaDemo,
   form: FormNode,
}
type MenuPosition = {
   top?: number
   left?: number
   right?: number
   bottom?: number
}

export type Menu = MenuPosition & {
   id?: string
   menuContent?: MenuItemSpec[]
}

export const WorkflowBuilder = () => {
   const [nodes, setNodes, onNodesChange] = useNodesState(sampleNodes)
   const [edges, setEdges, onEdgesChange] = useEdgesState(sampleEdges)
   const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
   const ref = useRef<HTMLDivElement>(null)
   const [menu, setMenu] = useState<Menu | null>(null)
   const defaultMenuContent: MenuItemSpec[] = sampleContextMenu
   const onConnect = useCallback(
      (params: Connection) => setEdges((eds) => addEdge(params, eds)),
      [setEdges],
   )

   const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
   }, [])

   const onDrop = useCallback(
      (event: React.DragEvent<HTMLDivElement>) => {
         event.preventDefault()

         if (!reactFlowInstance) return

         const type = event.dataTransfer.getData('application/reactflow')
         if (!type) return

         const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
         })
         // TODO: Use GUID for Id (or in addition to) `${type}-${subType}-${Date.now()}-${GenRandomGUID()}`
         // `node-input-12931238917-123987123981723
         const newNode: Node<NodeData> = {
            id: `${type}-${Date.now()}`,
            type,
            position,
            data: {
               label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
               description: `A ${type} node for your workflow`,
               kind: type,
               runtime: 'default', // or whichever runtime string makes sense in your system
               effect: 'none',     // replace with your default effect
               inputs: [],
               outputs: [],
            },
         }

         setNodes((nds) => nds.concat(newNode))
      },
      [reactFlowInstance, setNodes],
   )
   const onPaneClick = useCallback(() => setMenu(null), [setMenu])
   const onNodeContextMenu = useCallback(
      (event: React.MouseEvent, node: Node<NodeData>) => {
         event.preventDefault()
         if (!ref.current) return
         const pane = ref.current.getBoundingClientRect()
         setMenu({
            id: node.id,
            top: event.clientY < pane.height - 200 ? event.clientY : undefined,
            left: event.clientX < pane.width - 200 ? event.clientX : undefined,
            right: event.clientX >= pane.width - 200 ? pane.width - event.clientX : undefined,
            bottom: event.clientY >= pane.height - 200 ? pane.height - event.clientY : undefined,
            menuContent: defaultMenuContent,
         })
      },
      [setMenu],
   )
   const { menuContent = defaultMenuContent, ...restMenu } = menu ?? {}
   return (
      <div className="h-screen flex bg-canvas">
         <NodeSidebar />
         <div className="flex-1 relative" ref={ref}>
            <ContextMenu>
               <ContextMenuTrigger
                  className="">
                  <ReactFlow
                     nodes={nodes}
                     edges={edges}
                     onNodesChange={onNodesChange}
                     onEdgesChange={onEdgesChange}
                     onConnect={onConnect}
                     onInit={setReactFlowInstance}
                     onNodeContextMenu={onNodeContextMenu}
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
                              case 'input':
                                 return 'hsl(var(--node-input))'
                              case 'model':
                                 return 'hsl(var(--node-model))'
                              case 'processing':
                                 return 'hsl(var(--node-processing))'
                              case 'output':
                                 return 'hsl(var(--node-output))'
                              default:
                                 return 'hsl(var(--muted))'
                           }
                        }}
                     />
                     <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
                  </ReactFlow>
               </ContextMenuTrigger>
               <ContextMenuContent className="w-52">
                  <ContextMenuItem inset>
                     Back
                     <ContextMenuShortcut>⌘[</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem inset disabled>
                     Forward
                     <ContextMenuShortcut>⌘]</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem inset>
                     Reload
                     <ContextMenuShortcut>⌘R</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuSub>
                     <ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
                     <ContextMenuSubContent className="w-44">
                        <ContextMenuItem>Save Page...</ContextMenuItem>
                        <ContextMenuItem>Create Shortcut...</ContextMenuItem>
                        <ContextMenuItem>Name Window...</ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem>Developer Tools</ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
                     </ContextMenuSubContent>
                  </ContextMenuSub>
                  <ContextMenuSeparator />
                  <ContextMenuCheckboxItem checked>
                     Show Bookmarks
                  </ContextMenuCheckboxItem>
                  <ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>
                  <ContextMenuSeparator />
                  <ContextMenuRadioGroup value="pedro">
                     <ContextMenuLabel inset>People</ContextMenuLabel>
                     <ContextMenuRadioItem value="pedro">
                        Pedro Duarte
                     </ContextMenuRadioItem>
                     <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
                  </ContextMenuRadioGroup>
               </ContextMenuContent>
            </ContextMenu>


         </div>
      </div>
   )
}
