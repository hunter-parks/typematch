import { selectFont, stylesFor, weightLabel, weightsFor, type FontSelection, type FontStyle } from '../data/fonts'

export function FontControls({ font, label, onChange }: { font: FontSelection; label: 'Heading' | 'Body'; onChange: (font: FontSelection) => void }) {
  return <div className="font-controls">
    <label>{label} weight<select value={font.weight} onChange={event => onChange(selectFont(font, Number(event.target.value), font.style))}>
      {weightsFor(font, font.style).map(weight => <option key={weight} value={weight}>{weight}</option>)}
    </select></label>
    <label>{label} style<select value={font.style} onChange={event => onChange(selectFont(font, font.weight, event.target.value as FontStyle))}>
      {stylesFor(font).map(style => <option key={style} value={style}>{style === 'normal' ? 'Regular' : 'Italic'}</option>)}
    </select></label>
    <p>{weightLabel(font)}{font.axes.some(axis => axis.tag === 'opsz') ? ' · Optical sizing' : ''}</p>
  </div>
}
