import { describe, expect, it } from 'vitest'
import { isCatalog, normalizeMetadata } from './catalog'
import { createFontSearch, selectFont, stylesFor } from './fonts'
import { catalog, family } from '../test/catalogFixture'

describe('official catalog', () => {
  it('contains the complete saved metadata and all five categories', () => {
    expect(isCatalog(catalog)).toBe(true)
    expect(catalog.fonts.length).toBeGreaterThan(1900)
    expect(new Set(catalog.fonts.map(font => font.category)).size).toBe(5)
    expect(stylesFor(family('Playfair Display'))).toEqual(['normal', 'italic'])
    expect(family('Roboto Flex').axes.find(axis => axis.tag === 'wght')).toMatchObject({ min: 100, max: 1000 })
  })
  it('normalizes Google variants, anti-XSSI prefix, categories and numeric axis tags', () => {
    const metadata = { familyMetadataList: catalog.fonts.map(font => ({ ...font, category: font.category.replace('-', ' '), classifications: font.display ? ['Display'] : [], fonts: Object.fromEntries(font.variants.map(variant => [`${variant.weight}${variant.style === 'italic' ? 'i' : ''}`, {}])), axes: font.axes.map(axis => ({ ...axis, defaultValue: axis.default })) })) }
    expect(normalizeMetadata(")]}'\n" + JSON.stringify(metadata), new Date(catalog.updatedAt))).toEqual(catalog)
  })
  it('rejects truncated, duplicated and malformed data instead of poisoning the cache', () => {
    expect(isCatalog({ ...catalog, fonts: [] })).toBe(false)
    expect(isCatalog({ ...catalog, fonts: [...catalog.fonts, catalog.fonts[0]] })).toBe(false)
    expect(isCatalog({ ...catalog, fonts: [{ ...catalog.fonts[0], variants: [{ weight: 4000, style: 'normal' }] }, ...catalog.fonts.slice(1)] })).toBe(false)
    expect(() => normalizeMetadata('{"changed":[]}')).toThrow()
  })
  it('searches the entire catalog by tokens and category without changing the source', () => {
    const search = createFontSearch(catalog.fonts)
    expect(search('  SANS  noto ').length).toBeGreaterThan(50)
    expect(search('ROBOTO MONO').map(font => font.family)).toEqual(['Roboto Mono'])
    expect(search('noto', 'serif').every(font => font.category === 'serif')).toBe(true)
    expect(search('zzyx')).toEqual([])
    expect(search('')).toHaveLength(catalog.fonts.length)
  })
  it('selects valid weights and styles for variable, static and italic-only families', () => {
    expect(selectFont(family('Roboto Flex'), 537).weight).toBe(537)
    expect(selectFont(family('Bebas Neue'), 600, 'italic')).toMatchObject({ weight: 400, style: 'normal' })
    const italic = { ...family('Lora'), variants: [{ weight: 400, style: 'italic' as const }], axes: [] }
    expect(selectFont(italic)).toMatchObject({ weight: 400, style: 'italic' })
  })
})
