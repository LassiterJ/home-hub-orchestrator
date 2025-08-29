import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Database } from 'lucide-react';
import { NodeData } from '../../../../types';

const InputNode = memo(({ data }: NodeProps & { data: NodeData }) => {
   return (
      <div className="px-4 py-3 bg-card border border-border rounded-lg shadow-md min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
      <div className="p-1.5 rounded bg-node-input/20">
      <Database size={14} className="text-node-input" />
      </div>
      <h3 className="text-sm font-semibold">{data.label}</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{data.description}</p>
      <div className="flex justify-end">
   <div className="text-xs bg-node-input/10 text-node-input px-2 py-1 rounded-full">
      INPUT
      </div>
      </div>
      <Handle
   type="source"
   position={Position.Right}
   className="!w-2 !h-2 !bg-node-input !border-2 !border-white"
      />
      </div>
);
});

InputNode.displayName = 'InputNode';

export default InputNode;
