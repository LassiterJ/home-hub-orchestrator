import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('Dialog', () => {
  it('opens and renders content', async () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <button type="button">Open</button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>My Dialog</DialogTitle>
          <div>Body</div>
        </DialogContent>
      </Dialog>,
    )
    fireEvent.click(screen.getByRole('button', { name: /open/i }))
    expect(await screen.findByText('My Dialog')).toBeInTheDocument()
    expect(await screen.findByText('Body')).toBeInTheDocument()
  })
})


