import type { ReactNode } from 'react'

export function StepHeading({ step, id, children, note }: { step: string; id: string; children: ReactNode; note?: string }) {
  return <div className="flex min-w-0 items-center gap-2">
    <span className="step-badge" aria-hidden="true">{step}</span>
    <h2 id={id} className="text-[13px] font-semibold leading-4">{children}</h2>
    {note && <span className="text-[10px] leading-3 text-muted">{note}</span>}
  </div>
}
