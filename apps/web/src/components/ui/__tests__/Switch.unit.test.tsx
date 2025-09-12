import { Switch } from '@/components/ui/Switch'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

describe('Switch', () => {
  it('renders and toggles', () => {
    const onChange = vi.fn()
    render(<Switch checked={false} onCheckedChange={onChange} />)
    const switchEl = screen.getByRole('switch')
    fireEvent.click(switchEl)
    expect(onChange).toHaveBeenCalled()
  })
})


