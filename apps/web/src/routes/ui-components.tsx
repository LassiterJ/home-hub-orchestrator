import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Checkbox } from '../components/ui/Checkbox'
import { DatePicker } from '../components/ui/DatePicker'
import { Input } from '../components/ui/Input/Input'
import { RadioGroup, RadioGroupItem } from '../components/ui/RadioGroup'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select'
import { Switch } from '../components/ui/Switch'
import { Textarea } from '../components/ui/Textarea'
import { Combobox } from '../components/ui/Combobox'

export const Route = createFileRoute('/ui-components')({
   component: UIComponents,
})

const options = [
   { value: 'apple', label: 'Apple' },
   { value: 'banana', label: 'Banana' },
   { value: 'cherry', label: 'Cherry' },
   { value: 'date', label: 'Date' },
   { value: 'elderberry', label: 'Elderberry' },
]

function UIComponents() {
   const [checkboxChecked, setCheckboxChecked] = useState(false)
   const [switchChecked, setSwitchChecked] = useState(false)
   const [radioValue, setRadioValue] = useState('option1')
   const [selectValue, setSelectValue] = useState('')
   const [comboboxValue, setComboboxValue] = useState('')
   const [date, setDate] = useState<Date>()

   return (
      <div className="container mx-auto py-8 max-w-4xl">
         <h1 className="text-3xl font-bold mb-8">UI Components Showcase</h1>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Checkbox */}
            <div className="space-y-4">
               <h2 className="text-xl font-semibold">Checkbox</h2>
               <div className="flex items-center space-x-2">
                  <Checkbox
                     id="terms"
                     checked={checkboxChecked}
                     onCheckedChange={setCheckboxChecked}
                  />
                  <label htmlFor="terms"
                         className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                     Accept terms and conditions
                  </label>
               </div>
            </div>

            {/* Switch */}
            <div className="space-y-4">
               <h2 className="text-xl font-semibold">Switch</h2>
               <div className="flex items-center space-x-2">
                  <Switch
                     id="notifications"
                     checked={switchChecked}
                     onCheckedChange={setSwitchChecked}
                  />
                  <label htmlFor="notifications"
                         className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                     Enable notifications
                  </label>
               </div>
            </div>

            {/* Input */}
            <div className="space-y-4">
               <h2 className="text-xl font-semibold">Input</h2>
               <div className="space-y-2">
                  <Input placeholder="Enter your name" />
                  <Input type="email" placeholder="Enter your email" />
                  <Input type="password" placeholder="Enter your password" />
               </div>
            </div>

            {/* Textarea */}
            <div className="space-y-4">
               <h2 className="text-xl font-semibold">Textarea</h2>
               <Textarea placeholder="Enter your message here..." />
            </div>

            {/* Radio Group */}
            <div className="space-y-4">
               <h2 className="text-xl font-semibold">Radio Group</h2>
               <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                  <div className="flex items-center space-x-2">
                     <RadioGroupItem value="option1" id="r1" />
                     <label htmlFor="r1">Option 1</label>
                  </div>
                  <div className="flex items-center space-x-2">
                     <RadioGroupItem value="option2" id="r2" />
                     <label htmlFor="r2">Option 2</label>
                  </div>
                  <div className="flex items-center space-x-2">
                     <RadioGroupItem value="option3" id="r3" />
                     <label htmlFor="r3">Option 3</label>
                  </div>
               </RadioGroup>
            </div>

            {/* Select */}
            <div className="space-y-4">
               <h2 className="text-xl font-semibold">Select</h2>
               <Select value={selectValue} onValueChange={setSelectValue}>
                  <SelectTrigger className="w-[200px]">
                     <SelectValue placeholder="Select a fruit" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="apple">Apple</SelectItem>
                     <SelectItem value="banana">Banana</SelectItem>
                     <SelectItem value="cherry">Cherry</SelectItem>
                     <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
               </Select>
            </div>

            {/* Date Picker */}
            <div className="space-y-4">
               <h2 className="text-xl font-semibold">Date Picker</h2>
               <DatePicker
                  date={date}
                  setDate={setDate}
                  placeholder="Pick a date"
               />
            </div>

            {/* Combobox */}
            <div className="space-y-4">
               <h2 className="text-xl font-semibold">Combobox</h2>
               <Combobox
                  options={options}
                  value={comboboxValue}
                  onValueChange={setComboboxValue}
                  placeholder="Select a fruit..."
                  searchPlaceholder="Search fruits..."
               />
            </div>
         </div>

         {/* State Display */}
         <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Current State:</h3>
            <pre className="text-sm">
          {JSON.stringify({
             checkboxChecked,
             switchChecked,
             radioValue,
             selectValue,
             comboboxValue,
             date: date?.toISOString(),
          }, null, 2)}
        </pre>
         </div>
      </div>
   )
}
