# Design notes — TypeMatch 1.1

## What stayed the same

The original implementation used the supplied Figma desktop (`6:3352`), mobile (`6:3479`), and interaction-state (`6:3587`) frames. Version 1.1 preserves the cream background, pale blue selection color, black outlines, offset shadows, Inter interface, Playfair Display title, original SVG assets, and “form & field” specimen.

The desktop still has a 352px control column, flexible preview, and 32px gap, with a single column below 960px. Mobile starts at screen widths of 600px or less; the toggle remains independent after that. Desktop preview keeps its 760px minimum canvas and scales to fit. The original resize observer still measures specimen height. The decorative ampersand remains fixed Playfair Display italic at weight 400.

The existing muted color correction (`#716b62`) is retained. The previous implementation made this small adjustment from Figma after automated contrast checks. No new visual theme or navigation was introduced.

## Replacing the small catalog

The 28 hand-written heading entries are replaced by a full snapshot of Google's website metadata: 1,950 families fetched on October 22, 2026. The file is about 582 KB before compression and is fetched separately from the application JavaScript. It contains metadata only. The four-family bootstrap lets the default pairing work immediately; it is clearly labeled as a limited fallback if the full catalog cannot load.

Google's documented Developer API requires a key. The Fonts website publishes the metadata needed here without one, so a small same-origin function fetches that data instead. This keeps credentials out of the app and avoids a browser cross-origin dependency. The tradeoff is that the website endpoint is not a stable, versioned API. If its schema changes, validation rejects the response and the app keeps its saved catalog. The refresh script uses the same validator.

Actual metadata included axes such as `SZP1` and `XPN2`. The initial validator accepted only letters; checking the complete response exposed that mistake. Axis tags now accept four letters or digits. Script subsets and italic variants are retained rather than inferred from font names.

Refresh is checked on visits and hourly while an open page is visible. Metadata older than a day is refreshed through `/api/fonts`; server memory and Vercel CDN caching avoid a Google request for each visitor. This is demand-driven, not a scheduled background job. No database or API secret is required. Static-only hosting still works from the snapshot, but cannot refresh without an equivalent endpoint or a new build.

The browser stores only validated catalog metadata. Corrupt storage, quota failures, invalid responses, and network failures are handled separately from font-file loading. There is a visible loading state, a saved-catalog or starter-catalog message on failure, and a retry control.

## Search and font loading

Search indexes normalized family names once per catalog and supports multiple search words and all five Google categories. Results use the interface font so opening a large list does not download hundreds of font files. Only 40 rows are rendered per page. Arrow keys cross page boundaries, Page Up/Down jumps a page, and explicit Previous/Next buttons support pointer use. Each listbox option includes its overall position and result count for assistive technology.

The selected heading and three visible recommendation samples load on demand. A separately selected body style is included when needed. The interface's fixed typography has its own small stylesheet. Requests are shared and quick selection changes are coalesced. Unused completed stylesheets are evicted after eight cached selections; pending requests finish and are then eligible for eviction. This bounds retained CSS, but cannot control the browser's own font cache.

Both heading and body controls expose the available named weights and regular/italic styles from metadata. Single-weight fonts never offer artificial bold or italic. Variable weight ranges are shown, while the controls use the named weights supplied by Google. Optical-size ranges are explicitly included in CSS2 requests so `font-optical-sizing: auto` can work. Width, slant, grade, and other custom axes stay at their defaults. This keeps the MVP manageable without claiming to be a full variable-font editor.

## How pairing decisions work

The old three generic groups are replaced by editorial heading groups: high-contrast serif, classic serif, slab, geometric, grotesk, humanist, rounded, condensed, handwriting, monospace, and display. Common headings have explicit group assignments. Unfamiliar headings fall back to category, display classification, italic availability, and optical-size metadata. These are modest heuristics, not measured shape analysis.

Body candidates come from a written list of paragraph-oriented families with specific descriptions. Noto Sans/Serif script families provide metadata-based fallbacks when the curated list does not cover a script. Initial recommendations use normal weight 400. Available emphasis weights and italics help break ties.

