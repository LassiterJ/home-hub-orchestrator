import React, { useRef } from 'react'
import {
   Sidebar,
   SidebarContent,
   SidebarGroup,
   SidebarGroupAction,
   SidebarGroupContent,
   SidebarGroupLabel,
   SidebarHeader,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
} from '@/components/ui/Sidebar'
import { Input } from '@/components/ui/Input'
import { BarChart3, Brain, FileText, Settings, Table, Text, Upload, Zap } from 'lucide-react'
import { ControlFrom, controls, events, useDraggable } from '@neodrag/react'

const nodeCategories = [
   {
      title: 'Input',
      nodes: [
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

type SidebarNode = {
   type: string
   label: string
   icon: React.ComponentType<{ size?: number }>
   description: string
}


function matchQuery(node: SidebarNode, q: string) {
   if (!q) return true
   const s = q.toLowerCase()
   return node.label.toLowerCase().includes(s) || node.description.toLowerCase().includes(s) || node.type.toLowerCase().includes(s)
}

function DraggableMenuItem({ node }: { node: SidebarNode }) {
   const ref = useRef<HTMLButtonElement>(null)

   useDraggable(ref, [
      controls({ allow: ControlFrom.selector('.drag-handle') }),
      events({
         onDragEnd: () => {
            const el = ref.current
            if (!el) return
            const rect = el.getBoundingClientRect()
            const clientX = rect.left + rect.width / 2
            const clientY = rect.top + rect.height / 2
            window.dispatchEvent(
               new CustomEvent('sidebar-node-drop', {
                  detail: {
                     type: node.type,
                     clientX,
                     clientY,
                     payload: { label: node.label, description: node.description },
                  },
               }),
            )
         },
      }),
   ])

   const ColorWrap = ({ children }: { children: React.ReactNode }) => (
      <div
         className={
            node.type === 'input' ? 'bg-node-input/20 text-node-input p-1.5 rounded-md'
               : node.type === 'model' ? 'bg-node-model/20 text-node-model p-1.5 rounded-md'
                  : node.type === 'processing' ? 'bg-node-processing/20 text-node-processing p-1.5 rounded-md'
                     : 'bg-node-output/20 text-node-output p-1.5 rounded-md'
         }
      >{children}</div>
   )

   return (
      <SidebarMenuItem>
         <SidebarMenuButton
            ref={ref}
            className="drag-handle cursor-grab active:cursor-grabbing py-2"
            asChild={false}
            aria-label={`Add ${node.label}`}
            onKeyDown={(e) => {
               if (e.key === 'Enter' || e.key === ' ') {
                  window.dispatchEvent(new CustomEvent('sidebar-node-activate', {
                     detail: { type: node.type, payload: { label: node.label, description: node.description } },
                  }))
               }
            }}
         >
            <div className="flex items-start gap-3 w-full">
               <ColorWrap>
                  <node.icon size={16} />
               </ColorWrap>
               <div className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-medium">{node.label}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{node.description}</div>
               </div>
            </div>
         </SidebarMenuButton>
      </SidebarMenuItem>
   )
}

const NodeSidebar = () => {
   const [query, setQuery] = React.useState('')
   const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({})

   return (
      <Sidebar>
         <SidebarHeader>
            <div className="px-3 py-2 space-y-2">
               <div className="text-base font-semibold">Workflow Builder</div>
               <div className="text-xs text-muted-foreground">Drag blocks to build your workflow</div>
               <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search blocks…"
                  className="h-8"
                  aria-label="Search blocks"
               />
            </div>
         </SidebarHeader>
         <SidebarContent>
            {nodeCategories.map((category) => (
               <SidebarGroup key={category.title}>
                  <SidebarGroupLabel>{category.title}</SidebarGroupLabel>
                  <SidebarGroupAction asChild>
                     <button
                        type="button"
                        aria-label={collapsed[category.title] ? 'Expand group' : 'Collapse group'}
                        onClick={() => setCollapsed((m) => ({ ...m, [category.title]: !m[category.title] }))}
                     >
                        {collapsed[category.title] ? '+' : '–'}
                     </button>
                  </SidebarGroupAction>
                  <SidebarGroupContent>
                     {!collapsed[category.title] && (
                        <SidebarMenu>
                           {category.nodes.filter((n) => matchQuery(n as SidebarNode, query)).map((node, idx) => (
                              <DraggableMenuItem key={`${node.type}-${idx}`} node={node as SidebarNode} />
                           ))}
                        </SidebarMenu>
                     )}
                  </SidebarGroupContent>
               </SidebarGroup>
            ))}
         </SidebarContent>
      </Sidebar>
   )
}

export default NodeSidebar
