'use client'

import { type LucideIcon } from 'lucide-react'

import { Collapsible, CollapsibleTrigger } from '@/components/ui/Collapsible'
import {
   SidebarGroup,
   SidebarGroupLabel,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
} from '@/components/ui/Sidebar'

export function NavMain({
                           items,
                        }: {
   items: {
      title: string
      url: string
      icon: LucideIcon
      isActive?: boolean
      items?: {
         title: string
         url: string
      }[]
   }[]
}) {
   /** Should be
    * <Collapsable>
    * <SidebarGroup>
    *    <SidebarGroupLabel asChild>
    *    <CollabsableTrigger>
    *       "Text"
    *       <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
    *    </CollapsableTrigger>
    *    <SidebarGroupLabel>
    *    <CollapsibleContent>
    *       <SidebarGroupContent>
    *     <CollapsibleContent>
    * <SidebarGroup>
    * <Collapsable>
    *    */

   return (
      {data.navMain.map((item) => (
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
               {item.title}{" "}
               <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </CollapsibleTrigger>
         </SidebarGroupLabel>
         <CollapsibleContent>
            <SidebarGroupContent>
               <SidebarMenu>
                  {item.items.map((item) => (
                     <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={item.isActive}>
                           <a href={item.url}>{item.title}</a>
                        </SidebarMenuButton>
                     </SidebarMenuItem>
                  ))}
               </SidebarMenu>
            </SidebarGroupContent>
         </CollapsibleContent>
      </SidebarGroup> <SidebarGroup>
      <SidebarGroupLabel
         asChild
         className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
      >
         <CollapsibleTrigger>
            {item.title}{" "}
            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
         </CollapsibleTrigger>
      </SidebarGroupLabel>
      <CollapsibleContent>
         <SidebarGroupContent>
            <SidebarMenu>
               {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                     <SidebarMenuButton asChild isActive={item.isActive}>
                        <a href={item.url}>{item.title}</a>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
               ))}
            </SidebarMenu>
         </SidebarGroupContent>
      </CollapsibleContent>
   </SidebarGroup>
   )
}
