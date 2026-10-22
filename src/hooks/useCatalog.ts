import { useEffect, useState } from 'react'
import seed from '../data/seed-fonts.json'
import { CATALOG_TTL, isCatalog, type FontCatalog } from '../data/catalog'

export const CATALOG_CACHE_KEY = 'typematch:catalog:v1'
export const seedCatalog = seed as FontCatalog
export function readCatalogCache(): FontCatalog | undefined {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(CATALOG_CACHE_KEY) ?? 'null')
    if (isCatalog(value) && Date.parse(value.updatedAt) <= Date.now() + 300000) return value
  } catch { /* Storage can be disabled or contain an old, damaged cache. */ }
}
function saveCatalog(catalog: FontCatalog) {
  try { localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(catalog)) } catch { /* The in-memory catalog still works when storage is full. */ }
}
async function getCatalog(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(12000)]) })
  if (!response.ok) throw new Error('Catalog unavailable')
  const value: unknown = await response.json()
  if (!isCatalog(value) || Date.parse(value.updatedAt) > Date.now() + 300000) throw new Error('Invalid catalog')
  return value
}

export function useCatalog() {
  const [catalog, setCatalog] = useState(() => readCatalogCache() ?? seedCatalog)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    let current = readCatalogCache()
    let busy = false
    async function refresh(force = false) {
      if (busy) return
      busy = true
      setStatus('loading')
      try {
        if (!current) {
          try { current = await getCatalog(`${import.meta.env.BASE_URL}fonts-catalog.json`, controller.signal) }
          catch {
            if (controller.signal.aborted) return
            current = await getCatalog('/api/fonts', controller.signal)
          }
          if (controller.signal.aborted) return
          setCatalog(current)
          saveCatalog(current)
        }
        if (force || Date.now() - Date.parse(current.updatedAt) >= CATALOG_TTL) {
          const fresh = await getCatalog('/api/fonts', controller.signal)
          if (controller.signal.aborted) return
          if (Date.parse(fresh.updatedAt) >= Date.parse(current.updatedAt)) {
            current = fresh
            setCatalog(fresh)
            saveCatalog(fresh)
          }
        }
        if (!controller.signal.aborted) setStatus('ready')
      } catch {
        if (!controller.signal.aborted) setStatus('error')
      } finally { busy = false }
    }
    void refresh(attempt > 0)
    // Refresh checks run hourly while open; Google metadata is fetched only once stale.
    const interval = window.setInterval(() => {
      if (!document.hidden) void refresh()
    }, 60 * 60 * 1000)
    return () => { controller.abort(); clearInterval(interval) }
  }, [attempt])
  return { catalog, status, partial: catalog.fonts.length < 1000, retry: () => setAttempt(value => value + 1) }
}
