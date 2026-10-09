const fs = require('fs')
const crypto = require('crypto')
const { acknowledgeEvents, pendingEvents } = require('./crmAudit')
const { acknowledgeRuns, pendingRuns } = require('./runtimeRuns')

const DB_PATH = '/root/kairos3/db.json'
const apiUrl = () => String(process.env.CRM_SYNC_URL || '').trim()
const token = () => String(process.env.CRM_SYNC_TOKEN || '').trim()
const headers = () => ({ 'content-type': 'application/json', authorization: `Bearer ${token()}` })

async function request(action, options = {}) {
  if (!apiUrl() || !token()) throw new Error('CRM_SYNC_URL/CRM_SYNC_TOKEN não configurados.')
  const response = await fetch(`${apiUrl()}?action=${encodeURIComponent(action)}`, { ...options, headers: { ...headers(), ...(options.headers || {}) } })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.erro || body.error || `Kairos AGI respondeu ${response.status}`)
  return body
}

function leadRow(lead) {
  const phone = String(lead.phone || '').replace(/\D/g, '')
  const history = Array.isArray(lead.history) ? lead.history : []
  const last = history[history.length - 1]
  return {
    source_ref: crypto.createHash('sha256').update(phone || JSON.stringify([lead.name, lead.createdAt])).digest('hex'),
    name: lead.name || null, phone: phone || null, state: lead.state, score: lead.score,
    contacted: lead.contacted, meeting_scheduled: lead.meetingScheduled, lead_type: lead.tipo,
    attempts: lead.tentativas, niche: lead.nicho, city: lead.cidade, origin: lead.origem,
    priority: lead.prioridade, runtime_status: lead.status, history_count: history.length,
    last_message_at: last && last.at, source_created_at: lead.createdAt, source_updated_at: lead.updatedAt,
  }
}

async function syncNow() {
  const database = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
  const rawRows = (Array.isArray(database.leads) ? database.leads : []).map(leadRow)
  const rows = [...new Map(rawRows.map(row => [row.source_ref, row])).values()]
  let accepted = 0
  for (let index = 0; index < rows.length; index += 200) {
    const result = await request('crm-sync', { method: 'POST', body: JSON.stringify({ leads: rows.slice(index, index + 200) }) })
    accepted += Number(result.accepted || 0)
  }
  let eventsAccepted = 0
  while (true) {
    const events = pendingEvents(200)
    if (!events.length) break
    const result = await request('crm-events', { method: 'POST', body: JSON.stringify({ events }) })
    eventsAccepted += Number(result.accepted || 0)
    acknowledgeEvents(events.map(event => event.event_ref))
    if (events.length < 200) break
  }
  const runs = pendingRuns(100)
  let runsAccepted = 0
  if (runs.length) {
    const result = await request('crm-runs', { method: 'POST', body: JSON.stringify({ runs: runs.map(({ pending_sync, ...run }) => run) }) })
    runsAccepted = Number(result.accepted || 0)
    acknowledgeRuns(runs.map(run => run.run_ref))
  }
  return { accepted, eventsAccepted, runsAccepted }
}

async function createDevRequest(description) {
  const clean = String(description || '').trim()
  if (clean.length < 12) throw new Error('Descreva melhor o upgrade desejado.')
  return request('dev-request', { method: 'POST', body: JSON.stringify({
    external_ref: `wa-${Date.now()}`, title: clean.slice(0, 120), description: clean,
    impact: 'Solicitação feita pelo Founder no WhatsApp.', proposed_solution: 'Codex ou Claude Code deve triar, propor plano, testar e registrar a entrega.', priority: 'medium',
  }) })
}

async function confirmDevRequest(code) {
  return request('dev-confirm', { method: 'POST', body: JSON.stringify({ confirmation_code: String(code || '').trim() }) })
}

async function pollUpdates(notify) {
  const { events = [] } = await request('dev-updates', { method: 'GET' })
  const delivered = []
  for (const event of events) {
    const icon = event.status === 'done' ? '✅' : event.status === 'error' ? '❌' : event.status === 'blocked' ? '⛔' : '🛠️'
    await notify(`${icon} *Evolução KAIROS · ${event.status}*\n\n${event.message}`)
    delivered.push(event.id)
  }
  if (delivered.length) await request('dev-ack', { method: 'POST', body: JSON.stringify({ ids: delivered }) })
}

let started = false
function start({ notify, logger = console }) {
  if (started) return
  started = true
  const safeSync = () => syncNow().then(r => logger.info(`[AGI-BRIDGE] CRM sincronizado: ${r.accepted} leads, ${r.eventsAccepted} eventos, ${r.runsAccepted} rodadas`)).catch(e => logger.error(`[AGI-BRIDGE] sync: ${e.message}`))
  const safePoll = () => pollUpdates(notify).catch(e => logger.error(`[AGI-BRIDGE] updates: ${e.message}`))
  safeSync(); safePoll()
  setInterval(safeSync, 2 * 60 * 1000).unref()
  setInterval(safePoll, 60 * 1000).unref()
}

module.exports = { start, syncNow, createDevRequest, confirmDevRequest, pollUpdates }
