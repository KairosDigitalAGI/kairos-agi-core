const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const RUNS_PATH = process.env.KAIROS_RUNTIME_RUNS_PATH || path.join(__dirname, '..', 'data', 'runtime-runs.json')
const allowedTypes = new Set(['campaign', 'replenishment', 'recovery'])
const allowedStates = new Set(['running', 'completed', 'partial', 'failed'])
const metricNames = ['target_count', 'eligible_before', 'discovered', 'qualified', 'attempted', 'delivered', 'responses', 'opt_outs', 'invalid', 'eligible_after']

function readRuns() {
  if (!fs.existsSync(RUNS_PATH)) return []
  try { return JSON.parse(fs.readFileSync(RUNS_PATH, 'utf8')) } catch { return [] }
}

function saveRuns(runs) {
  fs.mkdirSync(path.dirname(RUNS_PATH), { recursive: true })
  const temporary = `${RUNS_PATH}.${process.pid}.tmp`
  fs.writeFileSync(temporary, JSON.stringify(runs.slice(-250), null, 2), { encoding: 'utf8', mode: 0o600 })
  fs.renameSync(temporary, RUNS_PATH)
}

function upsertRun(input) {
  if (!allowedTypes.has(input?.run_type)) throw new Error('run_type inválido')
  if (!allowedStates.has(input?.state)) throw new Error('state inválido')
  const now = new Date().toISOString()
  const runRef = String(input.run_ref || crypto.randomUUID()).slice(0, 120)
  const runs = readRuns()
  const index = runs.findIndex(run => run.run_ref === runRef)
  const previous = index >= 0 ? runs[index] : {}
  const next = {
    ...previous, ...input, run_ref: runRef,
    started_at: input.started_at || previous.started_at || now,
    finished_at: input.state === 'running' ? null : input.finished_at || now,
    pending_sync: true,
  }
  for (const name of metricNames) next[name] = Math.max(0, Math.trunc(Number(next[name]) || 0))
  if (index >= 0) runs[index] = next
  else runs.push(next)
  saveRuns(runs)
  return next
}

function pendingRuns(limit = 100) { return readRuns().filter(run => run.pending_sync).slice(0, limit) }

function acknowledgeRuns(refs) {
  const accepted = new Set((refs || []).map(String))
  if (!accepted.size) return 0
  let count = 0
  const runs = readRuns().map(run => {
    if (!accepted.has(run.run_ref) || !run.pending_sync) return run
    count += 1
    return { ...run, pending_sync: false }
  })
  saveRuns(runs)
  return count
}

module.exports = { upsertRun, pendingRuns, acknowledgeRuns }
