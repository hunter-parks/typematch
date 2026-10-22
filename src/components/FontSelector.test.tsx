import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FontSelector } from './FontSelector'
import { catalog, selected } from '../test/catalogFixture'

describe('heading selector', () => {
  it('opens, searches the full catalog, chooses by keyboard and restores focus', async () => {
    const user = userEvent.setup(), onSelect = vi.fn()
    render(<FontSelector fonts={catalog.fonts} selected={selected('Playfair Display')} onSelect={onSelect} />)
    const trigger = screen.getByRole('button', { name: 'Heading font: Playfair Display' })
    await user.click(trigger)
    const search = screen.getByRole('combobox', { name: 'Search heading fonts' })
    expect(search).toHaveFocus()
    await user.type(search, 'roboto mono')
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ family: 'Roboto Mono' }))
    expect(trigger).toHaveFocus()
  })
  it('bounds rendered results, pages by keyboard and filters categories', async () => {
    const user = userEvent.setup()
    render(<FontSelector fonts={catalog.fonts} selected={selected(catalog.fonts[0].family)} onSelect={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /Heading font/ }))
    expect(within(screen.getByRole('listbox')).getAllByRole('option')).toHaveLength(40)
    await user.keyboard('{PageDown}')
    const activeId = screen.getByRole('combobox', { name: 'Search heading fonts' }).getAttribute('aria-activedescendant')!
    expect(document.getElementById(activeId)).toHaveAttribute('aria-posinset', '41')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Category' }), 'handwriting')
    expect(within(screen.getByRole('listbox')).getAllByRole('option').every(option => option.textContent?.includes('Handwriting'))).toBe(true)
    await user.type(screen.getByRole('combobox', { name: 'Search heading fonts' }), 'Roboto Mono')
    expect(screen.getByText('No fonts found for “Roboto Mono”')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Reset search and category' }))
    expect(screen.getByRole('combobox', { name: 'Category' })).toHaveValue('all')
    await user.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: /Heading font/ })).toHaveFocus()
  })
  it('keeps Tab navigation native and closes when focus leaves', async () => {
    const user = userEvent.setup()
    render(<><FontSelector fonts={catalog.fonts} selected={selected('Playfair Display')} onSelect={vi.fn()} /><button>Next control</button></>)
    await user.click(screen.getByRole('button', { name: /Heading font/ }))
    await user.tab()
    expect(screen.getByRole('combobox', { name: 'Category' })).toHaveFocus()
    for (let i = 0; i < 4 && document.activeElement?.textContent !== 'Next control'; i++) await user.tab()
    expect(screen.getByRole('button', { name: 'Next control' })).toHaveFocus()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
