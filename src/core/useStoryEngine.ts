import { useCallback, useEffect, useState } from 'react'
import { useOperationsAuth } from './OperationsAuthProvider'
import { generateDailyNarrative, getAgentActivity } from '../services/storyEngine'
import type { OperationsFetchState } from './operationsClient'
import type { AgentActivityResponse, StoryNarrativeResponse } from '../types/operations'

// Story Engine (Fase 10) — feed real de atividade do Content Engine +
// narração gamificada sob demanda. Mesmo Basic Auth do Painel Operacional.
export function useStoryEngine() {
  const { header } = useOperationsAuth()
  const [activity, setActivity] = useState<OperationsFetchState<AgentActivityResponse>>({ status: 'sem-credencial' })
  const [narrative, setNarrative] = useState<StoryNarrativeResponse | null>(null)
  const [narrating, setNarrating] = useState(false)
  const [narrativeError, setNarrativeError] = useState<string | null>(null)

  const refreshActivity = useCallback(async () => {
    if (!header) {
      setActivity({ status: 'sem-credencial' })
      return
    }
    setActivity({ status: 'carregando' })
    try {
      setActivity({ status: 'ok', data: await getAgentActivity(header) })
    } catch (e) {
      setActivity({ status: 'erro', mensagem: e instanceof Error ? e.message : 'Falha ao consultar atividade.' })
    }
  }, [header])

  useEffect(() => {
    void refreshActivity()
  }, [refreshActivity])

  const narrate = useCallback(async () => {
    if (!header) return
    setNarrating(true)
    setNarrativeError(null)
    try {
      const result = await generateDailyNarrative(header)
      if (result.source !== 'real') {
        setNarrativeError(result.reason || 'Narrativa indisponível.')
      } else {
        setNarrative(result)
      }
    } catch (e) {
      setNarrativeError(e instanceof Error ? e.message : 'Não foi possível gerar a narrativa.')
    } finally {
      setNarrating(false)
    }
  }, [header])

  return { activity, refreshActivity, narrative, narrate, narrating, narrativeError }
}
