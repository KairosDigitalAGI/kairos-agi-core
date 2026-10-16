function requireRunReceipt(result, runs) {
  const expected = new Set(runs.map(run => run.run_ref))
  const confirmed = new Set(Array.isArray(result?.acceptedRefs) ? result.acceptedRefs : [])
  if (Number(result?.accepted) !== expected.size || confirmed.size !== expected.size || [...expected].some(ref => !confirmed.has(ref))) {
    throw new Error('O Core não confirmou todas as rodadas enviadas; fila local preservada para nova tentativa.')
  }
}

module.exports = { requireRunReceipt }