For each of Balanced, Modern, and Expressive / Editorial, candidates are ordered by:

1. Coverage of the chosen script subset.
2. The direction's preference: Modern favors sans serif; Editorial favors serif.
3. The heading group's ordered editorial preferences.
4. Available emphasis weights, then italics.
5. Alphabetical family name for stable ties.

The heading itself and earlier picks are excluded. There is no random choice, family-name hash, compatibility percentage, or claimed research score. The source arrays in `src/data/pairings.ts` show the preferences directly. Different heading groups use different body choices, but headings with similar metadata can intentionally receive the same set.

The default Balanced pairing remains Playfair Display with DM Sans. Source Sans 3 is its Modern option; Lora replaces the previous Lato card to give the Editorial option a distinct serif reading texture. This changes a recommendation, not the visual design.

“Pair for script” defaults to the heading's primary script where mapped, otherwise Latin or the first text subset. It exposes available subsets so users can make the choice explicitly. A recommendation claims shared coverage only for that chosen subset. If fewer than three suitable families cover it, the remaining cards clearly disclose the missing coverage. Subset metadata cannot guarantee every language or glyph. The preview remains the original English specimen and warns if a selected font has no Latin subset; it is not a multilingual typesetting test.

## Preview and export consistency

Font selection, font loading, preview styles, and exported CSS use the same family/weight/style model. All specimen heading levels now use the selected heading face; body content uses the selected body face. This removes previously implicit 400/500 weights that could request unsupported or synthesized styles. The fixed decorative ampersand is separate from the user's pairing.

The shared URL builder deduplicates families and faces, sorts CSS2 axis tuples, encodes names, and requests only the needed weights/styles plus supported optical sizing. “Copy CSS” includes the import before the heading and body rules. The separate import action and manual-copy fallback remain intact. Export text is usable CSS; it does not depend on TypeMatch's classes or variables.

## Verification and limits

Verified locally on October 22, 2026:

- 32 Vitest tests passed. One test checks recommendation invariants for all 1,950 headings; others cover normalization, all categories, script matching, deterministic diversity, supported variants, CSS encoding, keyboard paging, caching, retry, obsolete font responses, and stylesheet eviction.
- 9 Playwright tests passed in Microsoft Edge (Chromium). They cover the main user flow, radios and keyboard focus, category filters, live styles and copied CSS, script warnings, catalog outage recovery, font failure/retry, and clipboard denial.
- The real local `/api/fonts` endpoint returned a complete catalog with daily cache headers. Real Google Fonts preview and export requests succeeded for Playfair Display, Montserrat, Bungee, Caveat, Roboto Mono, Roboto Flex, Noto Sans JP, Noto Naskh Arabic, Noto Sans Devanagari, and Bebas Neue. This includes italic and nonstandard variable-weight requests. It does not claim live verification of every family.
- Axe reported no violations under WCAG 2 A/AA and 2.1 AA tags in the default desktop, open selector, and mobile states. Page-level overflow checks passed at 320, 390, 768, 1024, and 1440px, including desktop preview on narrow screens.
- Desktop and mobile screenshots were inspected. Added controls and longer explanations make the control column taller; the existing spacing, colors, cards, and responsive arrangement remain recognizable. Current captures are generated in `test-results/`; the images in `docs/screenshots/` are the original v1.0 references.
- TypeScript checking and the Vite production build passed. The full metadata snapshot is a separate asset, not embedded in the app bundle.

The browser test initially tried to click a visually hidden radio directly; the visible card correctly intercepted that pointer action. The test now uses focus and Space to exercise the actual accessible control. No product workaround was added for the test driver.

Firefox, Safari, physical mobile devices, and screen-reader sessions were not tested. Automated checks do not establish complete accessibility conformance. No user research, interviews, usability feedback, compatibility study, or performance study was conducted or invented. The verification results above describe the local implementation checks; deployment status is recorded separately by GitHub and Vercel.
