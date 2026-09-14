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
  const [approvingJobId, setApprovingJobId] = useState<string | null>(null)
  const [approveError, setApproveError] = useState<string | null>(null)

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

  // O Founder aciona a geração da imagem de capa de UM job em etapa
  // "roteiro" (clique explícito, nunca em lote) — só a OpenAI gera imagem
  // neste Core. Reaproveita generatingJobId/generateError: as duas ações
  // (roteiro/imagem) nunca ficam disponíveis ao mesmo tempo no mesmo job.
  // Ver api/_content.js#generateImage.
  const generateImage = useCallback(
    async (jobId: string) => {
      if (!header) return false
      setGeneratingJobId(jobId)
      setGenerateError(null)
      try {
        const response = await fetch('/api/content-jobs/generate-image', {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: header },
          body: JSON.stringify({ jobId }),
        })
        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          setGenerateError(body.erro || `/api/content-jobs/generate-image respondeu ${response.status}.`)
          return false
        }
        await refresh()
        return true
      } catch {
        setGenerateError('Não foi possível gerar a imagem neste ambiente. Nenhum conteúdo foi presumido criado.')
        return false
      } finally {
        setGeneratingJobId(null)
      }
    },
    [header, refresh],
  )

  // O Founder aciona a geração do vídeo de UM job em etapa "imagem" (clique
  // explícito, nunca em lote). tier="free" tenta Veo → fallback Kling v1.6;
  // tier="paid" usa Kling v2.1 Master e exige job.aprovado (mesmo gate da
  // imagem). Reaproveita generatingJobId/generateError. Ver
  // api/_content.js#generateVideo.
  const generateVideo = useCallback(
    async (jobId: string, tier: 'free' | 'paid' = 'free') => {
      if (!header) return false
      setGeneratingJobId(jobId)
      setGenerateError(null)
      try {
        const response = await fetch('/api/content-jobs/generate-video', {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: header },
          body: JSON.stringify({ jobId, tier }),
        })
        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          setGenerateError(body.erro || `/api/content-jobs/generate-video respondeu ${response.status}.`)
          return false
        }
        await refresh()
        return true
      } catch {
        setGenerateError('Não foi possível gerar o vídeo neste ambiente. Nenhum conteúdo foi presumido criado.')
        return false
      } finally {
        setGeneratingJobId(null)
      }
    },
    [header, refresh],
  )

  // O Founder aciona a publicação de UM job em etapa "video" no YouTube já
  // conectado (clique explícito, ação irreversível — sobe como privado).
  // Reaproveita generatingJobId/generateError, mesmo espírito das outras
  // ações de pipeline. Ver api/_content.js#postToYoutube.
  const postToYoutube = useCallback(
    async (jobId: string) => {
      if (!header) return false
      setGeneratingJobId(jobId)
      setGenerateError(null)
      try {
        const response = await fetch('/api/content-jobs/post-youtube', {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: header },
          body: JSON.stringify({ jobId }),
        })
        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          setGenerateError(body.erro || `/api/content-jobs/post-youtube respondeu ${response.status}.`)
          return false
        }
        await refresh()
        return true
      } catch {
        setGenerateError('Não foi possível publicar no YouTube neste ambiente. Nenhuma publicação foi presumida feita.')
        return false
      } finally {
        setGeneratingJobId(null)
      }
    },
    [header, refresh],
  )

  // Aprova o gasto de UM job antes de gerar conteúdo pago — passo separado
  // de "Gerar roteiro", exigido pelo próprio schema (aprovado:true).
  const approveJob = useCallback(
    async (jobId: string) => {
      if (!header) return false
      setApprovingJobId(jobId)
      setApproveError(null)
      try {
        const response = await fetch('/api/content-jobs/approve', {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: header },
          body: JSON.stringify({ jobId }),
        })
        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          setApproveError(body.erro || `/api/content-jobs/approve respondeu ${response.status}.`)
          return false
        }
        await refresh()
        return true
      } catch {
        setApproveError('Não foi possível aprovar o job neste ambiente. Nenhuma aprovação foi presumida.')
        return false
      } finally {
        setApprovingJobId(null)
      }
    },
    [header, refresh],
  )

  return {
    state,
    refresh,
    createJob,
    submitting,
    submitError,
    generateScript,
    generateImage,
    generateVideo,
    postToYoutube,
    generatingJobId,
    generateError,
    approveJob,
    approvingJobId,
    approveError,
  }
}
