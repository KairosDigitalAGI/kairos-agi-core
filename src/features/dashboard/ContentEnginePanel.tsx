import { FormEvent, useEffect, useState } from 'react'
import { CheckCircle2, Clapperboard, ExternalLink, Play, RefreshCw, Sparkles, XCircle } from 'lucide-react'
import { useContentPipeline } from '../../core/useContentPipeline'
import { STUDIO_PRODUCTION_DRAFT_KEY, type StudioProductionDraft } from '../studio/storyboard'
import { SectionHeader } from '../../ui/SectionHeader'
import type { ContentJobEtapa, SeedanceReadinessResponse } from '../../types/operations'
import './operations.css'

const ETAPA_LABEL: Record<ContentJobEtapa, string> = {
  ideia: 'Ideia', roteiro: 'Roteiro', imagem: 'Imagem', video: 'Vídeo', legenda: 'Legenda', aprovacao: 'Aprovação', publicado: 'Publicado', rejeitado: 'Rejeitado',
}

const SIGNAL_TEST_TITLE = 'Kairos Signal — Episódio 1 · establishing shot'
const SIGNAL_TEST_BRIEF = 'Clipe vertical cinematográfico original, 9:16, 8 segundos. Um grão violeta desperta na escuridão e desenha uma ampulheta abstrata de luz azul, violeta e magenta. Dolly-out lento revela a Founder Tower dentro de uma interface de vidro, cidade digital abstrata ao fundo, partículas sutis, macro de textura de vidro e arquitetura precisa. Sem pessoas, sem rosto, sem voz, sem texto legível, sem logotipos de terceiros, sem personagens existentes, sem marca d’água. O quadro final deixa espaço limpo para a assinatura Kairos Digital adicionada depois na edição.'
const SEEDANCE_OUTPUT_RATE_USD_PER_MILLION = 10.70
const VERCEL_GATEWAY_URL = 'https://vercel.com/ai-gateway'
const sixtySecondPlan: ReadonlyArray<readonly [string, string, string, string]> = [
  ['01', 'O grão', '7–8 s', 'Narrador: “Toda ideia começa pequena.”'],
  ['02', 'O sinal', '7–8 s', 'KAIROS: “Recebi uma ideia. Abrimos uma missão?”'],
  ['03', 'O contexto', '7–8 s', 'ORION: “Velocidade sem direção é só barulho.”'],
  ['04', 'A investigação', '7–8 s', 'HUNTER: “Sinal não é cliente. Primeiro, evidência.”'],
  ['05', 'A história', '7–8 s', 'INSTAGRAM AI: “Então vamos fazer alguém sentir.”'],
  ['06', 'O limite', '7–8 s', 'CFO + QA: “Criar também exige limite e prova.”'],
  ['07', 'A decisão', '7–8 s', 'KAIROS: “Eu preparo opções. Você decide.”'],
  ['08', 'A hora certa', '7–8 s', 'Narrador: “Kairos Digital. Construa a hora certa.”'],
]

function readStoryboardDraft(): StudioProductionDraft | null {
  try {
    const value = JSON.parse(localStorage.getItem(STUDIO_PRODUCTION_DRAFT_KEY) ?? 'null')
    if (!value || typeof value.title !== 'string' || typeof value.briefing !== 'string') return null
    return { title: value.title.slice(0, 200), briefing: value.briefing.slice(0, 2000) }
  } catch { return null }
}

