---
title: 'Neodrag v3 + React Flow Integration (XYFlow 12.8.4)'
tagline: 'Accurate types, props, and patterns for our RF setup'
---

> References: [Neodrag React Docs](https://next.neodrag.dev/docs/react), XYFlow React dists in `@xyflow/react@12.8.4`.

## Goals

- Make NeoDrag-driven interactions coexist safely with React Flow's own dragging, selection, and panning.
- Prevent conflicts between pane panning and node dragging.
- Respect RF props: `nodesDraggable`, `selectNodesOnDrag`, `nodeDragThreshold`, `noDragClassName`, `noWheelClassName`, `noPanClassName`, `panOnDrag`, `zoomOnScroll`, etc.

## Key RF Types/Props (from dist)

React Flow props that affect drag/pan/selection (see `esm/types/component-props.d.ts`):

- `nodesDraggable?: boolean` (default true)
- `selectNodesOnDrag?: boolean` (default true)
- `nodeDragThreshold?: number` (default 1)
- `noDragClassName?: string` (default `"nodrag"`)
- `noWheelClassName?: string` (default `"nowheel"`)
- `noPanClassName?: string` (default `"nopan"`)
- `panOnDrag?: boolean | number[]` (default true)
- `zoomOnScroll?: boolean` (default true)
- `zoomOnDoubleClick?: boolean` (default true)
- `panOnScroll?: boolean` (default false)

Node props (`esm/types/nodes.d.ts` → `NodePropsBase`):

- The internal node wrapper uses a `handleSelector` from `node.dragHandle` and the `useDrag` hook behind the scenes.
- RF will pass DOM attributes to the outer node wrapper; avoid spreading `NodeProps` onto inner DOM elements to prevent invalid props leaking.

RF `useDrag` (`esm/hooks/useDrag.d.ts`):

```ts
useDrag({
  nodeRef,
  disabled,
  noDragClassName,
  handleSelector,
  nodeId,
  isSelectable,
  nodeClickDistance,
}): boolean
```

## Conflict Matrix: NeoDrag vs RF

When a component inside a node becomes NeoDrag-draggable, coordinate with RF:

- Prevent RF from interpreting the same pointer stream as node drag or pane pan.
- Use CSS classes to stop propagation-based panning: add `nopan` and `nowheel` when needed.
- Use `controls({ allow: ControlFrom.selector('[data-drag-handle]') })` in NeoDrag, and add `data-drag-handle` to the handle element. This mirrors RF’s `dragHandle` semantic without touching RF config.

Recommendations:

1) Inside node UIs that use NeoDrag (lists, resize handles):
   - Add `class="nodrag nopan nowheel"` on inner draggable region to prevent RF node/pane capture.
   - In NeoDrag, add `touchAction('none')` and optionally `scrollLock({ lockAxis: 'both' })` for mobile.

2) For node header drag (moving the node itself): Prefer RF-native drag:
   - Use RF `dragHandle` at node level if you need a specific handle zone.
   - Do not use NeoDrag to move RF nodes; instead call RF instance methods (`updateNode`, `setNodes`), or let RF manage node drag entirely.

3) For palette → canvas drags: Use NeoDrag on palette items and on drop call RF `addNodes` with computed coordinates from viewport helpers.

## Patterns

### A) NeoDrag inside a Node (no node move)

Goal: Make an inner element draggable without moving the RF node or panning the canvas.

