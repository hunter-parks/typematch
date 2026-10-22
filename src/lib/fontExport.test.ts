import { describe, expect, it } from 'vitest'
import { bodyFonts, getRecommendations, headingFonts, searchFonts } from '../data/fonts'
import { createFontExport, googleFontsUrl } from './fontExport'

describe('curated font catalog', () => {
  it('searches without case or surrounding whitespace and handles no matches', () => {
    expect(searchFonts('  PLAY  ').map(font => font.family)).toEqual(['Playfair Display', 'Playfair', 'Play', 'DM Serif Display'])
    expect(searchFonts('zzyx')).toEqual([])
    expect(searchFonts('')).toHaveLength(28)
  })

  it.each(headingFonts)('provides three distinct, explained body pairings for $family', heading => {
    const picks = getRecommendations(heading)
    expect(picks).toHaveLength(3)
    expect(new Set(picks.map(pick => pick.font.family)).size).toBe(3)
    for (const pick of picks) {
      expect(pick.font.family).not.toBe(heading.family)
      expect(pick.explanation.length).toBeGreaterThan(40)
      expect(pick.font.weights).toContain(400)
    }
  })
})

describe('Google Fonts export', () => {
  it('exports a working import before the rules, with the selected weights', () => {
    const exported = createFontExport(headingFonts[0], bodyFonts.dm)
    expect(exported.importRule).toBe("@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Playfair+Display:wght@600&display=swap');")
    expect(exported.css.startsWith(exported.importRule)).toBe(true)
    expect(exported.rules).toContain("font-family: 'Playfair Display', serif; font-weight: 600;")
    expect(exported.rules).toContain("font-family: 'DM Sans', sans-serif; font-weight: 400;")
  })
  it('merges duplicate font requests and sorts weights', () => {
    expect(googleFontsUrl([{ family: 'Inter', weights: [600, 400] }, { family: 'Inter', weights: [400, 500] }]))
      .toBe('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap')
  })
  it('uses supported static weights for single-style heading fonts', () => {
    const heading = headingFonts.find(font => font.family === 'Bebas Neue')!
    const result = createFontExport(heading, bodyFonts.lato)
    expect(result.url).toContain('Bebas+Neue:wght@400')
    expect(result.rules).toContain("'Bebas Neue', sans-serif; font-weight: 400")
  })
})