// Painel operacional do Content Engine. O backend continua sendo a fonte de
// verdade de autorização, saldo e execução; a interface mostra a recusa real
// quando a Gateway estiver desligada, sem crédito ou sem migration.
export function ContentEnginePanel() {
  const {
    state, createJob, submitting, submitError, generateScript, generateImage,
    generateVideo, postToYoutube, postToInstagram, generatingJobId, generateError,
    approveJob, approvingJobId, approveError,
  } = useContentPipeline()
  const [storyboardDraft] = useState(readStoryboardDraft)
  const [titulo, setTitulo] = useState(() => storyboardDraft?.title ?? '')
  const [briefing, setBriefing] = useState(() => storyboardDraft?.briefing ?? '')
  const [route, setRoute] = useState<'gateway' | 'local'>('gateway')
  const [gatewayPrompt, setGatewayPrompt] = useState(SIGNAL_TEST_BRIEF)
  const [readiness, setReadiness] = useState<SeedanceReadinessResponse | null>(null)
  const [checkingReadiness, setCheckingReadiness] = useState(true)

  async function refreshReadiness() {
    setCheckingReadiness(true)
    try {
      const response = await fetch('/api/integrations/status?scope=media', { cache: 'no-store' })
      if (!response.ok) throw new Error('status indisponível')
      const status = await response.json() as { media?: { seedance?: SeedanceReadinessResponse | null } }
      setReadiness(status.media?.seedance ?? null)
    } catch { setReadiness(null) }
    finally { setCheckingReadiness(false) }
  }

  useEffect(() => { void refreshReadiness() }, [])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = titulo.trim()
    if (!trimmed) return
    const cleanBriefing = briefing.trim()
    const ok = await createJob(trimmed, cleanBriefing ? { roteiro: cleanBriefing } : undefined)
    if (ok) {
      setTitulo('')
      setBriefing('')
      localStorage.removeItem(STUDIO_PRODUCTION_DRAFT_KEY)
    }
  }

  function prepareSignalTest() {
    setTitulo(SIGNAL_TEST_TITLE)
    setBriefing(gatewayPrompt.trim())
  }

  function openLocalEngine() {
    document.getElementById('video-engine-local')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <article className="glass-panel content-engine-panel">
      <SectionHeader eyebrow="Content Engine · Gateway" title="Produção e acervo" action={<Sparkles size={18} />} />
      <div className="gateway-status">
        <Clapperboard size={18} />
        <div><strong>Seedance 2.5 · Vercel AI Gateway</strong><span>Clipe textual de 8 s · 9:16 · teto técnico de US$ 5 · sem recarga</span></div>
        <a href="/?module=library"><ExternalLink size={14} />Abrir acervo</a>
      </div>
      <p>O Gateway só executa um job aprovado e com a flag específica ativada no servidor. A primeira criação não usa imagem, voz ou rosto do Founder; os vídeos retornados entram no acervo operacional e não são publicados automaticamente.</p>
      {storyboardDraft && <p className="generation-route-note"><strong>Rascunho do storyboard carregado.</strong> Revise título e prompt abaixo; “Registrar ideia” cria apenas o job, sem aprovar, gerar ou gastar.</p>}
      <section className="seedance-readiness" aria-live="polite">
        <div><span className="eyebrow">PRÉ-VOO REAL · SEEDANCE 2.5</span><strong>{checkingReadiness ? 'Verificando o servidor…' : readiness ? 'Estado confirmado pelo deployment' : 'Status não disponível'}</strong></div>
        <button type="button" onClick={() => void refreshReadiness()} disabled={checkingReadiness}><RefreshCw size={14} />Atualizar</button>
        {readiness && <ul>
          {[[readiness.contentStoreReady, 'Pipeline e migrations'], [readiness.storageReady, 'Bucket content-assets'], [readiness.featureEnabled, 'Flag de uma geração Seedance'], [readiness.gatewayAuthenticated, 'Autenticação da AI Gateway']].map(([ready, label]) => <li key={String(label)} className={ready ? 'ready' : 'pending'}>{ready ? <CheckCircle2 size={15} /> : <XCircle size={15} />}<span>{label}</span></li>)}
        </ul>}
        {readiness && <small>Teto técnico: US$ {readiness.budgetCapUsd.toFixed(2)} · job aprovado obrigatório · sem publicação automática.</small>}
      </section>

      <section className="generation-budget" aria-label="Orçamento da geração">
        <div><span className="eyebrow">ORÇAMENTO VISÍVEL · PRIMEIRO TAKE</span><strong>1 clipe Seedance de 8 s: US$ 0,00–US$ {readiness?.budgetCapUsd.toFixed(2) ?? '5.00'}</strong></div>
        <dl><div><dt>Teto da chave</dt><dd>US$ {readiness?.budgetCapUsd.toFixed(2) ?? '5.00'} total, sem recarga.</dd></div><div><dt>Preço publicado</dt><dd>US$ {SEEDANCE_OUTPUT_RATE_USD_PER_MILLION.toFixed(2)} / 1 mi de tokens de saída.</dd></div><div><dt>Valor exato</dt><dd>A Gateway devolve o uso depois do render; o acervo registra esse dado.</dd></div></dl>
        <p>Não há uma tarifa pública fixa por segundo para este modelo. Por isso o Kairos não inventa um preço por clipe: o intervalo é protegido pelo teto da chave, e o valor realizado aparece no acervo após a resposta da Gateway.</p>
        <div className="generation-budget-links"><a href="https://vercel.com/ai-gateway/models/seedance-2.5" target="_blank" rel="noreferrer">Ver tabela de preços do modelo <ExternalLink size={13} /></a><a href={VERCEL_GATEWAY_URL} target="_blank" rel="noreferrer">Adicionar saldo protegido na Vercel <ExternalLink size={13} /></a></div>
      </section>

      <section className="sixty-second-plan" aria-label="Plano do filme de sessenta segundos">
        <div><span className="eyebrow">FILME FINAL · 60 SEGUNDOS</span><h3>Oito takes, uma história e montagem final</h3><p>O Seedance renderiza takes curtos. A qualidade vem de fixar os mesmos press kits, paleta, lente e movimentos por take; depois o Kairos monta a sequência vertical com transições, trilha e a assinatura final.</p></div>
        <ol>{sixtySecondPlan.map(([number, title, duration, audio]) => <li key={number}><span>{number}</span><strong>{title}</strong><small>{duration}</small><p>{audio}</p></li>)}</ol>
        <footer><strong>Guardrail:</strong> cada take será um job separado, registrado e revisável. O teto de US$ 5 é global para esta primeira rodada; não há recarga automática nem publicação automática.</footer>
      </section>

      <section className="generation-route" aria-label="Rota de geração">
        <div><span className="eyebrow">MODELO E PROMPT DO PRÓXIMO TAKE</span><h3>Escolha a rota antes de criar o job</h3></div>
        <div className="generation-route-options">
          <button type="button" className={route === 'gateway' ? 'selected' : ''} onClick={() => setRoute('gateway')}><Clapperboard size={16} /><span><strong>Seedance 2.5</strong><small>Vercel AI Gateway · 8 s · uso real devolvido</small></span></button>
          <button type="button" className={route === 'local' ? 'selected' : ''} onClick={() => setRoute('local')}><Play size={16} /><span><strong>Kairos Motion local</strong><small>Canvas/WebM · custo de API zero</small></span></button>
        </div>
        {route === 'gateway' ? <><label>Prompt exato do clipe inicial<textarea value={gatewayPrompt} onChange={event => setGatewayPrompt(event.target.value)} maxLength={2400} rows={7} /></label><div className="camera-grammar"><strong>Gramática de câmera do projeto</strong><span><b>Entrada:</b> macro de partículas e textura de vidro · <b>movimento:</b> dolly-out lento e órbita curta · <b>transição:</b> match-cut ampulheta→interface · <b>respiro:</b> plano fixo só na decisão humana.</span></div><p className="generation-route-note">Ao registrar e aprovar este job, este é o texto integral enviado ao Seedance; o servidor não o resume. A chamada continua bloqueada até flag da Gateway, OIDC, armazenamento e orçamento confirmados pelo servidor.</p></> : <div className="generation-route-note"><strong>Rota local selecionada.</strong> Ela gera motion graphics no navegador a partir do roteiro, sem API externa. <button type="button" onClick={openLocalEngine}>Abrir Video Engine local</button></div>}
      </section>

      <section className="publication-readiness"><span className="eyebrow">AUTOPUBLICAÇÃO · AINDA BLOQUEADA</span><p>O vídeo só poderá seguir automaticamente quando o canal Instagram confirmar publicação remota e o atendimento comprovar webhook de comentários e Direct em produção. Até lá, o pipeline mantém cada publicação em revisão, sem fingir automação.</p></section>

      {state.status === 'sem-credencial' && <p>Trancado. Desbloqueie o Painel Operacional acima para ver jobs, acervo e uso retornado.</p>}
      {state.status === 'carregando' && <p>Consultando pipeline e acervo…</p>}
      {state.status === 'erro' && <p>{state.mensagem}</p>}
      {state.status === 'ok' && state.data.source === 'unavailable' && <p>Pipeline indisponível: {state.data.reason ?? 'schema command não configurado.'}</p>}

      {state.status === 'ok' && (
        <form className="content-engine-form" onSubmit={onSubmit}>
          <div className="content-engine-form-heading"><strong>Novo job</strong><button type="button" className="content-engine-template" onClick={prepareSignalTest} disabled={submitting}>Preparar teste Kairos Signal</button></div>
          <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título da nova ideia" maxLength={200} disabled={submitting} />
          <textarea value={briefing} onChange={(e) => setBriefing(e.target.value)} placeholder="Briefing opcional: mensagem, cena, público e limites" maxLength={2000} disabled={submitting} rows={4} />
          <button type="submit" disabled={submitting || !titulo.trim()}>{submitting ? 'Registrando…' : 'Registrar ideia'}</button>
        </form>
      )}
      {submitError && <p className="content-engine-error">{submitError}</p>}
      {generateError && <p className="content-engine-error">{generateError}</p>}
      {approveError && <p className="content-engine-error">{approveError}</p>}

      {state.status === 'ok' && state.data.source === 'real' && (
        state.data.jobs.length === 0 ? <p>Nenhum job registrado ainda em command.content_jobs.</p> : (
          <ul className="content-engine-jobs">
            {state.data.jobs.map((job) => {
              const loading = generatingJobId === job.id || approvingJobId === job.id
              return <li key={job.id}>
                <span className={`content-engine-etapa etapa-${job.etapa}`}>{ETAPA_LABEL[job.etapa] ?? job.etapa}</span>
                <span className="content-engine-titulo">{job.titulo}</span>
                {!job.aprovado && <button type="button" className="content-engine-generate" disabled={loading} onClick={() => void approveJob(job.id)}>{loading ? 'Aprovando…' : 'Aprovar job'}</button>}
                {job.aprovado && job.etapa === 'ideia' && <button type="button" className="content-engine-generate gateway-action" disabled={loading} onClick={() => void generateVideo(job.id, 'gateway')}>{loading ? 'Gerando…' : 'Gerar Seedance 8 s'}</button>}
                {job.aprovado && job.etapa === 'ideia' && <button type="button" className="content-engine-generate" disabled={loading} onClick={() => void generateScript(job.id)}>{loading ? 'Gerando…' : 'Gerar roteiro'}</button>}
                {job.aprovado && job.etapa === 'roteiro' && <button type="button" className="content-engine-generate" disabled={loading} onClick={() => void generateImage(job.id)}>{loading ? 'Gerando…' : 'Gerar imagem'}</button>}
                {job.aprovado && job.etapa === 'imagem' && <button type="button" className="content-engine-generate gateway-action" disabled={loading} onClick={() => void generateVideo(job.id, 'gateway')}>{loading ? 'Gerando…' : 'Gerar Seedance 8 s'}</button>}
                {job.etapa === 'video' && job.aprovado && <button type="button" className="content-engine-generate" disabled={loading} onClick={() => void postToYoutube(job.id)}>{loading ? 'Publicando…' : 'YouTube privado'}</button>}
                {job.etapa === 'video' && job.aprovado && <button type="button" className="content-engine-generate" disabled={loading} onClick={() => void postToInstagram(job.id)}>{loading ? 'Publicando…' : 'Instagram'}</button>}
              </li>
            })}
          </ul>
        )
      )}
    </article>
  )
}
