'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  axis,
  bounds,
  BoundsFrom,
  ControlFrom,
  controls,
  events,
  threshold,
  touchAction,
  useDraggable,
} from '@neodrag/react'
import { Node, NodeProps, NodeToolbar } from '@xyflow/react'
import { GripVertical } from 'lucide-react'
import { memo, useMemo, useRef, useState } from 'react'

/**
 * ReorderDemoNode
 *
 * A minimal RF node that renders a list of rows which can be re-ordered using NeoDrag v3.
 * - Midpoint hit-testing to determine drop target
 * - Animated gap (placeholder effect) by applying translateY to siblings during drag
 * - Uses shadcn/ui components (Label, Input, Button) where appropriate
 * - No workflow coupling; purely local state inside node
 */

type Item = { id: string; label: string }
export type ReorderDemoNodeType = Node<{ items: Item[] }, 'list'>

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const copy = arr.slice()
  const [it] = copy.splice(from, 1)
  copy.splice(to, 0, it)
  return copy
}

export const ReorderDemoNode = memo(({ data }: NodeProps<ReorderDemoNodeType>) => {
  const [items, setItems] = useState<Item[]>(() => data.items ?? [
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Bravo' },
    { id: 'c', label: 'Charlie' },
  ])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const listRef = useRef<HTMLUListElement>(null)

  return (
    <div className="min-w-[300px] rounded-md border bg-background">
      <NodeToolbar isVisible>
        <span className="text-xs text-muted-foreground">Reorder demo</span>
      </NodeToolbar>

      <div className="p-3">
        <ul ref={listRef} className="space-y-2 nodrag nopan nowheel">
          {items.map((item, index) => (
            <Row
              key={item.id}
              index={index}
              listRef={listRef}
              label={item.label}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              onCommit={(from, to) => setItems(arr => arrayMove(arr, from, to))}
            />
          ))}
        </ul>

        <div className="mt-3 flex items-center gap-2">
          <Button size="sm" onClick={() => setItems(prev => [...prev, {
            id: crypto.randomUUID(),
            label: `Item ${prev.length + 1}`,
          }])}>Add</Button>
        </div>
      </div>
    </div>
  )
})

function Row({
  index,
  listRef,
  label,
  activeIndex,
  setActiveIndex,
  onCommit,
}: {
  index: number
  listRef: React.RefObject<HTMLUListElement>
  label: string
  activeIndex: number | null
  setActiveIndex: (i: number | null) => void
  onCommit: (from: number, to: number) => void
}) {
  const ref = useRef<HTMLLIElement>(null)
  const startIndexRef = useRef(index)
  const startTopRef = useRef(0)
  const heightRef = useRef(0)

  // Compute target index using midpoint hit-testing across siblings
  const computeTargetIndex = (): number => {
    const current = ref.current
    const parent = listRef.current
    if (!current || !parent) return index
    const rect = current.getBoundingClientRect()
    const centerY = rect.top + rect.height / 2
    const items = Array.from(parent.querySelectorAll<HTMLLIElement>('li[data-row]'))
    const mids = items.map(el => {
      const r = el.getBoundingClientRect()
      return (r.top + r.bottom) / 2
    })
    let to = mids.findIndex(mid => centerY < mid)
    if (to === -1) to = mids.length - 1
    return to
  }

  // Animate siblings to create a gap for placeholder effect
  const applyGapAnimation = (dragIndex: number) => {
    const parent = listRef.current
    if (!parent) return
    const items = Array.from(parent.querySelectorAll<HTMLLIElement>('li[data-row]'))
    const to = computeTargetIndex()
    items.forEach((el, i) => {
      el.style.transition = 'transform 140ms ease'
      el.style.transform = ''
      if (i === dragIndex) return
      if (dragIndex < i && i <= to) {
        el.style.transform = 'translateY(-8px)'
      } else if (to <= i && i < dragIndex) {
        el.style.transform = 'translateY(8px)'
      }
    })
  }

  const clearGapAnimation = () => {
    const parent = listRef.current
    if (!parent) return
    const items = Array.from(parent.querySelectorAll<HTMLLIElement>('li[data-row]'))
    items.forEach(el => {
      el.style.transform = ''
    })
  }

  useDraggable(ref, useMemo(() => [
    axis('y'),
    bounds(BoundsFrom.parent()),
    controls({ allow: ControlFrom.selector('[data-drag-handle]') }),
    threshold({ distance: 3 }),
    touchAction('none'),
    events({
      onDragStart: () => {
        startIndexRef.current = index
        const r = ref.current?.getBoundingClientRect()
        startTopRef.current = r?.top ?? 0
        heightRef.current = r?.height ?? 0
        setActiveIndex(index)
      },
      onDrag: () => {
        applyGapAnimation(startIndexRef.current)
      },
      onDragEnd: () => {
        clearGapAnimation()
        const to = computeTargetIndex()
        ref.current && (ref.current.style.transform = '')
        setActiveIndex(null)
        if (to !== startIndexRef.current) onCommit(startIndexRef.current, to)
      },
    }),
  ], [index]))

  return (
    <li ref={ref} data-row
      className={`relative flex items-center gap-2 rounded-md border bg-muted/30 p-2 nodrag nopan nowheel ${activeIndex === index ? 'ring-1 ring-primary/50' : ''}`}>
      <div className="flex items-center select-none cursor-grab" data-drag-handle>
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <Label className="mb-1 block">Label</Label>
        <Input value={label} readOnly />
      </div>
    </li>
  )
}


