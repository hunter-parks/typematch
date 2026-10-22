import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { METADATA_URL, normalizeMetadata } from '../src/data/catalog.ts'

// Local metadata input also permits reproducible, offline snapshot generation.
const input = process.argv[2]
const text = input ? await readFile(input, 'utf8') : await fetch(METADATA_URL, { signal: AbortSignal.timeout(15000) }).then(response => {
  if (!response.ok) throw new Error(`Google Fonts returned HTTP ${response.status}`)
  return response.text()
})
const catalog = normalizeMetadata(text)
const publicDir = new URL('../public/', import.meta.url)
await mkdir(publicDir, { recursive: true })
await writeFile(new URL('fonts-catalog.json', publicDir), JSON.stringify(catalog) + '\n')
const seedNames = ['Playfair Display', 'DM Sans', 'Source Sans 3', 'Lora']
await writeFile(new URL('../src/data/seed-fonts.json', import.meta.url), JSON.stringify({ ...catalog, fonts: catalog.fonts.filter(font => seedNames.includes(font.family)) }, null, 2) + '\n')
console.log(`Saved ${catalog.fonts.length} families to ${fileURLToPath(publicDir)}fonts-catalog.json (${catalog.updatedAt}).`)
