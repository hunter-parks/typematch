import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CATALOG_CACHE_KEY, readCatalogCache, useCatalog } from './useCatalog'
import { catalog } from '../test/catalogFixture'

const current = () => ({ ...catalog, updatedAt: new Date().toISOString() })
const response = (data: unknown) => Promise.resolve(new Response(JSON.stringify(data)))
beforeEach(() => localStorage.clear())
afterEach(() => { vi.unstubAllGlobals(); localStorage.clear() })

describe('catalog loading and cache', () => {
  it('uses a fresh cache without a network request', async () => {
    localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(current()))
    const fetcher = vi.fn()
    vi.stubGlobal('fetch', fetcher)
    const { result } = renderHook(useCatalog)
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.catalog.fonts).toHaveLength(catalog.fonts.length)
    expect(fetcher).not.toHaveBeenCalled()
  })
  it('keeps stale data on refresh failure and recovers on retry', async () => {
    localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify({ ...catalog, updatedAt: '2020-01-01T00:00:00Z' }))
    const fetcher = vi.fn().mockRejectedValueOnce(new Error('Offline')).mockImplementationOnce(() => response(current()))
    vi.stubGlobal('fetch', fetcher)
    const { result } = renderHook(useCatalog)
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.catalog.fonts).toHaveLength(catalog.fonts.length)
    act(() => result.current.retry())
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(readCatalogCache()?.updatedAt).not.toContain('2020')
  })
  it('discards invalid storage and loads the bundled snapshot', async () => {
    localStorage.setItem(CATALOG_CACHE_KEY, '{broken')
    const fetcher = vi.fn(() => response(current()))
    vi.stubGlobal('fetch', fetcher)
    const { result } = renderHook(useCatalog)
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(fetcher.mock.calls).toHaveLength(1)
    expect(readCatalogCache()?.fonts).toHaveLength(catalog.fonts.length)
  })
  it('retains starter choices when snapshot and refresh both fail, then retries', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('Offline'))
    vi.stubGlobal('fetch', fetcher)
    const { result } = renderHook(useCatalog)
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.partial).toBe(true)
    fetcher.mockImplementation(() => response(current()))
    act(() => result.current.retry())
    await waitFor(() => expect(result.current.partial).toBe(false))
    await waitFor(() => expect(result.current.status).toBe('ready'))
  })
  it('rejects a bad refresh without overwriting the saved catalog', async () => {
    const stale = { ...catalog, updatedAt: '2020-01-01T00:00:00Z' }
    localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(stale))
    vi.stubGlobal('fetch', vi.fn(() => response({ ...current(), fonts: [] })))
    const { result } = renderHook(useCatalog)
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(readCatalogCache()).toEqual(stale)
  })
  it('works when local storage cannot be written', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota exceeded') })
    vi.stubGlobal('fetch', vi.fn(() => response(current())))
    const { result } = renderHook(useCatalog)
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.partial).toBe(false)
  })
})