```tsx
import { memo, useRef } from 'react';
import { NodeProps } from '@xyflow/react';
import { useDraggable, axis, bounds, BoundsFrom, controls, ControlFrom, events, touchAction, scrollLock } from '@neodrag/react';

type MyNode = Parameters<NodeProps>[0];

export default memo(function SortableListNode(props: NodeProps<MyNode>) {
  const rowRef = useRef<HTMLDivElement>(null);

  useDraggable(rowRef, [
    axis('y'),
    bounds(BoundsFrom.parent()),
    controls({ allow: ControlFrom.selector('[data-drag-handle]') }),
    touchAction('none'),
    scrollLock({ lockAxis: 'both', allowScrollbar: false }),
    events({ onDragEnd: ({ currentNode }) => { if (currentNode instanceof HTMLElement) currentNode.style.transform = ''; } }),
  ]);

  return (
    <div className="node-shell">
      <div ref={rowRef} className="nodrag nopan nowheel">
        <span data-drag-handle>⋮⋮</span>
        {/* row contents */}
      </div>
    </div>
  );
});
```

Notes:

- `nodrag` stops RF from starting node drag when clicking the inner element.
- `nopan` stops pane panning.
- `nowheel` stops zoom-on-wheel.

### B) Palette item → drop on React Flow canvas

Goal: Drag from a sidebar and place a node at drop using RF viewport helpers.

```tsx
import { useRef } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useDraggable, events } from '@neodrag/react';

export function PaletteItem({ type, data }: { type: string; data?: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const rf = useReactFlow();

  useDraggable(ref, [
    events({
      onDragEnd: ({ event }) => {
        // Use RF viewport helpers for robust conversion
        const pos = rf.screenToFlowPosition({ x: event.clientX, y: event.clientY });
        rf.addNodes({ id: crypto.randomUUID(), type, data, position: pos });
      },
    }),
  ]);

  return <div ref={ref} className="nowheel nopan">{type}</div>;
}
```

Tip: If using a ghost preview, render it within RF overlay and update on `events.onDrag`.

### C) Respect RF node drag with a header handle

If you need to restrict RF node dragging to a header area, use RF’s `dragHandle` (node-level option) instead of NeoDrag:

- Set `node.dragHandle = '[data-node-drag-handle]'` in node definition (when you create the node object).
- In your node component, mark the header with `data-node-drag-handle`.

This lets RF `useDrag` consume events and keeps selection/threshold logic consistent with `nodeDragThreshold`.

### D) Preventing accidental drags

- RF has `nodeDragThreshold` (default 1px). Keep it at least 1 to differentiate click vs drag.
- For inner NeoDrag items, add NeoDrag `threshold({ distance: 3 })` or `threshold({ delay: 120 })` for safer UX.

## Event Interop

- RF node events: `onNodeDragStart`, `onNodeDrag`, `onNodeDragStop` receive `(event, node, nodes)`
- NeoDrag events: `events({ onDragStart, onDrag, onDragEnd })` receive `{ offset, rootNode, currentNode, event }`

Guideline: Avoid mixing RF node movement with NeoDrag transforms. If NeoDrag changes transforms of elements inside the node, clear them in `onDragEnd`.

## Mobile/Touch

- Use NeoDrag `touchAction('none')` on inner draggables.
- Consider RF props `preventScrolling` (default true). If your outer layout scrolls, also use NeoDrag `scrollLock` for precise control.

## Testing

- Use RF instance helpers via `useReactFlow()` for assertions (`getNodes()`, `updateNode()`).
- Mock pointer events for NeoDrag; ensure `className` guards (`nodrag`, `nopan`) are present.

## Gotchas

- Do not spread `NodeProps` onto DOM elements; pass only safe props to avoid invalid DOM attributes (`positionAbsoluteX`, etc.).
- RF may set `panOnDrag` dynamically when `panActivationKeyCode` is pressed. When building inner NeoDrag areas, still prefer `nopan` to be explicit.
- If you see unintended canvas zoom during inner drags, add `nowheel` to the draggable container and consider NeoDrag `scrollLock`.

—

