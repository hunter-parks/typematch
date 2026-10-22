import { categoryLabel, fontStack, weightLabel } from '../data/fonts'
import type { Recommendation } from '../data/pairings'

export function RecommendationList({ recommendations, selected, onSelect }: { recommendations: Recommendation[]; selected: string; onSelect: (family: string) => void }) {
  return <fieldset className="grid gap-3" aria-labelledby="matches-heading">
    <legend className="sr-only">Body font recommendations</legend>
    {recommendations.map(({ font, label, explanation, coverage }) => <label className="pairing-option" key={font.family}>
      <input className="sr-only" type="radio" name="body-font" value={font.family} aria-label={font.family} aria-describedby={`reason-${font.family.replaceAll(' ', '-')}`} checked={selected === font.family} onChange={() => onSelect(font.family)} />
      <span className="block text-[17px] leading-[22px]" style={{ fontFamily: fontStack(font), fontWeight: font.weight, fontStyle: font.style }}>{font.family}</span>
      <span id={`reason-${font.family.replaceAll(' ', '-')}`} className="block text-[13px] leading-[18px] text-preview-body">{explanation}<span className="block mt-1 text-[11px] leading-[16px]">{coverage}</span></span>
      <span className="pairing-meta">{label}{selected === font.family ? ' · Selected' : ''}</span>
      <span className="text-[10px] leading-[15px] text-muted">{categoryLabel(font.category)} · {weightLabel(font)}</span>
    </label>)}
  </fieldset>
}
