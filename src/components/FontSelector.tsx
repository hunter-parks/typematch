import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { categoryLabel, fontStack, headingFonts, searchFonts, type FontFamily } from '../data/fonts'
import { Icon } from './Icon'

export function FontSelector({ selected, onSelect }: { selected: FontFamily; onSelect: (font: FontFamily) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const id = useId()
  const results = searchFonts(query)
  const activeFont = results[active]

  useEffect(() => {
    if (!open) return
    input.current?.focus()
    const closeOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])

  useEffect(() => {
    if (open) document.getElementById(`${id}-option-${active}`)?.scrollIntoView?.({ block: 'nearest' })
  }, [active, open, id])

  const close = () => { setOpen(false); trigger.current?.focus() }
  const select = (font: FontFamily) => { onSelect(font); close() }
  const show = () => {
    setQuery('')
    setActive(Math.max(0, headingFonts.findIndex(font => font.family === selected.family)))
    setOpen(true)
  }
  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const change = event.key === 'ArrowDown' ? 1 : -1
      setActive(index => results.length ? (index + change + results.length) % results.length : 0)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (activeFont) select(activeFont)
    } else if (event.key === 'Escape') {
      event.preventDefault(); close()
    }
  }

  return <div ref={root} className="font-selector" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
  }} onKeyDown={event => { if (event.key === 'Escape' && open) { event.preventDefault(); close() } }}>
    <button ref={trigger} type="button" className="selector-trigger" aria-label={`Heading font: ${selected.family}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? `${id}-list` : undefined}
      onClick={() => open ? close() : show()} onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); show() } }}>
      <span className="flex min-w-0 flex-col gap-[3px] text-left">
        <span className="text-[20px] leading-[26px]" style={{ fontFamily: fontStack(selected) }}>{selected.family}</span>
        <span className="text-[9px] leading-[11px] text-muted uppercase">{categoryLabel(selected.category)} · Google Fonts</span>
      </span>
      <Icon name="chevrons-up-down" />
    </button>
    {open && <div className="font-menu">
      <div className="search-field">
        <Icon name="search" />
        <input ref={input} type="text" role="combobox" aria-label="Search heading fonts" aria-expanded="true" aria-autocomplete="list" aria-controls={`${id}-list`} aria-activedescendant={activeFont ? `${id}-option-${active}` : undefined}
          placeholder="Search Google Fonts…" value={query} onChange={event => { setQuery(event.target.value); setActive(0) }} onKeyDown={handleKey} autoComplete="off" spellCheck={false} />
        {query && <button type="button" className="clear-button" aria-label="Clear search" onClick={() => { setQuery(''); setActive(0); input.current?.focus() }}><Icon name="x" /></button>}
      </div>
      <p className="result-count" role="status">{results.length} {results.length === 1 ? 'family' : 'families'} found</p>
      <ul id={`${id}-list`} role="listbox" aria-label="Heading fonts" className="font-results">
        {results.map((font, index) => <li key={font.family} id={`${id}-option-${index}`} role="option" aria-selected={font.family === selected.family}
          className={`font-result ${index === active ? 'is-active' : ''}`} onPointerMove={() => setActive(index)} onMouseDown={event => event.preventDefault()} onClick={() => select(font)}>
          <span><span className="block text-[19px] leading-[26px]" style={{ fontFamily: fontStack(font) }}>{font.family}</span><span className="text-[10px] text-muted">{categoryLabel(font.category)} · Google Fonts</span></span>
          {font.family === selected.family && <Icon name="check" />}
        </li>)}
      </ul>
      {results.length === 0 && <div className="empty-results">
        <Icon name="search-x" />
        <p className="font-semibold">No fonts found for “{query}”</p>
        <p className="text-[11px] text-muted">Try another family name, like “Playfair”.</p>
        <button type="button" className="text-link" onClick={() => { setQuery(''); setActive(0); input.current?.focus() }}>Clear search</button>
      </div>}
      <p className="catalog-note">{headingFonts.length} selected Google Fonts for this MVP.</p>
    </div>}
  </div>
}
