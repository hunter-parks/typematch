# TypeMatch

A small font-pairing tool built from the supplied [TypeMatch Figma design](https://www.figma.com/design/THLMwIqt03ntPBdArDNVEP/?node-id=6-3352). Choose a heading font, compare three body-font recommendations, preview the pair, and copy the code into a project.

## Run locally

Use Node.js 22.12 or later and pnpm 11.25.0. The project includes a lockfile and pins its direct dependencies.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by Vite. You can also use npm (`npm install`, `npm run dev`), but pnpm is the tested package manager and uses the included lockfile.

## Features

- Search a bundled selection of 28 Google Fonts by family name. This is a curated catalog, not the complete Google Fonts directory.
- Get three distinct body-font recommendations for each heading. Recommendations use editorial rules written into the app; they are not AI-generated or research scores.
- See the selected pair in a live website specimen. Desktop and mobile are independent preview modes; desktop mode scales to fit a narrow screen.
- Copy complete CSS, including the import, or reveal and copy only the Google Fonts import.
- Use the selector with Arrow Up/Down, Enter, Escape, and Tab. Body choices use native radio-button keyboard behavior. All controls have visible keyboard focus.
- Recover from blocked clipboard access with a focused, selectable text field. If Google Fonts cannot load, the app shows fallback fonts and a retry action.

The app has no backend, authentication, database, API keys, paid APIs, analytics, or persistent user storage. Google Fonts stylesheets and font files are loaded over the network, so an internet connection is needed to see the actual fonts. Search and pairing data remain available if that service is blocked.

## Checks

```sh
pnpm test             # unit and component interaction tests
pnpm build            # TypeScript checks and production bundle
pnpm exec playwright install chromium
pnpm test:e2e         # browser flows, layout checks, and axe checks
pnpm preview         # serve the production bundle locally
```

The implementation passed 37 unit/component tests, 5 browser tests, and the production build. The browser suite can use an installed Edge browser instead of downloading Chromium. In PowerShell:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge'
pnpm test:e2e
```

Browser tests use port 5173 and can reuse a running dev server. They capture desktop/mobile images under `test-results/`. The successful-font test needs access to Google Fonts; a separate test deliberately blocks the service to check recovery. Browser and assistive-technology coverage is documented in `DESIGN_NOTES.md`.

## Deploy

This is a static Vite app. No server runtime or secrets are required.

1. Install dependencies with `pnpm install --frozen-lockfile`.
2. Run `pnpm build`.
3. Upload the contents of `dist/` to a static host, or configure a Git-connected host with that build command and `dist` as its output directory.
4. Use HTTPS so clipboard access is available. If a browser denies it, the manual-copy field still works.

`base: './'` in `vite.config.ts` makes assets work under a subdirectory as well as a root domain. There are no client-side routes, so a single-page-app rewrite is unnecessary. If your host has a Content Security Policy, allow styles from `https://fonts.googleapis.com` and fonts from `https://fonts.gstatic.com`. No deployment has been performed as part of this local implementation.

## Project structure

```text
src/
  assets/             Original SVGs downloaded from Figma
  components/         Selector, recommendations, preview, export, and shared UI
  data/fonts.ts       Font catalog and pairing explanations
  hooks/useFonts.ts   On-demand font loading and retry state
  lib/fontExport.ts   Shared URL and CSS generation
  styles.css          Tailwind theme, component styles, and breakpoints
tests/                Playwright browser checks
```

To expand the catalog, add a family with supported weights to `src/data/fonts.ts`, choose its pairing profile, and verify its generated Google Fonts request. Single-style fonts must use their actual weight, rather than assuming every family supports 600.

Implementation details and tradeoffs are in [DESIGN_NOTES.md](DESIGN_NOTES.md). The integration follows the official [Google Fonts CSS API](https://developers.google.com/fonts/docs/css2), [Tailwind Vite setup](https://tailwindcss.com/docs/installation/using-vite), and [Vite documentation](https://vite.dev/guide/).
