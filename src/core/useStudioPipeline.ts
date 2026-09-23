import { useCallback, useEffect, useState } from 'react'
import { useOperationsAuth } from './OperationsAuthProvider'
import { fetchOperations, type OperationsFetchState } from './operationsClient'
import type { StudioCharactersResponse, StudioReelsResponse } from '../types/operations'

// Estúdio Kairos (Fase 16) — personagens e reels reais sobre
// command.characters/reels (api/_studio.js). Mesmo espírito de
// useContentPipeline: um clique explícito do Founder por ação, nunca em
// lote, nunca presume sucesso quando a chamada falha.
export function useStudioPipeline() {
  const { header } = useOperationsAuth()
  const [characters, setCharacters] = useState<OperationsFetchState<StudioCharactersResponse>>({ status: 'sem-credencial' })
  const [reels, setReels] = useState<OperationsFetchState<StudioReelsResponse>>({ status: 'sem-credencial' })

  const [creatingCharacter, setCreatingCharacter] = useState(false)
  const [characterError, setCharacterError] = useState<string | null>(null)
  const [generatingPortraitId, setGeneratingPortraitId] = useState<string | null>(null)
  const [portraitError, setPortraitError] = useState<string | null>(null)

  const [creatingReel, setCreatingReel] = useState(false)
  const [reelError, setReelError] = useState<string | null>(null)
  const [approvingReelId, setApprovingReelId] = useState<string | null>(null)
  const [approveError, setApproveError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!header) {
      setCharacters({ status: 'sem-credencial' })
      setReels({ status: 'sem-credencial' })
      return
    }
    setCharacters({ status: 'carregando' })
    setReels({ status: 'carregando' })
    const [c, r] = await Promise.all([
      fetchOperations<StudioCharactersResponse>('/api/studio/list-characters', header),
      fetchOperations<StudioReelsResponse>('/api/studio/list-reels', header),
    ])
    setCharacters(c)
    setReels(r)
  }, [header])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const createCharacter = useCallback(
    async (nome: string, promptVisual: string) => {
      if (!header) return false
      setCreatingCharacter(true)
      setCharacterError(null)
      try {
        const response = await fetch('/api/studio/create-character', {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: header },
          body: JSON.stringify({ nome, promptVisual }),
        })
        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          setCharacterError(body.erro || `/api/studio/create-character respondeu ${response.status}.`)
          return false
        }
        await refresh()
        return true
      } catch {
        setCharacterError('Não foi possível criar o personagem neste ambiente. Nenhum personagem foi presumido criado.')
        return false
      } finally {
        setCreatingCharacter(false)
      }
    },
    [header, refresh],
  )

  // Chamada paga (fal.ai/flux/schnell), atrás de STUDIO_BUDGET_USD no
  // backend — ver api/_studio.js#generateCharacterPortrait. Um clique por
  // personagem, nunca em lote.
  const generateCharacterPortrait = useCallback(
    async (characterId: string) => {
      if (!header) return false
      setGeneratingPortraitId(characterId)
      setPortraitError(null)
      try {
        const response = await fetch('/api/studio/generate-character-portrait', {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: header },
          body: JSON.stringify({ characterId }),
        })
        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          setPortraitError(body.erro || `/api/studio/generate-character-portrait respondeu ${response.status}.`)
          return false
        }
        await refresh()
        return true
      } catch {
        setPortraitError('Não foi possível gerar o retrato neste ambiente. Nenhuma imagem foi presumida criada.')
        return false
      } finally {
        setGeneratingPortraitId(null)
      }
    },
    [header, refresh],
  )

  const createReel = useCallback(
    async (titulo: string, characterId: string | null, numScenesEstimado: number) => {
      if (!header) return false
      setCreatingReel(true)
      setReelError(null)
      try {
        const response = await fetch('/api/studio/create-reel', {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: header },
          body: JSON.stringify({ titulo, characterId, numScenesEstimado }),
        })
        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          setReelError(body.erro || `/api/studio/create-reel respondeu ${response.status}.`)
          return false
        }
        await refresh()
        return true
      } catch {
        setReelError('Não foi possível registrar o reel neste ambiente. Nenhum reel foi presumido criado.')
        return false
      } finally {
        setCreatingReel(false)
      }
    },
    [header, refresh],
  )

  // Gate de gasto do reel inteiro — mesma convenção de approveJob do
  // Content Engine (api/_content.js#approveContentJob), sem isso nenhuma
  // geração paga de cena roda para este reel.
  const approveReel = useCallback(
    async (reelId: string) => {
      if (!header) return false
      setApprovingReelId(reelId)
      setApproveError(null)
      try {
        const response = await fetch('/api/studio/approve-reel', {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: header },
          body: JSON.stringify({ reelId }),
        })
        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          setApproveError(body.erro || `/api/studio/approve-reel respondeu ${response.status}.`)
          return false
        }
        await refresh()
        return true
      } catch {
        setApproveError('Não foi possível aprovar o reel neste ambiente. Nenhuma aprovação foi presumida.')
        return false
      } finally {
        setApprovingReelId(null)
      }
    },
    [header, refresh],
  )

  return {
    characters,
    reels,
    refresh,
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
  }
}
