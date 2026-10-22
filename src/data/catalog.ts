export const CATALOG_VERSION = 1
export const CATALOG_TTL = 24 * 60 * 60 * 1000
export const METADATA_URL = 'https://fonts.google.com/metadata/fonts'
export const categories = ['serif', 'sans-serif', 'display', 'handwriting', 'monospace'] as const
export type FontCategory = typeof categories[number]
export type FontStyle = 'normal' | 'italic'
export interface FontVariant { weight: number; style: FontStyle }
export interface FontAxis { tag: string; min: number; max: number; default: number }
export interface FontFamily {
  family: string
  category: FontCategory
  variants: FontVariant[]
  axes: FontAxis[]
  subsets: string[]
  primaryScript: string
  display: boolean
}
export interface FontSelection extends FontFamily { weight: number; style: FontStyle }
export interface FontCatalog { version: number; updatedAt: string; fonts: FontFamily[] }

const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const safeName = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length < 150 && !/[\x00-\x1f<>]/.test(value)
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === 'string')

export function isCatalog(value: unknown): value is FontCatalog {
  if (!record(value) || value.version !== CATALOG_VERSION || typeof value.updatedAt !== 'string' || !Number.isFinite(Date.parse(value.updatedAt)) || !Array.isArray(value.fonts) || value.fonts.length < 1000) return false
  const names = new Set<string>()
  return value.fonts.every(font => {
    if (!record(font) || !safeName(font.family) || names.has(font.family) || !categories.includes(font.category as FontCategory) || !Array.isArray(font.variants) || !font.variants.length || !Array.isArray(font.axes) || !strings(font.subsets) || typeof font.primaryScript !== 'string' || typeof font.display !== 'boolean') return false
    names.add(font.family)
    return font.variants.every(variant => record(variant) && finite(variant.weight) && variant.weight >= 1 && variant.weight <= 1000 && ['normal', 'italic'].includes(String(variant.style))) && font.axes.every(axis => record(axis) && typeof axis.tag === 'string' && /^[A-Za-z0-9]{4}$/.test(axis.tag) && finite(axis.min) && finite(axis.max) && finite(axis.default) && axis.min <= axis.default && axis.default <= axis.max)
  })
}

/** Google's public site metadata is official, but not a versioned API. Reject schema changes. */
export function normalizeMetadata(text: string, now = new Date()): FontCatalog {
  const raw: unknown = JSON.parse(text.slice(text.indexOf('{')))
  if (!record(raw) || !Array.isArray(raw.familyMetadataList)) throw new Error('Google Fonts metadata format changed')
  const fonts = raw.familyMetadataList.map((item): FontFamily => {
    if (!record(item) || !safeName(item.family) || typeof item.category !== 'string' || !record(item.fonts) || !strings(item.subsets) || !Array.isArray(item.axes)) throw new Error('Incomplete font metadata')
    const variants = Object.keys(item.fonts).map(key => {
      const match = /^(\d{1,4})(i?)$/.exec(key)
      if (!match) throw new Error('Unknown font variant')
      return { weight: Number(match[1]), style: match[2] ? 'italic' as const : 'normal' as const }
    }).sort((a, b) => a.weight - b.weight || a.style.localeCompare(b.style))
    return {
      family: item.family,
      category: item.category.toLowerCase().replaceAll(' ', '-') as FontCategory,
      variants,
      axes: item.axes.map(axis => {
        if (!record(axis)) throw new Error('Unknown font axis')
        return { tag: String(axis.tag), min: Number(axis.min), max: Number(axis.max), default: Number(axis.defaultValue) }
      }),
      subsets: item.subsets.filter(subset => subset !== 'menu'),
      primaryScript: typeof item.primaryScript === 'string' ? item.primaryScript : '',
      display: strings(item.classifications) && item.classifications.includes('Display'),
    }
  }).sort((a, b) => a.family.localeCompare(b.family, 'en'))
  const catalog = { version: CATALOG_VERSION, updatedAt: now.toISOString(), fonts }
  if (!isCatalog(catalog)) throw new Error('Google Fonts catalog failed validation')
  return catalog
}
