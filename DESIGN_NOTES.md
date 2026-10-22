# Design notes

## What I worked from

The supplied Figma file includes desktop (`6:3352`), mobile (`6:3479`), and interaction-state (`6:3587`) frames. I read the design context and screenshots for all three. The workspace was empty, so there was no existing component library or application code to preserve.

The implementation follows the warm cream background, pale blue accents, dark outlines, offset shadows, Playfair Display title, and Inter interface typography. The default pair is Playfair Display with DM Sans. Source Sans 3 and Lato are the other two default recommendations, with the explanations supplied in the design.

Figma’s icons, browser dots, and blue artwork disc are downloaded SVG files in `src/assets`. They keep their original dimensions. The large ampersand remains live Playfair Display text, as it is in Figma. No screenshot is used as an application asset.

## Layout and components

The desktop layout uses a 352px controls column, a flexible preview column, and a 32px gap. The application switches to one column below 960px. At phone widths, the header is simplified, the main padding is 24px, the preview toggle uses icons, and the export buttons stack. These intermediate breakpoints are implementation choices; Figma supplies 1440px and 390px reference frames.

The preview starts in mobile mode on screens at or below 600px. After that, the toggle is the user’s choice. On a wide screen, mobile mode places a 322px specimen inside the muted surround shown in the interaction-state design. Desktop mode keeps a minimum 760px canvas and scales it to fit smaller containers. A ResizeObserver measures its real height so different fonts do not get clipped.

The fictional “form & field” website is a typography specimen. Its navigation labels, menu icon, and call-to-action appearance are sample content rather than real controls. The application’s own controls and external Google Fonts links work.

Reusable components separate the font selector, recommendation group, specimen, export panel, icons, and numbered section headings. Tailwind provides theme tokens and layout utilities. More involved responsive and specimen styling lives in named component classes so the JSX stays readable.

## Font choices and exports

The MVP bundles 28 heading families instead of fetching the complete Google Fonts catalog, which would introduce API-key management or a catalog synchronization process. The selector explicitly states this limit. Fonts load on demand for the current heading and its three recommendations; the default interface families also have an initial stylesheet request. Catalog entries record supported weights, including single-style display fonts.

Pairing suggestions come from three small editorial groups: serif headings, modern sans headings, and expressive headings. Each returns three distinct body families and a written explanation. These are design judgments, not measured readability results or user feedback. Changing the heading selects the first recommendation for that heading, keeping the preview and export consistent.

The export builder is shared with font loading so family encoding and weight sorting are consistent. “Copy CSS” includes the Google Fonts import followed by heading and body rules. This intentionally makes the result usable in one paste, while the visible preview retains the two-line snippet in Figma. The separate import panel follows the interaction-state design. If clipboard permission fails, a selected text field appears instead of a false success message.

## Accessibility and failure states

The selector uses a searchable combobox with a listbox, an active descendant, arrow-key navigation, Enter to select, Escape to close, and focus restoration. Tab can leave the menu. Body recommendations use native radios, including arrow-key selection. Preview controls announce their pressed state. Copy feedback and font-loading updates use polite announcements. The page includes a skip link and respects reduced-motion preferences.

The first automated accessibility pass found that Figma’s muted text color (`#766f66`) fell below 4.5:1 on the tip and selected-search backgrounds. I darkened the muted token slightly to `#716b62`. This is a deliberate small departure from the design to make those states readable.

Font-loading errors show system fallback fonts with an explicit retry. Requests are reused, and old responses cannot overwrite the status of a newer selection. The app does not persist selections across reloads; avoiding storage keeps this MVP simple.

## Verification

Completed on October 21, 2026:

- 37 Vitest unit and component tests passed. They cover case-insensitive search, empty results, keyboard selection and focus restoration, all 28 headings’ recommendation invariants, export encoding and supported weights, copy success, and clipboard failure.
- 5 Playwright tests passed using the installed Microsoft Edge browser (Chromium). They exercise real radio-keyboard behavior, heading changes, preview modes, clipboard contents, empty search, outside-click dismissal, visible focus, blocked font requests, and retry.
- Live Google Fonts requests succeeded for all 28 heading families, their recommendation font sets, and their default exported imports.
- Automated axe checks reported no violations under the WCAG 2 A/AA and 2.1 AA rule tags in the default desktop screen, open search menu, and default mobile screen. These checks do not establish full accessibility conformance.
- Layout checks found no page-level horizontal overflow at 320, 390, 768, 1024, and 1440px, including desktop preview mode on narrow screens.
- I inspected the rendered 1440px desktop and 390px mobile screenshots against the Figma references. I corrected the export panel’s extra empty feedback spacing. SVG files were checked for non-empty content and their original root dimensions; the browser check verifies loaded default-screen assets retain their intrinsic widths.
- The final TypeScript check and Vite production build passed. The production bundle emits the original SVGs as separate local assets.

Reference captures are saved in `docs/screenshots/`. Firefox, Safari, physical mobile devices, and screen-reader sessions were not tested. Browser text rendering can differ slightly from Figma. No user research, interviews, usability feedback, or performance study was conducted or inferred.
