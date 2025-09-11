import {
   addEdge,
   Background,
   BackgroundVariant,
   Connection,
   Controls,
   MiniMap,
   ReactFlow,
   ReactFlowProvider,
   useEdgesState,
   useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import React, { useCallback } from 'react'

import { WorkflowSidebar } from '@/components/features/workflow/WorkflowSidebar'
import { SiteHeader } from '@/components/shared/PageHeader'
import { MenuItemSpec } from '@/components/ui/ContextMenu'
import { SidebarInset, SidebarProvider } from '@/components/ui/Sidebar'
import { sampleEdges, sampleNodes } from '@/components/features/workflow/sampleWorkflow'
import { nodeTypes } from '@/components/features/workflow/nodeTypes'


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

   const [nodes, _, onNodesChange] = useNodesState(sampleNodes)
   const [edges, setEdges, onEdgesChange] = useEdgesState(sampleEdges)

   const onConnect = useCallback(
      (params: Connection) => setEdges((eds) => addEdge(params, eds)),
      [],
   )

   return (
      <div className="[--header-height:calc(--spacing(14))]">
         <ReactFlowProvider>
            <SidebarProvider className="flex flex-col">
               <SiteHeader />
               <div className="flex flex-1">
                  <WorkflowSidebar />
                  <SidebarInset>
                     <div className="h-full w-full">
                        <ReactFlow
                           nodes={nodes}
                           edges={edges}
                           onNodesChange={onNodesChange}
                           onEdgesChange={onEdgesChange}
                           onConnect={onConnect}
                           // onNodeContextMenu={onNodeContextMenu} TODO: re-implement context menu
                           nodeTypes={nodeTypes}
                           fitView
                           selectNodesOnDrag={false}
                           className="bg-canvas"
                           style={{ width: '100%', height: '100%' }}
                        >


                           <Controls className="bottom-4! left-4!" />
                           <MiniMap
                              className="bottom-4! right-4! w-48! h-32! border border-border rounded-lg shadow-lg"
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
                     </div>
                  </SidebarInset>
               </div>
            </SidebarProvider>
         </ReactFlowProvider>
      </div>
      //
      //    <div className="h-screen w-100vh flex bg-canvas">
      //       // <NodeSidebar />
      //       // {/*
      //       //        * IMPORTANT: Give the immediate React Flow ancestor an explicit height.
      //       //        * Without this, `height: 100%` on the flow container resolves to 0
      //       //        * when the parent's computed height is "auto", causing error 004.
      //       //        */}
      //       // <div className="flex-1 relative min-h-4 min-w-10 h-screen " ref={ref}>
      //       // <ContextMenu>
      //       // <ContextMenuTrigger asChild>
      //       // <div className="h-full w-full">
      //       // <ReactFlow
      //                   nodes={nodes}
      //                   edges={edges}
      //                   onNodesChange={onNodesChange}
      //                   onEdgesChange={onEdgesChange}
      //                   onConnect={onConnect}
      //                      onInit={setReactFlowInstance}
      //                      onNodeContextMenu={onNodeContextMenu}
      //                      onDrop={onDrop}
      //                      onDragOver={onDragOver}
      //                      nodeTypes={nodeTypes}
      //                      fitView
      //                      className="bg-canvas"
      //                      style={{ width: '100%', height: '100%' }}
      //                   >
      //
      //
      //                      <Controls className="bottom-4! left-4!" />
      //                      <MiniMap
      //                         className="bottom-4! right-4! w-48! h-32! border border-border rounded-lg shadow-lg"
      //                         nodeColor={(node) => {
      //                            switch (node.type) {
      //                               case 'input':
      //                                  return 'hsl(var(--node-input))'
      //                               case 'model':
      //                                  return 'hsl(var(--node-model))'
      //                               case 'processing':
      //                                  return 'hsl(var(--node-processing))'
      //                               case 'output':
      //                                  return 'hsl(var(--node-output))'
      //                               default:
      //                                  return 'hsl(var(--muted))'
      //                            }
      //                         }}
      //                      />
      //                      <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      //                   </ReactFlow>
      //                </div>
      //             </ContextMenuTrigger>
      //             <ContextMenuContent className="w-52">
      //                <ContextMenuItem inset>
      //                   Back
      //                   <ContextMenuShortcut>⌘[</ContextMenuShortcut>
      //                </ContextMenuItem>
      //                <ContextMenuItem inset disabled>
      //                   Forward
      //                   <ContextMenuShortcut>⌘]</ContextMenuShortcut>
      //                </ContextMenuItem>
      //                <ContextMenuItem inset>
      //                   Reload
      //                   <ContextMenuShortcut>⌘R</ContextMenuShortcut>
      //                </ContextMenuItem>
      //                <ContextMenuSub>
      //                   <ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
      //                   <ContextMenuSubContent className="w-44">
      //                      <ContextMenuItem>Save Page...</ContextMenuItem>
      //                      <ContextMenuItem>Create Shortcut...</ContextMenuItem>
      //                      <ContextMenuItem>Name Window...</ContextMenuItem>
      //                      <ContextMenuSeparator />
      //                      <ContextMenuItem>Developer Tools</ContextMenuItem>
      //                      <ContextMenuSeparator />
      //                      <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
      //                   </ContextMenuSubContent>
      //                </ContextMenuSub>
      //                <ContextMenuSeparator />
      //                <ContextMenuCheckboxItem checked>
      //                   Show Bookmarks
      //                </ContextMenuCheckboxItem>
      //                <ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>
      //                <ContextMenuSeparator />
      //                <ContextMenuRadioGroup value="pedro">
      //                   <ContextMenuLabel inset>People</ContextMenuLabel>
      //                   <ContextMenuRadioItem value="pedro">
      //                      Pedro Duarte
      //                   </ContextMenuRadioItem>
      //                   <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
      //                </ContextMenuRadioGroup>
      //             </ContextMenuContent>
      //          </ContextMenu>
      //       </div>
      //    </div>
   )
}
