import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Copy, ExternalLink, RefreshCw, TerminalSquare, MessageCircle } from 'lucide-react'
import type { FleetAgent } from '../../types/operations'
import { useFleetStatus } from '../../core/useFleetStatus'

type Runtime = 'codex' | 'claude' | 'manual'
const KEY = 'kairos.agent-runtimes.v1'

function loadChoices(): Record<string, Runtime> {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, Runtime>
    return value && typeof value === 'object' ? value : {}
  } catch { return {} }
}

function fleetMatch(agentId: string, fleet: FleetAgent[]): FleetAgent | undefined {
  const needle = agentId.replace(/-ai$/, '').toLowerCase()
  return fleet.find((item) => {
    const source = (item.slug + ' ' + item.nome + ' ' + (item.pm2_name || '')).toLowerCase()
    return source.includes(needle) || (agentId === 'kairos' && /kairos|whatsapp/.test(source))
  })
}

export function AgentRuntimePanel({ agentId, agentName }: { agentId: string; agentName: string }) {
  const { state, refresh } = useFleetStatus()
  const [choices, setChoices] = useState<Record<string, Runtime>>(loadChoices)
  const runtime = choices[agentId] || 'manual'
  const locked = state.status === 'sem-credencial'
  const loading = state.status === 'carregando'
  const fleetData = state.status === 'ok' ? state.data : null
  const fleet = useMemo(() => fleetMatch(agentId, fleetData?.fleet || []), [agentId, fleetData])
  const command = runtime === 'codex' ? 'codex' : runtime === 'claude' ? 'claude' : ''

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(choices)) } catch { /* preferência local opcional */ }
  }, [choices])

  async function copyCommand() {
    if (!command) return
    try { await navigator.clipboard.writeText(command) } catch { /* comando permanece visível */ }
  }

  const channelText = locked
    ? 'Desbloqueie o Painel Operacional para verificar a conexão real.'
    : loading
      ? 'Consultando a frota…'
      : fleet
        ? 'Processo ' + fleet.status + ' · ' + (fleet.pm2_name || 'sem nome pm2 informado')
        : fleetData?.source === 'real'
          ? 'Nenhum processo KAIROS/WhatsApp foi confirmado pela frota.'
          : state.status === 'erro'
            ? state.mensagem
            : 'A frota não respondeu nesta consulta.'

  return <section className="agent-runtime" aria-label={'Ambiente operacional de ' + agentName}>
    <header>
      <span><TerminalSquare size={15} /> Ambiente operacional</span>
      <button type="button" onClick={() => void refresh()} disabled={loading || locked}><RefreshCw size={14} />{loading ? 'Consultando…' : 'Atualizar'}</button>
    </header>
    {agentId === 'kairos' && <div className="agent-runtime-channel">
      <MessageCircle size={16} /><div><strong>Canal WhatsApp</strong><p>{channelText}</p></div>
    </div>}
    <label>Terminal preferido para este papel
      <select value={runtime} onChange={(event) => setChoices((current) => ({ ...current, [agentId]: event.target.value as Runtime }))}>
        <option value="manual">Sem terminal associado</option>
        <option value="codex">Codex CLI</option>
        <option value="claude">Claude Code</option>
      </select>
    </label>
    {command && <div className="agent-runtime-command">
      <code>{command}</code><button type="button" onClick={() => void copyCommand()}><Copy size={14} />Copiar comando</button>
    </div>}
    <p className="agent-runtime-note">{command ? 'Abra uma terminal local na pasta do projeto e execute o comando exibido. Esta escolha organiza o trabalho do papel; não cria um processo nem concede acesso remoto por si só.' : 'Associe Codex CLI ou Claude Code para deixar o comando de trabalho pronto neste navegador.'}</p>
    {agentId === 'kairos' && <a href="https://business.whatsapp.com/" target="_blank" rel="noreferrer">Abrir WhatsApp Business oficial <ExternalLink size={14} /></a>}
    {fleet?.status === 'online' && <span className="agent-runtime-confirmed"><CheckCircle2 size={14} />Sinal de processo confirmado pela frota.</span>}
  </section>
}

