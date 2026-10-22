import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ExportPanel } from './ExportPanel'
import { bodyFonts, headingFonts } from '../data/fonts'
import { createFontExport } from '../lib/fontExport'

describe('font export', () => {
  it('copies the selected pair as complete CSS and as a separate import', async () => {
    const user = userEvent.setup()
    const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    render(<ExportPanel heading={headingFonts[0]} body={bodyFonts.lato} />)
    await user.click(screen.getByRole('button', { name: 'Copy CSS' }))
    expect(write).toHaveBeenLastCalledWith(createFontExport(headingFonts[0], bodyFonts.lato).css)
    expect(screen.getByText('CSS copied to clipboard')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Google Fonts import' }))
    await user.click(screen.getByRole('button', { name: 'Copy import' }))
    expect(write).toHaveBeenLastCalledWith(createFontExport(headingFonts[0], bodyFonts.lato).importRule)
  })
  it('provides selectable text when clipboard permission is denied', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Permission denied'))
    render(<ExportPanel heading={headingFonts[0]} body={bodyFonts.dm} />)
    await user.click(screen.getByRole('button', { name: 'Copy CSS' }))
    const field = screen.getByRole('textbox')
    expect(field).toHaveFocus()
    expect(field).toHaveValue(createFontExport(headingFonts[0], bodyFonts.dm).css)
    expect(screen.queryByText('CSS copied to clipboard')).not.toBeInTheDocument()
  })
})
