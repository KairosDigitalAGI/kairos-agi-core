import { Clock3, Play, RefreshCw, ServerCog } from 'lucide-react'
import { useState } from 'react'
import { useCommercialRuns } from '../../core/useCommercialRuns'

const revenueRunway = [
  { channel: 'Freelancer.com.br', step: 'discover', proposalText: 'Runway rápido: buscar demandas por fonte oficial.' },
  { channel: 'WhatsApp', step: 'qualify', proposalText: 'Runway rápido: qualificar somente conversas e oportunidades autorizadas.' },
  { channel: 'WhatsApp', step: 'draft', proposalText: 'Runway rápido: preparar resposta ou proposta para revisão.' },
] as const

export function CommercialRunsPanel() {
  const { state, refresh, create } = useCommercialRuns()
  const [starting, setStarting] = useState(false)
  const [notice, setNotice] = useState('')

  async function scheduleRevenueRunway() {
    setStarting(true)
    setNotice('')
    try {
      for (const run of revenueRunway) await create(run)
      setNotice('Trilha de receita registrada no runtime. Ela começa em descoberta, qualificação e rascunho; nada é enviado.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Não foi possível registrar a trilha.')
    } finally {
      setStarting(false)
    }
  }

  return <article className="glass-panel hunter-runs">
    <div className="section-header"><div><span className="eyebrow"><ServerCog size={13}/> RUNTIME COMERCIAL</span><h2>Execuções do servidor</h2></div><button onClick={() => void refresh()}><RefreshCw size={14}/> Atualizar</button></div>
    <section className="revenue-runway"><div><span className="eyebrow"><Clock3 size={13}/> PRIORIDADE 01 · RECEITA</span><h3>Trilha inicial de oportunidades</h3><p>Agenda três etapas persistidas: descoberta em fonte oficial, qualificação e rascunho. O envio segue bloqueado até haver canal oficial, consentimento e confirmação remota.</p></div><button type="button" className="primary-button" onClick={() => void scheduleRevenueRunway()} disabled={starting || state.status === 'sem-credencial'}><Play size={14}/>{starting ? 'Registrando…' : 'Agendar trilha de receita'}</button></section>
    {notice && <p className="hunter-run-notice">{notice}</p>}
    {state.status === 'sem-credencial' && <p>Desbloqueie o Painel Operacional para consultar ou agendar ciclos persistidos.</p>}
    {state.status === 'carregando' && <p>Consultando execução comercial…</p>}
    {state.status === 'erro' && <p>{state.mensagem}</p>}
    {state.status === 'ok' && state.data.runs.length === 0 && <p>Nenhum ciclo persistido ainda. O executor cria registros quando um conector oficial estiver pronto.</p>}
    {state.status === 'ok' && state.data.runs.map((run) => <div className="hunter-run" key={run.id}><strong>{run.channel}</strong><span>{run.step} · {run.state}</span><small>{run.remote_id ? 'Confirmação: ' + run.remote_id : run.reason || 'Sem confirmação remota'}</small></div>)}
  </article>
}
