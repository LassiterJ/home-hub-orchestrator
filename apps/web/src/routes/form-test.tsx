import { createFileRoute } from '@tanstack/react-router'
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
   type MenuItemSpec,
   RadioGroupState,
} from '@/components/ui/ContextMenu'
import React, { useCallback, useRef, useState } from 'react'
import { sampleContextMenu } from '@/components/features/workflow/sampleWorkflow'
import { Menu } from '@/components/features/workflow/WorkflowBuilder'

export const Route = createFileRoute('/form-test')({
   component: FormTest,
})


function FormTest() {
   const [menu, setMenu] = useState<Menu | null>(null)
   const ctxMenuRef = useRef<HTMLDivElement | null>(null)
   const defaultMenuContent: MenuItemSpec[] = sampleContextMenu

   const handleClick = useCallback(
      (event: React.MouseEvent) => {
         console.log('handleClick, event: ', event)
         console.log('handleClick, ctxMenuRef.current: ', ctxMenuRef.current)
         event.preventDefault()
         if (!ctxMenuRef.current) return
         const pane = ctxMenuRef.current.getBoundingClientRect()
         console.log('handleClick, pane: ', pane)

         setMenu({
            id: 'sampleId',
            top: 500,
            left: 500,
            right: undefined,
            bottom: undefined,
            menuContent: defaultMenuContent,
         })
      },
      [setMenu],
   )
   const { menuContent = defaultMenuContent, ...restMenu } = menu ?? {}
   // const radioGroups = {
   //    value: 'RGVal',
   //    onValueChange: (next: string) => (console.log('radioGroupValueChanged, next: ', next)),
   // }

   const radioGroups: RadioGroupState = {
      // required by your sampleContextMenu radios
      sort: {
         value: 'asc', // pick one that exists in your menu, e.g. 'asc' | 'desc'
         onValueChange: (next) => console.log('sort changed to', next),
      },
      layout: {
         value: 'grid',
         onValueChange: (next) => console.log('layout changed to', next),
      },
      theme: {
         value: 'dark',
         onValueChange: (next) => console.log('theme changed to', next),
      },
   }
   if (!menu) {
      console.log('No Menu State')
   } else {
      console.log('Menu State: ', menu)
   }
   return (
      <div ref={ctxMenuRef} className="container mx-auto py-8">
         <h1 className="text-2xl font-bold mb-6">Form Test</h1>
         {/*<Button onClick={handleClick}>Sim Right Click</Button>*/}
         <ContextMenu>
            <ContextMenuTrigger
               className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
               Right click here
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
         {/*<ExampleForm />*/}
         {/*{menu && (*/}
         {/*   <div className={'bg-amber-600 '}>*/}
         {/*      <span>TEST</span>*/}
         {/*    */}


         {/*   </div>*/}

         {/*)}*/}
      </div>
   )
}

// <ContextMenuBuilder open={!!menu} className={'bg-amber-600 '} radioGroups={radioGroups} {...restMenu}>
//    {menuContent}
// </ContextMenuBuilder>
