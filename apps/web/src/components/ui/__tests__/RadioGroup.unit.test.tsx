import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('RadioGroup', () => {
  it('selects one option', () => {
    render(
      <RadioGroup defaultValue="a">
        <div>
          <RadioGroupItem value="a" id="opt-a" />
          <label htmlFor="opt-a">A</label>
        </div>
        <div>
          <RadioGroupItem value="b" id="opt-b" />
          <label htmlFor="opt-b">B</label>
        </div>
      </RadioGroup>,
    )
    const b = screen.getByLabelText('B')
    fireEvent.click(b)
    // The selected item should have aria-checked true
    expect((screen.getByLabelText('B') as HTMLLabelElement).control?.getAttribute('data-state')).toBe('checked')
  })
})


