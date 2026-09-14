import { useCallback, useEffect, useState } from 'react'
import { useOperationsAuth } from './OperationsAuthProvider'
import { fetchOperations, type OperationsFetchState } from './operationsClient'
import type { ContentPipelineResponse } from '../types/operations'

export function useContentPipeline() {
  const { header } = useOperationsAuth()
  const [state, setState] = useState<OperationsFetchState<ContentPipelineResponse>>({ status: 'sem-credencial' })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [generatingJobId, setGeneratingJobId] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!header) {
      setState({ status: 'sem-credencial' })
      return
    }
    setState({ status: 'carregando' })
    setState(await fetchOperations<ContentPipelineResponse>('/api/content-jobs', header))
  }, [header])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const createJob = useCallback(
    async (titulo: string) => {
      if (!header) return false
      setSubmitting(true)
      setSubmitError(null)
      try {
        const response = await fetch('/api/content-jobs', {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: header },
          body: JSON.stringify({ titulo }),
        })
        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          setSubmitError(body.erro || `/api/content-jobs respondeu ${response.status}.`)
          return false
        }
        await refresh()
        return true
      } catch {
        setSubmitError('Não foi possível registrar a ideia neste ambiente. Nenhum job foi presumido criado.')
        return false
      } finally {
        setSubmitting(false)
      }
    },
    [header, refresh],
  )

  // O Founder aciona a geração do roteiro de UM job (clique explícito, nunca
  // em lote) — chama um provider pago (Anthropic/OpenAI, mesma prioridade da
  // Fase 2). Ver api/_content.js#generateScript.
  const generateScript = useCallback(
    async (jobId: string) => {
      if (!header) return false
      setGeneratingJobId(jobId)
      setGenerateError(null)
      try {
        const response = await fetch('/api/content-jobs/generate-script', {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: header },
          body: JSON.stringify({ jobId }),
        })
        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          setGenerateError(body.erro || `/api/content-jobs/generate-script respondeu ${response.status}.`)
          return false
        }
        await refresh()
        return true
      } catch {
        setGenerateError('Não foi possível gerar o roteiro neste ambiente. Nenhum conteúdo foi presumido criado.')
        return false
      } finally {
        setGeneratingJobId(null)
      }
    },
    [header, refresh],
  )

  return { state, refresh, createJob, submitting, submitError, generateScript, generatingJobId, generateError }
}
