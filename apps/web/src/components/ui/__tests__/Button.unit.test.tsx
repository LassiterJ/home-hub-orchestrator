import { Button } from '@/components/ui/Button'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('applies variant classes', () => {
    render(<Button variant="destructive">Delete</Button>)
    const btn = screen.getByRole('button', { name: /delete/i })
    expect(btn.className).toMatch(/destructive/i)
  })

  it('disables when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>)
    const btn = screen.getByRole('button', { name: /disabled/i }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })
})


