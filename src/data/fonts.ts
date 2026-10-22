export type FontCategory = 'serif' | 'sans-serif' | 'display'
export type FontProfile = 'editorial' | 'modern' | 'expressive'

export interface FontFamily {
  family: string
  category: FontCategory
  weights: number[]
  headingWeight: number
  profile: FontProfile
}

const font = (family: string, category: FontCategory, profile: FontProfile, weights = [400, 600], headingWeight = 600): FontFamily =>
  ({ family, category, profile, weights, headingWeight })

// A deliberately bounded catalog. Every family is available from Google Fonts.
export const headingFonts: FontFamily[] = [
  font('Playfair Display', 'serif', 'editorial'),
  font('Playfair', 'serif', 'editorial'),
  font('Play', 'sans-serif', 'modern', [400, 700], 700),
  font('Lora', 'serif', 'editorial'),
  font('Cormorant Garamond', 'serif', 'editorial'),
  font('DM Serif Display', 'serif', 'expressive', [400], 400),
  font('Libre Baskerville', 'serif', 'editorial', [400, 700], 700),
  font('Merriweather', 'serif', 'editorial'),
  font('Fraunces', 'serif', 'expressive'),
  font('Bodoni Moda', 'serif', 'editorial'),
  font('Roboto Slab', 'serif', 'editorial'),
  font('Bitter', 'serif', 'editorial'),
  font('Montserrat', 'sans-serif', 'modern'),
  font('Poppins', 'sans-serif', 'modern'),
  font('Inter', 'sans-serif', 'modern'),
  font('Raleway', 'sans-serif', 'modern'),
  font('DM Sans', 'sans-serif', 'modern'),
  font('Space Grotesk', 'sans-serif', 'modern'),
  font('Outfit', 'sans-serif', 'modern'),
  font('Manrope', 'sans-serif', 'modern'),
  font('Oswald', 'sans-serif', 'expressive'),
  font('Bebas Neue', 'sans-serif', 'expressive', [400], 400),
  font('Anton', 'sans-serif', 'expressive', [400], 400),
  font('Abril Fatface', 'display', 'expressive', [400], 400),
  font('Source Serif 4', 'serif', 'editorial'),
  font('Sora', 'sans-serif', 'modern'),
  font('Work Sans', 'sans-serif', 'modern'),
  font('Archivo', 'sans-serif', 'modern'),
]

export const bodyFonts = {
  dm: font('DM Sans', 'sans-serif', 'modern', [400, 500], 500),
  source: font('Source Sans 3', 'sans-serif', 'modern', [400, 600]),
  lato: font('Lato', 'sans-serif', 'modern', [400, 700], 700),
  inter: font('Inter', 'sans-serif', 'modern', [400, 500], 500),
  lora: font('Lora', 'serif', 'editorial', [400, 500], 500),
  serif: font('Source Serif 4', 'serif', 'editorial'),
} satisfies Record<string, FontFamily>

export interface Recommendation {
  font: FontFamily
  label: string
  explanation: string
}

export function getRecommendations(heading: FontFamily): Recommendation[] {
  const name = heading.family === 'Playfair Display' ? 'Playfair' : heading.family
  if (heading.profile === 'modern') {
    return [
      { font: bodyFonts.serif, label: 'Editorial', explanation: `Source Serif 4 adds a quiet, literary texture beneath ${name}’s clean lines.` },
      { font: bodyFonts.lora, label: 'Warm', explanation: `Lora’s brushed curves bring warmth and a distinct rhythm to ${name}’s structured headings.` },
      { font: heading.family === 'Inter' ? bodyFonts.dm : bodyFonts.inter, label: 'Minimal', explanation: `A restrained sans keeps the page cohesive. Use size and weight to give ${name} the lead.` },
    ]
  }
  if (heading.profile === 'expressive') {
    return [
      { font: bodyFonts.dm, label: 'Balanced', explanation: `Open, simple letterforms balance ${name}’s strong personality without adding visual noise.` },
      { font: bodyFonts.inter, label: 'Clear', explanation: `Inter’s even rhythm gives the eye a calm place to land after ${name}’s expressive headings.` },
      { font: bodyFonts.source, label: 'Editorial', explanation: `Humanist proportions keep longer passages comfortable beside ${name}’s distinctive shapes.` },
    ]
  }
  return [
    { font: bodyFonts.dm, label: 'Balanced', explanation: `Its open, geometric forms give ${name}’s expressive serifs room to shine.` },
    { font: bodyFonts.source, label: 'Editorial', explanation: 'Humanist shapes soften the contrast; a clear, comfortable read in longer stories.' },
    { font: bodyFonts.lato, label: 'Friendly', explanation: `Warm curves echo ${name}’s round forms without competing with its detail.` },
  ]
}

export const categoryLabel = (category: FontCategory) => category === 'sans-serif' ? 'Sans serif' : category === 'serif' ? 'Serif' : 'Display'
export const fontStack = (font: FontFamily) => `'${font.family}', ${font.category === 'sans-serif' ? 'sans-serif' : 'serif'}`

export function searchFonts(query: string): FontFamily[] {
  const normalized = query.trim().toLocaleLowerCase()
  return headingFonts.filter(({ family }) => family.toLocaleLowerCase().includes(normalized))
}
