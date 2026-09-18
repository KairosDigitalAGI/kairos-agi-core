import { useCallback, useEffect, useState } from 'react'
import { Bell, ExternalLink, MessageSquare, RefreshCw } from 'lucide-react'
import { useOperationsAuth } from '../../core/OperationsAuthProvider'

interface InboxData {
  rules: Array<{ id: string; keyword: string; kind: string; enabled: boolean }>
  events: Array<{ id: string; status: string; kind: string }>
}

interface Props { active: boolean }

export function InstagramAutomationPanel({ active }: Props) {
  const { header } = useOperationsAuth()
  const [data, setData] = useState<InboxData | null>(null)
  const [loading, setLoading] = useState(false)
  const [subscribing, setSubscribing] = useState(false)
  const [subscribeMsg, setSubscribeMsg] = useState('')
  const [subscription, setSubscription] = useState<string>('Não verificada')
  const [inboxError, setInboxError] = useState('')

  const load = useCallback(async () => {
    if (!header) return
    setLoading(true)
    try {
      const res = await fetch('/api/integrations/instagram/inbox', { headers: { Authorization: header } })
      const body = await res.json().catch(() => ({}))
      if (res.ok) { setData(body); setInboxError('') }
      else setInboxError(body.erro || `Caixa de entrada indisponível (${res.status}).`)
      const statusRes = await fetch('/api/integrations/instagram/webhook-subscription', { headers: { Authorization: header } })
      const status = await statusRes.json().catch(() => ({}))
      setSubscription(statusRes.ok ? (status.subscribed ? 'comments e messages assinados na conta' : 'Assinatura da conta incompleta') : (status.erro || 'Assinatura não verificada'))
    } catch { setInboxError('Não foi possível consultar o servidor.') } finally { setLoading(false) }
  }, [header])

  useEffect(() => { if (active) void load() }, [active, load])

  async function activateWebhook() {
    if (!header) return
    setSubscribing(true); setSubscribeMsg('')
    try {
      const res = await fetch('/api/integrations/instagram/subscribe-webhook', { method: 'POST', headers: { Authorization: header } })
      const json = await res.json().catch(() => ({}))
      setSubscribeMsg(res.ok ? 'Assinatura da conta solicitada à Meta. Entrega real ainda exige app publicado e teste com evento.' : (json.erro || 'Falha ao ativar.'))
      if (res.ok) void load()
    } catch { setSubscribeMsg('Falha ao ativar.') } finally { setSubscribing(false) }
  }

  if (!active) return null

  const rulesEnabled = data?.rules.filter(r => r.enabled).length ?? 0
  const pending = data?.events.filter(e => e.status === 'pending').length ?? 0

  return (
    <div className="ig-auto-panel">
      <div className="ig-auto-header">
        <span className="ig-auto-title"><MessageSquare size={14} /> Atendimento Instagram</span>
        {loading && <span className="ig-auto-loading"><RefreshCw size={12} className="spin" /> Carregando…</span>}
      </div>
      <p>Regras aprovadas podem responder automaticamente. O teste de "oi" com LLM gratuita exige remetente por ID e projeto Free Tier verificados; demais mensagens aguardam revisão.</p>
      <small>Assinatura da conta: {subscription}. Isso não comprova entrega de eventos.</small>
      {inboxError && <small role="alert">{inboxError}</small>}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <small style={{ color: 'var(--muted)' }}>Regras ativas: <strong style={{ color: '#6ee7b7' }}>{rulesEnabled}</strong></small>
        <small style={{ color: 'var(--muted)' }}>Eventos pendentes: <strong style={{ color: '#fcd34d' }}>{pending}</strong></small>
      </div>
      <button
        type="button"
        onClick={() => void activateWebhook()}
        disabled={subscribing}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 28, padding: '0 10px', border: '1px solid rgba(52,211,153,.3)', borderRadius: 7, background: 'rgba(52,211,153,.08)', color: '#6ee7b7', fontSize: '.65rem', cursor: 'pointer' }}
      >
        <Bell size={12} />{subscribing ? 'Ativando…' : 'Ativar recebimento de eventos'}
      </button>
      {subscribeMsg && <small role="alert" style={{ fontSize: '.65rem' }}>{subscribeMsg}</small>}
      <a href="/?module=instagram" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.65rem', color: '#93c5fd', textDecoration: 'none' }}>
        Gerenciar regras e caixa de entrada <ExternalLink size={11} />
      </a>
    </div>
  )
}
