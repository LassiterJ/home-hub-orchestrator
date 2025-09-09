import { SearchForm } from '@/components/shared/SearchForm'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible'
import {
   Sidebar,
   SidebarContent,
   SidebarGroup,
   SidebarGroupContent,
   SidebarGroupLabel,
   SidebarHeader,
   SidebarMenu,
   SidebarMenuItem,
   SidebarRail,
} from '@/components/ui/Sidebar'
import { BarChart3, Brain, ChevronRight, FileText, Settings, Table, Text, Upload, Zap } from 'lucide-react'
import * as React from 'react'
import { useCallback } from 'react'
import { useReactFlow, XYPosition } from '@xyflow/react'
import { DraggableNode } from '@/components/features/workflow/nodes/DraggableNode'

// This is contains sample data.
const data = {
   versions: ['0.0.1'],
   nodesMain: [
      {
         title: 'Input Nodes',
         items: [
            {
               type: 'input',
               label: 'Text Input',
               icon: Text,
               description: 'Add text to workflow for cases like forms and prompts',
            },
            {
               type: 'form',
               label: 'Form Node',
               icon: FileText,
               description: 'Update the configuration at your own risk',
            },
         ],
      },
      {
         title: 'Output Nodes',
         items: [
            {
               type: 'output',
               label: 'Visualize',
               icon: BarChart3,
               description: 'Visualize results and metrics',
            },
            {
               type: 'output',
               label: 'Export',
               icon: Upload,
               description: 'Export results to various formats',
            },
            {
               type: 'output',
               label: 'Webhook',
               icon: Zap,
               description: 'Send results via webhook',
            },
         ],
      },
      {
         title: 'Model Nodes',
         items: [
            {
               type: 'model',
               label: 'Object Detection',
               icon: Brain,
               description: 'Detect objects in images',
            },
            {
               type: 'model',
               label: 'Classification',
               icon: Brain,
               description: 'Classify images or objects',
            },
            {
               type: 'model',
               label: 'Segmentation',
               icon: Brain,
               description: 'Segment objects or regions',
            },
         ],
      },
      {
         title: 'Processing Nodes',
         items: [
            {
               type: 'processing',
               label: 'Filter',
               icon: Settings,
               description: 'Filter detections by criteria',
            },
            {
               type: 'processing',
               label: 'Transform',
               icon: Zap,
               description: 'Transform image coordinates',
            },
            {
               type: 'processing',
               label: 'Augment',
               icon: Settings,
               description: 'Apply data augmentations',
            },
         ],
      },
      {
         title: 'Documentation Nodes',
         items: [
            {
               type: 'documentation',
               label: 'DatabaseSchemaNode',
               icon: Table,
               description: 'A convenient node for documenting schemas',
            },
         ],
      },
   ],
}

// -------- types --------------------------------------------------------------
type SidebarNode = {
   type: string
   label: string
   icon: React.ComponentType<{ size?: number }>
   description: string
}

// -------- helpers ------------------------------------------------------------
const getBadgeClass = (t: string) => {
   if (t === 'input') return 'bg-node-input/20 text-node-input'
   if (t === 'model') return 'bg-node-model/20 text-node-model'
   if (t === 'processing') return 'bg-node-processing/20 text-node-processing'
   if (t === 'output') return 'bg-node-output/20 text-node-output'
   return 'bg-muted text-foreground'
}
//
// // -------- draggable item (ported from NodeSidebar) ---------------------------
// const DraggableMenuItem: React.FC<{ node: SidebarNode }> = ({ node }) => {
//    // We attach the draggable ref to a DOM wrapper instead of the function component
//    // to avoid React's ref warning. The drag handle remains on the button.
//    const draggableRef = React.useRef<HTMLDivElement>(null)
//    const [position, setPosition] = useState<XYPosition>({ x: 0, y: 0 })
//    useDraggable(draggableRef, [
//       controls({ allow: ControlFrom.selector('.drag-handle') }),
//       events({
//          onDragEnd: (event) => {
//             setPosition({ x: 0, y: 0 })
//             onDrop(nodeType, {
//                x: event.clientX,
//                y: event.clientY,
//             })
//          },
//       }),
//    ])

