import {
   addEdge,
   Background,
   BackgroundVariant,
   Connection,
   Controls,
   MiniMap,
   NodeTypes,
   ReactFlow,
   ReactFlowProvider,
   useEdgesState,
   useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import React, { useCallback } from 'react'

import { AppSidebar } from '@/components/features/workflow/AppSidebar'
import DatabaseSchemaDemo from '@/components/features/workflow/nodes/documentation/DatabaseSchemaNode'
import { SiteHeader } from '@/components/shared/PageHeader'
import { MenuItemSpec } from '@/components/ui/ContextMenu'
import { SidebarInset, SidebarProvider } from '@/components/ui/Sidebar'
import { FormNode, ModelNode, OutputNode, ProcessingNode } from './nodes'
import { TextInputNode } from './nodes/form/TextInputNode'
import { sampleEdges, sampleNodes } from '@/components/features/workflow/sampleWorkflow'
import { Input } from '@/components/ui/Input'

export const nodeTypes: NodeTypes = {
   input: TextInputNode,
   model: ModelNode,
   processing: ProcessingNode,
   output: OutputNode,
   schema: DatabaseSchemaDemo,
   form: FormNode,
}
export const formNodeFormControlMap = {
   input: Input,
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
   // const [nodes, setNodes, onNodesChange] = useNodesState(sampleNodes)
   // const [edges, setEdges, onEdgesChange] = useEdgesState(sampleEdges)
   // const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
   // const ref = useRef<HTMLDivElement>(null)
   // const [menu, setMenu] = useState<Menu | null>(null)
   // const defaultMenuContent: MenuItemSpec[] = sampleContextMenu
   // const onConnect = useCallback(
   //    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
   //    [setEdges],
   // )
   //
   // const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
   //    event.preventDefault()
   //    event.dataTransfer.dropEffect = 'move'
   // }, [])
   //
   // const onDrop = useCallback(
   //    (event: React.DragEvent<HTMLDivElement>) => {
   //       event.preventDefault()
   //
   //       if (!reactFlowInstance) return
   //
   //       const type = event.dataTransfer.getData('application/reactflow')
   //       if (!type) return
   //
   //       const position = reactFlowInstance.screenToFlowPosition({
   //          x: event.clientX,
   //          y: event.clientY,
   //       })
   //       // TODO: Use GUID for Id (or in addition to) `${type}-${subType}-${Date.now()}-${GenRandomGUID()}`
   //       // `node-input-12931238917-123987123981723
   //       const newNode: Node<NodeData> = {
   //          id: `${type}-${Date.now()}`,
   //          type,
   //          position,
   //          data: {
   //             label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
   //             description: `A ${type} node for your workflow`,
   //          },
   //       }
   //
   //       setNodes((nds) => nds.concat(newNode))
   //    },
   //    [reactFlowInstance, setNodes],
   // )
   // // const onPaneClick = useCallback(() => setMenu(null), [setMenu])
   // const onNodeContextMenu = useCallback(
   //    (event: React.MouseEvent, node: Node<NodeData>) => {
   //       event.preventDefault()
   //       if (!ref.current) return
   //       const pane = ref.current.getBoundingClientRect()
   //       setMenu({
   //          id: node.id,
   //          top: event.clientY < pane.height - 200 ? event.clientY : undefined,
   //          left: event.clientX < pane.width - 200 ? event.clientX : undefined,
   //          right: event.clientX >= pane.width - 200 ? pane.width - event.clientX : undefined,
   //          bottom: event.clientY >= pane.height - 200 ? pane.height - event.clientY : undefined,
   //          menuContent: defaultMenuContent,
   //       })
   //    },
   //    [setMenu],
   // )
   // // const { menuContent = defaultMenuContent } = menu ?? {}
   //
   // /**
   //  * Wire NeoDrag-based sidebar events to React Flow node creation.
   //  *
   //  * We listen for two custom events dispatched by the sidebar:
   //  * - `sidebar-node-drop`: fired after a drag ends; contains screen coords (clientX/Y)
   //  * - `sidebar-node-activate`: keyboard activation to add a node at flow center
   //  *
   //  * Rationale:
   //  * NeoDrag does not use the HTML5 DataTransfer API, so React Flow's onDrop handler
   //  * won't receive the usual `dataTransfer` payload. Instead, we translate screen
   //  * coordinates to flow coordinates with `screenToFlowPosition` via the instance.
   //  */
   // useEffect(() => {
   //    if (!reactFlowInstance) return
   //
   //    type SidebarDropDetail = {
   //       type: string
   //       clientX: number
   //       clientY: number
   //       payload?: { label?: string; description?: string }
   //    }
   //
   //    type SidebarActivateDetail = {
   //       type: string
   //       payload?: { label?: string; description?: string }
   //    }
   //
   //    const getFlowRect = () => {
   //       const el = document.querySelector('.react-flow') as HTMLElement | null
   //       return el?.getBoundingClientRect()
   //    }
   //
   //    const handleSidebarDrop = (ev: Event) => {
   //       const e = ev as CustomEvent<SidebarDropDetail>
   //       const rect = getFlowRect()
   //       if (!rect) return
   //
   //       const inside =
   //          e.detail.clientX >= rect.left &&
   //          e.detail.clientX <= rect.right &&
   //          e.detail.clientY >= rect.top &&
   //          e.detail.clientY <= rect.bottom
   //       if (!inside) return
   //
   //       const position = reactFlowInstance.screenToFlowPosition({
   //          x: e.detail.clientX,
   //          y: e.detail.clientY,
   //       })
   //
   //       const newNode: Node<NodeData> = {
   //          id: `${e.detail.type}-${Date.now()}`,
   //          type: e.detail.type,
   //          position,
   //          data: {
   //             label:
   //                e.detail.payload?.label ??
   //                `${e.detail.type.charAt(0).toUpperCase() + e.detail.type.slice(1)} Node`,
   //             description:
   //                e.detail.payload?.description ?? `A ${e.detail.type} node for your workflow`,
   //          },
   //       }
   //
   //       setNodes((nds) => nds.concat(newNode))
   //    }
   //
   //    const handleSidebarActivate = (ev: Event) => {
   //       const e = ev as CustomEvent<SidebarActivateDetail>
   //       const rect = getFlowRect()
   //       if (!rect) return
   //
   //       const position = reactFlowInstance.screenToFlowPosition({
   //          x: rect.left + rect.width / 2,
   //          y: rect.top + rect.height / 2,
   //       })
   //
   //       const newNode: Node<NodeData> = {
   //          id: `${e.detail.type}-${Date.now()}`,
   //          type: e.detail.type,
   //          position,
   //          data: {
   //             label:
   //                e.detail.payload?.label ??
   //                `${e.detail.type.charAt(0).toUpperCase() + e.detail.type.slice(1)} Node`,
   //             description:
   //                e.detail.payload?.description ?? `A ${e.detail.type} node for your workflow`,
   //          },
   //       }
   //
   //       setNodes((nds) => nds.concat(newNode))
   //    }
   //
   //    window.addEventListener('sidebar-node-drop', handleSidebarDrop as EventListener, false)
   //    window.addEventListener('sidebar-node-activate', handleSidebarActivate as EventListener, false)
   //
   //    return () => {
   //       window.removeEventListener('sidebar-node-drop', handleSidebarDrop as EventListener, false)
   //       window.removeEventListener('sidebar-node-activate', handleSidebarActivate as EventListener, false)
   //    }
   // }, [reactFlowInstance, setNodes])
   // /** Use this to trigger the context menu without wrapping the ReactFlow component:
   //  * https://github.com/xyflow/xyflow/discussions/3089
   //  *
   //  * const triggerRightClick = (
   //  *     element: HTMLSpanElement,
   //  *     { position }: { position: XYPosition }
   //  * ) => {
   //  *     const event = new MouseEvent('contextmenu', {
   //  *         bubbles: true,
   //  *         cancelable: true,
   //  *         clientX: position.x,
   //  *         clientY: position.y,
   //  *     });
   //  *     element.dispatchEvent(event);
   //  * };
   //  *
   //  * Usage:
   //  *  triggerRightClick(ref.current, {
   //  *                     position: contextMenu.position,
   //  *                 });
   //  * */
   const [nodes, _, onNodesChange] = useNodesState(sampleNodes)
   const [edges, setEdges, onEdgesChange] = useEdgesState(sampleEdges)

   const onConnect = useCallback(
      (params: Connection) => setEdges((eds) => addEdge(params, eds)),
      [],
   )

   return (
      // React Flow requires its parent to have an explicit width and height.
      // We set the overall layout to a fixed viewport height to avoid 0-height
      // calculations during initial mount which would trigger React Flow error 004.
      <div className="[--header-height:calc(--spacing(14))]">
         <ReactFlowProvider>

            <SidebarProvider className="flex flex-col">
               <SiteHeader />
               <div className="flex flex-1">
                  <AppSidebar />
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
      //                      <Controls className="!bottom-4 !left-4" />
      //                      <MiniMap
      //                         className="!bottom-4 !right-4 !w-48 !h-32 border border-border rounded-lg shadow-lg"
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
