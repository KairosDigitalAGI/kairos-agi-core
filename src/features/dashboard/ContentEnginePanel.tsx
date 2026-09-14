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

// Pipeline real do Content Engine (command.content_jobs). Registra ideias e
// gera roteiro (etapa ideia→roteiro) com um provider pago, um clique do
// Founder por vez — imagem/vídeo/legenda ainda não têm motor conectado.
export function ContentEnginePanel() {
  const { state, createJob, submitting, submitError, generateScript, generatingJobId, generateError } = useContentPipeline()
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

      {state.status === 'ok' && state.data.source === 'real' && (
        state.data.jobs.length === 0
          ? <p>Nenhum job registrado ainda em command.content_jobs.</p>
          : (
            <ul className="content-engine-jobs">
              {state.data.jobs.map((job) => (
                <li key={job.id}>
                  <span className={`content-engine-etapa etapa-${job.etapa}`}>{ETAPA_LABEL[job.etapa] ?? job.etapa}</span>
                  <span className="content-engine-titulo">{job.titulo}</span>
                  {job.etapa === 'ideia' && (
                    <button
                      type="button"
                      className="content-engine-generate"
                      disabled={generatingJobId === job.id}
                      onClick={() => void generateScript(job.id)}
                    >
                      {generatingJobId === job.id ? 'Gerando…' : 'Gerar roteiro'}
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
