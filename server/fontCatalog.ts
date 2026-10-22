import { CATALOG_TTL, METADATA_URL, normalizeMetadata, type FontCatalog } from '../src/data/catalog.ts'

let cached: FontCatalog | undefined
let pending: Promise<FontCatalog> | undefined
export function fetchCatalog(): Promise<FontCatalog> {
  if (cached && Date.now() - Date.parse(cached.updatedAt) < CATALOG_TTL) return Promise.resolve(cached)
  if (pending) return pending
  pending = fetch(METADATA_URL, { signal: AbortSignal.timeout(10000) })
    .then(async response => {
      if (!response.ok) throw new Error(`Google Fonts returned ${response.status}`)
      cached = normalizeMetadata(await response.text())
      return cached
    }).finally(() => { pending = undefined })
  return pending
}
