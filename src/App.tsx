import { useMemo, useState } from 'react'
import { FontSelector } from './components/FontSelector'
import { RecommendationList } from './components/RecommendationList'
import { TypographyPreview, type PreviewMode } from './components/TypographyPreview'
import { ExportPanel } from './components/ExportPanel'
import { Icon } from './components/Icon'
import { StepHeading } from './components/StepHeading'
import { defaultSubset, selectFont, subsetLabel, textSubsets, type FontFamily, type FontSelection } from './data/fonts'
import { getRecommendations, pairingSummary } from './data/pairings'
import { FontControls } from './components/FontControls'
import { seedCatalog, useCatalog } from './hooks/useCatalog'
import { useFonts } from './hooks/useFonts'

export default function App() {
  const { catalog, status: catalogStatus, partial, retry: retryCatalog } = useCatalog()
  const [headingChoice, setHeading] = useState(() => selectFont(seedCatalog.fonts.find(font => font.family === 'Playfair Display')!))
  const [bodyChoice, setBody] = useState<FontSelection | null>(null)
  const [subsetChoice, setSubset] = useState('latin')
  const heading = useMemo(() => selectFont(catalog.fonts.find(font => font.family === headingChoice.family) ?? headingChoice, headingChoice.weight, headingChoice.style), [catalog, headingChoice])
  const subset = heading.subsets.includes(subsetChoice) ? subsetChoice : defaultSubset(heading)
  const [mode, setMode] = useState<PreviewMode>(() => window.matchMedia('(max-width: 600px)').matches ? 'mobile' : 'desktop')
  const recommendations = useMemo(() => getRecommendations(heading, catalog.fonts, subset), [heading, catalog, subset])
  const bodyFont = recommendations.find(item => item.font.family === bodyChoice?.family)?.font ?? recommendations[0].font
  const body = bodyFont.family === bodyChoice?.family ? selectFont(bodyFont, bodyChoice.weight, bodyChoice.style) : bodyFont
  const { status, retry } = useFonts([heading, body, ...recommendations.map(item => item.font)])

  function selectHeading(next: FontFamily) {
    setHeading(selectFont(next))
    setSubset(defaultSubset(next))
    setBody(null)
  }

  return <>
    <a href="#pairing-workspace" className="skip-link">Skip to font pairing</a>
    <header className="app-header">
      <a href="#" aria-label="TypeMatch home" className="brand"><span className="brand-mark" aria-hidden="true">Tt</span><span className="brand-name">TypeMatch</span><span className="brand-credit">/ &nbsp;by DesignDesk</span></a>
      <span className="mobile-credit">DesignDesk</span>
      <nav aria-label="Main navigation" className="header-nav"><a href="#pairing-workspace" aria-current="page" className="font-semibold">Font pairing</a><a href="https://fonts.google.com/" target="_blank" rel="noreferrer" className="text-muted">Google Fonts ↗</a><span className="utility-badge">A free design tool</span></nav>
    </header>
    <main className="workspace">
      <div className="introduction"><p className="eyebrow">Less guesswork. More good type.</p><h1>Better type. Together.</h1><p className="intro-description">Pick a heading font. Find its other half. See your next website take shape.</p></div>
      <div id="pairing-workspace" tabIndex={-1} className="pairing-workspace">
        <aside className="pairing-controls" aria-label="Choose your font pairing">
          <section aria-labelledby="heading-heading" className="grid gap-3">
            <StepHeading step="01" id="heading-heading">Choose your heading</StepHeading>
            <FontSelector selected={heading} fonts={catalog.fonts} onSelect={selectHeading} />
            <FontControls font={heading} label="Heading" onChange={setHeading} />
            <div className="catalog-status text-[11px] leading-[17px] text-muted" aria-live="polite">
              {catalogStatus === 'loading' ? <p>Loading the Google Fonts catalog…</p> : catalogStatus === 'error' ? <p>{partial ? 'Full catalog unavailable. Showing starter fonts.' : 'Refresh unavailable. Using the saved catalog.'} <button className="text-link" onClick={retryCatalog}>Retry catalog</button></p> : <p>Search {catalog.fonts.length.toLocaleString('en-US')} Google Fonts · Catalog {catalog.updatedAt.slice(0, 10)}.</p>}
            </div>
          </section>
          <section aria-labelledby="matches-heading" className="grid gap-3">
            <StepHeading step="02" id="matches-heading" note="3 curated picks">Meet your matches</StepHeading>
            <label className="script-filter">Pair for script<select value={subset} onChange={event => { setSubset(event.target.value); setBody(null) }}>
              {textSubsets(heading).map(value => <option key={value} value={value}>{subsetLabel(value)}</option>)}
              {!textSubsets(heading).includes(subset) && <option value={subset}>{subsetLabel(subset)}</option>}
            </select></label>
            <RecommendationList recommendations={recommendations} selected={body.family} onSelect={family => setBody(recommendations.find(item => item.font.family === family)!.font)} />
            <FontControls font={body} label="Body" onChange={setBody} />
          </section>
          <div className="pairing-tip"><Icon name="sparkles" /><div><p className="text-[11px] font-semibold leading-[13px]">Contrast is the sweet spot.</p><p className="mt-1 text-[11px] leading-[18px] text-tip">{pairingSummary(heading)}</p></div></div>
        </aside>
        <div className="preview-and-export">
          <TypographyPreview heading={heading} body={body} mode={mode} onModeChange={setMode} fontStatus={status} onRetry={retry} />
          <ExportPanel key={`${heading.family}-${heading.weight}-${heading.style}-${body.family}-${body.weight}-${body.style}`} heading={heading} body={body} />
        </div>
      </div>
      <footer className="app-footer"><p>Made for the love of type. &nbsp;© DesignDesk</p><p className="footer-source">Powered by Google Fonts · Open-source type, ready for the web.</p></footer>
    </main>
  </>
}
