import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { categoryLabel, createFontSearch, fontStack, weightLabel, type FontCategory, type FontFamily, type FontSelection } from '../data/fonts'
import { categories } from '../data/catalog'
import { Icon } from './Icon'

const PAGE_SIZE = 40
export function FontSelector({ selected, fonts, onSelect }: { selected: FontSelection; fonts: FontFamily[]; onSelect: (font: FontFamily) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<FontCategory | 'all'>('all')
  const [active, setActive] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const id = useId()
  const search = useMemo(() => createFontSearch(fonts), [fonts])
  const results = useMemo(() => search(query, category), [search, query, category])
  const index = Math.min(active, Math.max(0, results.length - 1))
  const pageStart = Math.floor(index / PAGE_SIZE) * PAGE_SIZE
  const activeFont = results[index]

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
    if (open) document.getElementById(`${id}-option-${index}`)?.scrollIntoView?.({ block: 'nearest' })
  }, [index, open, id, query, category])

  const close = () => { setOpen(false); trigger.current?.focus() }
  const select = (font: FontFamily) => { onSelect(font); close() }
  const show = () => { setQuery(''); setCategory('all'); setActive(Math.max(0, fonts.findIndex(font => font.family === selected.family))); setOpen(true) }
  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp'].includes(event.key)) {
      event.preventDefault()
      const change = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : event.key === 'PageDown' ? PAGE_SIZE : -PAGE_SIZE
      setActive(results.length ? (index + change + results.length) % results.length : 0)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (activeFont) select(activeFont)
    } else if (event.key === 'Escape') { event.preventDefault(); close() }
  }
  const clear = () => { setQuery(''); setActive(0); input.current?.focus() }

  return <div ref={root} className="font-selector" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
  }} onKeyDown={event => { if (event.key === 'Escape' && open) { event.preventDefault(); close() } }}>
    <button ref={trigger} type="button" className="selector-trigger" aria-label={`Heading font: ${selected.family}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? `${id}-list` : undefined}
      onClick={() => open ? close() : show()} onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); show() } }}>
      <span className="flex min-w-0 flex-col gap-[3px] text-left">
        <span className="selected-family text-[20px] leading-[26px]" style={{ fontFamily: fontStack(selected), fontWeight: selected.weight, fontStyle: selected.style }}>{selected.family}</span>
        <span className="text-[9px] leading-[11px] text-muted uppercase">{categoryLabel(selected.category)} · Google Fonts</span>
      </span><Icon name="chevrons-up-down" />
    </button>
    {open && <div className="font-menu">
      <div className="search-field"><Icon name="search" />
        <input ref={input} type="text" role="combobox" aria-label="Search heading fonts" aria-expanded="true" aria-autocomplete="list" aria-controls={`${id}-list`} aria-activedescendant={activeFont ? `${id}-option-${index}` : undefined}
          placeholder="Search Google Fonts…" value={query} onChange={event => { setQuery(event.target.value); setActive(0) }} onKeyDown={handleKey} autoComplete="off" spellCheck={false} />
        {query && <button type="button" className="clear-button" aria-label="Clear search" onClick={clear}><Icon name="x" /></button>}
      </div>
      <label className="category-filter">Category<select value={category} onChange={event => { setCategory(event.target.value as FontCategory | 'all'); setActive(0) }}>
        <option value="all">All categories</option>{categories.map(value => <option key={value} value={value}>{categoryLabel(value)}</option>)}
      </select></label>
      <p className="result-count" role="status">{results.length.toLocaleString('en-US')} {results.length === 1 ? 'family' : 'families'} found</p>
      <ul id={`${id}-list`} role="listbox" aria-label="Heading fonts" className="font-results">
        {results.slice(pageStart, pageStart + PAGE_SIZE).map((font, offset) => <li key={font.family} id={`${id}-option-${pageStart + offset}`} role="option" aria-selected={font.family === selected.family} aria-posinset={pageStart + offset + 1} aria-setsize={results.length}
          className={`font-result ${pageStart + offset === index ? 'is-active' : ''}`} onPointerMove={() => setActive(pageStart + offset)} onMouseDown={event => event.preventDefault()} onClick={() => select(font)}>
          <span className="min-w-0"><span className="block text-[14px] leading-[22px] break-words">{font.family}</span><span className="text-[10px] text-muted">{categoryLabel(font.category)} · {weightLabel(font)}</span></span>
          {font.family === selected.family && <Icon name="check" />}
        </li>)}
      </ul>
      {results.length > PAGE_SIZE && <div className="catalog-pages">
        <button type="button" className="text-link" disabled={pageStart === 0} onClick={() => { setActive(pageStart - PAGE_SIZE); input.current?.focus() }}>Previous fonts</button>
        <span>{pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, results.length)}</span>
        <button type="button" className="text-link" disabled={pageStart + PAGE_SIZE >= results.length} onClick={() => { setActive(pageStart + PAGE_SIZE); input.current?.focus() }}>Next fonts</button>
      </div>}
      {results.length === 0 && <div className="empty-results"><Icon name="search-x" /><p className="font-semibold">No fonts found for “{query}”</p><p className="text-[11px] text-muted">Try another name or category.</p><button type="button" className="text-link" onClick={() => { setCategory('all'); clear() }}>Reset search and category</button></div>}
      <p className="catalog-note">Search names or use arrow keys. Fonts load when selected.</p>
    </div>}
  </div>
}
