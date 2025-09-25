import { createFileRoute } from '@tanstack/react-router'
import { SampleForm } from '@/features/formbuilder/builder/SampleForm'

export const Route = createFileRoute('/')({
   component: Index,
})

function Index() {
   return (
      <div className="p-2">
         <SampleForm />
      </div>
   )
}
