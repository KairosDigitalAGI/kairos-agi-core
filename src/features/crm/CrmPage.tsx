import { useState } from 'react'
import { AlertTriangle, Bot, CheckCircle2, ExternalLink, MessageCircleReply, Search, Send, ShieldCheck, UserRoundCheck } from 'lucide-react'
import { AgentRuntimePanel } from '../dashboard/AgentRuntimePanel'
import { OperationsUnlock } from '../dashboard/OperationsUnlock'
import { useFleetStatus } from '../../core/useFleetStatus'
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
      <article className="glass-panel"><Search size={21} /><span>HUNTER DIÁRIO</span><strong>Até 30 qualificados</strong><p>Busca, deduplica e pontua. A quantidade final depende da qualidade observada.</p></article>
      <article className="glass-panel"><ShieldCheck size={21} /><span>CONTROLE DE SAÍDA</span><strong>Campanha isolada</strong><p>O freio geral continua fechado; somente a fila Hunter aprovada atravessa a rota programada.</p></article>
    </section>

    <section className="glass-panel carlos-routine">
      <div><span className="eyebrow">ROTINA DIÁRIA · PREPARADA</span><h3>O que já funciona daqui para frente</h3></div>
      <ol>
        <li><CheckCircle2 size={17} /><div><strong>07h · prospecção</strong><p>Até 30 empresas Hunter ainda não contatadas recebem uma única abordagem personalizada.</p></div></li>
        <li><CheckCircle2 size={17} /><div><strong>08h, 13h e 18h · Hunter</strong><p>Novas fontes públicas são avaliadas para recompor a reserva do dia seguinte.</p></div></li>
        <li><CheckCircle2 size={17} /><div><strong>Atendimento · mensagem recebida</strong><p>O KAIROS responde a inbound fresco, registra contexto e chama o Founder quando houver handoff.</p></div></li>
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
        <article className="done"><CheckCircle2 size={16} /><div><strong>Busca e qualificação</strong><span>Ativa, até 30 registros/dia.</span></div></article>
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
