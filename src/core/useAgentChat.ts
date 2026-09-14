import { useCallback, useState } from 'react'
import { useOperationsAuth } from './OperationsAuthProvider'
import type { AgentChatResponse, ChatMessage } from '../types/operations'

interface ChatEntry extends ChatMessage {
  provider?: string
  model?: string
}

// Chat com um agente do organograma via /api/agent-chat — mesma credencial do
// Painel Operacional, porque a rota lê receita/frota reais para montar o
// system prompt. Sem credencial, nem tenta: fica travado como o resto do painel.
export function useAgentChat(agentId: string) {
  const { header } = useOperationsAuth()
  const [messages, setMessages] = useState<ChatEntry[]>([])
  const [sending, setSending] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const send = useCallback(
    async (text: string) => {
      if (!header) {
        setErro('Desbloqueie o Painel Operacional acima para conversar com o agente.')
        return
      }
      const trimmed = text.trim()
      if (!trimmed || sending) return
      setErro(null)
      const next: ChatEntry[] = [...messages, { role: 'user', content: trimmed }]
      setMessages(next)
      setSending(true)
      try {
        const response = await fetch('/api/agent-chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: header },
          body: JSON.stringify({ agentId, messages: next.map(({ role, content }) => ({ role, content })) }),
        })
        const body = await response.json().catch(() => ({}))
        if (!response.ok) {
          setErro(body?.erro || `Chat indisponível (${response.status}).`)
          return
        }
        const data = body as AgentChatResponse
        setMessages((current) => [...current, { role: 'assistant', content: data.text, provider: data.provider, model: data.model }])
      } catch {
        setErro('Chat indisponível neste ambiente. Nenhuma resposta foi presumida.')
      } finally {
        setSending(false)
      }
    },
    [agentId, header, messages, sending],
  )

  const reset = useCallback(() => {
    setMessages([])
    setErro(null)
  }, [])

  return { messages, send, sending, erro, locked: !header, reset }
}
