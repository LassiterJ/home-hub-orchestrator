import { NodeStatusIndicator, NodeStatusIndicatorProps } from '@/components/features/workflow/NodeStatusIndicator'
import { cn } from '@/utils/utils'
import { forwardRef, type HTMLAttributes } from 'react'
import { NodeResizer, NodeToolbar, type Position } from '@xyflow/react'
import {
   Menubar,
   MenubarCheckboxItem,
   MenubarContent,
   MenubarItem,
   MenubarMenu,
   MenubarRadioGroup,
   MenubarRadioItem,
   MenubarSeparator,
   MenubarShortcut,
   MenubarSub,
   MenubarSubContent,
   MenubarSubTrigger,
   MenubarTrigger,
} from '@/components/ui/Menubar'


export type BaseNodeProps = HTMLAttributes<HTMLDivElement> & {
   status?: NodeStatusIndicatorProps['status']
   statusIndicatorVariant?: NodeStatusIndicatorProps['variant']
   forceToolbarVisible?: boolean,
   toolbarPosition?: Position,
   resizeable?: boolean,
   selected?: boolean,
   nodeResizeColor?: string

}

export const BaseNode = forwardRef<
   HTMLDivElement,
   BaseNodeProps
>(({
      className,
      status = 'initial',
      statusIndicatorVariant,
      forceToolbarVisible,
      toolbarPosition,
      resizeable = true,
      selected = false,
      nodeResizeColor,
      ...props
   }, ref) => (
   <>
      {resizeable &&
         <NodeResizer
            color={nodeResizeColor || '#ff0071'}
            isVisible={selected} //TODO: use state from Toolbar's resize button
            minWidth={100}
            minHeight={30}
         />}

      <NodeToolbar
         isVisible={forceToolbarVisible || undefined}
         position={toolbarPosition}
      >
         <Menubar>
            <MenubarMenu>
               <MenubarTrigger>File</MenubarTrigger>
               <MenubarContent>
                  <MenubarItem>
                     New Tab <MenubarShortcut>⌘T</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem>
                     New Window <MenubarShortcut>⌘N</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem disabled>New Incognito Window</MenubarItem>
                  <MenubarSeparator />
                  <MenubarSub>
                     <MenubarSubTrigger>Share</MenubarSubTrigger>
                     <MenubarSubContent>
                        <MenubarItem>Email link</MenubarItem>
                        <MenubarItem>Messages</MenubarItem>
                        <MenubarItem>Notes</MenubarItem>
                     </MenubarSubContent>
                  </MenubarSub>
                  <MenubarSeparator />
                  <MenubarItem>
                     Print... <MenubarShortcut>⌘P</MenubarShortcut>
                  </MenubarItem>
               </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
               <MenubarTrigger>Edit</MenubarTrigger>
               <MenubarContent>
                  <MenubarItem>
                     Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem>
                     Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarSub>
                     <MenubarSubTrigger>Find</MenubarSubTrigger>
                     <MenubarSubContent>
                        <MenubarItem>Search the web</MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem>Find...</MenubarItem>
                        <MenubarItem>Find Next</MenubarItem>
                        <MenubarItem>Find Previous</MenubarItem>
                     </MenubarSubContent>
                  </MenubarSub>
                  <MenubarSeparator />
                  <MenubarItem>Cut</MenubarItem>
                  <MenubarItem>Copy</MenubarItem>
                  <MenubarItem>Paste</MenubarItem>
               </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
               <MenubarTrigger>View</MenubarTrigger>
               <MenubarContent>
                  <MenubarCheckboxItem>Always Show Bookmarks Bar</MenubarCheckboxItem>
                  <MenubarCheckboxItem checked>
                     Always Show Full URLs
                  </MenubarCheckboxItem>
                  <MenubarSeparator />
                  <MenubarItem inset>
                     Reload <MenubarShortcut>⌘R</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem disabled inset>
                     Force Reload <MenubarShortcut>⇧⌘R</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem inset>Toggle Fullscreen</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem inset>Hide Sidebar</MenubarItem>
               </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
               <MenubarTrigger>Profiles</MenubarTrigger>
               <MenubarContent>
                  <MenubarRadioGroup value="benoit">
                     <MenubarRadioItem value="andy">Andy</MenubarRadioItem>
                     <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
                     <MenubarRadioItem value="Luis">Luis</MenubarRadioItem>
                  </MenubarRadioGroup>
                  <MenubarSeparator />
                  <MenubarItem inset>Edit...</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem inset>Add Profile...</MenubarItem>
               </MenubarContent>
            </MenubarMenu>
         </Menubar>
      </NodeToolbar>

      <NodeStatusIndicator status={status} variant={statusIndicatorVariant}>
         <div
            ref={ref}
            className={cn(
               'relative rounded-md border bg-card text-card-foreground',
               'hover:ring-1',
               // React Flow displays node elements inside a `NodeWrapper` component,
               // which compiles down to a div with the class `react-flow__node`.
               // When a node is selected, the class `selected` is added to the
               // `react-flow__node` element. This allows us to style the node when it
               // is selected, using Tailwind's `&` selector.
               '[.react-flow\\_\\_node.selected_&]:border-muted-foreground',
               '[.react-flow\\_\\_node.selected_&]:shadow-lg',
               className,
            )}
            tabIndex={0}
            {...props}
         />
      </NodeStatusIndicator>
   </>
))
BaseNode.displayName = 'BaseNode'

/**
 * A container for a consistent header layout intended to be used inside the
 * `<BaseNode />` component.
 */
export const BaseNodeHeader = forwardRef<
   HTMLElement,
   HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
   <header
      ref={ref}
      {...props}
      className={cn(
         'mx-0 my-0 -mb-1 flex flex-row items-center justify-between gap-2 px-3 py-2',
         // Remove or modify these classes if you modify the padding in the
         // `<BaseNode />` component.
         className,
      )}
   />
))
BaseNodeHeader.displayName = 'BaseNodeHeader'

/**
 * The title text for the node. To maintain a native application feel, the title
 * text is not selectable.
 */
export const BaseNodeHeaderTitle = forwardRef<
   HTMLHeadingElement,
   HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
   <h3
      ref={ref}
      data-slot="base-node-title"
      className={cn('user-select-none flex-1 font-semibold', className)}
      {...props}
   />
))
BaseNodeHeaderTitle.displayName = 'BaseNodeHeaderTitle'

export const BaseNodeContent = forwardRef<
   HTMLDivElement,
   HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
   <div
      ref={ref}
      data-slot="base-node-content"
      className={cn('flex flex-col gap-y-2 p-3', className)}
      {...props}
   />
))
BaseNodeContent.displayName = 'BaseNodeContent'

export const BaseNodeFooter = forwardRef<
   HTMLDivElement,
   HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
   <div
      ref={ref}
      data-slot="base-node-footer"
      className={cn(
         'flex flex-col items-center gap-y-2 border-t px-3 pb-3 pt-2',
         className,
      )}
      {...props}
   />
))
BaseNodeFooter.displayName = 'BaseNodeFooter'
