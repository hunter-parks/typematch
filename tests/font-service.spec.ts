import { test, expect } from '@playwright/test'
import { headingFonts, getRecommendations } from '../src/data/fonts'
import { createFontExport, googleFontsUrl } from '../src/lib/fontExport'

test('every catalog family and exported pairing resolves from Google Fonts', async ({ request }) => {
  test.setTimeout(60000)
  for (let offset = 0; offset < headingFonts.length; offset += 7) {
    await Promise.all(headingFonts.slice(offset, offset + 7).map(async heading => {
      const picks = getRecommendations(heading)
      const live = await request.get(googleFontsUrl([heading, ...picks.map(pick => pick.font)]))
      expect(live.ok(), `${heading.family}: preview fonts`).toBe(true)
      expect(await live.text()).toContain('@font-face')
      const exported = await request.get(createFontExport(heading, picks[0].font).url)
      expect(exported.ok(), `${heading.family}: exported import`).toBe(true)
      expect(await exported.text()).toContain('@font-face')
    }))
  }
})
