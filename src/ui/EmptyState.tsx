// Adapted from kairos-command/src/components/ui.tsx; source commit recorded in docs/REUSE_PROVENANCE.md.
import { Layers3 } from 'lucide-react'
export function EmptyState({ title = 'Sem dados ainda', text }: { title?: string; text?: string }) {
  return <div className="empty-state"><Layers3 size={26} aria-hidden="true" /><strong>{title}</strong>{text && <p>{text}</p>}</div>
}
