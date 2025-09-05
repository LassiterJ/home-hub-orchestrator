'use client'

import { BaseHandle } from '@/components/features/workflow/handles/BaseHandle'
import { Button } from '@/components/ui/Button/'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { type NodeData } from '@/types'
import { NodeProps, Position } from '@xyflow/react'
import { FileText, Info } from 'lucide-react'
import { BaseNode, BaseNodeContent, BaseNodeFooter, BaseNodeHeader, BaseNodeHeaderTitle } from './BaseNode'

/**
 * Props for the FormNode component
 */
export interface FormNodeProps extends NodeProps {
  data: NodeData
}

/**
 * FormNode component for workflow forms
 *
 * A specialized node component that displays a form interface within a workflow.
 * Purpose: to allow inputs into the workflow like files or workflow configuration. Anywhere you would need a form.
 * Features a header with form icon, title, and info tooltip, an empty content
 * area for form fields, and a footer with a submit button.
 */
export function FormNode({ data }: FormNodeProps) {
  const {
    label,
    description = 'Form node for data collection and submission',
    status = 'initial',
    icon = FileText,
    onSubmit,
    disabled = false,
    className,
  } = data
  const Icon = icon
  return (
    <BaseNode className={className} status={status}>
      {/* Header with form icon, title, and info tooltip */}
      <BaseNodeHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <BaseNodeHeaderTitle>{label}</BaseNodeHeaderTitle>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Show form description"
            >
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-sm">{description}</p>
          </TooltipContent>
        </Tooltip>
      </BaseNodeHeader>

      {/* Empty content area for form fields */}
      <BaseNodeContent>
        {/* Form content will be rendered here */}
        <p>Form content will be rendered here</p>
      </BaseNodeContent>

      {/* Footer with submit button */}
      <BaseNodeFooter>
        <Button
          onClick={onSubmit}
          disabled={disabled}
          className="w-full"
          size="sm"
        >
          Submit
        </Button>
      </BaseNodeFooter>
      <BaseHandle
        type="source"
        position={Position.Left}
      />
      <BaseHandle
        type="target"
        position={Position.Right}
      />
    </BaseNode>
  )
}
