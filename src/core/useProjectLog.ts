import { useCallback, useEffect, useState } from 'react'
import { useOperationsAuth } from './OperationsAuthProvider'
import type { OperationsFetchState } from './operationsClient'
import type { ProjectLogAgent, ProjectLogResponse, ProjectLogType } from '../types/operations'

// Mapa do Projeto (Fase 14) — diferente de useAvatars/useBusinessMetrics,
// a LEITURA é pública de propósito (a própria API não exige Basic Auth em
// GET): qualquer um que abra o dashboard vê o histórico. Só a ESCRITA
// (adicionar entrada) exige a credencial do Painel Operacional.
export function useProjectLog() {
  const { header } = useOperationsAuth()
  const [state, setState] = useState<OperationsFetchState<ProjectLogResponse>>({ status: 'carregando' })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setState({ status: 'carregando' })
    try {
      const response = await fetch('/api/project-log', { headers: { accept: 'application/json' }, cache: 'no-store' })
      if (!response.ok) {
        setState({ status: 'erro', mensagem: `/api/project-log respondeu ${response.status}.` })
        return
      }
      setState({ status: 'ok', data: (await response.json()) as ProjectLogResponse })
    } catch {
      setState({ status: 'erro', mensagem: 'Mapa do Projeto indisponível neste ambiente. Nenhuma entrada foi presumida.' })
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const addEntry = useCallback(
    async (input: { agent: ProjectLogAgent; phase: string; type: ProjectLogType; title: string; description: string; commit: string; deployed: boolean }) => {
      if (!header) return false
      setSubmitting(true)
      setSubmitError(null)
      try {
        const response = await fetch('/api/project-log', {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: header },
          body: JSON.stringify(input),
        })
        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          setSubmitError(body.erro || `/api/project-log respondeu ${response.status}.`)
          return false
        }
        await refresh()
        return true
      } catch {
        setSubmitError('Não foi possível registrar a entrada neste ambiente. Nada foi presumido salvo.')
        return false
      } finally {
        setSubmitting(false)
      }
    },
    [header, refresh],
  )

  return { state, refresh, addEntry, submitting, submitError }
}
