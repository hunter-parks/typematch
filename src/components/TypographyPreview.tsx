import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { fontStack, type FontSelection } from '../data/fonts'
import { Icon } from './Icon'
import { StepHeading } from './StepHeading'

export type PreviewMode = 'desktop' | 'mobile'

function WebsiteSpecimen({ heading, body, mobile }: { heading: FontSelection; body: FontSelection; mobile: boolean }) {
  const style = { '--specimen-heading': fontStack(heading), '--specimen-body': fontStack(body), '--specimen-weight': heading.weight, '--specimen-style': heading.style, '--body-weight': body.weight, '--body-style': body.style } as CSSProperties
  return <div className={`website-specimen ${mobile ? 'is-mobile' : ''}`} style={style}>
    <div className="specimen-nav">
      <span className="specimen-wordmark">form &amp; field</span>
      {mobile ? <Icon name="menu" /> : <div className="specimen-links" aria-hidden="true"><span>Work</span><span>About</span><span>Let’s talk ↗</span></div>}
    </div>
    <div className="specimen-hero">
      <p className="specimen-eyebrow">Independent design studio</p>
      <div className="hero-composition">
        <h3 className="specimen-title">Good things<br />take shape.</h3>
        {!mobile && <div className="typographic-art" aria-hidden="true"><Icon name="artwork-disc" /><span>&amp;</span></div>}
      </div>
      <p className="specimen-intro">We turn thoughtful ideas into enduring identities and digital spaces. A little curiosity. A lot of care.</p>
      <span className="specimen-cta">Explore our work <Icon name="arrow-up-right" /></span>
    </div>
    <div className="specimen-details">
      <div><p className="detail-label">01 / Our approach</p><h4>Thoughtful by nature.</h4><p className="detail-description">Built with intention. Made to last.</p></div>
      <div><p className="detail-label">02 / What we do</p><h4>From idea to identity.</h4><p className="detail-description">Brand strategy, art direction &amp; digital design.</p></div>
    </div>
  </div>
}

export function TypographyPreview({ heading, body, mode, onModeChange, fontStatus, onRetry }: {
  heading: FontSelection; body: FontSelection; mode: PreviewMode; onModeChange: (mode: PreviewMode) => void
  fontStatus: string; onRetry: () => void
}) {
  const stage = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 928, height: 536 })
  useLayoutEffect(() => {
    if (!stage.current || !canvas.current) return
    const measure = () => setSize({ width: stage.current!.clientWidth, height: canvas.current!.offsetHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage.current)
    observer.observe(canvas.current)
    return () => observer.disconnect()
  }, [])
  const mobile = mode === 'mobile'
  const inset = mobile && size.width > 420 ? 20 : 0
  const width = mobile ? (inset ? 322 : size.width) : Math.max(760, size.width)
  const scale = mobile ? 1 : Math.min(1, size.width / width)

  return <section aria-labelledby="preview-heading" className="min-w-0">
    <div className="preview-toolbar">
      <StepHeading step="03" id="preview-heading">See it in context</StepHeading>
      <div className="preview-switch" role="group" aria-label="Preview size">
        {(['desktop', 'mobile'] as const).map(value => <button key={value} type="button" aria-label={`${value === 'desktop' ? 'Desktop' : 'Mobile'} preview`} aria-pressed={mode === value} onClick={() => onModeChange(value)}>
          <Icon name={value === 'desktop' ? 'monitor' : 'smartphone'} /><span>{value === 'desktop' ? 'Desktop' : 'Mobile'}</span>
        </button>)}
      </div>
    </div>
    <div className="preview-window">
      <div className="browser-chrome" aria-hidden="true"><Icon name="window-dots" /><span>formandfield.studio</span><Icon name="lock-keyhole" /></div>
      <div ref={stage} className={`preview-stage ${inset ? 'has-surround' : ''}`} style={{ height: size.height * scale + inset * 2, paddingBlock: inset }}>
        <div ref={canvas} className="specimen-canvas" data-testid="specimen" data-mode={mode} role="region" aria-label={`${mode} typography sample website`} style={{ width, transform: `scale(${scale})` }}>
          <WebsiteSpecimen heading={heading} body={body} mobile={mobile} />
        </div>
      </div>
      <div className="preview-metadata">
        <span>H&nbsp; {heading.family} · {heading.weight}{heading.style === 'italic' ? ' italic' : ''}</span><span>B&nbsp; {body.family} · {body.weight}{body.style === 'italic' ? ' italic' : ''}</span>
        <span className="preview-status">Aa&nbsp; Live typography preview</span>
      </div>
    </div>
    <div aria-live="polite" className="font-load-status">
      {fontStatus === 'error' && <p>Fonts couldn’t load. Showing system fallbacks. <button className="text-link" onClick={onRetry}>Retry fonts</button></p>}
      {fontStatus === 'loading' && <p>Loading your fonts…</p>}
      {fontStatus === 'ready' && <span className="sr-only">{heading.family} and {body.family} preview ready.</span>}
    </div>
    {(!heading.subsets.includes('latin') || !body.subsets.includes('latin')) && <p className="text-[11px] leading-[18px] text-muted mt-2">This sample is in English. A selected font has no Latin subset, so some letters may use a system fallback. Check your own text before publishing.</p>}
  </section>
}
