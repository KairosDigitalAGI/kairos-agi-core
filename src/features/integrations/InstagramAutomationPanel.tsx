import { useState } from 'react'
import { Bot, ChevronDown, ChevronUp, RefreshCw, ToggleLeft, ToggleRight, Zap } from 'lucide-react'
import { useInstagramAutomation, type AutomationLog } from '../../core/useInstagramAutomation'

const DEFAULT_PROMPT = 'Você é o assistente digital da Kairos Digital, empresa brasileira especializada em automação com IA para pequenas e médias empresas. Responda de forma amigável, profissional e concisa em português brasileiro. Objetivo: qualificar o interesse do lead e direcioná-lo para falar com um especialista da Kairos. Nunca invente preços, prazos ou funcionalidades técnicas. Máximo 2 a 3 frases por resposta.'

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}

function LogRow({ log }: { log: AutomationLog }) {
  const [open, setOpen] = useState(false)
  const hasDetail = !!(log.incoming_text || log.response_text || log.error)
  return (
    <div className={`ig-auto-log-row ${log.error ? 'error' : ''}`}>
      <div className="ig-auto-log-meta">
        <span className={`ig-auto-type ${log.type}`}>{log.type === 'comment' ? 'Comentário' : 'DM'}</span>
        <span className="ig-auto-log-date">{fmtDate(log.created_at)}</span>
        {log.error && <span className="ig-auto-log-err">Erro</span>}
        {hasDetail && (
          <button className="ig-auto-expand" onClick={() => setOpen(v => !v)}>
            {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        )}
      </div>
      {open && (
        <div className="ig-auto-log-detail">
          {log.incoming_text && <p><strong>Recebido:</strong> {log.incoming_text}</p>}
          {log.response_text && <p><strong>Resposta:</strong> {log.response_text}</p>}
          {log.error && <p className="err"><strong>Erro:</strong> {log.error}</p>}
        </div>
      )}
    </div>
  )
}

interface Props { active: boolean }

export function InstagramAutomationPanel({ active }: Props) {
  const { config, logs, loading, saving, error, save, refreshLogs } = useInstagramAutomation(active)
  const [editingPrompt, setEditingPrompt] = useState(false)
  const [promptDraft, setPromptDraft] = useState('')
  const [showLogs, setShowLogs] = useState(false)

  if (!active) return null

  function startEditPrompt() {
    setPromptDraft(config.prompt_base || DEFAULT_PROMPT)
    setEditingPrompt(true)
  }

  function cancelEditPrompt() { setEditingPrompt(false) }

  function savePrompt() {
    void save({ prompt_base: promptDraft.trim() || null })
    setEditingPrompt(false)
  }

  function toggleEnabled() { void save({ enabled: !config.enabled }) }

  return (
    <div className="ig-auto-panel">
      <div className="ig-auto-header">
        <span className="ig-auto-title"><Bot size={14} /> Automação IA</span>
        {loading && <span className="ig-auto-loading"><RefreshCw size={12} /> Carregando…</span>}
      </div>

      {error && <small className="ig-auto-error" role="alert">{error}</small>}

      <div className="ig-auto-toggle">
        <button
          className={`ig-auto-toggle-btn ${config.enabled ? 'on' : 'off'}`}
          onClick={toggleEnabled}
          disabled={saving || loading}
          title={config.enabled ? 'Clique para desativar' : 'Clique para ativar'}
        >
          {config.enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
          <span>{config.enabled ? 'Ativa' : 'Inativa'}</span>
          {saving && <RefreshCw size={12} className="spin" />}
        </button>
        <small>{config.enabled ? 'Respondendo comentários e DMs automaticamente via IA.' : 'Automação pausada — nenhuma resposta será enviada.'}</small>
      </div>

      <div className="ig-auto-prompt-section">
        <div className="ig-auto-prompt-head">
          <span className="ig-auto-sub"><Zap size={12} /> Prompt base</span>
          {!editingPrompt && <button className="ig-auto-link-btn" onClick={startEditPrompt}>Editar</button>}
        </div>
        {!editingPrompt && (
          <p className="ig-auto-prompt-preview">{config.prompt_base || DEFAULT_PROMPT}</p>
        )}
        {editingPrompt && (
          <>
            <textarea
              className="ig-auto-textarea"
              value={promptDraft}
              onChange={e => setPromptDraft(e.target.value)}
              rows={5}
              placeholder="Instruções para o agente IA responder em seu nome…"
            />
            <div className="ig-auto-prompt-actions">
              <button className="ig-auto-save-btn" onClick={savePrompt} disabled={saving}>Salvar</button>
              <button className="ig-auto-cancel-btn" onClick={cancelEditPrompt}>Cancelar</button>
            </div>
          </>
        )}
      </div>

      <div className="ig-auto-logs-section">
        <div className="ig-auto-prompt-head">
          <span className="ig-auto-sub">Últimas respostas</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="ig-auto-link-btn" onClick={() => void refreshLogs()}>Atualizar</button>
            <button className="ig-auto-link-btn" onClick={() => setShowLogs(v => !v)}>{showLogs ? 'Ocultar' : 'Ver'}</button>
          </div>
        </div>
        {showLogs && (
          <div className="ig-auto-logs">
            {logs.length === 0 && <small className="ig-auto-empty">Nenhuma resposta registrada ainda.</small>}
            {logs.slice(0, 15).map(log => <LogRow key={log.id} log={log} />)}
          </div>
        )}
      </div>
    </div>
  )
}
