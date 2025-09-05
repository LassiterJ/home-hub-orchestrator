import * as React from 'react'
import {
   ContextMenuCheckboxItem,
   ContextMenuItem,
   ContextMenuLabel,
   ContextMenuRadioGroup,
   ContextMenuRadioItem,
   ContextMenuSeparator,
   ContextMenuShortcut,
   ContextMenuSub,
   ContextMenuSubContent,
   ContextMenuSubTrigger,
} from './ContextMenu'

/* ===== Types ===== */

type CommonContextMenuProps = {
   id: string
   disabled?: boolean
   inset?: boolean
   iconLeft?: React.ReactNode
   shortcut?: string
}

type MenuAction = CommonContextMenuProps & {
   kind: 'item'
   label: React.ReactNode
   variant?: 'default' | 'destructive'
   onSelect?: (event: Event) => void
}

type MenuCheckbox = CommonContextMenuProps & {
   kind: 'checkbox'
   label: React.ReactNode
   checked: boolean
   onCheckedChange: (checked: boolean) => void
}

type MenuRadio = CommonContextMenuProps & {
   kind: 'radio'
   label: React.ReactNode
   group: string
   value: string
}

type MenuLabel = CommonContextMenuProps & {
   kind: 'label'
   label: React.ReactNode
}

type MenuSeparator = {
   kind: 'separator'
   id: string
}

type MenuSub = CommonContextMenuProps & {
   kind: 'sub'
   label: React.ReactNode
   items: MenuItemSpec[]
}

export type MenuItemSpec =
   | MenuAction
   | MenuCheckbox
   | MenuRadio
   | MenuLabel
   | MenuSeparator
   | MenuSub

export type RadioGroupState = Record<
   string,
   { value: string; onValueChange: (next: string) => void }
>

/* ===== Validation ===== */

const collectAll = (items: MenuItemSpec[]): MenuItemSpec[] => {
   const out: MenuItemSpec[] = []
   for (const it of items) {
      out.push(it)
      if (it.kind === 'sub') out.push(...collectAll(it.items))
   }
   return out
}

const ensureUniqueIds = (items: MenuItemSpec[]) => {
   const all = collectAll(items)
   const seen = new Set<string>()
   for (const it of all) {
      if (!it.id) throw new Error('Menu item missing id')
      if (seen.has(it.id)) throw new Error(`Duplicate id: ${it.id}`)
      seen.add(it.id)
   }
}

const validateCheckboxes = (items: MenuItemSpec[]) => {
   const all = collectAll(items)
   for (const it of all) {
      if (it.kind !== 'checkbox') continue
      if (typeof it.onCheckedChange !== 'function')
         throw new Error(`Checkbox "${it.id}" missing onCheckedChange`)
   }
}

const validateRadios = (
   items: MenuItemSpec[],
   radioGroups?: RadioGroupState,
) => {
   const all = collectAll(items)
   const radios = all.filter((i): i is MenuRadio => i.kind === 'radio')
   if (radios.length === 0) return
   if (!radioGroups) throw new Error('Radio items provided but radioGroups missing')

   const perGroup = new Map<string, Set<string>>()
   for (const r of radios) {
      if (!r.group) throw new Error(`Radio "${r.id}" missing group`)
      if (!r.value) throw new Error(`Radio "${r.id}" missing value`)
      if (!radioGroups[r.group])
         throw new Error(`No state config for radio group "${r.group}"`)
      const values = perGroup.get(r.group) ?? new Set<string>()
      if (values.has(r.value))
         throw new Error(`Duplicate radio value "${r.value}" in "${r.group}"`)
      values.add(r.value)
      perGroup.set(r.group, values)
   }
}

/* ===== Render ===== */

type BuildOpts = {
   radioGroups?: RadioGroupState
}

