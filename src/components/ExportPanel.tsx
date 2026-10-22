import { useEffect, useRef, useState } from 'react'
import type { FontFamily } from '../data/fonts'
import { createFontExport } from '../lib/fontExport'
import { Icon } from './Icon'

type CopyKind = 'css' | 'import'

export function ExportPanel({ heading, body }: { heading: FontFamily; body: FontFamily }) {
  const [showImport, setShowImport] = useState(false)
  const [copied, setCopied] = useState<CopyKind | null>(null)
  const [fallback, setFallback] = useState<{ kind: CopyKind; text: string } | null>(null)
  const [copying, setCopying] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fallbackField = useRef<HTMLTextAreaElement>(null)
  const { importRule, rules, css } = createFontExport(heading, body)

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  useEffect(() => { fallbackField.current?.focus(); fallbackField.current?.select() }, [fallback])

  async function copy(kind: CopyKind) {
    setCopying(true)
    setFallback(null)
    const text = kind === 'css' ? css : importRule
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(text)
      setCopied(kind)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(null), 4000)
    } catch {
      setCopied(null)
      setFallback({ kind, text })
    } finally { setCopying(false) }
  }

  return <section className="export-panel" aria-labelledby="export-heading">
    <div className="flex items-center justify-between gap-3">
      <div><h2 id="export-heading" className="text-[15px] font-semibold leading-[18px]">Make this match yours.</h2><p className="mt-1 text-[11px] leading-[17px] text-muted">Two fonts. Ready for your next project.</p></div>
      <span className="export-monogram" aria-hidden="true">Aa</span>
    </div>
    <pre className="code-block rules-block" aria-label="Font CSS rules"><code>{rules.split('\n').map(line => <span key={line}>{line}</span>)}</code></pre>
    <div className="export-actions">
      <button type="button" className={`action-button primary ${copied === 'css' ? 'is-copied' : ''}`} disabled={copying} onClick={() => void copy('css')}>
        <Icon name={copied === 'css' ? 'check1' : 'copy'} />{copied === 'css' ? 'CSS copied!' : 'Copy CSS'}
      </button>
      <button type="button" className="action-button" aria-expanded={showImport} aria-controls="google-fonts-import" onClick={() => setShowImport(value => !value)}><Icon name="code-xml" />Google Fonts import</button>
      <a className="license-note" href="https://fonts.google.com/knowledge/using_type/using_web_fonts" target="_blank" rel="noreferrer">Free for commercial use ↗</a>
    </div>
    {showImport && <div id="google-fonts-import" className="import-panel">
      <h3 className="text-[14px] font-semibold">Bring your fonts along.</h3>
      <p className="text-[11px] leading-[18px] text-muted">Paste this at the top of your stylesheet, before the font-family rules.</p>
      <pre className="code-block"><code>{importRule}</code></pre>
      <button type="button" className={`action-button primary ${copied === 'import' ? 'is-copied' : ''}`} disabled={copying} onClick={() => void copy('import')}><Icon name={copied === 'import' ? 'check1' : 'copy'} />{copied === 'import' ? 'Import copied!' : 'Copy import'}</button>
    </div>}
    <div aria-live="polite" aria-atomic="true" className="copy-feedback">
      {copied && <div className="copy-notice"><Icon name="circle-check" /><div><p className="font-semibold">{copied === 'css' ? 'CSS copied to clipboard' : 'Google Fonts import copied'}</p><p className="mt-1 text-[10px]">{copied === 'css' ? 'Includes the Google Fonts import and both font rules.' : 'Place the import before other rules in your stylesheet.'}</p></div></div>}
    </div>
    {fallback && <div className="clipboard-fallback">
      <label htmlFor="manual-copy" className="text-[12px] font-semibold">Clipboard access is unavailable. Copy the selected {fallback.kind === 'css' ? 'CSS' : 'import'} below.</label>
      <textarea ref={fallbackField} id="manual-copy" readOnly value={fallback.text} rows={5} className="code-block w-full" />
      <p className="text-[11px] text-muted">Press Ctrl+C (Windows) or ⌘C (Mac), or use your device’s copy menu.</p>
    </div>}
  </section>
}
