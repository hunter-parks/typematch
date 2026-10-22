import { categoryLabel, fontStack, type Recommendation } from '../data/fonts'

export function RecommendationList({ recommendations, selected, onSelect }: { recommendations: Recommendation[]; selected: string; onSelect: (family: string) => void }) {
  return <fieldset className="grid gap-3" aria-labelledby="matches-heading">
    <legend className="sr-only">Body font recommendations</legend>
    {recommendations.map(({ font, label, explanation }) => <label className="pairing-option" key={font.family}>
      <input className="sr-only" type="radio" name="body-font" value={font.family} aria-label={font.family} aria-describedby={`reason-${font.family.replaceAll(' ', '-')}`} checked={selected === font.family} onChange={() => onSelect(font.family)} />
      <span className="block text-[17px] leading-[22px]" style={{ fontFamily: fontStack(font) }}>{font.family}</span>
      <span id={`reason-${font.family.replaceAll(' ', '-')}`} className="block text-[13px] leading-[16px] text-preview-body">{explanation}</span>
      <span className="pairing-meta">{selected === font.family ? 'Selected' : label} · {categoryLabel(font.category)} · {font.weights.join(' / ')}</span>
    </label>)}
  </fieldset>
}
