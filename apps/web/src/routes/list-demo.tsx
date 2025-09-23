import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export const Route = createFileRoute('/list-demo')({
   component: ListTest,
})

const listItems = [
   { key: 'item1', label: 'Item1' },
   { key: 'item2', label: 'Item2' },
   { key: 'item3', label: 'Item3' },
   { key: 'item4', label: 'Item4' },
   { key: 'item5', label: 'Item5' },
]

const sampleData = [
   {
      'id': 'formField-819e770d-a82d-48f9-8d0c-9885f3e26ce2',
      'name': 'Name',
      'label': 'Label',
      'placeholder': 'placeholder',
      'description': ' Description',
   },
   {
      'id': 'formField-90ef0a4b-578f-4577-b448-cd5ef0b45f7d',
      'name': 'Name',
      'label': 'Label',
      'placeholder': 'placeholder',
      'description': ' Description',
   },
]

function ListTest() {
   const [selected, setSelected] = useState(false)
   const toggleSelected = () => setSelected(!selected)
   return (
      <div className="h-screen w-screen">
         <div className={'container w-[500px] h-[400px] border'}>
            <Button onClick={toggleSelected}>
               Toggle Selected
            </Button>
         </div>
      </div>
   )
}
