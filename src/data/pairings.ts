import { categoryLabel, defaultSubset, selectFont, subsetLabel, supportsWeight, type FontFamily, type FontSelection } from './fonts'

type Character = 'contrast' | 'classic' | 'slab' | 'geometric' | 'grotesk' | 'humanist' | 'rounded' | 'condensed' | 'handwriting' | 'monospace' | 'display'
const headingGroups: Record<Character, string[]> = {
  contrast: ['Playfair Display', 'Playfair', 'Bodoni Moda', 'Libre Bodoni', 'DM Serif Display', 'Abril Fatface', 'Prata', 'Cormorant Garamond'],
  classic: ['Lora', 'Merriweather', 'Libre Baskerville', 'Source Serif 4', 'EB Garamond', 'Spectral', 'Crimson Pro'],
  slab: ['Bitter', 'Roboto Slab', 'Arvo', 'Zilla Slab', 'Rokkitt'],
  geometric: ['Montserrat', 'Poppins', 'Outfit', 'Sora', 'Raleway', 'Futura', 'Josefin Sans', 'Jost'],
  grotesk: ['Inter', 'Roboto', 'Roboto Flex', 'Space Grotesk', 'Archivo', 'DM Sans', 'Manrope', 'Work Sans'],
  humanist: ['Source Sans 3', 'Lato', 'Open Sans', 'PT Sans', 'Noto Sans', 'Fira Sans', 'IBM Plex Sans'],
  rounded: ['Nunito', 'Nunito Sans', 'Quicksand', 'Comfortaa', 'Varela Round'],
  condensed: ['Oswald', 'Bebas Neue', 'Anton', 'Barlow Condensed', 'Roboto Condensed', 'Archivo Narrow'],
  handwriting: [], monospace: [], display: [],
}
const descriptions: Record<Character, string> = {
  contrast: 'high-contrast serifs', classic: 'serif structure', slab: 'sturdy serifs', geometric: 'geometric shapes', grotesk: 'restrained sans forms', humanist: 'humanist shapes', rounded: 'rounded shapes', condensed: 'compact headings', handwriting: 'handwritten forms', monospace: 'fixed-width rhythm', display: 'display character',
}
function characterOf(font: FontFamily): Character {
  const known = (Object.keys(headingGroups) as Character[]).find(key => headingGroups[key].includes(font.family))
  if (known) return known
  if (font.category === 'handwriting' || font.category === 'monospace') return font.category
  if (font.display || font.category === 'display') return 'display'
  if (font.category === 'serif') return font.variants.some(variant => variant.style === 'italic') ? 'classic' : 'slab'
  return font.axes.some(axis => axis.tag === 'opsz') ? 'grotesk' : 'humanist'
}

