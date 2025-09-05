import { Edge, Node, Position } from '@xyflow/react'
import { NodeData } from '../../../types'
import { MenuItemSpec } from '@/components/ui/ContextMenu/buildContextMenu'

export const sampleNodes: Node<NodeData>[] = [
   {
      id: 'example-input',
      type: 'input',
      position: { x: 100, y: 100 },
      data: {
         label: 'Image Dataset',
         description: 'Your source images for processing',
         kind: 'example-kind',
         runtime: 'example-runtime',
         effect: 'exampleEffect',
         inputs: ['example-input'],
         outputs: ['example-outputs'],
         toolbarPosition: Position.Top,      // or Right/Bottom/Left
         forceToolbarVisible: false,         // set true to show always
      },

   },
   {
      id: 'example-model',
      type: 'model',
      position: { x: 400, y: 100 },
      data: {
         label: 'YOLOv8 Detection',
         description: 'Object detection using YOLOv8',
         kind: 'example-kind',
         runtime: 'example-runtime',
         effect: 'exampleEffect',
         inputs: ['example-input'],
         outputs: ['example-outputs'],
      },
   },
   {
      id: 'example-processing',
      type: 'processing',
      position: { x: 700, y: 100 },
      data: {
         label: 'Confidence Filter',
         description: 'Filter detections by confidence score',
         kind: 'example-kind',
         runtime: 'example-runtime',
         effect: 'exampleEffect',
         inputs: ['example-input'],
         outputs: ['example-outputs'],
      },
   },
   {
      id: 'example-output',
      type: 'output',
      position: { x: 1000, y: 100 },
      data: {
         label: 'JSON Export',
         description: 'Export results as JSON format',
         kind: 'example-kind',
         runtime: 'example-runtime',
         effect: 'exampleEffect',
         inputs: ['example-input'],
         outputs: ['example-outputs'],
      },
   },
   {
      id: '1',
      position: { x: 0, y: 0 },
      type: 'schema',
      data: {
         label: 'Products',
         description: 'For documenting schemas.',
         toolbarPosition: Position.Top,      // or Right/Bottom/Left
         forceToolbarVisible: false,         // set true to show always
         schema: [
            { title: 'id', type: 'uuid' },
            { title: 'name', type: 'varchar' },
            { title: 'description', type: 'varchar' },
            { title: 'warehouse_id', type: 'uuid' },
            { title: 'supplier_id', type: 'uuid' },
            { title: 'price', type: 'money' },
            { title: 'quantity', type: 'int4' },
         ],
      },
   },
]

export const sampleEdges: Edge[] = [
   {
      id: 'e1-2',
      label: 'connects with',
      source: 'example-input',
      target: 'example-model',
      type: 'smoothstep',
   },
   {
      id: 'e2-3',
      source: 'example-model',
      label: 'connects with',
      target: 'example-processing',
      type: 'smoothstep',
   },
   {
      id: 'e3-4',
      source: 'example-processing',
      label: 'connects with',
      target: 'example-output',
      type: 'smoothstep',
   },
]

export const sampleContextMenu: MenuItemSpec[] = [
   { kind: 'label', id: 'section-a', label: 'File' },
   { kind: 'item', id: 'open', label: 'Open', shortcut: '⌘O' },
   {
      kind: 'checkbox', id: 'hidden', label: 'Show hidden', checked: true, onCheckedChange: () => {
         console.log('onCheckedChange')
      },
   },
   { kind: 'separator', id: 'sep-1' },
   {
      kind: 'sub',
      id: 'sort-sub',
      label: 'Sort',
      items: [
         { kind: 'radio', id: 'sort-name', label: 'Name', group: 'sort', value: 'name' },
         { kind: 'radio', id: 'sort-date', label: 'Date', group: 'sort', value: 'date' },
         { kind: 'separator', id: 'sep-2' },
         { kind: 'item', id: 'advanced', label: 'Advanced…' },
      ],
   },
]

