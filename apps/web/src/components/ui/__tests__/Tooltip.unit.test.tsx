import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('Tooltip', () => {
  it('shows content on trigger hover', async () => {
    render(
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button">Hover me</button>
        </TooltipTrigger>
        <TooltipContent>Tooltip text</TooltipContent>
      </Tooltip>,
    )
    const trigger = screen.getByRole('button', { name: /hover me/i })
    fireEvent.mouseEnter(trigger)
    expect(await screen.findByText('Tooltip text')).toBeInTheDocument()
  })
})


