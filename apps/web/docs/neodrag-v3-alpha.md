---
title: 'Neodrag v3 (alpha) for Orchestrator'
tagline: 'Installation, usage, plugins, types, and project recipes (React)'
---

> References: [Neodrag React Docs](https://next.neodrag.dev/docs/react)

## Overview

This guide documents how we use Neodrag v3 alpha in our React codebase. It covers installation (pnpm), basic usage, reactive compartments, all official plugins, essential type declarations, migration notes from v2, and project-specific recipes for our workflow builder and form editor.

Neodrag v3 switches from an options-based configuration to a plugin-based architecture with event delegation and explicit reactivity controls.

### Why v3

- Tree-shakable plugins (smaller bundles)
- Event delegation: constant listeners (≈3 total) regardless of draggable count
- Pointer capture reliability and better performance
- Custom plugins supported

## Install (pnpm)

We only need the React package in the web app.

```bash
cd apps/web
pnpm add @neodrag/react@next
```

If you also need types for authoring custom plugins (rare), they are included transitively via `@neodrag/core` through `@neodrag/react`.

## Quick Start (React)

```tsx
import { useRef } from 'react';
import { useDraggable } from '@neodrag/react';

export function Example() {
  const ref = useRef<HTMLDivElement>(null);
  useDraggable(ref); // default: free drag on both axes
  return <div ref={ref}>Drag me</div>;
}
```

With plugins:

```tsx
import { useRef } from 'react';
import {
  useDraggable,
  axis,
  bounds,
  BoundsFrom,
  grid,
  events,
} from '@neodrag/react';

export function ExamplePlugins() {
  const ref = useRef<HTMLDivElement>(null);
  useDraggable(ref, [
    axis('x'),
    bounds(BoundsFrom.parent()),
    grid([10, 10]),
    events({ onDrag: ({ offset }) => console.log(offset) }),
  ]);
  return <div ref={ref}>Drag me</div>;
}
```

## Reactivity with Compartments

v3 requires explicit reactivity when plugin behavior depends on state. Use `useCompartment` to recompute plugins on dependency changes without re-instantiating the draggable.

```tsx
import { useRef, useState } from 'react';
import { useDraggable, useCompartment, axis, bounds, BoundsFrom } from '@neodrag/react';

export function ReactiveDrag() {
  const ref = useRef<HTMLDivElement>(null);
  const [currentAxis, setCurrentAxis] = useState<'x' | 'y' | 'both'>('x');
  const [constrainToParent, setConstrainToParent] = useState(false);

  // Recompute only when dependencies change
  const axisComp = useCompartment(
    () => (currentAxis === 'both' ? null : axis(currentAxis as 'x' | 'y')),
    [currentAxis],
  );
  const boundsComp = useCompartment(
    () => (constrainToParent ? bounds(BoundsFrom.parent()) : null),
    [constrainToParent],
  );

  useDraggable(ref, () => [axisComp, boundsComp].filter(Boolean));

  return (
    <div>
      <div ref={ref}>Reactive draggable</div>
      <button onClick={() => setCurrentAxis('y')}>Switch to Y</button>
      <button onClick={() => setConstrainToParent(v => !v)}>Toggle bounds</button>
    </div>
  );
}
```

## Plugin Catalog (v3)

All plugins are imported from `@neodrag/react` and re-exported from `@neodrag/core/plugins`.

- axis(direction)
  - `axis('x' | 'y' | null)`; omit for both (default)
- bounds(fromFn, shouldRecompute?)
  - Constrain movement to computed bounds
  - `BoundsFrom.parent() | selector() | element() | viewport()`
- grid([x, y])
  - Snap movement to grid increments
- threshold({ delay?, distance? })
  - Require a time delay and/or pointer distance before drag begins
- controls({ allow?, block?, priority? }, shouldRecompute?)
  - Zone-based allow/block of pointer down origins. Use `ControlFrom.selector()` or `ControlFrom.elements()`
- events({ onDragStart?, onDrag?, onDragEnd? })
  - Hook into lifecycle with `{ offset, rootNode, currentNode, event }`
- disabled(boolean)
  - Toggle dragging on/off
- ignoreMultitouch(boolean)
  - Ignore additional touches after first pointer
- applyUserSelectHack(boolean)
  - Temporarily modify `user-select` to prevent selection artifacts
- transform((args) => void)
  - Run after position is computed; good for DOM transforms or side-effects
- position({ current?, default? })
  - Control initial and externally forced positions
- touchAction(mode | false)
  - Control CSS `touch-action` for gesture interaction
- scrollLock({ lockAxis?, container?, allowScrollbar? })
  - Prevent scroll during drag, optionally keeping scrollbar visible
- stateMarker()
  - Internal marker; rarely needed directly

Helpers:

- BoundsFrom.parent(padding?)
- BoundsFrom.selector(selector, padding?, root?)
- BoundsFrom.element(element, padding?)
- BoundsFrom.viewport(padding?)
- ControlFrom.selector(selector)
- ControlFrom.elements(elements)

## Type Declarations (Condensed)

These are the key types we rely on. Full types are available in `@neodrag/react` and `@neodrag/core` d.ts files.

```ts
// @neodrag/react
import { DraggableFactory } from '@neodrag/core';
import { PluginInput, DragEventData, Compartment } from '@neodrag/core/plugins';

export type DragState = DragEventData & { isDragging: boolean };

declare function useDraggable(
  ref: React.RefObject<HTMLElement | SVGElement | null>,
  plugins?: PluginInput,
): DragState;

declare function useCompartment(
  reactive: ConstructorParameters<typeof Compartment>[0],
  deps?: React.DependencyList,
): Compartment;
```

```ts
// @neodrag/core/plugins
export interface PluginContext {
  delta: { x: number; y: number };
  proposed: { x: number | null; y: number | null };
  offset: { x: number; y: number };
  initial: { x: number; y: number };
  isDragging: boolean;
  isInteracting: boolean;
  rootNode: HTMLElement | SVGElement;
  lastEvent: PointerEvent | null;
  cachedRootNodeRect: DOMRect;
  currentlyDraggedNode: HTMLElement | SVGElement;
  effect: { immediate: (fn: () => void) => void; paint: (fn: () => void) => void };
  propose: (x: number | null, y: number | null) => void;
  cancel: () => void;
  preventStart: () => void;
  setForcedPosition: (x: number, y: number) => void;
}

export type DragEventData = Readonly<{
  offset: Readonly<{ x: number; y: number }>;
  rootNode: HTMLElement | SVGElement;
  currentNode: HTMLElement | SVGElement;
  event: PointerEvent;
}>;

export type Plugin<State = any> = {
  name: string;
  priority?: number;
  liveUpdate?: boolean;
  cancelable?: boolean;
  setup?: (ctx: PluginContext) => State;
  shouldStart?: (ctx: PluginContext, state: State, event: PointerEvent) => boolean;
  start?: (ctx: PluginContext, state: State, event: PointerEvent) => void;
  drag?: (ctx: PluginContext, state: State, event: PointerEvent) => void;
  end?: (ctx: PluginContext, state: State, event: PointerEvent) => void;
  cleanup?: (ctx: PluginContext, state: State) => void;
};

export type PluginResolver = () => (Plugin | Compartment)[];
export type PluginInput = Plugin[] | PluginResolver;

export class Compartment {
  constructor(initial?: null | (() => Plugin | undefined | null));
  get current(): Plugin | null | undefined;
  set current(plugin: Plugin | null | undefined);
  subscribe(cb: (plugin: Plugin | null | undefined) => void): () => boolean;
}
```

```ts
// Selected plugin helpers (signatures)
declare const axis: (value?: 'x' | 'y' | null) => Plugin;
declare const grid: (values?: [x: number | null, y: number | null] | null) => Plugin;
declare const disabled: (value?: boolean) => Plugin;
declare const threshold: (options?: { delay?: number; distance?: number } | null) => Plugin;
declare const events: (handlers?: {
  onDragStart?: (data: DragEventData) => void;
  onDrag?: (data: DragEventData) => void;
  onDragEnd?: (data: DragEventData) => void;
}) => Plugin;
declare const bounds: (
  from?: ReturnType<typeof BoundsFrom.parent> | ReturnType<typeof BoundsFrom.selector> | ReturnType<typeof BoundsFrom.element> | ReturnType<typeof BoundsFrom.viewport>,
  shouldRecompute?: (ctx: { readonly hook: 'setup' | 'start' | 'drag' | 'end' }) => boolean,
) => Plugin;
declare const controls: (options?: {
  allow?: ReturnType<typeof ControlFrom.selector> | ReturnType<typeof ControlFrom.elements>;
  block?: ReturnType<typeof ControlFrom.selector> | ReturnType<typeof ControlFrom.elements>;
  priority?: 'allow' | 'block';
} | null, shouldRecompute?: (ctx: { readonly hook: 'setup' | 'start' | 'drag' | 'end' }) => boolean) => Plugin;
```

## Migration Notes (v2 → v3, React)

- Replace options object with a plugin array
- Convert events to `events({ ... })` plugin; event data is now `{ offset, rootNode, currentNode, event }`
- Replace `axis: 'both'` with no axis plugin (default both)
- Bounds use `BoundsFrom.*` helpers
- For dynamic options, use `useCompartment`

Example before/after:

```tsx
// v2
useDraggable(ref, {
  axis: 'x',
  bounds: 'parent',
  grid: [10, 10],
  onDrag: ({ offsetX, offsetY }) => console.log(offsetX, offsetY),
});

// v3
useDraggable(ref, [
  axis('x'),
  bounds(BoundsFrom.parent()),
  grid([10, 10]),
  events({ onDrag: ({ offset }) => console.log(offset.x, offset.y) }),
]);
```

## Project Recipes

### 1) FormNode editor: Row drag with snap-back

Goal: Drag rows to visually reorder during edit, then snap back to their list position after drop. Use stable keys and avoid RHF form context inside the editor.

Key points:

- Use `axis('y')` for vertical dragging
- Constrain to parent with `bounds(BoundsFrom.parent())`
- Optionally `threshold({ distance: 3 })` to avoid accidental drags
- Use `controls({ allow: ControlFrom.selector('[data-drag-handle]') })` to require handle
- In `onDragEnd`, clear any inline transform to snap back
- Keep React list keys stable (e.g., field name) to avoid remounts

Example:

```tsx
import { useRef } from 'react';
import {
  useDraggable,
  axis,
  bounds,
  BoundsFrom,
  threshold,
  controls,
  ControlFrom,
  events,
} from '@neodrag/react';

export function DraggableRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useDraggable(ref, [
    axis('y'),
    bounds(BoundsFrom.parent({ top: 0, bottom: 0 })),
    threshold({ distance: 3 }),
    controls({ allow: ControlFrom.selector('[data-drag-handle]') }),
    events({
      onDragEnd: ({ currentNode }) => {
        // Snap back by removing transform, list position remains authoritative
        if (currentNode instanceof HTMLElement) currentNode.style.transform = '';
      },
    }),
  ]);
  return (
    <div ref={ref} className="row">
      <span data-drag-handle className="handle">⋮⋮</span>
      {children}
    </div>
  );
}
```

Notes:

- Ensure list items use stable keys based on immutable identifiers (e.g., field name)
- Do not couple to React Hook Form context in the editor; render standalone labels/inputs to avoid unintended re-renders during drag

### 2) Workflow builder: Palette item drag

Goal: Make palette items draggable for placement, with optional scroll lock and handle-only drag.

Example:

```tsx
import { useRef } from 'react';
import {
  useDraggable,
  axis,
  grid,
  scrollLock,
  controls,
  ControlFrom,
  events,
} from '@neodrag/react';

export function PaletteItem({ onDrop }: { onDrop: (offset: { x: number; y: number }) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useDraggable(ref, [
    axis(null), // both
    grid([8, 8]),
    scrollLock({ lockAxis: 'both', allowScrollbar: false }),
    controls({ allow: ControlFrom.selector('[data-drag-handle]') }),
    events({
      onDragEnd: ({ offset }) => onDrop(offset),
    }),
  ]);
  return (
    <div ref={ref} className="palette-item">
      <span data-drag-handle className="handle">⇲</span>
      Node
    </div>
  );
}
```

Tips:

- Use `grid` to align with canvas snapping rules
- Use `scrollLock` to avoid the page scrolling during drag on trackpads/mobiles

## Troubleshooting

- Plugins not applied: Ensure you pass an array or a resolver function. Import each plugin explicitly.
- Events not firing: Add the `events(...)` plugin; events are no longer options.
- Reactivity not updating: Use `useCompartment` and dependency arrays; v3 does not auto-recompute on state change.
- Bounds not correct: Prefer `BoundsFrom.parent()` or `selector()` and recompute via the plugin `shouldRecompute` parameter if the layout changes during drag.

## Performance Notes

- v3 uses event delegation and pointer capture, significantly reducing listeners and GC pressure
- Prefer `controls` to avoid unnecessary drag starts
- Use `threshold` for noisy UIs where incidental drags are common

## Appendix: Selected Core Types

```ts
// @neodrag/core
export interface DraggableInstance {
  ctx: any;
  root_node: HTMLElement | SVGElement;
  plugins: Plugin[];
  states: Map<string, any>;
  pointer_captured_id: number | null;
  inverse_scale: number;
  controller: AbortController;
  compartments: {
    map: Map<Compartment, Plugin | null | undefined>;
    pending: Set<Compartment>;
    is_flushing: boolean;
  };
}

export class DraggableFactory {
  constructor(opts: { plugins: Plugin[]; delegate: () => HTMLElement; onError: (e: any) => void });
  draggable(node: HTMLElement | SVGElement, plugins?: PluginInput): () => void;
}
```

---

For deeper details, see the official docs: [Neodrag React Docs](https://next.neodrag.dev/docs/react).

Also see: React Flow integration guide in `docs/neodrag-reactflow.md` for conflict management with RF drag/pan/selection.

## Agent Playbook (Do/Don't)

- Do prefer a plugin array for static behavior; use a resolver function only when using compartments or when plugin sets depend on props/state.
- Do use `useCompartment` for any dynamic behavior (axis, bounds, grid sizes, enable/disable) to avoid tearing and re-instantiation.
- Do add `events(...)` explicitly; callbacks are not part of options anymore.
- Do constrain drag start with `controls` and/or `threshold` to reduce noise.
- Do use selector-based handles like `[data-drag-handle]` to keep DOM decoupled.
- Do keep list keys stable when visually dragging list rows; clear `transform` on drop to snap back.
- Don't mutate `DragEventData` (it is `Readonly`).
- Don't re-create the ref object; always keep a stable `useRef`.
- Don't rebuild the plugin array every render unless you pass a function and compartments; otherwise memoize.

## Array vs Resolver vs Compartments

- Static plugins (never changing): pass an array literal or memoized array.
- Dynamic plugins (change based on state/props):
  - Use `useCompartment` per dynamic concern
  - Pass a resolver: `useDraggable(ref, () => [axisComp, boundsComp])`
  - Update compartments by updating React state; the hook reconciles without tearing

Example ordering and memoization:

```tsx
const plugins = useMemo(() => [
  axis('x'),
  grid([8, 8]),
  events({...}),
], []);
useDraggable(ref, plugins);
```

## Bounds Recompute Strategies

Some layouts change while dragging (collapsible containers, viewport resize). You can:

- Use the `shouldRecompute` predicate to recompute in given hook phases:

```tsx
bounds(BoundsFrom.parent({ top: 8, bottom: 8 }), ({ hook }) => hook !== 'drag');
```

- Trigger plugin recompute via compartments if your bounds source changes:

```tsx
const parentBoundsComp = useCompartment(() => bounds(BoundsFrom.parent()));
useDraggable(ref, () => [parentBoundsComp]);
```

- For responsive recompute, attach a `ResizeObserver` and flip a boolean state to refresh a compartment.

## Touch & Mobile Settings

- Use `scrollLock({ lockAxis: 'both', allowScrollbar: false })` to prevent scroll during drag on touchpads/mobiles.
- Consider `touchAction('none')` to reduce gesture conflicts inside scrollable containers.
- Use `ignoreMultitouch(true)` to ignore additional fingers after the first pointer when needed.

## Programmatic Position Control

Prefer the `position({ default, current })` plugin to set initial/default positions, and to externally control current position via a compartment:

```tsx
const posComp = useCompartment(() => position({ current: externalPos } as const), [externalPos.x, externalPos.y]);
useDraggable(ref, () => [posComp]);
```

Low-level escape hatch (not recommended for routine control): access the instance and call the internal `setForcedPosition` via context. This uses internal APIs and can break across versions.

```tsx
import { instances } from '@neodrag/react';

function force(ref: React.RefObject<HTMLElement>) {
  const el = ref.current;
  if (!el) return;
  const inst = instances.get(el);
  inst?.ctx.setForcedPosition(100, 100); // internal API; avoid if possible
}
```

## Testing Notes

- Use `@testing-library/react` with `PointerEvent` support; JSDOM supports `PointerEvent` in recent versions.
- Simulate `pointerdown`, `pointermove`, `pointerup` on the element; verify style transform or side-effects from `events` plugin.
- Mock `ResizeObserver` if you depend on bounds recomputation in tests.

## Full API Surface (Types and Plugins)

The following declarations are adapted from the published type definitions. Use them to ensure agents call APIs with correct types. See also the official docs: [Neodrag React Docs](https://next.neodrag.dev/docs/react).

```ts
// @neodrag/react/dist/index.d.ts (essentials)
import * as _neodrag_core from '@neodrag/core';
import { DraggableFactory } from '@neodrag/core';
import { PluginInput, DragEventData, Compartment } from '@neodrag/core/plugins';
export * from '@neodrag/core/plugins';

interface DragState extends DragEventData { isDragging: boolean }

declare const wrapper: (
  draggableFactory: DraggableFactory,
) => (
  ref: React.RefObject<HTMLElement | SVGElement | null>,
  plugins?: PluginInput,
) => DragState;

declare function useCompartment(
  reactive: ConstructorParameters<typeof Compartment>[0],
  deps?: React.DependencyList,
): Compartment;

declare const useDraggable: (
  ref: React.RefObject<HTMLElement | SVGElement | null>,
  plugins?: PluginInput,
) => DragState;

declare const instances: Map<HTMLElement | SVGElement, _neodrag_core.DraggableInstance>;

export { instances, useCompartment, useDraggable, wrapper };
```

```ts
// @neodrag/core/dist/plugins.d.ts (core types and plugins)
interface PluginContext {
  delta: { x: number; y: number };
  proposed: { x: number | null; y: number | null };
  offset: { x: number; y: number };
  initial: { x: number; y: number };
  isDragging: boolean;
  isInteracting: boolean;
  rootNode: HTMLElement | SVGElement;
  lastEvent: PointerEvent | null;
  cachedRootNodeRect: DOMRect;
  currentlyDraggedNode: HTMLElement | SVGElement;
  effect: { immediate: (fn: () => void) => void; paint: (fn: () => void) => void };
  propose: (x: number | null, y: number | null) => void;
  cancel: () => void;
  preventStart: () => void;
  setForcedPosition: (x: number, y: number) => void;
}

interface Plugin<State = any> {
  name: string;
  priority?: number;
  liveUpdate?: boolean;
  cancelable?: boolean;
  setup?: (ctx: PluginContext) => State;
  shouldStart?: (ctx: PluginContext, state: State, event: PointerEvent) => boolean;
  start?: (ctx: PluginContext, state: State, event: PointerEvent) => void;
  drag?: (ctx: PluginContext, state: State, event: PointerEvent) => void;
  end?: (ctx: PluginContext, state: State, event: PointerEvent) => void;
  cleanup?: (ctx: PluginContext, state: State) => void;
}

type PluginResolver = () => (Plugin | Compartment)[];
type PluginInput = Plugin[] | PluginResolver;

declare class Compartment {
  constructor(initial?: undefined | null | (() => Plugin | undefined | null));
  get current(): Plugin | null | undefined;
  set current(plugin: Plugin | null | undefined);
  subscribe(callback: (plugin: Plugin | null | undefined) => void): () => boolean;
}

declare function unstable_definePlugin<State, Args extends unknown[]>(
  fn: (...args: Args) => Plugin<State>,
): (...args: Args) => Plugin<State>;

declare const ignoreMultitouch: (value?: boolean | undefined) => Plugin<{ active_pointers: Set<number> }>;
declare const stateMarker: () => Plugin<{ count: number }>;
declare const axis: (value?: 'x' | 'y' | null | undefined) => Plugin<unknown>;
declare const applyUserSelectHack: (value?: boolean | null | undefined) => Plugin<{ body_user_select_val: string }>;
declare const grid: (values?: [x: number | null | undefined, y: number | null | undefined] | null | undefined) => Plugin<unknown>;
declare const disabled: (value?: boolean | undefined) => Plugin<unknown>;
declare const transform: (
  func?: ((args: { offset: { x: number; y: number }; rootNode: HTMLElement | SVGElement }) => void) | undefined,
) => Plugin<void>;

type BoundFromFunction = (data: { root_node: HTMLElement | SVGElement }) => [[x1: number, y1: number], [x2: number, y2: number]];

declare const BoundsFrom: {
  element(
    element: HTMLElement,
    padding?: { top?: number; left?: number; right?: number; bottom?: number },
  ): BoundFromFunction;
  selector(
    selector: string,
    padding?: { top?: number; left?: number; right?: number; bottom?: number },
    root?: HTMLElement,
  ): BoundFromFunction;
  viewport(
    padding?: { top?: number; left?: number; right?: number; bottom?: number },
  ): BoundFromFunction;
  parent(
    padding?: { top?: number; left?: number; right?: number; bottom?: number },
  ): BoundFromFunction;
};

declare const bounds: (
  value?: BoundFromFunction | undefined,
  shouldRecompute?: ((ctx: { readonly hook: 'setup' | 'start' | 'drag' | 'end' }) => boolean) | undefined,
) => Plugin<{ bounds: [[number, number], [number, number]]; initialElementPosition: { x: number; y: number } }>;

declare const threshold: (
  options?: { delay?: number; distance?: number } | null | undefined,
) => Plugin<
  | { enabled: false }
  | { enabled: true; start_time: number; start_position: { x: number; y: number }; options: { delay: number; distance: number } }
>;

type DragEventData = Readonly<{
  offset: Readonly<{ x: number; y: number }>;
  rootNode: HTMLElement | SVGElement;
  currentNode: HTMLElement | SVGElement;
  event: PointerEvent;
}>;

declare const events: (events?: {
  onDragStart?: (data: DragEventData) => void;
  onDrag?: (data: DragEventData) => void;
  onDragEnd?: (data: DragEventData) => void;
} | undefined) => Plugin<{ offset: { x: number; y: number }; rootNode: HTMLElement | SVGElement; currentNode: HTMLElement | SVGElement; event: PointerEvent }>;

type ControlZone = { element: Element; top: number; right: number; bottom: number; left: number; area: number };

declare const ControlFrom: {
  selector(selector: string): (root: Element) => ControlZone[];
  elements: (elements: NodeListOf<Element> | (Element | null | undefined)[]) => (root: Element) => ControlZone[];
};

declare const controls: (
  options?: {
    allow?: ReturnType<(typeof ControlFrom)[keyof typeof ControlFrom]>;
    block?: ReturnType<(typeof ControlFrom)[keyof typeof ControlFrom]>;
    priority?: 'allow' | 'block';
  } | null | undefined,
  shouldRecompute?: ((ctx: { readonly hook: 'setup' | 'start' | 'drag' | 'end' }) => boolean) | undefined,
) => Plugin<{
  allow_zones: ControlZone[];
  block_zones: ControlZone[];
  priority: 'block' | 'allow';
  allow_fn: ((root: Element) => ControlZone[]) | undefined;
  block_fn: ((root: Element) => ControlZone[]) | undefined;
  compute_zones: () => { allow_zones: ControlZone[]; block_zones: ControlZone[] };
}>;

declare const position: (options?: { current?: { x: number; y: number } | null; default?: { x: number; y: number } | null } | null | undefined) => Plugin<void>;

type TouchActionMode =
  | 'auto' | 'none' | 'pan-x' | 'pan-left' | 'pan-right' | 'pan-y' | 'pan-up' | 'pan-down' | 'pinch-zoom'
  | 'manipulation' | 'inherit' | 'initial' | 'revert' | 'revert-layer' | 'unset';

declare const touchAction: (mode?: false | TouchActionMode | null | undefined) => Plugin<void>;

declare const scrollLock: (options?: {
  lockAxis?: 'x' | 'y' | 'both';
  container?: HTMLElement | (() => HTMLElement);
  allowScrollbar?: boolean;
} | null | undefined) => Plugin<{
  config: {
    lockAxis?: 'x' | 'y' | 'both';
    container: HTMLElement | (() => HTMLElement);
    allowScrollbar?: boolean;
    lock_axis: string;
    allow_scrollbar: boolean;
  };
  original_styles: Map<HTMLElement, { user_select: string; touch_action: string; overflow: string }>;
  container_rect: DOMRect | null;
  last_container_check: number;
}>;

export { BoundsFrom, Compartment, ControlFrom, type DragEventData, type Plugin, type PluginContext, type PluginInput, type PluginResolver, applyUserSelectHack, axis, bounds, controls, disabled, events, grid, ignoreMultitouch, position, scrollLock, stateMarker, threshold, touchAction, transform, unstable_definePlugin };
```

## Common Pitfalls for Agents

- Forgetting to include `events(...)` and then expecting callbacks — always add the plugin.
- Passing `axis('both')` — not needed; omit `axis` for both directions.
- Recreating the plugin array each render causing subtle behavior changes — use `useMemo` or pass a resolver with compartments.
- Mutating DOM styles directly while also relying on default transforms — prefer letting the library handle transforms, and only clear transforms intentionally on drop in snap-back UIs.
- Ignoring `touchAction` in nested scroll containers — add `touchAction('none')` or `scrollLock`.

## Compatibility

- Works with HTMLElement and SVGElement refs.
- Safe in SSR: the hook attaches on the client; ensure refs are not accessed on the server.

—

Source: [Neodrag React Docs](https://next.neodrag.dev/docs/react)


