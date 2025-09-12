import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('Select', () => {
  it('renders trigger and opens content', async () => {
    render(
      <Select>
        <SelectTrigger><SelectValue placeholder="Pick one" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="one">One</SelectItem>
          <SelectItem value="two">Two</SelectItem>
        </SelectContent>
      </Select>,
    )
    const trigger = screen.getByRole('button')
    fireEvent.mouseDown(trigger)
    // Content may render in a portal, assert presence by text
    expect(await screen.findByText('One')).toBeInTheDocument()
  })
})


