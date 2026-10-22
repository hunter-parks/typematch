# TypeMatch 1.1

A Google Fonts pairing tool built with React, TypeScript, Vite, and Tailwind. The layout, colors, icons, and website specimen follow the original [TypeMatch Figma design](https://www.figma.com/design/THLMwIqt03ntPBdArDNVEP/?node-id=6-3352).

## Run locally

Use Node.js 24 LTS and pnpm 11.25.0. No API keys or environment variables are needed.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the URL printed by Vite. The development server includes the catalog refresh endpoint.

## Features

- Search the full saved Google Fonts catalog: **1,950 families**, fetched October 22, 2026. Filter by Serif, Sans serif, Display, Handwriting, or Monospace.
- Get three distinct recommendations: Balanced, Modern, and Expressive / Editorial. The rules consider heading character, body-text suitability, script coverage, weights, and italics. Explanations describe the actual choices; there are no compatibility percentages or random selections.
- Choose supported heading and body weights and styles. Variable fonts expose the named weights in Google's metadata and show their full weight range. Optical sizing is requested when available; other custom axes remain at their defaults.
- Select a script subset to prioritize compatible body fonts. Coverage gaps are explicitly labeled. A subset is a script-level indication, not a guarantee for every language or glyph.
- Preview the selected faces in desktop or mobile mode. Copy complete Google Fonts imports and CSS using those same weights and styles.
- Use Arrow Up/Down, Page Up/Down, Enter, Escape, and Tab in search. Native selects and radios retain their keyboard behavior and visible focus. Clipboard denial provides selectable text; font and catalog failures have retry actions.

Search uses a normalized name index and renders at most 40 font results at once. Browsing the catalog does not request fonts. Font files load for the current heading, three recommendation samples, and selected body face, plus the fixed interface typography. The browser chooses needed glyph subsets. Recently used font stylesheets are reused, with at most eight settled selection stylesheets retained.

## Catalog source, cache, and refresh

The source is Google's own [Fonts website metadata](https://fonts.google.com/metadata/fonts). It provides families, variants, variable axes, categories, and script subsets without credentials. **This endpoint is not a versioned public API.** Shape validation rejects unexpected or incomplete responses. The documented [Developer API](https://developers.google.com/fonts/docs/developer_api) requires a key; this project does not use it.

`public/fonts-catalog.json` is a checked-in metadata snapshot, not a collection of font files. A small four-family bootstrap keeps the default pairing usable while the full catalog loads. A valid browser cache is reused, and fresh catalogs are saved in localStorage. Storage failure does not stop the app. No selections or personal data are persisted.

`GET /api/fonts` fetches and normalizes official metadata. Server memory caches results for 24 hours and coalesces simultaneous refresh requests. On Vercel, CDN headers cache the response for a day with a further day of stale-while-revalidate. The browser checks on startup and hourly while the page is visible, requesting refreshes when its catalog is at least a day old. **Refresh is demand-driven; no job runs when the app is unused.** Failed or invalid refreshes leave the saved catalog intact and show a retry message.

To update the committed snapshot and bootstrap metadata:

```sh
pnpm fonts:refresh
pnpm test
pnpm build
```

The script requires Node 24 and network access. For a reproducible offline import, run `node scripts/refresh-fonts.mjs /path/to/saved-google-metadata.json`. It validates before writing. Refreshing files never commits or deploys them automatically. Production builds use the saved snapshot and do not depend on Google being available.

## Checks

```sh
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
pnpm preview
```

Verified on October 22, 2026: **32 unit/component tests, 9 browser tests, and the production build passed**. Browser tests used Microsoft Edge (Chromium):

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge'
pnpm test:e2e
```

The suite checks all 1,950 headings' recommendation invariants, cache and network failure recovery, keyboard paging, filtering, supported faces, copy behavior, and stale font-load responses. Browser tests verify live provider requests for ten representative families, the real local refresh endpoint, and layout at 320, 390, 768, 1024, and 1440px. Automated axe scans cover default desktop, open search, and mobile states. They do not establish full accessibility conformance. Screenshots are written to ignored `test-results/`.

## Deployment instructions

The existing Vercel project uses `vercel.json`: Vite, `pnpm build`, and `dist/`.

For future releases, after deployment approval:

1. Run the checks above and review the Git diff. Keep `.env*`, `.vercel`, dependencies, build output, and test artifacts excluded from Git.
2. Push the reviewed source to the private repository. If the Vercel project has a Git integration, its configured branch may deploy automatically.
3. For CLI deployment, run `vercel --prod` from the project root. Upload the source project, including `api/` and `server/`, so Vercel builds the refresh function alongside the Vite output. Use Node 24; no secrets are required.
4. Verify the production page, `/fonts-catalog.json`, and `/api/fonts`. Check search, a pairing change, and copy over HTTPS.

A static host can serve `dist/`, but has no refresh function: the app uses its bundled/browser catalog and reports a refresh failure once stale. Update the snapshot and redeploy to refresh a static-only installation, or provide the same-origin endpoint. `base: './'` supports static assets under subdirectories; the live endpoint is intentionally rooted at `/api/fonts`. No SPA rewrite is needed. A CSP must permit Google Fonts stylesheets, `fonts.gstatic.com` font files, and same-origin catalog requests.

## Code map

```text
api/fonts.ts                 Vercel / Vite HTTP endpoint
server/fontCatalog.ts        Official metadata fetch, request coalescing, TTL
scripts/refresh-fonts.mjs     Snapshot refresh command
public/fonts-catalog.json    Full normalized metadata snapshot
src/data/catalog.ts          Shared schema, validation, normalization
src/data/fonts.ts            Search index, supported faces, script utilities
src/data/pairings.ts         Curated descriptions and deterministic priorities
src/hooks/useCatalog.ts      Browser cache and refresh states
src/hooks/useFonts.ts        Lazy face loading, bounded reuse, retry
src/components/              Reusable selector, controls, cards, preview, export
src/lib/fontExport.ts        Shared Google Fonts CSS2 URLs and CSS generation
tests/                       Browser and live-provider verification
```

Pairing rules and limitations are explained in [DESIGN_NOTES.md](DESIGN_NOTES.md). Imports follow the official [Google Fonts CSS2 API](https://developers.google.com/fonts/docs/css2); the endpoint uses Vercel's [Node.js function runtime](https://vercel.com/docs/functions/runtimes/node-js). The app has no authentication, database, analytics, AI service, or paid API dependency.
