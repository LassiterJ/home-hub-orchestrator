import { type XYPosition } from '@xyflow/react'
import { CurrentNode } from '../workflow/AppSidebar'

/**
 * Returns the DOMRect for the React Flow container.
 * Keeping this local avoids querying multiple different selectors across the file.
 */
export const getFlowRect = () => document.querySelector('.react-flow')?.getBoundingClientRect()

/**
 * Check if a screen position lies within a given DOMRect.
 * Uses early boolean coercion to keep the call sites concise.
 */
export const isPointInRect = (p: XYPosition, r?: DOMRect) =>
   !!r && p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom

/**
 * Build a React Flow Rect representing the dragged element at a flow-space position.
 * We read the drag element’s size from the DOM to mirror what overlaps on the canvas.
 */
export const buildDragRect = (el: CurrentNode, position: XYPosition): Rect => {
   const { width, height } = el.getBoundingClientRect()
   return { x: position.x, y: position.y, width, height }
}

/**
 * Simple membership check by id. Kept inline to avoid lodash dependency.
 */
export const hasMatchingId = (items: { id: string }[], id: string) => items.some((i) => i.id === id)

/**
 * Status transition for drag highlighting:
 * - If node was highlighted but no longer intersecting, revert to 'default'
 * - If intersecting, set to 'intersected'
 * - Otherwise keep previous status (defaulting to 'default')
 */
export const nextStatusOnDrag = (prev: unknown, isIntersecting: boolean) => {
   if (prev === 'intersected' && !isIntersecting) return 'default'
   if (isIntersecting) return 'intersected'
   return (prev as string) ?? 'default'
}
