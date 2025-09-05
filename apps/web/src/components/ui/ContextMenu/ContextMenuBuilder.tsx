import * as React from 'react'
import {
   buildContextMenu,
   ContextMenu as RadixContextMenu,
   ContextMenuContent,
   ContextMenuTrigger,
   type MenuItemSpec,
   type RadioGroupState,
} from '@/components/ui/ContextMenu/index' // adjust if your wrapper re-exports differently

type BuilderOpts = {
   radioGroups?: RadioGroupState
   /** Optional content props passthrough */
   contentProps?: Omit<React.ComponentProps<typeof ContextMenuContent>, 'children'>
}

type ChildrenAsData =
   | MenuItemSpec[]
   | ((ctx: { defaultItems: MenuItemSpec[] }) => MenuItemSpec[])

type ContextMenuBuilderProps = BuilderOpts & {
   /** The element that opens the menu */
   trigger?: React.ReactNode
   /** optionally control rendering externally */
   open?: boolean;
   /** Default items used if children is a function */
   defaultItems?: MenuItemSpec[]
   children: ChildrenAsData
}

export const ContextMenuBuilder: React.FC<ContextMenuBuilderProps> = (props) => {
   const {
      trigger,
      children,
      radioGroups,
      defaultItems = [],
      contentProps,
      ...restProps
   } = props

   const items =
      typeof children === 'function'
         ? children({ defaultItems })
         : children

   if (!Array.isArray(items) || items.length === 0) {
      return (
         <RadixContextMenu {...restProps}>
            <ContextMenuTrigger asChild>{trigger}</ContextMenuTrigger>
            <ContextMenuContent {...contentProps} />
         </RadixContextMenu>
      )
   }

   const nodes = buildContextMenu(items, { radioGroups })

   return (
      <RadixContextMenu {...restProps}>
         <ContextMenuTrigger asChild>{trigger}</ContextMenuTrigger>
         <ContextMenuContent {...contentProps}>{nodes}</ContextMenuContent>
      </RadixContextMenu>
   )
}
