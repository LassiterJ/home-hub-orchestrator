import { Node, Edge } from '@xyflow/react';
import { NodeData } from '../../../types';

export const sampleNodes: Node<NodeData>[] = [
   {
      id: 'example-input',
      type: 'input',
      position: { x: 100, y: 100 },
      data: {
         label: 'Image Dataset',
         description: 'Your source images for processing',
         kind: "example-kind",
         runtime: "example-runtime",
         effect: "exampleEffect",
         inputs: ["example-input"],
         outputs: ["example-outputs"],

      },

   },
   {
      id: 'example-model',
      type: 'model',
      position: { x: 400, y: 100 },
      data: {
         label: 'YOLOv8 Detection',
         description: 'Object detection using YOLOv8',
         kind: "example-kind",
         runtime: "example-runtime",
         effect: "exampleEffect",
         inputs: ["example-input"],
         outputs: ["example-outputs"],
      },
   },
   {
      id: 'example-processing',
      type: 'processing',
      position: { x: 700, y: 100 },
      data: {
         label: 'Confidence Filter',
         description: 'Filter detections by confidence score',
         kind: "example-kind",
         runtime: "example-runtime",
         effect: "exampleEffect",
         inputs: ["example-input"],
         outputs: ["example-outputs"],
      },
   },
   {
      id: 'example-output',
      type: 'output',
      position: { x: 1000, y: 100 },
      data: {
         label: 'JSON Export',
         description: 'Export results as JSON format',
         kind: "example-kind",
         runtime: "example-runtime",
         effect: "exampleEffect",
         inputs: ["example-input"],
         outputs: ["example-outputs"],
      },
   },
];

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
];

