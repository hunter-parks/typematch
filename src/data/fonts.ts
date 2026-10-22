import type { FontCategory, FontFamily, FontSelection, FontStyle } from './catalog'
export type { FontCategory, FontFamily, FontSelection, FontStyle } from './catalog'

export const categoryLabel = (category: FontCategory) => ({ 'sans-serif': 'Sans serif', serif: 'Serif', display: 'Display', handwriting: 'Handwriting', monospace: 'Monospace' })[category]
export const cssFamily = (family: string) => `'${family.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`
export const fontStack = (font: FontFamily) => `${cssFamily(font.family)}, ${font.category === 'monospace' ? 'monospace' : font.category === 'sans-serif' ? 'sans-serif' : font.category === 'handwriting' ? 'cursive' : 'serif'}`
export const stylesFor = (font: FontFamily): FontStyle[] => [...new Set(font.variants.map(variant => variant.style))].sort().reverse()
export const weightsFor = (font: FontFamily, style: FontStyle) => [...new Set(font.variants.filter(variant => variant.style === style).map(variant => variant.weight))].sort((a, b) => a - b)
export const weightRange = (font: FontFamily) => font.axes.find(axis => axis.tag === 'wght')
export const supportsWeight = (font: FontFamily, weight: number, style: FontStyle) => {
  if (!stylesFor(font).includes(style) || !Number.isFinite(weight)) return false
  const range = weightRange(font)
  return range ? weight >= range.min && weight <= range.max : weightsFor(font, style).includes(weight)
}
export function selectFont(font: FontFamily, requestedWeight = 600, requestedStyle: FontStyle = 'normal'): FontSelection {
  const style = stylesFor(font).includes(requestedStyle) ? requestedStyle : stylesFor(font)[0]
  const weights = weightsFor(font, style)
  const weight = supportsWeight(font, requestedWeight, style) ? requestedWeight : weights.reduce((best, value) => Math.abs(value - requestedWeight) < Math.abs(best - requestedWeight) ? value : best)
  return { ...font, weight, style }
}
export const weightLabel = (font: FontFamily) => {
  const range = weightRange(font)
  return range ? `${range.min}–${range.max} variable` : [...new Set(font.variants.map(variant => variant.weight))].sort((a, b) => a - b).join(' / ')
}
export const textSubsets = (font: FontFamily) => font.subsets.filter(subset => !['math', 'symbols', 'symbols2', 'music', 'emoji', 'latin-ext', 'cyrillic-ext', 'greek-ext', 'devanagari-ext'].includes(subset))
const scriptSubsets: Record<string, string> = { Arab: 'arabic', Jpan: 'japanese', Hans: 'chinese-simplified', Hant: 'chinese-traditional', Kore: 'korean', Deva: 'devanagari', Hebr: 'hebrew', Thai: 'thai', Beng: 'bengali', Taml: 'tamil', Telu: 'telugu', Gujr: 'gujarati', Guru: 'gurmukhi', Knda: 'kannada', Mlym: 'malayalam', Cyrl: 'cyrillic', Grek: 'greek' }
export const defaultSubset = (font: FontFamily) => {
  const primary = scriptSubsets[font.primaryScript]
  return primary && font.subsets.includes(primary) ? primary : font.subsets.includes('latin') ? 'latin' : textSubsets(font)[0] ?? font.subsets[0] ?? 'latin'
}
export const subsetLabel = (subset: string) => subset.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')

const normalizeSearch = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
export function createFontSearch(fonts: FontFamily[]) {
  const index = fonts.map(font => ({ font, name: normalizeSearch(font.family) }))
  return (query: string, category: FontCategory | 'all' = 'all') => {
    const words = normalizeSearch(query).split(/\s+/)
    return index.filter(item => (category === 'all' || item.font.category === category) && words.every(word => item.name.includes(word))).map(item => item.font)
  }
}
