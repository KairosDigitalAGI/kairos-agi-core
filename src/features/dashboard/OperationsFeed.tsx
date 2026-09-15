import { Radio } from 'lucide-react'
import { useStoryEngine } from '../../core/useStoryEngine'
import { SectionHeader } from '../../ui/SectionHeader'
import './operations.css'

const ETAPA_LABEL: Record<string, string> = {
  ideia: 'Ideia', roteiro: 'Roteiro', imagem: 'Imagem', video: 'Vídeo',
  legenda: 'Legenda', aprovacao: 'Aprovação', publicado: 'Publicado', rejeitado: 'Rejeitado',
}

// "Operações ativas" (Missão 006, Fase 10) — feed real dos content_jobs mais
// recentes, cada um rotulado com o departamento do organograma dono daquela
// etapa (ver comentário de ETAPA_PARA_AGENTE_SLUG em api/_story.js — rótulo
// organizacional, não alegação de execução real). Botão "Narrar o dia" chama
// um provider pago para transformar métricas reais em texto — uma chamada
// por clique, nunca automático.
export function OperationsFeed() {
  const { activity, narrative, narrate, narrating, narrativeError } = useStoryEngine()

  return (
    <article className="glass-panel operations-feed-panel">
      <SectionHeader eyebrow="Story Engine" title="Operações ativas" action={<Radio size={18} />} />

      {activity.status === 'sem-credencial' && <p>Trancado. Desbloqueie o Painel Operacional acima para ver o feed real.</p>}
      {activity.status === 'carregando' && <p>Consultando atividade…</p>}
      {activity.status === 'erro' && <p>{activity.mensagem}</p>}
      {activity.status === 'ok' && activity.data.source === 'unavailable' && (
        <p>Feed indisponível: {activity.data.reason ?? 'schema command não configurado.'}</p>
      )}
      {activity.status === 'ok' && activity.data.source === 'real' && (
        activity.data.activity.length === 0
          ? <p>Nenhum job registrado ainda em command.content_jobs.</p>
          : (
            <ul className="operations-feed-list">
              {activity.data.activity.map((item) => (
                <li key={item.jobId}>
                  <span className="operations-feed-agent">{item.agente.name}</span>
                  <span className="operations-feed-titulo">{item.titulo}</span>
                  <span className="operations-feed-etapa">{ETAPA_LABEL[item.etapa] ?? item.etapa}</span>
                </li>
              ))}
            </ul>
          )
      )}

      {activity.status === 'ok' && activity.data.source === 'real' && (
        <div className="operations-feed-narrative">
          <button type="button" onClick={() => void narrate()} disabled={narrating}>
            {narrating ? 'Narrando…' : 'Narrar o dia'}
          </button>
          {narrativeError && <small role="alert">{narrativeError}</small>}
          {narrative?.narrative && <p className="operations-feed-narrative-text">{narrative.narrative}</p>}
        </div>
      )}
    </article>
  )
}
