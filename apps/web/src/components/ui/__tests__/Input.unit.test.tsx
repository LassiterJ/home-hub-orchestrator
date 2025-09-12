import { Input } from '@/components/ui/Input'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('Input', () => {
  it('renders input with placeholder', () => {
    render(<Input placeholder="Your name" />)
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument()
  })

  it('forwards type prop', () => {
    render(<Input type="number" />)
    const input = screen.getByRole('spinbutton') as HTMLInputElement
    expect(input.type).toBe('number')
  })
})


