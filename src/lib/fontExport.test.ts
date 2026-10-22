import { describe, expect, it } from 'vitest'
import { createFontExport, googleFontsUrl } from './fontExport'
import { selected } from '../test/catalogFixture'

describe('Google Fonts export', () => {
  it('exports only the selected faces and places the import before rules', () => {
    const result = createFontExport(selected('Playfair Display'), selected('DM Sans', 400))
    expect(result.importRule).toBe("@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400&family=Playfair+Display:wght@600&display=swap');")
    expect(result.css.startsWith(result.importRule)).toBe(true)
    expect(result.rules).toContain("font-family: 'Playfair Display', serif; font-weight: 600; font-style: normal;")
    expect(result.rules).toContain('font-optical-sizing: auto;')
  })
  it('deduplicates faces and sorts italic axis tuples as required by CSS2', () => {
    expect(googleFontsUrl([selected('Inter', 600, 'italic'), selected('Inter', 400), selected('Inter', 600), selected('Inter', 400)]))
      .toBe('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,600;1,14..32,600&display=swap')
  })
  it('exports supported single-weight fonts without synthetic bold', () => {
    const result = createFontExport(selected('Bebas Neue'), selected('Lato', 400))
    expect(result.url).toContain('Bebas+Neue:wght@400')
    expect(result.rules).toContain("'Bebas Neue', sans-serif; font-weight: 400")
  })
  it('exports arbitrary supported variable weights and the selected italic style', () => {
    const result = createFontExport(selected('Roboto Flex', 537), selected('Lora', 500, 'italic'))
    expect(result.url).toContain('Roboto+Flex:opsz,wght@8..144,537')
    expect(result.url).toContain('Lora:ital,wght@1,500')
    expect(result.rules).toContain('font-weight: 500; font-style: italic;')
  })
  it('escapes family names in both CSS strings and query parameters', () => {
    const result = createFontExport({ ...selected('Inter'), family: "Font's Name" }, selected('Lora', 400))
    expect(result.url).toContain('Font%27s+Name')
    expect(result.rules).toContain("'Font\\'s Name'")
  })
})
