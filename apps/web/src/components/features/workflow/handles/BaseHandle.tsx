import { Handle, type HandleProps } from '@xyflow/react';
import { forwardRef } from 'react';

import { cn } from '@/utils';

export type BaseHandleProps = HandleProps;

export const BaseHandle = forwardRef<HTMLDivElement, BaseHandleProps>(
   ({ className, children, ...props }, ref) => {
      return (
         <Handle
            ref={ref}
            {...props}
            className={cn(
               'h-4 w-4 rounded-full border-2 transition-all duration-200',
               className,
            )}
            {...props}
         >
            {children}
         </Handle>
      )
   },
)

BaseHandle.displayName = 'BaseHandle'
