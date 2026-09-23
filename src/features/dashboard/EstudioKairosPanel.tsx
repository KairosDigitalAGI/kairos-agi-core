import { FormEvent, useState } from 'react'
import { Wand2 } from 'lucide-react'
import { useStudioPipeline } from '../../core/useStudioPipeline'
import { SectionHeader } from '../../ui/SectionHeader'
import './operations.css'

// Estúdio Kairos (Fase 16) — personagens e reels reais (command.characters/
// reels). Só a parte que roda hoje: criar personagem, gerar retrato de
// referência (fal.ai/flux/schnell, atrás do teto STUDIO_BUDGET_USD),
// registrar reel com custo estimado e aprovar o gasto antes de qualquer
// geração de cena — a geração de cena em si (vídeo por cena, agentes de
// texto) ainda não tem botão aqui, ver MORNING.md/tech debt.
export function EstudioKairosPanel() {
  const {
    characters,
    reels,
    createCharacter,
    creatingCharacter,
    characterError,
    generateCharacterPortrait,
    generatingPortraitId,
    portraitError,
    createReel,
    creatingReel,
    reelError,
    approveReel,
    approvingReelId,
    approveError,
  } = useStudioPipeline()

  const [nomePersonagem, setNomePersonagem] = useState('')
  const [promptVisual, setPromptVisual] = useState('')
  const [tituloReel, setTituloReel] = useState('')
  const [numCenas, setNumCenas] = useState(3)

  async function onSubmitCharacter(event: FormEvent) {
    event.preventDefault()
    const nome = nomePersonagem.trim()
    const prompt = promptVisual.trim()
    if (!nome || !prompt) return
    const ok = await createCharacter(nome, prompt)
    if (ok) {
      setNomePersonagem('')
      setPromptVisual('')
    }
  }

  async function onSubmitReel(event: FormEvent) {
    event.preventDefault()
    const titulo = tituloReel.trim()
    if (!titulo) return
    const ok = await createReel(titulo, null, numCenas)
    if (ok) setTituloReel('')
  }

  return (
    <article className="glass-panel content-engine-panel">
      <SectionHeader eyebrow="Estúdio Kairos" title="Personagens e reels" action={<Wand2 size={18} />} />

      {characters.status === 'sem-credencial' && <p>Trancado. Desbloqueie o Painel Operacional acima para ver o Estúdio real.</p>}
      {characters.status === 'carregando' && <p>Consultando personagens…</p>}
      {characters.status === 'erro' && <p>{characters.mensagem}</p>}
      {characters.status === 'ok' && characters.data.source === 'unavailable' && (
        <p>Estúdio indisponível: {characters.data.reason ?? 'schema command não configurado.'}</p>
      )}

      {characters.status === 'ok' && characters.data.source === 'real' && (
        <>
          <form className="content-engine-form" onSubmit={onSubmitCharacter}>
            <input
              type="text"
              value={nomePersonagem}
              onChange={(e) => setNomePersonagem(e.target.value)}
              placeholder="Nome do personagem"
              maxLength={100}
              disabled={creatingCharacter}
            />
            <input
              type="text"
              value={promptVisual}
              onChange={(e) => setPromptVisual(e.target.value)}
              placeholder="Descrição visual (aparência consistente entre cenas)"
              maxLength={300}
              disabled={creatingCharacter}
            />
            <button type="submit" disabled={creatingCharacter || !nomePersonagem.trim() || !promptVisual.trim()}>
              {creatingCharacter ? 'Criando…' : 'Criar personagem'}
            </button>
          </form>
          {characterError && <p className="content-engine-error">{characterError}</p>}
          {portraitError && <p className="content-engine-error">{portraitError}</p>}

          {characters.data.characters.length === 0
            ? <p>Nenhum personagem registrado ainda em command.characters.</p>
            : (
              <ul className="content-engine-jobs">
                {characters.data.characters.map((character) => (
                  <li key={character.id}>
                    <span className={`content-engine-etapa etapa-${character.status === 'ativo' ? 'publicado' : ''}`}>{character.status}</span>
                    <span className="content-engine-titulo">{character.nome}</span>
                    {character.status !== 'ativo' && (
                      <button
                        type="button"
                        className="content-engine-generate"
                        disabled={generatingPortraitId === character.id}
                        onClick={() => void generateCharacterPortrait(character.id)}
                      >
                        {generatingPortraitId === character.id ? 'Gerando…' : 'Gerar retrato (fal.ai)'}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
        </>
      )}

      {reels.status === 'ok' && reels.data.source === 'real' && (
        <>
          <form className="content-engine-form" onSubmit={onSubmitReel}>
            <input
              type="text"
              value={tituloReel}
              onChange={(e) => setTituloReel(e.target.value)}
              placeholder="Título do novo reel"
              maxLength={200}
              disabled={creatingReel}
            />
            <input
              type="number"
              min={1}
              max={20}
              value={numCenas}
              onChange={(e) => setNumCenas(Number(e.target.value) || 1)}
              disabled={creatingReel}
              style={{ width: 64 }}
            />
            <button type="submit" disabled={creatingReel || !tituloReel.trim()}>
              {creatingReel ? 'Registrando…' : 'Registrar reel'}
            </button>
          </form>
          {reelError && <p className="content-engine-error">{reelError}</p>}
          {approveError && <p className="content-engine-error">{approveError}</p>}

          {reels.data.reels.length === 0
            ? <p>Nenhum reel registrado ainda em command.reels.</p>
            : (
              <ul className="content-engine-jobs">
                {reels.data.reels.map((reel) => (
                  <li key={reel.id}>
                    <span className={`content-engine-etapa etapa-${reel.etapa}`}>{reel.etapa}</span>
                    <span className="content-engine-titulo">
                      {reel.titulo}
                      {typeof reel.custo_estimado_usd === 'number' && ` — custo estimado $${reel.custo_estimado_usd.toFixed(2)}`}
                    </span>
                    {!reel.aprovado && (
                      <button
                        type="button"
                        className="content-engine-generate"
                        disabled={approvingReelId === reel.id}
                        onClick={() => void approveReel(reel.id)}
                      >
                        {approvingReelId === reel.id ? 'Aprovando…' : 'Aprovar geração paga'}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
        </>
      )}
    </article>
  )
}
