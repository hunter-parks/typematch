import { fontStack, type FontSelection } from '../data/fonts'
import type { FontAxis } from '../data/catalog'

export function googleFontsUrl(fonts: (Pick<FontSelection, 'family' | 'weight' | 'style'> & Partial<Pick<FontSelection, 'axes'>>)[]): string {
  const families = new Map<string, { variants: Map<string, { weight: number; style: string }>; optical?: FontAxis }>()
  for (const font of fonts) {
    const entry = families.get(font.family) ?? { variants: new Map(), optical: font.axes?.find(axis => axis.tag === 'opsz' && axis.min < axis.max) }
    entry.variants.set(`${font.style}:${font.weight}`, { weight: font.weight, style: font.style })
    families.set(font.family, entry)
  }
  const params = [...families].sort(([a], [b]) => a.localeCompare(b, 'en')).map(([family, { variants, optical }]) => {
    const list = [...variants.values()].sort((a, b) => Number(a.style === 'italic') - Number(b.style === 'italic') || a.weight - b.weight)
    const italic = list.some(variant => variant.style === 'italic')
    const values = list.map(variant => `${italic ? `${variant.style === 'italic' ? 1 : 0},` : ''}${optical ? `${optical.min}..${optical.max},` : ''}${variant.weight}`)
    return `family=${encodeURIComponent(family).replace(/%20/g, '+').replaceAll("'", '%27')}:${italic ? 'ital,' : ''}${optical ? 'opsz,' : ''}wght@${values.join(';')}`
  })
  return `https://fonts.googleapis.com/css2?${params.join('&')}&display=swap`
}
export function createFontExport(heading: FontSelection, body: FontSelection) {
  const url = googleFontsUrl([heading, body])
  const importRule = `@import url('${url}');`
  const declaration = (font: FontSelection) => `font-family: ${fontStack(font)}; font-weight: ${font.weight}; font-style: ${font.style};${font.axes.some(axis => axis.tag === 'opsz') ? ' font-optical-sizing: auto;' : ''}`
  const rules = `h1, h2, h3, h4, h5, h6 { ${declaration(heading)} }\nbody { ${declaration(body)} }`
  return { url, importRule, rules, css: `${importRule}\n\n${rules}\n` }
}