//    return (
//       <SidebarMenuItem>
//          <SidebarMenuButton
//             className="drag-handle cursor-grab active:cursor-grabbing py-4"
//             asChild={false}
//             aria-label={`Add ${node.label}`}
//          >
//             <div ref={draggableRef} className="inline-flex align-middle items-start gap-2 w-full">
//                <div className={`${getBadgeClass(node.type)} p-1.5 rounded-md`}>
//                   <node.icon size={16} />
//                </div>
//                {/*<div className="flex-1 min-w-0 text-left">*/}
//                <div className="text-sm font-medium">{node.label}</div>
//                {/*<div className="text-xs text-muted-foreground line-clamp-2">*/}
//                {/*   {node.description}*/}
//                {/*</div>*/}
//                {/*</div>*/}
//             </div>
//          </SidebarMenuButton>
//       </SidebarMenuItem>
//    )
// }
let id = 0
const getId = () => `dndnode_${id++}` //TODO setup uuid.
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
   const { setNodes, screenToFlowPosition } = useReactFlow()

   const handleNodeDrop = useCallback(
      (nodeType: string, screenPosition: XYPosition) => {
         const flow = document.querySelector('.react-flow')
         const flowRect = flow?.getBoundingClientRect()
         const isInFlow =
            flowRect &&
            screenPosition.x >= flowRect.left &&
            screenPosition.x <= flowRect.right &&
            screenPosition.y >= flowRect.top &&
            screenPosition.y <= flowRect.bottom

         // Create a new node and add it to the flow
         if (isInFlow) {
            const position = screenToFlowPosition(screenPosition)

            const newNode = {
               id: getId(),
               type: nodeType,
               position,
               data: { label: `${nodeType} node` },
            }

            setNodes((nds) => nds.concat(newNode))
         }
      },
      [setNodes, screenToFlowPosition],
   )
   console.log('AppSidebar Props: ', props)
   return (
      <Sidebar className="top-(--header-height) h-[calc(100svh-var(--header-height))]!" {...props}>
         <SidebarHeader>
            {/*<VersionSwitcher versions={data.versions} defaultVersion={data.versions[0]} />*/}
            <SearchForm />
         </SidebarHeader>

         <SidebarContent className={'overflow-visible'}>
            {data.nodesMain.map((group) => (
               <Collapsible key={group.title} title={group.title} defaultOpen className="group/collapsible">
                  <SidebarGroup>
                     <SidebarGroupLabel
                        asChild
                        className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
                     >
                        <CollapsibleTrigger>
                           {group.title}
                           <ChevronRight
                              className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </CollapsibleTrigger>
                     </SidebarGroupLabel>

                     <CollapsibleContent>
                        <SidebarGroupContent>
                           <SidebarMenu className={'gap-3'}>
                              {group.items.map((node) => (
                                 <SidebarMenuItem key={`${node.type}-${node.label}`}
                                                  className={''}>
                                    <DraggableNode
                                       nodeType={node.type}
                                       onDrop={handleNodeDrop}
                                       className={'inline-flex align-baseline'}>
                                       <div
                                          className={`${getBadgeClass(node.type)}  p-1.5 rounded-md `}>
                                          <node.icon size={16} />
                                       </div>
                                       <div className=" p-1.5 min-w-0 text-left">
                                          <span className="text-sm font-medium">{node.label}</span>
                                          {/*<span className="text-xs text-muted-foreground line-clamp-2">*/}
                                          {/*   {node.description}*/}
                                          {/*</span>*/}
                                       </div>
                                    </DraggableNode>
                                 </SidebarMenuItem>
                              ))}
                           </SidebarMenu>
                        </SidebarGroupContent>
                     </CollapsibleContent>
                  </SidebarGroup>
               </Collapsible>
            ))}
         </SidebarContent>

         <SidebarRail />
      </Sidebar>
   )
}

// export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
//    return (
//       <Sidebar {...props}>
//          <SidebarHeader>
//             <VersionSwitcher
//                versions={data.versions}
//                defaultVersion={data.versions[0]}
//             />
//             <SearchForm />
//          </SidebarHeader>
//          <SidebarContent className="gap-0">
//             {/* We create a collapsible SidebarGroup for each parent. */}
//             {data.nodesMain.map((item) => (
//                <Collapsible
//                   key={item.title}
//                   title={item.title}
//                   defaultOpen
//                   className="group/collapsible"
//                >
//                   <SidebarGroup>
//                      <SidebarGroupLabel
//                         asChild
//                         className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
//                      >
//                         <CollapsibleTrigger>
//                            {item.title}{' '}
//                            <ChevronRight
//                               className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
//                         </CollapsibleTrigger>
//                      </SidebarGroupLabel>
//                      <CollapsibleContent>
//                         <SidebarGroupContent>
//                            <SidebarMenu>
//                               {item.items.map((item) => (
//                                  <SidebarMenuItem key={item.label}>
//                                     <SidebarMenuButton>
//                                        {item.label}
//                                     </SidebarMenuButton>
//                                  </SidebarMenuItem>
//                               ))}
//                            </SidebarMenu>
//                         </SidebarGroupContent>
//                      </CollapsibleContent>
//                   </SidebarGroup>
//                </Collapsible>
//             ))}
//          </SidebarContent>
//          <SidebarRail />
//       </Sidebar>
//    )
// }
