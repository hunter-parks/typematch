import { afterEach, describe, expect, it, vi } from 'vitest'
import { catalog } from './catalogFixture'

const rawMetadata = () => JSON.stringify({ familyMetadataList: catalog.fonts.map(font => ({ ...font, classifications: font.display ? ['Display'] : [], fonts: Object.fromEntries(font.variants.map(variant => [`${variant.weight}${variant.style === 'italic' ? 'i' : ''}`, {}])), axes: font.axes.map(axis => ({ ...axis, defaultValue: axis.default })) })) })
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); vi.resetModules() })
describe('catalog refresh service', () => {
  it('coalesces refreshes, caches for a day, and refreshes after expiry', async () => {
    vi.useFakeTimers()
    const fetcher = vi.fn(async () => new Response(rawMetadata()))
    vi.stubGlobal('fetch', fetcher)
    const { fetchCatalog } = await import('../../server/fontCatalog')
    const [first, second] = await Promise.all([fetchCatalog(), fetchCatalog()])
    expect(first).toEqual(second)
    expect(fetcher).toHaveBeenCalledTimes(1)
    await fetchCatalog()
    expect(fetcher).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(25 * 60 * 60 * 1000)
    await fetchCatalog()
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
  it('does not retain failed or malformed provider responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('{}')).mockResolvedValueOnce(new Response(rawMetadata())))
    const { fetchCatalog } = await import('../../server/fontCatalog')
    await expect(fetchCatalog()).rejects.toThrow()
    expect((await fetchCatalog()).fonts).toHaveLength(catalog.fonts.length)
  })
})
