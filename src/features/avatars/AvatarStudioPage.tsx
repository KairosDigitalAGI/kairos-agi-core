import { Sparkles, Trophy } from 'lucide-react'
import { useAvatars } from '../../core/useAvatars'
import { useOperationsAuth } from '../../core/OperationsAuthProvider'
import { OperationsUnlock } from '../dashboard/OperationsUnlock'
import './avatars.css'

// Avatar Studio (Missão 006, Fase 9) — grid dos 27 agentes do organograma com
// progresso REAL de gamificação (command.avatars). Identidade (nome, papel,
// departamento) vem de src/data/agentRegistry.json, nunca do Supabase — a
// tabela avatars só guarda nivel/xp/coins/conquistas por agente_slug (ver
// comentário da própria tabela na migration 0020). Um agente sem linha ainda
// gravada mostra o baseline 1/0/0 com um botão explícito pra criar o registro
// real, nunca um número fabricado. Mesmo Basic Auth do Painel Operacional,
// porque grava no Supabase mestre.
export function AvatarStudioPage() {
  const { header } = useOperationsAuth()
  const { state, ensureAvatar, ensuringSlug, ensureError } = useAvatars()

  return (
    <section className="page-stack avatar-studio-page">
      <header className="glass-panel avatars-hero">
        <div>
          <span className="eyebrow"><Sparkles size={14} /> GAMIFICAÇÃO</span>
          <h2>Avatar Studio</h2>
          <p>Progresso real por agente, lido de command.avatars. Identidade vem do organograma; nível/XP/coins vêm do Supabase.</p>
        </div>
      </header>

      <OperationsUnlock />

      {!header && <p className="avatars-alert">Desbloqueie o Painel Operacional acima para ver e registrar progresso.</p>}
      {state.status === 'carregando' && <p className="avatars-alert">Consultando avatares…</p>}
      {state.status === 'erro' && <p className="avatars-alert" role="alert">{state.mensagem}</p>}
      {state.status === 'ok' && state.data.source === 'unavailable' && (
        <p className="avatars-alert">Progresso indisponível: {state.data.reason ?? 'schema command não configurado.'}</p>
      )}
      {ensureError && <p className="avatars-alert" role="alert">{ensureError}</p>}

      {state.status === 'ok' && state.data.source === 'real' && (
        <div className="avatar-grid">
          {state.data.avatars.map((avatar) => (
            <article className="glass-panel avatar-card" key={avatar.slug}>
              <div className="avatar-card-head">
                <div><span className="eyebrow">{avatar.department}</span><h3>{avatar.name}</h3><small>{avatar.role}</small></div>
                <span className={`avatar-nivel ${avatar.hasProgress ? 'tracked' : ''}`}><Trophy size={13} /> Nv {avatar.nivel}</span>
              </div>
              <ul className="avatar-stats">
                <li><span>XP</span><b>{avatar.xp}</b></li>
                <li><span>Coins</span><b>{avatar.coins}</b></li>
                <li><span>Conquistas</span><b>{avatar.conquistas.length}</b></li>
              </ul>
              {!avatar.hasProgress && (
                <button
                  type="button"
                  disabled={ensuringSlug === avatar.slug}
                  onClick={() => void ensureAvatar(avatar.slug)}
                >
                  {ensuringSlug === avatar.slug ? 'Registrando…' : 'Registrar progresso inicial'}
                </button>
              )}
              {avatar.hasProgress && <small className="avatar-tracked-note">Progresso gravado em command.avatars.</small>}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
