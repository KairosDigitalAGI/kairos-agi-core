import { Fragment, useState } from 'react'
import { AlertTriangle, Bot, CheckCircle2, ChevronDown, ChevronRight, Code2, ExternalLink, Eye, EyeOff, MessageCircleReply, RefreshCw, Search, Send, ShieldCheck, UserRoundCheck } from 'lucide-react'
import { AgentRuntimePanel } from '../dashboard/AgentRuntimePanel'
import { OperationsUnlock } from '../dashboard/OperationsUnlock'
import { useFleetStatus } from '../../core/useFleetStatus'
import { useCrm } from '../../core/useCrm'
import type { CrmLead } from '../../types/operations'
import './crm.css'

const humanSteps = [
  {
    title: 'WhatsApp oficial (migração opcional)',
    detail: 'A campanha atual usa a sessão Web já pareada. A plataforma oficial permanece como opção futura para maior estabilidade e governança.',
    href: 'https://business.facebook.com/wa/manage/home/',
    action: 'Consultar Meta Business',
  },
  {
    title: 'Workana',
    detail: 'A conta precisa concluir a revisão do perfil. Depois, a integração da caixa de entrada será tratada separadamente do WhatsApp.',
    href: 'https://www.workana.com/dashboard',
    action: 'Abrir Workana',
  },
  {
    title: '99Freelas',
    detail: 'Entrar na conta e confirmar qual caixa de entrada poderá ser consultada. Nenhuma credencial será salva no frontend.',
    href: 'https://www.99freelas.com.br/',
    action: 'Abrir 99Freelas',
  },
]

const authorizationKey = 'kairos.outbound.authorization.v1'
const defaultOutreachDraft = 'Olá, {{nome}}! Vi a {{empresa}} e reparei que {{sinal_real}}. Aqui é da Kairos Digital. Preparei duas sugestões específicas sobre {{oportunidade}} que podem ajudar sua empresa. Posso te enviar por aqui, sem compromisso? Se preferir não receber mensagens, responda SAIR.'

type CampaignAuthorization = {
  authorizedAt: string
  dailyLimit: number
  message: string
}

function readAuthorization(): CampaignAuthorization | null {
  try {
    const value = window.localStorage.getItem(authorizationKey)
    return value ? JSON.parse(value) as CampaignAuthorization : null
  } catch {
    return null
  }
}

const stageLabel: Record<string, string> = { abertura: 'Abertura', diagnostico: 'Diagnóstico', dor: 'Dor', solucao: 'Solução', interesse: 'Interesse', agendamento: 'Agendamento', fechamento: 'Fechamento', conversando: 'Conversando', site_abordado: 'Site abordado', sem_whatsapp: 'Sem WhatsApp', pausado_manual: 'Pausado', bloqueado: 'Bloqueado' }
const maskPhone = (phone: string | null) => phone ? `${phone.slice(0, 4)}••••${phone.slice(-3)}` : '—'
const when = (value: string | null) => value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '—'
const eventLabel: Record<string, string> = { classification: 'Classificação', inbound_message: 'Mensagem recebida', outbound_message: 'Mensagem enviada', delivery: 'Confirmação de entrega', blocked: 'Bloqueio', unblocked: 'Retomada', state_changed: 'Mudança de etapa', score_changed: 'Mudança de score', meeting: 'Reunião', error: 'Erro' }
const statusLabel: Record<string, string> = { received: 'recebida', queued: 'na fila', sent: 'enviada', delivered: 'entregue', read: 'lida', failed: 'falhou', blocked: 'bloqueada', ignored: 'ignorada', applied: 'aplicada' }

