import { useState, type FormEvent } from 'react'
import { Bot, Send, X } from 'lucide-react'
import { useAgentChat } from '../../core/useAgentChat'
import './agent-chat.css'

interface AgentChatPanelProps {
  agentId: string
  agentName: string
  onClose: () => void
}

// Conversa consultiva com um agente do organograma — nunca finge executar
// ação nenhuma (ver system prompt em api/_agent-chat.js). Trancado até o
// Painel Operacional ser desbloqueado, porque o prompt inclui receita/frota reais.
export function AgentChatPanel({ agentId, agentName, onClose }: AgentChatPanelProps) {
  const { messages, send, sending, erro, locked } = useAgentChat(agentId)
  const [draft, setDraft] = useState('')

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!draft.trim()) return
    void send(draft)
    setDraft('')
  }

  return (
    <div className="agent-chat glass-panel">
      <header className="agent-chat-header">
        <span><Bot size={16} /> Conversa com {agentName}</span>
        <button type="button" onClick={onClose} aria-label="Fechar conversa"><X size={16} /></button>
      </header>

      {locked && <p className="agent-chat-note">Desbloqueie o Painel Operacional no Dashboard para conversar com {agentName}.</p>}

      {!locked && (
        <>
          <div className="agent-chat-log">
            {messages.length === 0 && <p className="agent-chat-note">Sem mensagens ainda. Pergunte algo direto — {agentName} responde só com o que já é real.</p>}
            {messages.map((message, index) => (
              <div className={`agent-chat-bubble ${message.role}`} key={index}>
                <p>{message.content}</p>
                {message.role === 'assistant' && message.provider && <span className="agent-chat-meta">{message.provider} · {message.model}</span>}
              </div>
            ))}
            {sending && <div className="agent-chat-bubble assistant pending"><p>Pensando…</p></div>}
          </div>
          {erro && <p className="agent-chat-error">{erro}</p>}
          <form className="agent-chat-form" onSubmit={onSubmit}>
            <input
              type="text"
              placeholder={`Escreva para ${agentName}…`}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={sending}
            />
            <button type="submit" disabled={sending || !draft.trim()}><Send size={14} /></button>
          </form>
        </>
      )}
    </div>
  )
}
