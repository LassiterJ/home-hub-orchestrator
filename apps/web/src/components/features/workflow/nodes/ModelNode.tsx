import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Brain } from 'lucide-react';
import { NodeData } from '../../../../types';

const ModelNode = memo(({ data }: NodeProps & { data: NodeData }) => {
   return (
      <div className="px-4 py-3 bg-card border border-border rounded-lg shadow-md min-w-[180px]">
         <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded bg-node-model/20">
               <Brain size={14} className="text-node-model" />
            </div>
            <h3 className="text-sm font-semibold">{data.label}</h3>
         </div>
         <p className="text-xs text-muted-foreground mb-3">{data.description}</p>
         <div className="flex justify-between items-center">
            <div className="text-xs bg-node-model/10 text-node-model px-2 py-1 rounded-full">
               MODEL
            </div>
            <div className="text-xs text-muted-foreground">v1.0</div>
         </div>
         <Handle
            type="target"
            position={Position.Left}
            className="!w-2 !h-2 !bg-node-model !border-2 !border-white"
         />
         <Handle
            type="source"
            position={Position.Right}
            className="!w-2 !h-2 !bg-node-model !border-2 !border-white"
         />
      </div>
   );
});

ModelNode.displayName = 'ModelNode';

export default ModelNode;
