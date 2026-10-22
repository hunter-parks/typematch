import snapshot from '../../public/fonts-catalog.json' with { type: 'json' }
import type { FontCatalog } from '../data/catalog'
import { selectFont } from '../data/fonts'
export const catalog = snapshot as FontCatalog
export const family = (name: string) => {
  const font = catalog.fonts.find(item => item.family === name)
  if (!font) throw new Error(`Missing test font: ${name}`)
  return font
}
export const selected = (name: string, weight = 600, style: 'normal' | 'italic' = 'normal') => selectFont(family(name), weight, style)
