import { useCallback, useEffect, useState } from 'react'
import { useOperationsAuth } from './OperationsAuthProvider'
import { fetchOperations } from './operationsClient'

export interface AutomationConfig {
  enabled: boolean
  prompt_base: string | null
}

export interface AutomationLog {
  id: number
  created_at: string
  type: 'comment' | 'dm'
  incoming_id: string
  incoming_text: string | null
  response_text: string | null
  error: string | null
}

export function useInstagramAutomation(active: boolean) {
  const { header } = useOperationsAuth()
  const [config, setConfig] = useState<AutomationConfig>({ enabled: false, prompt_base: null })
  const [logs, setLogs] = useState<AutomationLog[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConfig = useCallback(async () => {
    if (!header || !active) return
    setLoading(true)
    const result = await fetchOperations<AutomationConfig>('/api/integrations/instagram/automation-config', header)
    if (result.status === 'ok') setConfig(result.data)
    else if (result.status === 'erro') setError(result.mensagem)
    setLoading(false)
  }, [header, active])

  const fetchLogs = useCallback(async () => {
    if (!header || !active) return
    const result = await fetchOperations<{ logs: AutomationLog[] }>('/api/integrations/instagram/automation-logs', header)
    if (result.status === 'ok') setLogs(result.data.logs)
  }, [header, active])

  useEffect(() => { void fetchConfig(); void fetchLogs() }, [fetchConfig, fetchLogs])

  const save = useCallback(async (updates: Partial<AutomationConfig>) => {
    if (!header) return
    setSaving(true); setError(null)
    const next = { enabled: updates.enabled ?? config.enabled, promptBase: updates.prompt_base ?? config.prompt_base }
    try {
      const response = await fetch('/api/integrations/instagram/automation-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: header },
        body: JSON.stringify(next),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) setError(body.erro || `Erro ${response.status}`)
      else setConfig(body as AutomationConfig)
    } catch { setError('Não foi possível salvar a configuração.') }
    finally { setSaving(false) }
  }, [header, config])

  return { config, logs, loading, saving, error, save, refreshLogs: fetchLogs }
}