function LiveCrmPanel() {
  const { state, refresh } = useCrm()
  const [query, setQuery] = useState('')
  const [stage, setStage] = useState('todos')
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set())
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())
  const data = state.status === 'ok' ? state.data : null
  const leads = (data?.leads || []).filter((lead: CrmLead) => {
    const haystack = `${lead.name || ''} ${lead.niche || ''} ${lead.city || ''} ${lead.phone || ''}`.toLowerCase()
    return (stage === 'todos' || lead.state === stage) && haystack.includes(query.toLowerCase().trim())
  }).slice(0, 100)
  const stages = Array.from(new Set((data?.leads || []).map(item => item.state))).sort()
  const toggle = (id: string) => setRevealed(current => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next })
  const toggleExpanded = (id: string) => setExpanded(current => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next })
  return <>
    <section className="glass-panel crm-live">
      <div className="crm-live-heading"><div><span className="eyebrow">CRM REAL · KAIROS WHATSAPP</span><h3>Base comercial privada</h3><p>Sincronizada da VPS para o Supabase mestre. A linha do tempo atualiza a cada 15 segundos; telefones ficam ocultos até você abrir cada registro.</p></div><button type="button" onClick={() => void refresh()}><RefreshCw size={15} /> Atualizar agora</button></div>
      {state.status === 'sem-credencial' && <p className="crm-state">Desbloqueie o Painel Operacional para consultar a base.</p>}
      {state.status === 'carregando' && <p className="crm-state">Consultando a base privada…</p>}
      {state.status === 'erro' && <p className="crm-state error">{state.mensagem}</p>}
      {data && <><div className="crm-kpis"><article><span>Total</span><strong>{data.stats.total}</strong></article><article><span>Ativos</span><strong>{data.stats.active}</strong></article><article><span>Contatados</span><strong>{data.stats.contacted}</strong></article><article><span>Qualificados</span><strong>{data.stats.qualified}</strong></article><article><span>Reuniões</span><strong>{data.stats.meetings}</strong></article></div>
        <div className="crm-audit-kpis"><article><span>Eventos auditados</span><b>{data.eventStats.total}</b></article><article className="ok"><span>Entregas confirmadas</span><b>{data.eventStats.delivered}</b></article><article className="warn"><span>Bloqueios</span><b>{data.eventStats.blocked}</b></article><article className="ok"><span>Retomadas</span><b>{data.eventStats.resumed}</b></article><article className={data.eventStats.failed ? 'danger' : 'ok'}><span>Falhas</span><b>{data.eventStats.failed}</b></article></div>
        <div className="crm-toolbar"><label><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar empresa, nicho, cidade ou telefone" /></label><select value={stage} onChange={event => setStage(event.target.value)}><option value="todos">Todos os estágios</option>{stages.map(item => <option value={item} key={item}>{stageLabel[item] || item}</option>)}</select><small>{leads.length} exibidos · limite visual de 100</small></div>
        <div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>Lead</th><th>Contato</th><th>Etapa</th><th>Score</th><th>Histórico</th><th>Atualizado</th></tr></thead><tbody>{leads.map(lead => {
          const events = data.events.filter(event => event.lead_source_ref === lead.source_ref).slice(0, 50)
          const isExpanded = expanded.has(lead.id)
          return <Fragment key={lead.id}><tr className={isExpanded ? 'is-expanded' : ''}><td><button type="button" className="crm-expand" onClick={() => toggleExpanded(lead.id)} aria-label={`${isExpanded ? 'Fechar' : 'Abrir'} histórico de ${lead.name || 'lead'}`}>{isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}</button><strong>{lead.name || 'Nome não informado'}</strong><small>{[lead.niche, lead.city].filter(Boolean).join(' · ') || 'Segmento não informado'}</small></td><td><span className="crm-phone">{revealed.has(lead.id) ? lead.phone || '—' : maskPhone(lead.phone)}<button type="button" onClick={() => toggle(lead.id)} aria-label={revealed.has(lead.id) ? 'Ocultar telefone' : 'Mostrar telefone'}>{revealed.has(lead.id) ? <EyeOff size={14} /> : <Eye size={14} />}</button></span></td><td><span className={`crm-stage stage-${lead.state}`}>{stageLabel[lead.state] || lead.state}</span></td><td><b>{lead.score}</b></td><td>{lead.history_count} mensagens · {events.length} auditados</td><td>{when(lead.source_updated_at || lead.last_message_at)}</td></tr>{isExpanded && <tr className="crm-event-row"><td colSpan={6}><div className="crm-timeline">{events.map(event => <article key={event.id} className={`event-${event.status}`}><span className="crm-event-dot" /><div><strong>{eventLabel[event.event_type] || event.event_type}</strong><p>{event.summary || 'Evento sem conteúdo textual.'}</p><small>{when(event.occurred_at)} · {event.direction} · {statusLabel[event.status] || event.status}</small></div></article>)}{!events.length && <p className="crm-state">Nenhum evento novo sincronizado para este lead.</p>}</div></td></tr>}</Fragment>
        })}{!leads.length && <tr><td colSpan={6}>Nenhum lead corresponde aos filtros.</td></tr>}</tbody></table></div><small className="crm-source">Fonte: runtime KAIROS WhatsApp · consulta {when(data.checkedAt)} · atualização automática em 15 s</small></>}
    </section>
    {data && <section className="glass-panel dev-requests"><div><span className="eyebrow">EVOLUÇÃO CONTÍNUA</span><h3>Demandas de programação vindas do WhatsApp</h3><p>O KAIROS registra a necessidade, pede sua confirmação e acompanha Codex ou Claude Code até concluir, bloquear ou reportar erro.</p></div><div className="dev-request-list">{data.requests.map(request => <article key={request.id}><Code2 size={18} /><div><strong>{request.title}</strong><p>{request.description}</p><span>{request.priority} · {request.status}{request.assigned_to ? ` · ${request.assigned_to}` : ' · aguardando responsável'}</span></div></article>)}{!data.requests.length && <p className="crm-state">Nenhuma demanda de programação recebida ainda.</p>}</div></section>}
  </>
}

