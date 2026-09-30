import { useState } from 'react'
import { Bot, CheckCircle2, ExternalLink, LockKeyhole, MessageCircleReply, Search, Send, ShieldCheck, UserRoundCheck } from 'lucide-react'
import { AgentRuntimePanel } from '../dashboard/AgentRuntimePanel'
import { OperationsUnlock } from '../dashboard/OperationsUnlock'
import { useFleetStatus } from '../../core/useFleetStatus'
import './crm.css'

const humanSteps = [
  {
    title: 'WhatsApp Business Platform',
    detail: 'Escolher o número oficial, concluir a autorização da Meta e aprovar os modelos de mensagem usados somente com base válida.',
    href: 'https://business.facebook.com/wa/manage/home/',
    action: 'Abrir Meta Business',
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
const defaultOutreachDraft = 'Olá! Sou da Kairos Digital. Analisei informações públicas da sua empresa e identifiquei oportunidades para melhorar a captação digital. Posso enviar um diagnóstico curto e gratuito por aqui? Se preferir não receber mensagens, responda SAIR.'

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

    <OperationsUnlock />

    <section className="carlos-status-grid">
      <article className="glass-panel"><Bot size={21} /><span>RUNTIME</span><strong>{online ? 'Conectado' : 'Protegido'}</strong><p>Sessão atual da VPS; não equivale à API oficial da Meta.</p></article>
      <article className="glass-panel"><MessageCircleReply size={21} /><span>RESPOSTAS</span><strong>{online ? 'Inbound ativo' : 'Aguardando consulta'}</strong><p>Responde somente após uma mensagem nova e respeita pausa e handoff.</p></article>
      <article className="glass-panel"><Search size={21} /><span>HUNTER DIÁRIO</span><strong>Até 30 qualificados</strong><p>Busca, deduplica e pontua. A quantidade final depende da qualidade observada.</p></article>
      <article className="glass-panel"><ShieldCheck size={21} /><span>PROTEÇÃO META</span><strong>Disparo frio bloqueado</strong><p>Intervalo aleatório não substitui consentimento nem reduz o risco de denúncia.</p></article>
    </section>

    <section className="glass-panel carlos-routine">
      <div><span className="eyebrow">ROTINA DIÁRIA · PREPARADA</span><h3>O que já funciona daqui para frente</h3></div>
      <ol>
        <li><CheckCircle2 size={17} /><div><strong>07h · descoberta</strong><p>Busca pública com teto de 30 contatos, filtros de reputação, telefone, deduplicação e score.</p></div></li>
        <li><CheckCircle2 size={17} /><div><strong>Revisão · fila parada</strong><p>Prospects ficam separados do bot enquanto a base e o canal de contato não forem aprovados.</p></div></li>
        <li><CheckCircle2 size={17} /><div><strong>Atendimento · mensagem recebida</strong><p>O KAIROS responde a inbound fresco, registra contexto e chama o Founder quando houver handoff.</p></div></li>
        <li><CheckCircle2 size={17} /><div><strong>Teste real · 30/09/2026 17:49</strong><p>A VPS confirmou a entrega de uma mensagem de diagnóstico exclusivamente ao telefone do Founder.</p></div></li>
      </ol>
    </section>

    <section className="glass-panel outbound-authorization">
      <div className="outbound-heading">
        <div><span className="eyebrow">AUTORIZAÇÃO DO FOUNDER</span><h3>Campanha de prospecção ativa</h3><p>Registre aqui o lote que você autoriza. O registro prepara a campanha, mas o envio permanece travado até a WhatsApp Business Platform confirmar o canal oficial.</p></div>
        <div className={`outbound-gate ${authorization ? 'authorized' : ''}`}><LockKeyhole size={17} /><strong>{authorization ? 'Autorização registrada' : 'Aguardando autorização'}</strong><span>Execução: bloqueada pela conexão oficial</span></div>
      </div>
      <div className="outbound-form">
        <label>Limite por dia<input type="number" min="1" max="30" value={dailyLimit} onChange={event => setDailyLimit(Math.min(30, Math.max(1, Number(event.target.value) || 1)))} /></label>
        <label className="outbound-message">Mensagem para aprovação<textarea rows={5} value={message} onChange={event => setMessage(event.target.value)} /></label>
        <label className="outbound-consent"><input type="checkbox" checked={founderChecked} onChange={event => setFounderChecked(event.target.checked)} /><span>Eu, Founder, autorizo preparar este lote de até {dailyLimit} contatos por dia, com identificação da Kairos Digital, opt-out e registro de resultado.</span></label>
        <button type="button" className="outbound-authorize" disabled={!founderChecked || !message.trim()} onClick={registerAuthorization}><Send size={16} /> Registrar autorização</button>
      </div>
      <div className="outbound-requirements">
        <article className="done"><CheckCircle2 size={16} /><div><strong>Busca e qualificação</strong><span>Ativa, até 30 registros/dia.</span></div></article>
        <article className={authorization ? 'done' : ''}><CheckCircle2 size={16} /><div><strong>Autorização do Founder</strong><span>{authorization ? `Registrada para ${authorization.dailyLimit}/dia neste navegador.` : 'Ainda não registrada.'}</span></div></article>
        <article><LockKeyhole size={16} /><div><strong>WhatsApp Business Platform</strong><span>Não conectada; bloqueia o envio.</span></div></article>
        <article><LockKeyhole size={16} /><div><strong>Recibos e opt-out</strong><span>Entram na execução após o canal oficial.</span></div></article>
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
