import { fontStack, type FontFamily } from '../data/fonts'

export function googleFontsUrl(fonts: Pick<FontFamily, 'family' | 'weights'>[]): string {
  const families = new Map<string, Set<number>>()
  for (const { family, weights } of fonts) {
    const unique = families.get(family) ?? new Set<number>()
    weights.forEach(weight => unique.add(weight))
    families.set(family, unique)
  }
  const params = [...families].sort(([a], [b]) => a.localeCompare(b)).map(([family, weights]) =>
    `family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@${[...weights].sort((a, b) => a - b).join(';')}`,
  )
  return `https://fonts.googleapis.com/css2?${params.join('&')}&display=swap`
}

export function createFontExport(heading: FontFamily, body: FontFamily) {
  const url = googleFontsUrl([{ ...heading, weights: [heading.headingWeight] }, body])
  const importRule = `@import url('${url}');`
  const rules = `h1, h2, h3 { font-family: ${fontStack(heading)}; font-weight: ${heading.headingWeight}; }\nbody { font-family: ${fontStack(body)}; font-weight: 400; }`
  return { url, importRule, rules, css: `${importRule}\n\n${rules}\n` }
}