export function CrmPage() {
  const { state } = useFleetStatus()
  const fleet = state.status === 'ok' ? state.data.fleet : []
  const kairos = fleet.find(item => /kairos|whatsapp/i.test(`${item.slug} ${item.nome} ${item.pm2_name || ''}`))
  const online = kairos?.status === 'online'
  const [dailyLimit, setDailyLimit] = useState(30)
  const [message, setMessage] = useState(defaultOutreachDraft)
  const [founderChecked, setFounderChecked] = useState(false)
  const [authorization, setAuthorization] = useState<CampaignAuthorization | null>(readAuthorization)

  const registerAuthorization = () => {
    if (!founderChecked) return
    const next = { authorizedAt: new Date().toISOString(), dailyLimit, message: message.trim() }
    window.localStorage.setItem(authorizationKey, JSON.stringify(next))
    setAuthorization(next)
  }

  return <div className="page-stack carlos-page">
    <section className="glass-panel carlos-hero">
      <div>
        <span className="eyebrow">KAIROS AGI · OPERAÇÃO COMERCIAL</span>
        <h2>Atendimento, prospecção e handoff em um só lugar</h2>
        <p>O KAIROS organiza a busca, recebe mensagens e prepara a próxima ação. Comunicação ativa só atravessa canais autorizados, com opt-out, limites e recibo remoto.</p>
      </div>
      <div className={`carlos-live ${online ? 'is-online' : ''}`}>
        <span>{online ? 'ONLINE' : 'VERIFICAÇÃO PROTEGIDA'}</span>
        <strong>{online ? 'WhatsApp conectado' : 'Desbloqueie para consultar'}</strong>
        <small>{online ? `Processo ${kairos?.pm2_name || 'KAIROS'} confirmado pela frota` : 'O status real não é presumido sem autenticação.'}</small>
      </div>
    </section>

    <LiveCrmPanel />

    <section className="glass-panel activation-board">
      <div className="activation-heading">
        <div><span className="eyebrow">CAMPANHA PROGRAMADA</span><h3>Primeira prospecção fria</h3><p>Snapshot operacional verificado em 01/10/2026 às 03:05 (Brasília). O status online continua vindo da frota autenticada.</p></div>
        <strong>{online ? '5 de 5 prontas' : '4 de 5 prontas'}</strong>
      </div>
      <div className="activation-steps">
        <article className={online ? 'ready' : 'pending'}>{online ? <CheckCircle2 size={19} /> : <AlertTriangle size={19} />}<div><span>01 · WhatsApp conectado</span><strong>{online ? 'KAIROS online na VPS' : 'Desbloqueie para consultar'}</strong><small>Sessão e heartbeat confirmados pela frota.</small></div></article>
        <article className="ready"><CheckCircle2 size={19} /><div><span>02 · Fila aprovada</span><strong>33 empresas elegíveis</strong><small>30 para a meta diária e 3 de reserva; score Hunter mínimo 45.</small></div></article>
        <article className="ready"><CheckCircle2 size={19} /><div><span>03 · Autorização</span><strong>30 contatos por dia</strong><small>Autorização explícita do Founder registrada no runtime privado.</small></div></article>
        <article className="ready"><CheckCircle2 size={19} /><div><span>04 · Mensagem personalizada</span><strong>Empresa, nicho, cidade e sinal público</strong><small>KAIROS se identifica como assistente digital e inclui opt-out SAIR.</small></div></article>
        <article className="ready"><CheckCircle2 size={19} /><div><span>05 · Agenda e recibo</span><strong>01/10 às 07h · Brasília</strong><small>Uma abordagem por empresa; fila para se faltar confirmação no chat.</small></div></article>
      </div>
      <div className="activation-next"><strong>Próxima execução</strong><span>O KAIROS inicia automaticamente às 07h. A meta é 30; o total real depende de números válidos e confirmação do WhatsApp. O comando /campanha-parar desativa a rotina.</span></div>
    </section>

    <OperationsUnlock />

    <section className="carlos-status-grid">
      <article className="glass-panel"><Bot size={21} /><span>RUNTIME</span><strong>{online ? 'Conectado' : 'Protegido'}</strong><p>Sessão atual da VPS; não equivale à API oficial da Meta.</p></article>
      <article className="glass-panel"><MessageCircleReply size={21} /><span>RESPOSTAS</span><strong>{online ? 'Inbound ativo' : 'Aguardando consulta'}</strong><p>Responde somente após uma mensagem nova e respeita pausa e handoff.</p></article>
      <article className="glass-panel"><Search size={21} /><span>HUNTER AUTÔNOMO</span><strong>Reserva alvo: 45</strong><p>Repõe às 22h e tenta novas estratégias às 00h30 e 04h30 se a fila continuar curta.</p></article>
      <article className="glass-panel"><ShieldCheck size={21} /><span>CONTROLE DE SAÍDA</span><strong>Campanha isolada</strong><p>O freio geral continua fechado; somente a fila Hunter aprovada atravessa a rota programada.</p></article>
    </section>

    <section className="glass-panel carlos-routine">
      <div><span className="eyebrow">ROTINA DIÁRIA · PREPARADA</span><h3>O que já funciona daqui para frente</h3></div>
      <ol>
        <li><CheckCircle2 size={17} /><div><strong>07h · prospecção</strong><p>Até 30 empresas Hunter ainda não contatadas recebem uma única abordagem personalizada.</p></div></li>
        <li><CheckCircle2 size={17} /><div><strong>22h · reposição autônoma</strong><p>O Hunter mede a reserva, alterna nichos e cidades e busca até atingir 45 elegíveis. Se faltar, recupera às 00h30 e 04h30.</p></div></li>
        <li><CheckCircle2 size={17} /><div><strong>Atendimento · evolução em tempo real</strong><p>Cada resposta atualiza histórico, score e etapa no CRM. O modo gratuito bloqueia chamadas de modelos pagos.</p></div></li>
        <li><CheckCircle2 size={17} /><div><strong>Recibo obrigatório</strong><p>Sem confirmação visível no chat, a execução para e não repete a mensagem às cegas.</p></div></li>
      </ol>
    </section>

    <section className="glass-panel outbound-authorization">
      <div className="outbound-heading">
        <div><span className="eyebrow">AUTORIZAÇÃO DO FOUNDER</span><h3>Campanha de prospecção ativa</h3><p>O runtime privado está programado para 30 contatos/dia desde 01/10/2026 às 07h. Este formulário conserva uma cópia editorial do limite e da mensagem no navegador.</p></div>
        <div className="outbound-gate authorized"><CheckCircle2 size={17} /><strong>Runtime programado</strong><span>Próxima execução: 07h, Brasília</span></div>
      </div>
      <div className="outbound-form">
        <label>Limite por dia<input type="number" min="1" max="30" value={dailyLimit} onChange={event => setDailyLimit(Math.min(30, Math.max(1, Number(event.target.value) || 1)))} /></label>
        <label className="outbound-message">Mensagem para aprovação<textarea rows={5} value={message} onChange={event => setMessage(event.target.value)} /></label>
        <div className="outbound-personalization"><strong>Personalização obrigatória por contato</strong><span><code>{'{{nome}}'}</code> responsável real · <code>{'{{empresa}}'}</code> empresa · <code>{'{{sinal_real}}'}</code> observação verificável · <code>{'{{oportunidade}}'}</code> sugestão coerente com o sinal.</span><small>Se qualquer informação estiver ausente, o lead permanece em revisão e a mensagem não é preparada para envio.</small></div>
        <label className="outbound-consent"><input type="checkbox" checked={founderChecked} onChange={event => setFounderChecked(event.target.checked)} /><span>Eu, Founder, autorizo preparar este lote de até {dailyLimit} contatos por dia, com identificação da Kairos Digital, opt-out e registro de resultado.</span></label>
        <button type="button" className="outbound-authorize" disabled={!founderChecked || !message.trim()} onClick={registerAuthorization}><Send size={16} /> Salvar cópia local</button>
      </div>
      <div className="outbound-requirements">
        <article className="done"><CheckCircle2 size={16} /><div><strong>Busca e qualificação</strong><span>Ativa com coleta pública gratuita, deduplicação, score e recuperação automática.</span></div></article>
        <article className="done"><CheckCircle2 size={16} /><div><strong>Autorização do Founder</strong><span>Runtime: 30/dia. {authorization ? `Cópia local: ${authorization.dailyLimit}/dia.` : 'A cópia no navegador é opcional e não bloqueia a agenda.'}</span></div></article>
        <article className="done"><CheckCircle2 size={16} /><div><strong>Sessão WhatsApp Web</strong><span>Pareada na VPS; transporte não oficial e sujeito a limitações da plataforma.</span></div></article>
        <article className="done"><CheckCircle2 size={16} /><div><strong>Recibos e opt-out</strong><span>Confirmação no chat e palavra SAIR incluídas no fluxo.</span></div></article>
      </div>
    </section>

    <section className="glass-panel carlos-founder-actions">
      <div><span className="eyebrow">SÓ DEPENDE DO FOUNDER</span><h3>Autorizações e logins finais</h3><p>O restante técnico fica preparado pelo Core. Estes passos exigem que você entre na conta correspondente.</p></div>
      <div className="carlos-action-list">
        {humanSteps.map(step => <article key={step.title}>
          <UserRoundCheck size={19} />
          <div><strong>{step.title}</strong><p>{step.detail}</p><a href={step.href} target="_blank" rel="noreferrer">{step.action} <ExternalLink size={13} /></a></div>
        </article>)}
      </div>
    </section>

    <AgentRuntimePanel agentId="kairos" agentName="KAIROS AGI" />
  </div>
}
