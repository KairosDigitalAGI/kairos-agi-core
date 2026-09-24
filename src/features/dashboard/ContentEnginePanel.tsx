import { FormEvent, useState } from 'react'
import { Clapperboard, ExternalLink, Play, Sparkles } from 'lucide-react'
import { useContentPipeline } from '../../core/useContentPipeline'
import { SectionHeader } from '../../ui/SectionHeader'
import type { ContentJobEtapa } from '../../types/operations'
import './operations.css'

const ETAPA_LABEL: Record<ContentJobEtapa, string> = {
  ideia: 'Ideia', roteiro: 'Roteiro', imagem: 'Imagem', video: 'Vídeo', legenda: 'Legenda', aprovacao: 'Aprovação', publicado: 'Publicado', rejeitado: 'Rejeitado',
}

const SIGNAL_TEST_TITLE = 'Kairos Signal — Episódio 1 · establishing shot'
const SIGNAL_TEST_BRIEF = 'Clipe vertical cinematográfico original, 9:16, 8 segundos. Um grão violeta desperta na escuridão e desenha uma ampulheta abstrata de luz azul, violeta e magenta. Dolly-out lento revela a Founder Tower dentro de uma interface de vidro, cidade digital abstrata ao fundo, partículas sutis, macro de textura de vidro e arquitetura precisa. Sem pessoas, sem rosto, sem voz, sem texto legível, sem logotipos de terceiros, sem personagens existentes, sem marca d’água. O quadro final deixa espaço limpo para a assinatura Kairos Digital adicionada depois na edição.'

// Painel operacional do Content Engine. O backend continua sendo a fonte de
// verdade de autorização, saldo e execução; a interface mostra a recusa real
// quando a Gateway estiver desligada, sem crédito ou sem migration.
export function ContentEnginePanel() {
  const {
    state, createJob, submitting, submitError, generateScript, generateImage,
    generateVideo, postToYoutube, postToInstagram, generatingJobId, generateError,
    approveJob, approvingJobId, approveError,
  } = useContentPipeline()
  const [titulo, setTitulo] = useState('')
  const [briefing, setBriefing] = useState('')
  const [route, setRoute] = useState<'gateway' | 'local'>('gateway')
  const [gatewayPrompt, setGatewayPrompt] = useState(SIGNAL_TEST_BRIEF)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = titulo.trim()
    if (!trimmed) return
    const cleanBriefing = briefing.trim()
    const ok = await createJob(trimmed, cleanBriefing ? { roteiro: cleanBriefing } : undefined)
    if (ok) {
      setTitulo('')
      setBriefing('')
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

      <section className="generation-route" aria-label="Rota de geração">
        <div><span className="eyebrow">MODELO E PROMPT DO PRÓXIMO TAKE</span><h3>Escolha a rota antes de criar o job</h3></div>
        <div className="generation-route-options">
          <button type="button" className={route === 'gateway' ? 'selected' : ''} onClick={() => setRoute('gateway')}><Clapperboard size={16} /><span><strong>Seedance 2.5</strong><small>Vercel AI Gateway · 8 s · uso real devolvido</small></span></button>
          <button type="button" className={route === 'local' ? 'selected' : ''} onClick={() => setRoute('local')}><Play size={16} /><span><strong>Kairos Motion local</strong><small>Canvas/WebM · custo de API zero</small></span></button>
        </div>
        {route === 'gateway' ? <><label>Prompt exato do clipe inicial<textarea value={gatewayPrompt} onChange={event => setGatewayPrompt(event.target.value)} maxLength={2400} rows={7} /></label><div className="camera-grammar"><strong>Gramática de câmera do projeto</strong><span><b>Entrada:</b> macro de partículas e textura de vidro · <b>movimento:</b> dolly-out lento e órbita curta · <b>transição:</b> match-cut ampulheta→interface · <b>respiro:</b> plano fixo só na decisão humana.</span></div><p className="generation-route-note">Este texto será copiado para o briefing ao usar “Preparar teste Kairos Signal”. A chamada continua bloqueada até job aprovado, flag da Gateway, OIDC e orçamento confirmados pelo servidor.</p></> : <div className="generation-route-note"><strong>Rota local selecionada.</strong> Ela gera motion graphics no navegador a partir do roteiro, sem API externa. <button type="button" onClick={openLocalEngine}>Abrir Video Engine local</button></div>}
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
