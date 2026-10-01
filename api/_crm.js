import { createHash, timingSafeEqual } from 'node:crypto'
import { patchCommand, readCommand, upsertCommand, writeCommand } from './_command.js'

const MAX_BATCH = 250
const ALLOWED_STATES = new Set(['abertura','diagnostico','dor','solucao','interesse','agendamento','fechamento','encerrado','conversando','site_abordado','sem_whatsapp','pausado','pausado_manual','bloqueado','x1_coletando'])

const digest = value => createHash('sha256').update(String(value), 'utf8').digest()
const equal = (a, b) => timingSafeEqual(digest(a), digest(b))

export function checkCrmSyncAuth(req) {
  const expected = String(process.env.CRM_SYNC_TOKEN || '')
  const header = String(req.headers?.authorization || req.headers?.Authorization || '')
  const actual = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : ''
  return Boolean(expected && actual && equal(actual, expected))
}

const text = (value, max = 180) => {
  const clean = String(value ?? '').trim()
  return clean ? clean.slice(0, max) : null
}
const date = value => {
  const parsed = value ? new Date(value) : null
  return parsed && Number.isFinite(parsed.getTime()) ? parsed.toISOString() : null
}

export function normalizeCrmLead(input) {
  const sourceRef = text(input?.source_ref, 96)
  if (!sourceRef) throw new Error('source_ref ausente no lead sincronizado.')
  const state = text(input.state, 40) || 'abertura'
  return {
    source: 'kairos_whatsapp',
    source_ref: sourceRef,
    name: text(input.name, 160),
    phone: text(input.phone, 32),
    state: ALLOWED_STATES.has(state) ? state : 'abertura',
    score: Math.max(0, Math.min(100, Number(input.score) || 0)),
    contacted: Boolean(input.contacted),
    meeting_scheduled: Boolean(input.meeting_scheduled),
    lead_type: text(input.lead_type, 50),
    attempts: Math.max(0, Math.min(999, Number(input.attempts) || 0)),
    niche: text(input.niche, 100),
    city: text(input.city, 100),
    origin: text(input.origin, 100),
    priority: text(input.priority, 30),
    runtime_status: text(input.runtime_status, 50),
    history_count: Math.max(0, Number(input.history_count) || 0),
    last_message_at: date(input.last_message_at),
    source_created_at: date(input.source_created_at),
    source_updated_at: date(input.source_updated_at),
    synced_at: new Date().toISOString(),
  }
}

export async function syncCrmLeads(body) {
  const leads = Array.isArray(body?.leads) ? body.leads : []
  if (!leads.length || leads.length > MAX_BATCH) throw new Error(`Envie entre 1 e ${MAX_BATCH} leads por lote.`)
  const rows = [...new Map(leads.map(normalizeCrmLead).map(row => [`${row.source}:${row.source_ref}`, row])).values()]
  const saved = await upsertCommand('crm_leads', rows, 'source,source_ref')
  return { accepted: saved.length, received: leads.length, duplicatesRemoved: leads.length - rows.length, syncedAt: new Date().toISOString() }
}

export async function addDevRequest(body) {
  const title = text(body?.title, 180)
  const description = text(body?.description, 8000)
  if (!title || !description) throw new Error('title e description são obrigatórios.')
  const confirmationCode = createHash('sha256').update(`${Date.now()}:${title}:${Math.random()}`).digest('hex').slice(0, 6).toUpperCase()
  const [row] = await writeCommand('dev_requests', {
    source: 'kairos_whatsapp',
    external_ref: text(body.external_ref, 120),
    title,
    description,
    impact: text(body.impact, 2000),
    evidence: text(body.evidence, 4000),
    proposed_solution: text(body.proposed_solution, 4000),
    priority: ['low','medium','high','critical'].includes(body.priority) ? body.priority : 'medium',
    status: 'awaiting_confirmation',
    confirmation_code: confirmationCode,
    assigned_to: null,
  })
  await writeCommand('dev_request_events', { request_id: row.id, status: row.status, message: 'Pedido recebido. Aguardando confirmação explícita do Founder no WhatsApp.', actor: 'kairos', notify_founder: false })
  return row
}