Sources: [Neodrag React Docs](https://next.neodrag.dev/docs/react), RF dist: `@xyflow/react/dist` types (`component-props.d.ts`, `nodes.d.ts`, `hooks/useDrag.d.ts`).

## Viewport Helpers & Position Conversion

The RF instance exposes viewport helpers (via `useReactFlow()`), including:

- `screenToFlowPosition({ x, y }): { x: number; y: number }`
- `fitView`, `setViewport`, `getViewport`

Prefer `screenToFlowPosition` over manual math with `x/y/zoom` for pointer-based placement.

Example placing a node at pointer location in a pane handler:

```tsx
const rf = useReactFlow();
const onPaneClick = (e: React.MouseEvent) => {
  const pos = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY });
  rf.addNodes({ id: crypto.randomUUID(), type: 'new', position: pos });
};
```

## Click/Drag Thresholds & Selection

- RF `nodeDragThreshold` (default 1) delays node drag start; use to reduce mis-clicks.
- RF `paneClickDistance` (default 0) helps distinguish clicks from small drags on the pane.
- For inner NeoDrag, also use NeoDrag `threshold({ distance, delay })` to require intention.
- Remember to set `selectNodesOnDrag` appropriately for your UX; inner `nodrag` areas ignore it.

## Re-orderable List inside a Node (RF + NeoDrag)

Goal: Vertical reordering of list items inside a node without moving the node. Use NeoDrag for rows, and update node data via RF instance.

```tsx
import { memo, useMemo, useRef, useState } from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { useDraggable, axis, bounds, BoundsFrom, grid, controls, ControlFrom, threshold, events, touchAction } from '@neodrag/react';

type ListNodeData = { items: { id: string; label: string }[] };

function reorder<T>(arr: T[], from: number, to: number) {
  const copy = arr.slice();
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export default memo(function ReorderableListNode({ id, data }: NodeProps<{ items: ListNodeData['items'] }>) {
  const rf = useReactFlow();
  const [rowHeight] = useState(36); // px; keep in sync with CSS

  return (
    <div className="node-shell">
      <ul className="list nodrag nopan nowheel" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {data.items.map((item, index) => (
          <DraggableRow
            key={item.id}
            nodeId={id}
            index={index}
            rowHeight={rowHeight}
            onCommit={(from, to) => {
              if (from === to) return;
              rf.updateNodeData(id, (node) => ({ items: reorder(node.data.items, from, to) }));
            }}
          >
            {item.label}
          </DraggableRow>
        ))}
      </ul>
    </div>
  );
});

function DraggableRow({ nodeId, index, rowHeight, onCommit, children }: {
  nodeId: string;
  index: number;
  rowHeight: number;
  onCommit: (from: number, to: number) => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const startIndexRef = useRef(index);

  const plugins = useMemo(() => [
    axis('y'),
    bounds(BoundsFrom.parent()),
    grid([0, rowHeight]), // snap rows
    controls({ allow: ControlFrom.selector('[data-drag-handle]') }),
    threshold({ distance: 3 }),
    touchAction('none'),
    events({
      onDragStart: () => { startIndexRef.current = index; },
      onDragEnd: ({ currentNode }) => {
        if (!(currentNode instanceof HTMLElement)) return;
        // Compute final index using translateY / rowHeight
        const transform = currentNode.style.transform || '';
        const match = transform.match(/translate\([^,]+,\s*([-\d.]+)px\)/);
        const dy = match ? Number(match[1]) : 0;
        const deltaRows = Math.round(dy / rowHeight);
        const toIndex = Math.max(0, startIndexRef.current + deltaRows);
        onCommit(startIndexRef.current, toIndex);
        currentNode.style.transform = '';
      },
    }),
  ], [index, rowHeight]);

  useDraggable(ref, plugins);

  return (
    <li ref={ref} className="row nodrag nopan nowheel" style={{ height: rowHeight, display: 'flex', alignItems: 'center' }}>
      <span data-drag-handle style={{ cursor: 'grab', paddingRight: 8 }}>⋮⋮</span>
      <span>{children}</span>
    </li>
  );
}
```

Notes:

- `grid([0, rowHeight])` snaps movement per row.
- We compute the destination index from the final translateY; for more robust detection, you can compute using element bounds against sibling midpoints.
- Use stable keys (`item.id`) to prevent React remounts during reorder.

### Variant: Midpoint Hit-Testing (variable row heights)

Use this when rows have variable heights or dynamic content. Instead of `grid`, compute the drop index by comparing the dragged row center against sibling midpoints.

```tsx
import { memo, useMemo, useRef } from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { useDraggable, axis, bounds, BoundsFrom, controls, ControlFrom, threshold, events, touchAction } from '@neodrag/react';

type ListNodeData = { items: { id: string; label: string }[] };

export default memo(function ReorderableListNodeVariable({ id, data }: NodeProps<{ items: ListNodeData['items'] }>) {
  const rf = useReactFlow();
  const listRef = useRef<HTMLUListElement>(null);

  return (
    <div className="node-shell">
      <ul ref={listRef} className="list nodrag nopan nowheel" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {data.items.map((item, index) => (
          <HitTestRow
            key={item.id}
            nodeId={id}
            index={index}
            listRef={listRef}
            onCommit={(from, to) => {
              if (from === to) return;
              rf.updateNodeData(id, (node) => {
                const copy = node.data.items.slice();
                const [it] = copy.splice(from, 1);
                copy.splice(to, 0, it);
                return { items: copy };
              });
            }}
          >
            {item.label}
          </HitTestRow>
        ))}
      </ul>
    </div>
  );
});

function HitTestRow({ nodeId, index, listRef, onCommit, children }: {
  nodeId: string;
  index: number;
  listRef: React.RefObject<HTMLUListElement>;
  onCommit: (from: number, to: number) => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const startIndexRef = useRef(index);
  const startTopRef = useRef(0);
  const heightRef = useRef(0);

  const getSiblings = () => Array.from(listRef.current?.querySelectorAll<HTMLLIElement>('li.row') ?? []);

  const plugins = useMemo(() => [
    axis('y'),
    bounds(BoundsFrom.parent()),
    controls({ allow: ControlFrom.selector('[data-drag-handle]') }),
    threshold({ distance: 3 }),
    touchAction('none'),
    events({
      onDragStart: () => {
        startIndexRef.current = index;
        const rect = ref.current?.getBoundingClientRect();
        startTopRef.current = rect?.top ?? 0;
        heightRef.current = rect?.height ?? 0;
      },
      onDragEnd: ({ currentNode, offset }) => {
        if (!(currentNode instanceof HTMLElement)) return;
        const currentCenter = startTopRef.current + (heightRef.current / 2) + offset.y;
        const siblings = getSiblings();
        const mids = siblings.map((el) => {
          const r = el.getBoundingClientRect();
          return (r.top + r.bottom) / 2;
        });
        // Determine target index by first midpoint greater than current center
        let to = mids.findIndex((mid) => currentCenter < mid);
        if (to === -1) to = mids.length - 1;
        onCommit(startIndexRef.current, to);
        currentNode.style.transform = '';
      },
    }),
  ], [index]);

  useDraggable(ref, plugins);

  return (
    <li ref={ref} className="row nodrag nopan nowheel" style={{ display: 'flex', alignItems: 'center' }}>
      <span data-drag-handle style={{ cursor: 'grab', paddingRight: 8 }}>⋮⋮</span>
      <span>{children}</span>
    </li>
  );
}
```

#### Grid vs Hit-Testing: When to Use Which

- Grid snapping
  - Use when row heights are uniform and fixed.
  - Pros: simple, performant, minimal layout reads.
  - Cons: incorrect with variable heights or dynamic wrapping.

- Midpoint hit-testing
  - Use when row heights vary or content expands/collapses.
  - Pros: accurate across heterogeneous heights.
  - Cons: requires layout reads (`getBoundingClientRect`); consider measuring on `onDragStart` and `onDragEnd` only. For very large lists, debounce or virtualize.




