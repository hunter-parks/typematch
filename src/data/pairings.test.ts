import { describe, expect, it } from 'vitest'
import { getRecommendations } from './pairings'
import { catalog, family } from '../test/catalogFixture'

describe('deterministic pairing rules', () => {
  it('gives every catalog heading three distinct paragraph choices, never itself', () => {
    for (const heading of catalog.fonts) {
      const picks = getRecommendations(heading, catalog.fonts)
      expect(picks.map(pick => pick.label)).toEqual(['Balanced', 'Modern', 'Expressive / Editorial'])
      expect(new Set(picks.map(pick => pick.font.family)).size, heading.family).toBe(3)
      for (const pick of picks) {
        expect(pick.font.family).not.toBe(heading.family)
        expect(pick.font.weight).toBe(400)
        expect(pick.font.style).toBe('normal')
        expect(['serif', 'sans-serif']).toContain(pick.font.category)
        expect(pick.explanation).toContain(heading.family)
      }
    }
  })
  it('varies curated choices across all categories and repeats deterministically', () => {
    const names = ['Playfair Display', 'Bitter', 'Montserrat', 'Inter', 'Nunito', 'Oswald', 'Caveat', 'Roboto Mono', 'Bungee', 'Lora']
    const picks = names.map(name => getRecommendations(family(name), catalog.fonts))
    expect(new Set(picks.flatMap(items => items.map(pick => pick.font.family))).size).toBeGreaterThanOrEqual(14)
    expect(getRecommendations(family('Montserrat'), [...catalog.fonts].reverse())).toEqual(picks[2])
  })
  it.each([['Noto Naskh Arabic', 'arabic'], ['Noto Sans JP', 'japanese'], ['Noto Sans Devanagari', 'devanagari'], ['Playfair Display', 'cyrillic']])('prioritizes %s script coverage', (name, subset) => {
    expect(getRecommendations(family(name), catalog.fonts, subset).every(pick => pick.font.subsets.includes(subset))).toBe(true)
  })
  it('explains missing coverage instead of claiming an unsupported language', () => {
    const picks = getRecommendations(family('Noto Sans Avestan'), catalog.fonts, 'avestan')
    expect(picks.every(pick => pick.coverage.includes('lacks that subset'))).toBe(true)
  })
  it('uses known metadata for unfamiliar headings', () => {
    const heading = { ...family('Lora'), family: 'Unfamiliar Serif' }
    expect(getRecommendations(heading, catalog.fonts)).toHaveLength(3)
    expect(getRecommendations(heading, catalog.fonts)[0].explanation).toContain('serif structure')
  })
})
