function requireExactReceipt(result, snapshots, key, noun) {
  const expected = new Set(snapshots.map(snapshot => snapshot[key]))
  const confirmed = new Set(Array.isArray(result?.acceptedRefs) ? result.acceptedRefs : [])
  if (expected.size !== snapshots.length || Number(result?.accepted) !== expected.size || confirmed.size !== expected.size || [...expected].some(ref => !confirmed.has(ref))) {
    throw new Error(`O Core não confirmou todos os ${noun} enviados; fila local preservada para nova tentativa.`)
  }
}

function requireRunReceipt(result, runs) { return requireExactReceipt(result, runs, 'run_ref', 'registros de rodada') }
function requireEventReceipt(result, events) { return requireExactReceipt(result, events, 'event_ref', 'eventos') }

module.exports = { requireRunReceipt, requireEventReceipt }
