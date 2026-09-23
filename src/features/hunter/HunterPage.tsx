import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Bot, ExternalLink, FileText, Search, ShieldCheck, Sparkles, Target } from 'lucide-react'
import { createHunterOpportunity, emptyHunterDraft, hunterSources, hunterStages, nextHunterStage, type HunterDraft, type HunterOpportunity, type HunterStage } from './domain'
import { loadHunterOpportunities, saveHunterOpportunities } from './storage'
import { CommercialRunsPanel } from './CommercialRunsPanel'
import { useCommercialRuns } from '../../core/useCommercialRuns'
import './hunter.css'

const stages: Array<{ id: HunterStage; label: string; hint: string }> = [
  { id: 'triagem', label: 'Triagem', hint: 'origem e escopo conferidos' },
  { id: 'qualificada', label: 'Qualificada', hint: 'viável sem promessas inventadas' },
  { id: 'proposta pronta', label: 'Proposta pronta', hint: 'texto preparado para revisão' },
  { id: 'aguardando resposta', label: 'Aguardando resposta', hint: 'enviada e registrada na plataforma' },
]

export function HunterPage() {
  const { create: createRun } = useCommercialRuns()
  const [opportunities, setOpportunities] = useState<HunterOpportunity[]>(() => loadHunterOpportunities())
  const [form, setForm] = useState<HunterDraft>(emptyHunterDraft)
  const [selected, setSelected] = useState<string | null>(null)
  const active = opportunities.find((item) => item.id === selected) ?? opportunities[0]
  const byStage = useMemo(() => Object.fromEntries(stages.map((stage) => [stage.id, opportunities.filter((item) => item.stage === stage.id)])) as Record<HunterStage, HunterOpportunity[]>, [opportunities])

  useEffect(() => saveHunterOpportunities(opportunities), [opportunities])

  function capture(event: FormEvent) {
    event.preventDefault()
    try {
      const item = createHunterOpportunity(form, crypto.randomUUID(), new Date().toISOString())
      setOpportunities((items) => [item, ...items])
      setSelected(item.id)
      setForm(emptyHunterDraft)
      void createRun({ channel: item.source, step: 'discover', sourceUrl: item.url, opportunityId: item.id }).catch(() => undefined)
    } catch {
      // O formulário já marca os campos obrigatórios; não inventa registro incompleto.
    }
  }

  function advance(item: HunterOpportunity) {
    const next = nextHunterStage(item.stage)
    if (!next) return
    setOpportunities((items) => items.map((current) => current.id === item.id ? { ...current, stage: next } : current))
  }

  return (
    <section className="page-stack hunter-page">
      <header className="glass-panel hunter-hero">
        <div>
          <span className="eyebrow"><Target size={14} /> MONEY HUNTER · OPERAÇÃO COMERCIAL</span>
          <h2>Central de demandas</h2>
          <p>Transforme oportunidades verificadas em escopo, proposta e plano de entrega. Nada é enviado, contratado ou prometido sem revisão explícita.</p>
        </div>
        <div className="hunter-hero-status"><ShieldCheck size={17} /><span>{opportunities.length ? `${opportunities.length} oportunidades registradas` : 'Nenhuma fonte conectada'}</span></div>
      </header>

      <div className="hunter-grid">
        <form className="glass-panel hunter-capture" onSubmit={capture}>
          <div className="section-header"><div><span className="eyebrow"><Search size={13} /> CAPTURA AUTORIZADA</span><h2>Registrar demanda</h2></div></div>
          <p>Use o link e os dados que já foram vistos em uma plataforma autorizada. O Core não raspa páginas, não contorna limites e não cria contatos.</p>
          <label>Fonte<select value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value as HunterDraft['source'] })}>{hunterSources.map((source) => <option key={source}>{source}</option>)}</select></label>
          <label>Título<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Ex.: landing page para captação" required /></label>
          <label>Link de origem<input value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} type="url" placeholder="https://..." /></label>
          <label>Orçamento informado<input value={form.budget} onChange={(event) => setForm({ ...form, budget: event.target.value })} placeholder="Ex.: R$ 1.500–2.000" /></label>
          <label>Escopo observado<textarea value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} rows={4} placeholder="O que o cliente pediu, sem completar lacunas." required /></label>
          <button className="primary-button" type="submit"><Target size={15} /> Adicionar à triagem</button>
        </form>

        <div className="hunter-workspace">
          <div className="hunter-stages">
            {stages.map((stage) => <article className="glass-panel hunter-stage" key={stage.id}><div><strong>{stage.label}</strong><span>{byStage[stage.id].length}</span></div><small>{stage.hint}</small></article>)}
          </div>
          <div className="glass-panel hunter-list">
            <div className="section-header"><div><span className="eyebrow"><Bot size={13} /> OPPORTUNITY BUILDER</span><h2>Fila comercial</h2></div></div>
            {!opportunities.length && <p className="hunter-empty">Aguardando uma demanda real de fonte autorizada. O agente comercial está arquitetado, mas não há executor de coleta conectado.</p>}
            {opportunities.map((item) => <button type="button" className={`hunter-item ${active?.id === item.id ? 'active' : ''}`} onClick={() => setSelected(item.id)} key={item.id}><span>{item.source}</span><strong>{item.title}</strong><small>{item.budget} · {stages.find((stage) => stage.id === item.stage)?.label}</small></button>)}
          </div>

          <aside className="glass-panel hunter-detail">
            {!active && <><Sparkles size={20} /><h3>Proposta irresistível, com base real</h3><p>Quando uma demanda for capturada, o Kairos estrutura a descoberta, a amostra de impacto e a proposta. A mensagem final permanece em revisão antes do envio.</p></>}
            {active && <><span className="eyebrow"><FileText size={13} /> {active.source}</span><h3>{active.title}</h3><p>{active.summary}</p><dl><div><dt>Orçamento</dt><dd>{active.budget}</dd></div><div><dt>Etapa</dt><dd>{stages.find((stage) => stage.id === active.stage)?.label}</dd></div></dl><div className="hunter-detail-actions">{active.url && <a href={active.url} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Abrir origem</a>}{nextHunterStage(active.stage) && <button type="button" onClick={() => advance(active)}>Avançar para {stages.find((stage) => stage.id === nextHunterStage(active.stage))?.label}</button>}</div><small>Avançar organiza a fila local. Não envia mensagens nem publica proposta.</small></>}
          </aside>
        </div>
      </div>
      <CommercialRunsPanel />
    </section>
  )
}
