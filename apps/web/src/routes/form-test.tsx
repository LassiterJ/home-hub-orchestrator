import { createFileRoute } from '@tanstack/react-router'
import { ExampleForm } from '../components/ui/Form/example-form'

export const Route = createFileRoute('/form-test')({
  component: FormTest,
})

function FormTest() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Form Test</h1>
      <ExampleForm />
    </div>
  )
}
