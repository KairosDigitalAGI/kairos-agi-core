import { useCallback, useEffect, useState } from 'react'
import { useOperationsAuth } from './OperationsAuthProvider'
import { fetchOperations, type OperationsFetchState } from './operationsClient'

// Interruptor do rascunho de resposta por IA do webhook (Fase 17). OFF por
// padrão: enquanto sem credencial/config, nunca presume ligado — mesmo
// contrato de "indisponível, nunca inventado" do resto do painel.
type AutoReplyStatus = { enabled: boolean; source: 'real' | 'unavailable'; reason?: string }

export function useAutoReplyToggle(provider: 'instagram') {
  const { header } = useOperationsAuth()
  const [state, setState] = useState<OperationsFetchState<AutoReplyStatus>>({ status: 'sem-credencial' })
  const [saving, setSaving] = useState(false)

  const refresh = useCallback(async () => {
    if (!header) return setState({ status: 'sem-credencial' })
    setState({ status: 'carregando' })
    setState(await fetchOperations<AutoReplyStatus>(`/api/integrations/${provider}/auto-reply`, header))
  }, [header, provider])

  useEffect(() => { void refresh() }, [refresh])

  const setEnabled = useCallback(async (enabled: boolean) => {
    if (!header) return
    setSaving(true)
    try {
      const response = await fetch(`/api/integrations/${provider}/auto-reply`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: header },
        body: JSON.stringify({ enabled }),
        cache: 'no-store',
      })
      if (response.ok) await refresh()
    } catch {
      // refresh() já cobre o estado de indisponibilidade; nada a fazer aqui.
    } finally { setSaving(false) }
  }, [header, provider, refresh])

  return { state, setEnabled, saving }
}
