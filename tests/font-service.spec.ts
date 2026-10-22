import { test, expect } from '@playwright/test'
import { getRecommendations } from '../src/data/pairings'
import { catalog, selected } from '../src/test/catalogFixture'
import { createFontExport, googleFontsUrl } from '../src/lib/fontExport'

test('local refresh endpoint serves a complete official catalog with daily cache headers', async ({ request }) => {
  const response = await request.get('/api/fonts')
  expect(response.ok()).toBe(true)
  const data = await response.json()
  expect(data.fonts.length).toBeGreaterThan(1900)
  expect(response.headers()['cache-control']).toContain('s-maxage=86400')
  expect(Date.now() - Date.parse(data.updatedAt)).toBeLessThan(24 * 60 * 60 * 1000)
})

test('representative categories, scripts, italic and variable exports resolve from Google Fonts', async ({ request }) => {
  test.setTimeout(60000)
  const representatives = ['Playfair Display', 'Montserrat', 'Bungee', 'Caveat', 'Roboto Mono', 'Roboto Flex', 'Noto Sans JP', 'Noto Naskh Arabic', 'Noto Sans Devanagari', 'Bebas Neue']
  for (const name of representatives) {
    const heading = selected(name, name === 'Roboto Flex' ? 537 : 600, name === 'Playfair Display' ? 'italic' : 'normal')
    const picks = getRecommendations(heading, catalog.fonts)
    const live = await request.get(googleFontsUrl([heading, ...picks.map(pick => pick.font)]))
    expect(live.ok(), `${name}: preview faces`).toBe(true)
    expect(await live.text()).toContain('@font-face')
    const exported = await request.get(createFontExport(heading, picks[0].font).url)
    expect(exported.ok(), `${name}: exported import`).toBe(true)
    expect(await exported.text()).toContain('@font-face')
  }
})
