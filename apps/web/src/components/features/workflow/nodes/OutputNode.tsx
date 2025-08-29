import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { BarChart3 } from 'lucide-react';
import { NodeData } from '../../../../types';

const OutputNode = memo(({ data }: NodeProps & { data: NodeData }) => {
   return (
      <div className="px-4 py-3 bg-card border border-border rounded-lg shadow-md min-w-[180px]">
         <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded bg-node-output/20">
               <BarChart3 size={14} className="text-node-output" />
            </div>
            <h3 className="text-sm font-semibold">{data.label}</h3>
         </div>
         <p className="text-xs text-muted-foreground mb-3">{data.description}</p>
         <div className="flex justify-end">
            <div className="text-xs bg-node-output/10 text-node-output px-2 py-1 rounded-full">
               OUTPUT
            </div>
         </div>
         <Handle
            type="target"
            position={Position.Left}
            className="!w-2 !h-2 !bg-node-output !border-2 !border-white"
         />
      </div>
   );
});

OutputNode.displayName = 'OutputNode';

export default OutputNode;
