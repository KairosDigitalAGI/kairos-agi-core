import { useCallback, useEffect, useState } from 'react'
import { useOperationsAuth } from '../../core/OperationsAuthProvider'
import { OperationsUnlock } from '../../features/dashboard/OperationsUnlock'

type Kind = 'comment' | 'message'
type Event = {
  event_key: string; kind: Kind; sender_username: string | null; content: string
  status: 'pending' | 'sending' | 'sent' | 'review'; reply_text: string | null
  sent_at: string | null; error: string | null; created_at: string
}
type Rule = {
  id: string; kind: Kind; keyword: string; response_text: string
  enabled: boolean; approved_at: string | null
}

export function InstagramEngagementPanel() {
  const { header } = useOperationsAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [rules, setRules] = useState<Rule[]>([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [kind, setKind] = useState<Kind>('message')
  const [keyword, setKeyword] = useState('')
  const [responseText, setResponseText] = useState('')
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    if (!header) return
    setError('')
    try {
      const response = await fetch('/api/integrations/instagram/inbox', { headers: { authorization: header }, cache: 'no-store' })
      const body = await response.json()
      if (!response.ok) throw new Error(body.erro || 'Não foi possível carregar o atendimento.')
      setEvents(body.events || []); setRules(body.rules || [])
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Atendimento indisponível.') }
  }, [header])
  useEffect(() => { void load() }, [load])

  async function action(path: string, payload: object) {
    if (!header) return
    setBusy(true); setError(''); setNotice('')
    try {
      const response = await fetch(`/api/integrations/instagram/${path}`, {
        method: 'POST', headers: { authorization: header, 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.erro || 'Ação recusada pelo servidor.')
      setNotice(path === 'reply' ? 'Resposta enviada ou encaminhada para revisão. Confira o status abaixo.' : 'Configuração salva.')
      await load()
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Ação indisponível.') }
    finally { setBusy(false) }
  }

  return <section className="glass-panel instagram-engagement">
    <div className="engagement-head"><div><span className="eyebrow">ATENDIMENTO OFICIAL · META</span><h3>Comentários e Direct</h3></div>
      <button type="button" onClick={() => void load()} disabled={!header || busy}>Atualizar</button></div>
    <p>Após configurar o webhook na Meta e a migration no Supabase mestre, eventos reais aparecerão aqui. Apenas regras aprovadas e ativadas respondem automaticamente; uma resposta por pessoa e canal ao dia. Nada usa modelos pagos.</p>
    {!header && <OperationsUnlock />}
    {error && <p role="alert" className="editorial-alert">{error}</p>}
    {notice && <p role="status" className="editorial-notice">{notice}</p>}
    {header && <>
      <div className="engagement-grid">
        <div><h4>Nova regra</h4><p>Começa pausada. Revise o texto antes de ativar.</p>
          <label>Canal<select value={kind} onChange={e => setKind(e.target.value as Kind)}><option value="message">Direct recebido</option><option value="comment">Comentário recebido</option></select></label>
          <label>Palavra-chave<input value={keyword} onChange={e => setKeyword(e.target.value)} maxLength={80} placeholder="Ex.: orçamento" /></label>
          <label>Resposta aprovada<textarea value={responseText} onChange={e => setResponseText(e.target.value)} maxLength={500} rows={4} placeholder="Texto exato que será enviado" /></label>
          <button type="button" disabled={busy || keyword.trim().length < 2 || !responseText.trim()} onClick={() => void action('rule', { kind, keyword, responseText })}>Salvar regra pausada</button>
        </div>
        <div><h4>Regras</h4>{rules.length === 0 && <p>Nenhuma regra cadastrada.</p>}
          {rules.map(rule => <article key={rule.id} className="engagement-item"><strong>{rule.kind === 'message' ? 'Direct' : 'Comentário'} · “{rule.keyword}”</strong><p>{rule.response_text}</p>
            <span>{rule.enabled ? 'Ativa' : 'Pausada'}</span>{' '}
            <button type="button" disabled={busy} onClick={() => void action('rule-toggle', { id: rule.id, enabled: !rule.enabled })}>{rule.enabled ? 'Pausar' : 'Aprovar texto e ativar'}</button>
          </article>)}
        </div>
      </div>
      <h4>Fila de atendimento</h4><p>As respostas manuais são enviadas apenas após clicar em “Enviar resposta”. Eventos ambíguos ficam para revisão.</p>
      {events.length === 0 && <p>Nenhum comentário ou Direct recebido pelo webhook ainda.</p>}
      {events.map(event => <article key={event.event_key} className="engagement-item"><div><strong>{event.kind === 'message' ? 'Direct' : 'Comentário'} · {event.sender_username ? `@${event.sender_username}` : 'Pessoa no Instagram'}</strong><span>{event.status === 'pending' ? 'Pendente' : event.status === 'sent' ? 'Enviada' : event.status === 'review' ? 'Revisar' : 'Enviando'}</span></div>
        <p>{event.content}</p><small>{new Date(event.created_at).toLocaleString('pt-BR')}</small>
        {event.reply_text && <p><strong>Resposta:</strong> {event.reply_text}</p>}
        {event.error && <p role="alert">{event.error}</p>}
        {event.status === 'pending' && <div className="engagement-reply"><textarea aria-label={`Resposta para ${event.event_key}`} value={drafts[event.event_key] || ''} onChange={e => setDrafts({ ...drafts, [event.event_key]: e.target.value })} maxLength={500} rows={2} /><button type="button" disabled={busy || !drafts[event.event_key]?.trim()} onClick={() => void action('reply', { eventKey: event.event_key, text: drafts[event.event_key] })}>Enviar resposta</button></div>}
      </article>)}
    </>}
  </section>
}
