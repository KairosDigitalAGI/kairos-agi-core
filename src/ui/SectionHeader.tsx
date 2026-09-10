import type { ReactNode } from 'react'

export function SectionHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return (
    <div className="section-header">
      <div><span>{eyebrow}</span><h2>{title}</h2></div>
      {action}
    </div>
  )
}
