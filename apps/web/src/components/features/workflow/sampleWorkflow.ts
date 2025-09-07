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
      id: '1',
      position: { x: 0, y: 0 },
      type: 'schema',
      data: {
         label: 'Products',
         description: 'For documenting schemas.',
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

export const sampleEdges: Edge[] = []

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

