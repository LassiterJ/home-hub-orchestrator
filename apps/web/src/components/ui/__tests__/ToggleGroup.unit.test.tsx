import { ToggleGroup, ToggleGroupItem } from '@/components/ui/ToggleGroup'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

describe('ToggleGroup', () => {
  it('selects values in multiple mode', () => {
    const onValueChange = vi.fn()
    render(
      <ToggleGroup type="multiple" value={[]} onValueChange={onValueChange}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'A' }))
    expect(onValueChange).toHaveBeenCalled()
  })
})


