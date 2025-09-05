import React from 'react';

export type NodeData = {
   label: string;
   description: string;
   kind?: string;
   runtime?: string;
   effect?: string;
   inputs?: string[];
   outputs?: string[];
   schema?: { title: string, type: string }[]
   // Form-specific properties
   status?: 'loading' | 'success' | 'error' | 'initial';
   onSubmit?: () => void;
   disabled?: boolean;
   className?: string;
   icon?: React.ComponentType<{ className?: string }>; // LucideIcon type
};
