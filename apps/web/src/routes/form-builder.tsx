import { SimpleFormBuilder } from '@/features/formbuilder/builder/SimpleFormBuilder'
// import { FormSchema } from '@/features/formbuilder/form-schema';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/form-builder')({
   component: FormBuilderPage,
})

function FormBuilderPage() {
   const handleSchemaChange = () => {
      // You could save to localStorage, send to API, etc.
      // console.log('Schema changed:', schema)
   }

   return (
      <div className="h-screen">
         <div className="h-16 border-b bg-background flex items-center px-4">
            <h1 className="text-2xl font-bold">Form Builder</h1>
            <div className="ml-auto text-sm text-muted-foreground">
               Build forms visually and export as TSX
            </div>
         </div>
         <SimpleFormBuilder
            onSchemaChange={handleSchemaChange}
            debug={false}
            className="h-[calc(100vh-4rem)]"
         />
      </div>
   )
}