// These descriptions and preferences are editorial choices, not measured compatibility scores.
export const bodyNotes: Record<string, string> = {
  'DM Sans': 'open, low-contrast forms', 'Source Sans 3': 'humanist shapes and open counters',
  'Lato': 'warm curves and steady text texture', 'Inter': 'a tall x-height and clear small text',
  'Lora': 'brushed curves and moderate serif contrast', 'Source Serif 4': 'a text-oriented serif with optical sizing',
  'Spectral': 'a literary serif texture', 'Literata': 'book-oriented forms and optical sizing',
  'Merriweather': 'sturdy serifs and a generous x-height', 'PT Serif': 'a robust, traditional serif texture',
  'Crimson Pro': 'a compact, bookish serif rhythm', 'EB Garamond': 'old-style proportions and a literary tone',
  'Libre Baskerville': 'wide, open serif forms', 'Noto Serif': 'a restrained serif texture',
  'Open Sans': 'open counters and neutral proportions', 'IBM Plex Sans': 'humanist details within a structured sans',
  'Work Sans': 'plain, open shapes for screen text', 'Public Sans': 'sturdy, unadorned letterforms',
  'Fira Sans': 'distinct letterforms and humanist proportions', 'PT Sans': 'open, practical sans forms',
  'Nunito Sans': 'soft details and an even text rhythm', 'Karla': 'a spacious, informal sans rhythm',
  'Assistant': 'a light, open sans texture', 'Noto Sans': 'neutral shapes across many scripts',
  'Atkinson Hyperlegible Next': 'deliberately differentiated letterforms', 'Barlow': 'slightly narrow, low-contrast forms',
  'Roboto': 'familiar, economical sans forms', 'Noto Naskh Arabic': 'a Naskh structure for continuous Arabic text',
  'Noto Sans Arabic': 'a restrained Arabic sans texture', 'IBM Plex Sans Arabic': 'a structured Arabic sans texture',
  'Amiri': 'traditional Naskh forms for Arabic reading', 'Vazirmatn': 'open Persian and Arabic text forms',
  'Noto Sans JP': 'a neutral Japanese Gothic texture', 'Noto Serif JP': 'a Japanese Mincho texture',
  'BIZ UDPGothic': 'distinct Japanese Gothic forms', 'BIZ UDPMincho': 'a clear Japanese Mincho structure',
  'Noto Sans SC': 'a neutral Simplified Chinese sans texture', 'Noto Serif SC': 'a Simplified Chinese Song-style texture',
  'Noto Sans TC': 'a neutral Traditional Chinese sans texture', 'Noto Serif TC': 'a Traditional Chinese serif texture',
  'Noto Sans KR': 'a restrained Korean sans texture', 'Noto Serif KR': 'a Korean serif texture',
  'Noto Sans Devanagari': 'open Devanagari text forms', 'Noto Serif Devanagari': 'a formal Devanagari serif texture',
  'Hind': 'clear Devanagari forms for screen text', 'Mukta': 'a balanced Devanagari text rhythm',
  'Noto Sans Hebrew': 'a restrained Hebrew sans texture', 'Noto Serif Hebrew': 'a Hebrew serif texture',
  'Heebo': 'open Hebrew sans forms', 'Noto Sans Thai': 'an even Thai text texture',
  'Noto Serif Thai': 'a formal Thai serif texture', 'Sarabun': 'Thai forms designed for continuous text',
}
// Each tuple gives a distinct starting point for Balanced, Modern, and Editorial.
const preferences: Record<Character, [string[], string[], string[]]> = {
  contrast: [['DM Sans', 'Lato', 'Open Sans'], ['Source Sans 3', 'Inter', 'Public Sans'], ['Lora', 'Spectral', 'Literata']],
  classic: [['Source Sans 3', 'Lato', 'PT Sans'], ['Inter', 'Work Sans', 'Public Sans'], ['Literata', 'Spectral', 'Crimson Pro']],
  slab: [['Open Sans', 'Source Sans 3', 'Nunito Sans'], ['Work Sans', 'IBM Plex Sans', 'Inter'], ['Source Serif 4', 'PT Serif', 'Lora']],
  geometric: [['Source Sans 3', 'Open Sans', 'Fira Sans'], ['Work Sans', 'Inter', 'Public Sans'], ['Source Serif 4', 'Lora', 'Spectral']],
  grotesk: [['Lato', 'Source Sans 3', 'Open Sans'], ['IBM Plex Sans', 'Public Sans', 'Work Sans'], ['Literata', 'Merriweather', 'Crimson Pro']],
  humanist: [['Source Serif 4', 'Lora', 'Noto Serif'], ['DM Sans', 'Inter', 'Work Sans'], ['EB Garamond', 'Spectral', 'PT Serif']],
  rounded: [['Open Sans', 'Lato', 'Fira Sans'], ['Public Sans', 'Inter', 'IBM Plex Sans'], ['Libre Baskerville', 'PT Serif', 'Literata']],
  condensed: [['Source Sans 3', 'Open Sans', 'Lato'], ['Roboto', 'Inter', 'Work Sans'], ['Merriweather', 'Source Serif 4', 'PT Serif']],
  handwriting: [['Nunito Sans', 'Lato', 'Source Sans 3'], ['Karla', 'DM Sans', 'Public Sans'], ['Lora', 'Crimson Pro', 'Spectral']],
  monospace: [['IBM Plex Sans', 'Source Sans 3', 'Open Sans'], ['Inter', 'Public Sans', 'Work Sans'], ['PT Serif', 'Source Serif 4', 'Literata']],
  display: [['Atkinson Hyperlegible Next', 'Source Sans 3', 'Open Sans'], ['Barlow', 'Inter', 'DM Sans'], ['Spectral', 'Lora', 'Merriweather']],
}
export interface Recommendation { font: FontSelection; label: 'Balanced' | 'Modern' | 'Expressive / Editorial'; explanation: string; coverage: string }
const bodyCache = new WeakMap<FontFamily[], FontFamily[]>()
export function getRecommendations(heading: FontFamily, catalog: FontFamily[], subset = defaultSubset(heading)): Recommendation[] {
  const character = characterOf(heading)
  const used = new Set([heading.family])
  let candidates = bodyCache.get(catalog)
  if (!candidates) {
    candidates = catalog.filter(font => (bodyNotes[font.family] || (/^Noto (Sans|Serif) /.test(font.family) && ['serif', 'sans-serif'].includes(font.category) && !font.display)) && supportsWeight(font, 400, 'normal'))
    bodyCache.set(catalog, candidates)
  }
  const options: Recommendation[] = []
  const labels = ['Balanced', 'Modern', 'Expressive / Editorial'] as const
  for (const [index, label] of labels.entries()) {
    const preferred = preferences[character][index]
    // Lexicographic priorities: script coverage, direction, curated preference, weight range, italics, name.
    // No random tie-breaker, popularity proxy, or displayed compatibility percentage.
    const rank = (font: FontFamily) => [
      font.subsets.includes(subset) ? 0 : 1,
      index === 2 ? (font.category === 'serif' ? 0 : 1) : index === 1 ? (font.category === 'sans-serif' ? 0 : 1) : 0,
      preferred.includes(font.family) ? preferred.indexOf(font.family) : preferred.length,
      supportsWeight(font, 600, 'normal') || supportsWeight(font, 700, 'normal') ? 0 : 1,
      supportsWeight(font, 400, 'italic') ? 0 : 1,
    ]
    const sorted = candidates.filter(font => !used.has(font.family)).map(font => ({ font, rank: rank(font) })).sort((a, b) => {
      const ra = a.rank, rb = b.rank
      for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return ra[i] - rb[i]
      return a.font.family.localeCompare(b.font.family, 'en')
    })
    const font = sorted[0]?.font
    if (!font) break
    used.add(font.family)
    const relation = index === 0 ? `balance ${heading.family}’s ${descriptions[character]}` : index === 1 ? `give ${heading.family} a cleaner, screen-focused companion` : `bring a reading-oriented editorial voice beside ${heading.family}`
    const coverage = font.subsets.includes(subset) ? `${subsetLabel(subset)} subset available in both fonts.` : `No further curated ${subsetLabel(subset)} body match. This option lacks that subset; use it only for supported text.`
    const details = bodyNotes[font.family] ?? `regular-weight ${categoryLabel(font.category).toLowerCase()} forms (a metadata-based fallback)`
    options.push({ font: selectFont(font, 400), label, explanation: `${font.family}’s ${details} ${relation}.`, coverage })
  }
  return options
}

export function pairingSummary(heading: FontFamily) {
  return `${categoryLabel(heading.category)} headings with ${descriptions[characterOf(heading)]}. These picks prioritize paragraph text and your chosen script; they are editorial suggestions, not compatibility scores.`
}
