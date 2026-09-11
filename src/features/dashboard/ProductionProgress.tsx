import { ArrowUpRight, CheckCircle2, Film } from 'lucide-react'
import { useClone } from '../../core/CloneProvider'
import { useEditorial } from '../../core/EditorialProvider'
import type { ModuleKey } from '../../types'
export function ProductionProgress({ navigate }: { navigate: (module: ModuleKey) => void }) {
  const { state: clone } = useClone()
  const { state: editorial } = useEditorial()
  const identities = clone.records.filter(r => r.kind === 'identity' && r.fields.consent === 'Autorizado').length
  const assets = clone.records.filter(r => r.kind === 'asset').length
  const ready = clone.videos.filter(v => v.stage === 'Publicação').length
  const reviewed = ready + editorial.items.filter(i => i.stage === 'Publicação').length
  const steps = [{ label: 'Identidade cadastrada', done: identities > 0 }, { label: 'Materiais catalogados', done: assets > 0 }, { label: 'Primeira produção aprovada', done: ready > 0 }]
  return <section className="production-progress glass-panel"><div><span className="eyebrow">SEU PRÓXIMO MOVIMENTO</span><h2>Do conhecimento à entrega.</h2><p>Construa seu acervo, prepare o conteúdo e aprove o que está pronto.</p><button className="primary-button" onClick={() => navigate('clone')}><Film size={17} />{identities ? 'Continuar produção' : 'Preparar meu Clone'}<ArrowUpRight size={17} /></button></div>
    <div className="production-checklist">{steps.map((step,index) => <div key={step.label} className={step.done ? 'complete' : ''}><span>{step.done ? <CheckCircle2 size={20} /> : String(index + 1).padStart(2,'0')}</span><strong>{step.label}</strong><small>{step.done ? 'Registrado' : 'Pendente'}</small></div>)}<p>{reviewed} revisões aprovadas neste navegador · nenhuma publicação externa</p></div>
  </section>
}