export async function confirmDevRequest(body) {
  const code = text(body?.confirmation_code, 12)?.toUpperCase()
  if (!code) throw new Error('confirmation_code é obrigatório.')
  const rows = await readCommand('dev_requests', `?confirmation_code=eq.${encodeURIComponent(code)}&status=eq.awaiting_confirmation&select=id,title&limit=1`)
  if (!rows?.length) throw new Error('Pedido não encontrado, expirado ou já confirmado.')
  const [request] = await patchCommand('dev_requests', `?id=eq.${rows[0].id}`, { status: 'pending', confirmed_at: new Date().toISOString(), updated_at: new Date().toISOString(), progress_note: 'Confirmado pelo Founder no WhatsApp; aguardando triagem técnica.' })
  await writeCommand('dev_request_events', { request_id: request.id, status: 'pending', message: 'Founder confirmou o pedido. Aguardando Codex ou Claude Code assumir.', actor: 'founder' })
  return request
}

export async function updateDevRequest(body) {
  const id = text(body?.id, 64)
  const status = text(body?.status, 40)
  const allowed = ['triaged','in_progress','blocked','done','error','rejected']
  if (!id || !allowed.includes(status)) throw new Error('id e status válido são obrigatórios.')
  const payload = { status, updated_at: new Date().toISOString(), assigned_to: body.assigned_to || null, progress_note: text(body.progress_note, 4000), resolution: text(body.resolution, 8000), error_message: text(body.error_message, 4000) }
  const rows = await patchCommand('dev_requests', `?id=eq.${encodeURIComponent(id)}&confirmed_at=not.is.null`, payload)
  if (!rows.length) throw new Error('Pedido confirmado não encontrado.')
  const message = payload.resolution || payload.error_message || payload.progress_note || `Pedido atualizado para ${status}.`
  await writeCommand('dev_request_events', { request_id: id, status, message, actor: body.assigned_to || 'automation' })
  return rows[0]
}

export async function listPendingDevUpdates() {
  return await readCommand('dev_request_events', '?delivered_at=is.null&notify_founder=eq.true&select=id,request_id,created_at,status,message,actor&order=created_at.asc&limit=50') ?? []
}

export async function acknowledgeDevUpdates(body) {
  const ids = Array.isArray(body?.ids) ? body.ids.filter(id => /^[0-9a-f-]{36}$/i.test(String(id))).slice(0, 50) : []
  if (!ids.length) return { acknowledged: 0 }
  const rows = await patchCommand('dev_request_events', `?id=in.(${ids.join(',')})`, { delivered_at: new Date().toISOString() })
  return { acknowledged: rows.length }
}

export async function listCrm() {
  const leadFields = 'id,source,source_ref,name,phone,state,score,contacted,meeting_scheduled,lead_type,attempts,niche,city,origin,priority,runtime_status,history_count,last_message_at,source_created_at,source_updated_at,synced_at'
  const requestsPromise = readCommand('dev_requests', '?select=id,created_at,updated_at,source,title,description,impact,evidence,proposed_solution,priority,status,assigned_to,resolution&order=created_at.desc&limit=100')
  const rows = []
  for (let offset = 0; offset < 5000; offset += 1000) {
    const page = await readCommand('crm_leads', `?select=${leadFields}&order=source_updated_at.desc.nullslast&limit=1000&offset=${offset}`) ?? []
    rows.push(...page)
    if (page.length < 1000) break
  }
  const requests = await requestsPromise
  return {
    source: 'real',
    checkedAt: new Date().toISOString(),
    leads: rows,
    requests: requests ?? [],
    stats: {
      total: rows.length,
      contacted: rows.filter(item => item.contacted).length,
      active: rows.filter(item => !['encerrado','bloqueado','sem_whatsapp','pausado_manual'].includes(item.state)).length,
      qualified: rows.filter(item => Number(item.score) >= 8 || ['interesse','agendamento','fechamento'].includes(item.state)).length,
      meetings: rows.filter(item => item.meeting_scheduled).length,
    },
  }
}
