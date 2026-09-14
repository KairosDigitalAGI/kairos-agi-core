import { ServerCog } from 'lucide-react'
import type { OperationsFetchState } from '../../core/operationsClient'
import type { FleetStatusResponse } from '../../types/operations'
import { SectionHeader } from '../../ui/SectionHeader'
import './operations.css'

const STATUS_LABEL: Record<string, string> = {
  online: 'Online',
  degradado: 'Degradado',
  offline: 'Offline',
  desconhecido: 'Desconhecido',
}

// Frota real de agentes WhatsApp (pm2, via command.agents) — nunca chama pm2
// diretamente, só lê o snapshot que o sidecar já escreveu no Supabase.
export function FleetPanel({ state }: { state: OperationsFetchState<FleetStatusResponse> }) {
  return (
    <article className="glass-panel fleet-panel">
      <SectionHeader eyebrow="Frota" title="Agentes WhatsApp (pm2)" action={<ServerCog size={18} />} />
      {state.status === 'sem-credencial' && <p>Trancado. Desbloqueie o Painel Operacional acima para ver a frota real.</p>}
      {state.status === 'carregando' && <p>Consultando frota…</p>}
      {state.status === 'erro' && <p>{state.mensagem}</p>}
      {state.status === 'ok' && state.data.source === 'unavailable' && (
        <p>Frota indisponível: {state.data.reason ?? 'schema command não configurado.'}</p>
      )}
      {state.status === 'ok' && state.data.source === 'real' && (
        state.data.fleet.length === 0
          ? <p>Nenhum agente cadastrado em command.agents.</p>
          : state.data.fleet.map((agent) => (
            <div className="fleet-row" key={agent.slug}>
              <span className={`fleet-dot ${agent.status}`} />
              <div className="fleet-row-main">
                <strong>{agent.nome}</strong>
                <span>{agent.pm2_name ?? agent.slug}{agent.vps_ip ? ` · ${agent.vps_ip}` : ''}</span>
              </div>
              <b>{STATUS_LABEL[agent.status] ?? agent.status}</b>
            </div>
          ))
      )}
    </article>
  )
}
