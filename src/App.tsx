import { useState } from 'react'
import { FontSelector } from './components/FontSelector'
import { RecommendationList } from './components/RecommendationList'
import { TypographyPreview, type PreviewMode } from './components/TypographyPreview'
import { ExportPanel } from './components/ExportPanel'
import { Icon } from './components/Icon'
import { StepHeading } from './components/StepHeading'
import { getRecommendations, headingFonts, type FontFamily } from './data/fonts'
import { useFonts } from './hooks/useFonts'

export default function App() {
  const [heading, setHeading] = useState(headingFonts[0])
  const [bodyFamily, setBodyFamily] = useState('DM Sans')
  const [mode, setMode] = useState<PreviewMode>(() => window.matchMedia('(max-width: 600px)').matches ? 'mobile' : 'desktop')
  const recommendations = getRecommendations(heading)
  const body = recommendations.find(item => item.font.family === bodyFamily)?.font ?? recommendations[0].font
  const { status, retry } = useFonts([heading, ...recommendations.map(item => item.font)])

  function selectHeading(next: FontFamily) {
    setHeading(next)
    setBodyFamily(getRecommendations(next)[0].font.family)
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
            <FontSelector selected={heading} onSelect={selectHeading} />
            <p className="text-[11px] leading-[17px] text-muted">Search {headingFonts.length} Google Fonts to start a pairing.</p>
          </section>
          <section aria-labelledby="matches-heading" className="grid gap-3">
            <StepHeading step="02" id="matches-heading" note="3 curated picks">Meet your matches</StepHeading>
            <RecommendationList recommendations={recommendations} selected={body.family} onSelect={setBodyFamily} />
          </section>
          <div className="pairing-tip"><Icon name="sparkles" /><div><p className="text-[11px] font-semibold leading-[13px]">Contrast is the sweet spot.</p><p className="mt-1 text-[11px] leading-[18px] text-tip">{heading.profile === 'modern' ? 'A clean sans + a warm serif gives headings and body copy their own voice.' : `A characterful ${heading.profile === 'editorial' ? 'serif' : 'heading'} + a quiet sans keeps headings expressive and body copy easy to read.`}</p></div></div>
        </aside>
        <div className="preview-and-export">
          <TypographyPreview heading={heading} body={body} mode={mode} onModeChange={setMode} fontStatus={status} onRetry={retry} />
          <ExportPanel key={`${heading.family}-${body.family}`} heading={heading} body={body} />
        </div>
      </div>
      <footer className="app-footer"><p>Made for the love of type. &nbsp;© DesignDesk</p><p className="footer-source">Powered by Google Fonts · Open-source type, ready for the web.</p></footer>
    </main>
  </>
}
