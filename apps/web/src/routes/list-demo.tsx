import { createFileRoute } from '@tanstack/react-router'
import { List } from '@/components/ui/List'

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

function ListTest() {
   return (
      <div className="h-screen w-screen">
         <div className={'container w-[500px] h-[400px] border'}>
            <List listItems={listItems} />
         </div>
      </div>
   )
}
