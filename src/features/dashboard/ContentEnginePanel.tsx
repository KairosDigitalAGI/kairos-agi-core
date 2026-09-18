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

// Pipeline real do Content Engine (command.content_jobs). Nesta implantação
// de custo zero, a criação por APIs pagas fica fechada no backend. O Flow
// gratuito gera ativos, e a Video Engine importa seus MP4 na galeria local.
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
    postToYoutube,
    postToInstagram,
    generatingJobId,
    generateError,
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
      <p>Modo custo zero: a API Veo e os modelos de imagem não têm faixa gratuita. Crie imagens e clipes com os créditos diários no <a href="https://flow.google.com/" target="_blank" rel="noreferrer">Google Flow</a> e importe os MP4 na <a href="/?module=video">Video Engine</a>. Nenhuma chamada paga é iniciada por este painel.</p>

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
                  {['ideia', 'roteiro', 'imagem'].includes(job.etapa) && <small>Geração por API pausada no modo custo zero.</small>}
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