const renderLeaf = (it: Exclude<MenuItemSpec, MenuSub>): React.ReactNode => {
   if (it.kind === 'item')
      return (
         <ContextMenuItem
            key={it.id}
            disabled={it.disabled}
            inset={it.inset}
            data-id={it.id}
            variant={it.variant ?? 'default'}
            onSelect={it.onSelect}
         >
            {it.iconLeft}
            {it.label}
            {it.shortcut ? <ContextMenuShortcut>{it.shortcut}</ContextMenuShortcut> : null}
         </ContextMenuItem>
      )

   if (it.kind === 'checkbox')
      return (
         <ContextMenuCheckboxItem
            key={it.id}
            disabled={it.disabled}
            checked={it.checked}
            onCheckedChange={it.onCheckedChange}
            data-id={it.id}
         >
            {it.iconLeft}
            {it.label}
            {it.shortcut ? <ContextMenuShortcut>{it.shortcut}</ContextMenuShortcut> : null}
         </ContextMenuCheckboxItem>
      )

   if (it.kind === 'radio')
      return (
         <ContextMenuRadioItem
            key={it.id}
            value={it.value}
            disabled={it.disabled}
            data-id={it.id}
         >
            {it.iconLeft}
            {it.label}
            {it.shortcut ? <ContextMenuShortcut>{it.shortcut}</ContextMenuShortcut> : null}
         </ContextMenuRadioItem>
      )

   if (it.kind === 'label')
      return (
         <ContextMenuLabel
            key={it.id}
            inset={it.inset}
            data-id={it.id}
         >
            {it.label}
         </ContextMenuLabel>
      )

   return <ContextMenuSeparator key={it.id} data-id={it.id} />
}

const groupRadiosForRender = (
   items: MenuItemSpec[],
   radioGroups?: RadioGroupState,
): React.ReactNode[] => {
   const flatItems: Exclude<MenuItemSpec, MenuSub>[] = items.filter(
      (i): i is Exclude<MenuItemSpec, MenuSub> => i.kind !== 'sub',
   )
   const out: React.ReactNode[] = []
   const processedGroups = new Set<string>()

   // Render in original order. When a radio is seen, render its full group once.
   for (const it of flatItems) {
      if (it.kind !== 'radio') {
         out.push(renderLeaf(it))
         continue
      }
      if (processedGroups.has(it.group)) continue
      processedGroups.add(it.group)

      const groupItems = flatItems.filter(
         (x): x is MenuRadio => x.kind === 'radio' && x.group === it.group,
      )
      const state = radioGroups?.[it.group]
      if (!state) throw new Error(`Missing radioGroups state for "${it.group}"`)

      out.push(
         <ContextMenuRadioGroup
            key={`group:${it.group}`}
            value={state.value}
            onValueChange={state.onValueChange}
            data-group={it.group}
         >
            {groupItems.map(renderLeaf)}
         </ContextMenuRadioGroup>,
      )
   }

   return out
}

const renderItemsFlat = (
   items: MenuItemSpec[],
   opts: BuildOpts,
): React.ReactNode[] => {
   const hasRadios = items.some((x) => x.kind === 'radio')
   if (!hasRadios) return items.map((x) => (x.kind === 'sub' ? null : renderLeaf(x as Exclude<MenuItemSpec, MenuSub>))).filter(Boolean) as React.ReactNode[]
   return groupRadiosForRender(items, opts.radioGroups)
}

const renderSub = (sub: MenuSub, opts: BuildOpts): React.ReactNode => {
   const children = buildContextMenu(sub.items, opts)
   return (
      <ContextMenuSub key={sub.id}>
         <ContextMenuSubTrigger
            inset={sub.inset}
            disabled={sub.disabled}
            data-id={sub.id}
         >
            {sub.iconLeft}
            {sub.label}
            {sub.shortcut ? <ContextMenuShortcut>{sub.shortcut}</ContextMenuShortcut> : null}
         </ContextMenuSubTrigger>
         <ContextMenuSubContent>{children}</ContextMenuSubContent>
      </ContextMenuSub>
   )
}

export const buildContextMenu = (
   items: MenuItemSpec[],
   opts: BuildOpts = {},
): React.ReactNode[] => {
   ensureUniqueIds(items)
   validateCheckboxes(items)
   validateRadios(items, opts.radioGroups)

   const out: React.ReactNode[] = []
   for (const it of items) {
      if (it.kind === 'sub') {
         out.push(renderSub(it, opts))
         continue
      }
      out.push(...renderItemsFlat([it], opts))
   }
   return out
}
