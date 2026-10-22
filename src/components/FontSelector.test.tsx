import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FontSelector } from './FontSelector'
import { headingFonts } from '../data/fonts'

describe('heading selector', () => {
  it('opens, filters, chooses with the keyboard, and restores focus', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<FontSelector selected={headingFonts[0]} onSelect={onSelect} />)
    const trigger = screen.getByRole('button', { name: 'Heading font: Playfair Display' })
    await user.click(trigger)
    const search = screen.getByRole('combobox')
    expect(search).toHaveFocus()
    await user.type(search, 'play')
    await user.keyboard('{ArrowDown}{Enter}')
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ family: 'Playfair' }))
    expect(trigger).toHaveFocus()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
  it('does not select an empty result and recovers with Clear search', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<FontSelector selected={headingFonts[0]} onSelect={onSelect} />)
    await user.click(screen.getByRole('button', { name: /Heading font/ }))
    await user.type(screen.getByRole('combobox'), 'zzyx')
    await user.keyboard('{Enter}')
    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByText('No fonts found for “zzyx”')).toBeVisible()
    await user.click(screen.getAllByRole('button', { name: 'Clear search' })[0])
    expect(screen.getAllByRole('option')).toHaveLength(28)
    expect(screen.getByRole('combobox')).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: /Heading font/ })).toHaveFocus()
  })
  it('closes when tabbing outside without trapping keyboard focus', async () => {
    const user = userEvent.setup()
    render(<><FontSelector selected={headingFonts[0]} onSelect={vi.fn()} /><button>Next control</button></>)
    await user.click(screen.getByRole('button', { name: /Heading font/ }))
    await user.tab()
    expect(screen.getByRole('button', { name: 'Next control' })).toHaveFocus()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
