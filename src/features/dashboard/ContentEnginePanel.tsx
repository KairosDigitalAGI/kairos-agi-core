import { FormEvent, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useContentPipeline } from '../../core/useContentPipeline'
import { SectionHeader } from '../../ui/SectionHeader'
import type { ContentJobEtapa } from '../../types/operations'
import './operations.css'

const ETAPA_LABEL: Record<ContentJobEtapa, string> = {
  ideia: 'Ideia',
  roteiro: 'Roteiro',
  imagem: 'Imagem',
  video: 'Vídeo',
  legenda: 'Legenda',
  aprovacao: 'Aprovação',
  publicado: 'Publicado',
  rejeitado: 'Rejeitado',
}

// Pipeline real do Content Engine (command.content_jobs). Registra ideias,
// gera roteiro (ideia→roteiro), imagem de capa (roteiro→imagem) e vídeo
// (imagem→video) com provider pago, um clique do Founder por vez, sempre
// atrás de aprovação explícita de gasto (job.aprovado) — legenda ainda não
// tem motor. Vídeo tem dois botões: "grátis" (Veo → fallback Kling v1.6,
// esse fallback também exige aprovado) e "premium" (Kling v2.1 Master).
// "Postar no YouTube"/"Postar no Instagram" reaproveitam o mesmo
// aprovado:true como sinal de publicação (etapa aprovacao ainda não tem
// motor — ver comentário em api/_content.js#postToYoutube) e sobem o
// vídeo como privado no canal / Reels via container assíncrono.
export function ContentEnginePanel() {
  const {
    state,
    createJob,
    submitting,
    submitError,
    generateScript,
    generateImage,
    generateVideo,
    postToYoutube,
    postToInstagram,
    generatingJobId,
    generateError,
    approveJob,
    approvingJobId,
    approveError,
  } = useContentPipeline()
  const [titulo, setTitulo] = useState('')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = titulo.trim()
    if (!trimmed) return
    const ok = await createJob(trimmed)
    if (ok) setTitulo('')
  }

  return (
    <article className="glass-panel content-engine-panel">
      <SectionHeader eyebrow="Content Engine" title="Pipeline de conteúdo" action={<Sparkles size={18} />} />

      {state.status === 'sem-credencial' && <p>Trancado. Desbloqueie o Painel Operacional acima para ver o pipeline real.</p>}
      {state.status === 'carregando' && <p>Consultando pipeline…</p>}
      {state.status === 'erro' && <p>{state.mensagem}</p>}
      {state.status === 'ok' && state.data.source === 'unavailable' && (
        <p>Pipeline indisponível: {state.data.reason ?? 'schema command não configurado.'}</p>
      )}

      {state.status === 'ok' && (
        <form className="content-engine-form" onSubmit={onSubmit}>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título da nova ideia"
            maxLength={200}
            disabled={submitting}
          />
          <button type="submit" disabled={submitting || !titulo.trim()}>
            {submitting ? 'Registrando…' : 'Registrar ideia'}
          </button>
        </form>
      )}
      {submitError && <p className="content-engine-error">{submitError}</p>}
      {generateError && <p className="content-engine-error">{generateError}</p>}
      {approveError && <p className="content-engine-error">{approveError}</p>}

      {state.status === 'ok' && state.data.source === 'real' && (
        state.data.jobs.length === 0
          ? <p>Nenhum job registrado ainda em command.content_jobs.</p>
          : (
            <ul className="content-engine-jobs">
              {state.data.jobs.map((job) => (
                <li key={job.id}>
                  <span className={`content-engine-etapa etapa-${job.etapa}`}>{ETAPA_LABEL[job.etapa] ?? job.etapa}</span>
                  <span className="content-engine-titulo">{job.titulo}</span>
                  {job.etapa === 'ideia' && !job.aprovado && (
                    <button
                      type="button"
                      className="content-engine-generate"
                      disabled={approvingJobId === job.id}
                      onClick={() => void approveJob(job.id)}
                    >
                      {approvingJobId === job.id ? 'Aprovando…' : 'Aprovar geração paga'}
                    </button>
                  )}
                  {job.etapa === 'ideia' && job.aprovado && (
                    <button
                      type="button"
                      className="content-engine-generate"
                      disabled={generatingJobId === job.id}
                      onClick={() => void generateScript(job.id)}
                    >
                      {generatingJobId === job.id ? 'Gerando…' : 'Gerar roteiro'}
                    </button>
                  )}
                  {job.etapa === 'roteiro' && job.aprovado && (
                    <button
                      type="button"
                      className="content-engine-generate"
                      disabled={generatingJobId === job.id}
                      onClick={() => void generateImage(job.id)}
                    >
                      {generatingJobId === job.id ? 'Gerando…' : 'Gerar imagem'}
                    </button>
                  )}
                  {job.etapa === 'imagem' && (
                    <button
                      type="button"
                      className="content-engine-generate"
                      disabled={generatingJobId === job.id}
                      onClick={() => void generateVideo(job.id, 'free')}
                    >
                      {generatingJobId === job.id ? 'Gerando…' : 'Gerar vídeo (grátis)'}
                    </button>
                  )}
                  {job.etapa === 'imagem' && job.aprovado && (
                    <button
                      type="button"
                      className="content-engine-generate"
                      disabled={generatingJobId === job.id}
                      onClick={() => void generateVideo(job.id, 'paid')}
                    >
                      {generatingJobId === job.id ? 'Gerando…' : 'Gerar vídeo (premium)'}
                    </button>
                  )}
                  {job.etapa === 'video' && job.aprovado && (
                    <button
                      type="button"
                      className="content-engine-generate"
                      disabled={generatingJobId === job.id}
                      onClick={() => void postToYoutube(job.id)}
                    >
                      {generatingJobId === job.id ? 'Publicando…' : 'Postar no YouTube'}
                    </button>
                  )}
                  {job.etapa === 'video' && job.aprovado && (
                    <button
                      type="button"
                      className="content-engine-generate"
                      disabled={generatingJobId === job.id}
                      onClick={() => void postToInstagram(job.id)}
                    >
                      {generatingJobId === job.id ? 'Publicando…' : 'Postar no Instagram'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )
      )}
    </article>
  )
}
