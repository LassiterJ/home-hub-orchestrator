import * as React from 'react'
import { BarChart3, Brain, ChevronRight, FileText, Settings, Table, Upload, Zap } from 'lucide-react'

import { SearchForm } from '@/components/shared/SearchForm'
import { VersionSwitcher } from './VersionSwitcher'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible'
import {
   Sidebar,
   SidebarContent,
   SidebarGroup,
   SidebarGroupContent,
   SidebarGroupLabel,
   SidebarHeader,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
   SidebarRail,
} from '@/components/ui/Sidebar'

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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
   return (
      <Sidebar {...props}>
         <SidebarHeader>
            <VersionSwitcher
               versions={data.versions}
               defaultVersion={data.versions[0]}
            />
            <SearchForm />
         </SidebarHeader>
         <SidebarContent className="gap-0">
            {/* We create a collapsible SidebarGroup for each parent. */}
            {data.nodesMain.map((item) => (
               <Collapsible
                  key={item.title}
                  title={item.title}
                  defaultOpen
                  className="group/collapsible"
               >
                  <SidebarGroup>
                     <SidebarGroupLabel
                        asChild
                        className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
                     >
                        <CollapsibleTrigger>
                           {item.title}{' '}
                           <ChevronRight
                              className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </CollapsibleTrigger>
                     </SidebarGroupLabel>
                     <CollapsibleContent>
                        <SidebarGroupContent>
                           <SidebarMenu>
                              {item.items.map((item) => (
                                 <SidebarMenuItem key={item.label}>
                                    <SidebarMenuButton>
                                       {item.label}
                                    </SidebarMenuButton>
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
