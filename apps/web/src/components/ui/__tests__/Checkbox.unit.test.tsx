import { Checkbox } from '@/components/ui/Checkbox'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('Checkbox', () => {
  it('renders and toggles checked state', () => {
    const { container } = render(<Checkbox defaultChecked={false} />)
    const root = container.querySelector('[data-state]') ?? screen.getByRole('checkbox')
    // Click the checkbox
    fireEvent.click(root as Element)
    // Radix sets aria-checked on role=switch/checkbox; assert presence of indicator element
    expect(container.querySelector('[data-state="checked"]') || container.querySelector('[data-state=checked]')).toBeTruthy()
  })
})


