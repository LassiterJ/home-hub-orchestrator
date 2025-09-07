import { createFileRoute } from '@tanstack/react-router'
import { WorkflowBuilder } from '@/components/features/workflow/WorkflowBuilder'

export const Route = createFileRoute('/workflows')({
   component: WorkflowBuilder,
})
