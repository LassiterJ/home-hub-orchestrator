import { Textarea } from '@/components/ui/Textarea'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('Textarea', () => {
  it('renders with placeholder and rows', () => {
    render(<Textarea placeholder="Type here" rows={3} />)
    const ta = screen.getByPlaceholderText('Type here') as HTMLTextAreaElement
    expect(ta).toBeInTheDocument()
    expect(ta.rows).toBe(3)
  })
})


