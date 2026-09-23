import test from 'node:test'
import assert from 'node:assert/strict'
import {
  computeStudioSpend,
  assertBudgetAvailable,
  listCharacters,
  createCharacter,
  generateCharacterPortrait,
  listReels,
  createReel,
  estimateReelCostUsd,
  approveReel,
  listScenes,
  addScene,
} from '../api/_studio.js'

const KEYS = [
  'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'FAL_KEY', 'FAL_POLL_INTERVAL_MS', 'FAL_POLL_TIMEOUT_MS',
  'STUDIO_BUDGET_USD', 'STUDIO_CUSTO_IMAGEM_USD', 'STUDIO_CUSTO_VIDEO_USD',
]

function withEnv(vars, fn) {
  const saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]))
  for (const k of KEYS) delete process.env[k]
  Object.assign(process.env, vars)
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      for (const k of KEYS) delete process.env[k]
      for (const [k, v] of Object.entries(saved)) if (v !== undefined) process.env[k] = v
    })
}

// --- estimateReelCostUsd (pure function, no env/network needed) ---

test('estimateReelCostUsd is 0 for 0 scenes and grows linearly with scene count', () => {
  assert.equal(estimateReelCostUsd(0), 0)
  assert.equal(estimateReelCostUsd(-3), 0)
  const um = estimateReelCostUsd(1)
  assert.ok(um > 0)
  assert.equal(estimateReelCostUsd(4), um * 4)
})

// --- computeStudioSpend / assertBudgetAvailable (the budget guard) ---

test('computeStudioSpend reports unavailable without Supabase configured', async () => {
  await withEnv({}, async () => {
    const out = await computeStudioSpend()
    assert.equal(out.source, 'unavailable')
    assert.equal(out.totalUsd, 0)
  })
})

test('computeStudioSpend surfaces the pending-migration hint when the table does not exist yet', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('relation "command.studio_spend" does not exist', { status: 404 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      const out = await computeStudioSpend()
      assert.equal(out.source, 'unavailable')
      assert.match(out.reason, /0025_estudio_kairos\.sql/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('computeStudioSpend sums custo_usd across the ledger', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify([{ custo_usd: '0.003' }, { custo_usd: '0.35' }]), { status: 200 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      const out = await computeStudioSpend()
      assert.equal(out.source, 'real')
      assert.ok(Math.abs(out.totalUsd - 0.353) < 1e-9)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('assertBudgetAvailable fails closed (503) without STUDIO_BUDGET_USD configured, even with Supabase up', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('[]', { status: 200 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      await assert.rejects(assertBudgetAvailable(0.01), /STUDIO_BUDGET_USD/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('assertBudgetAvailable refuses (402) when projected spend would exceed the configured budget', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify([{ custo_usd: '4.99' }]), { status: 200 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x', STUDIO_BUDGET_USD: '5' }, async () => {
      await assert.rejects(assertBudgetAvailable(0.5), /orçamento do Estúdio Kairos estourado/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('assertBudgetAvailable allows spend that stays within the configured budget', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify([{ custo_usd: '1.00' }]), { status: 200 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x', STUDIO_BUDGET_USD: '5' }, async () => {
      const out = await assertBudgetAvailable(0.5)
      assert.equal(out.spentUsd, 1)
      assert.equal(out.budgetUsd, 5)
      assert.equal(out.projetadoUsd, 1.5)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

// --- Characters --------------------------------------------------------

test('createCharacter requires nome and promptVisual before touching anything', async () => {
  await assert.rejects(createCharacter({}), /nome/)
  await assert.rejects(createCharacter({ nome: 'Kai' }), /promptVisual/)
})

test('createCharacter fails closed (503) without Supabase configured', async () => {
  await withEnv({}, async () => {
    await assert.rejects(createCharacter({ nome: 'Kai', promptVisual: 'jovem, cabelo azul' }), /SUPABASE_URL/)
  })
})

test('generateCharacterPortrait requires characterId (400) before touching anything', async () => {
  await assert.rejects(generateCharacterPortrait({}), /characterId/)
})

test('generateCharacterPortrait reports 404 when the character does not exist', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('[]', { status: 200 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      await assert.rejects(generateCharacterPortrait({ characterId: 'abc' }), /não encontrado/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('generateCharacterPortrait fails closed (503) without FAL_KEY configured', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify([{ id: 'abc', nome: 'Kai', prompt_visual: 'jovem, cabelo azul' }]), { status: 200 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      await assert.rejects(generateCharacterPortrait({ characterId: 'abc' }), /FAL_KEY/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('generateCharacterPortrait refuses (402) before calling fal.ai when the budget would be exceeded', async () => {
  const originalFetch = globalThis.fetch
  let falCalled = false
  globalThis.fetch = async (url) => {
    const href = String(url)
    if (href.includes('queue.fal.run')) { falCalled = true; return new Response('{}', { status: 200 }) }
    if (href.includes('characters')) return new Response(JSON.stringify([{ id: 'abc', nome: 'Kai', prompt_visual: 'jovem, cabelo azul' }]), { status: 200 })
    if (href.includes('studio_spend')) return new Response(JSON.stringify([{ custo_usd: '999' }]), { status: 200 })
    throw new Error(`fetch inesperado: ${href}`)
  }
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x', FAL_KEY: 'x', STUDIO_BUDGET_USD: '1' }, async () => {
      await assert.rejects(generateCharacterPortrait({ characterId: 'abc' }), /orçamento do Estúdio Kairos estourado/)
      assert.equal(falCalled, false, 'fal.ai não deve ser chamado quando o orçamento já estouraria')
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('generateCharacterPortrait generates via MOCKED fal.ai, uploads to the "studio" bucket, records studio_spend and activates the character', async () => {
  const originalFetch = globalThis.fetch
  const calls = []
  globalThis.fetch = async (url, opts = {}) => {
    const href = String(url)
    calls.push(href)
    if (href.includes('queue.fal.run/fal-ai/flux/schnell')) {
      return new Response(JSON.stringify({
        status: 'COMPLETED',
        status_url: 'https://queue.fal.run/status/9',
        response_url: 'https://queue.fal.run/response/9',
      }), { status: 200 })
    }
    if (href.includes('queue.fal.run/response/9')) {
      return new Response(JSON.stringify({ images: [{ url: 'https://fal.media/portrait-kai.png' }] }), { status: 200 })
    }
    if (href === 'https://fal.media/portrait-kai.png') {
      return new Response(Buffer.from('fake-png-bytes'), { status: 200 })
    }
    if (href.includes('/storage/v1/object/studio/')) {
      return new Response('{}', { status: 200 })
    }
    if (href.includes('rest/v1/characters') && (!opts.method || opts.method === 'GET')) {
      return new Response(JSON.stringify([{ id: 'abc', nome: 'Kai', prompt_visual: 'jovem, cabelo azul' }]), { status: 200 })
    }
    if (href.includes('rest/v1/studio_spend') && (!opts.method || opts.method === 'GET')) {
      return new Response('[]', { status: 200 })
    }
    if (href.includes('rest/v1/studio_spend') && opts.method === 'POST') {
      return new Response(JSON.stringify([{ id: 'spend-1' }]), { status: 201 })
    }
    if (href.includes('rest/v1/characters') && opts.method === 'PATCH') {
      return new Response(JSON.stringify([{ id: 'abc', nome: 'Kai', imagem_referencia_path: 'studio/characters/abc/retrato.png', status: 'ativo' }]), { status: 200 })
    }
    throw new Error(`fetch inesperado neste teste: ${opts.method || 'GET'} ${href}`)
  }
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x', FAL_KEY: 'x', STUDIO_BUDGET_USD: '5' }, async () => {
      const out = await generateCharacterPortrait({ characterId: 'abc' })
      assert.equal(out.status, 'ativo')
      assert.match(out.imagem_referencia_path, /^studio\//)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

// --- Reels ---------------------------------------------------------------

test('createReel requires titulo before touching anything', async () => {
  await assert.rejects(createReel({}), /titulo/)
})

test('createReel fails closed (503) without Supabase configured', async () => {
  await withEnv({}, async () => {
    await assert.rejects(createReel({ titulo: 'Reel de lançamento' }), /SUPABASE_URL/)
  })
})

test('approveReel requires reelId (400) before touching anything', async () => {
  await assert.rejects(approveReel({}), /reelId/)
})

test('approveReel reports 404 when the reel does not exist', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('[]', { status: 200 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      await assert.rejects(approveReel({ reelId: 'r1' }), /não encontrado/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('approveReel writes aprovado:true/aprovado_por/etapa=aprovacao on success', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, opts = {}) => {
    const href = String(url)
    if (href.includes('reels') && (!opts.method || opts.method === 'GET')) return new Response(JSON.stringify([{ id: 'r1' }]), { status: 200 })
    if (href.includes('reels') && opts.method === 'PATCH') {
      const body = JSON.parse(opts.body)
      assert.equal(body.aprovado, true)
      assert.equal(body.aprovado_por, 'Founder')
      assert.equal(body.etapa, 'aprovacao')
      return new Response(JSON.stringify([{ id: 'r1', ...body }]), { status: 200 })
    }
    throw new Error(`fetch inesperado: ${opts.method || 'GET'} ${href}`)
  }
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      const out = await approveReel({ reelId: 'r1', aprovadoPor: 'Founder' })
      assert.equal(out.aprovado, true)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

// --- Scenes ----------------------------------------------------------------

test('listScenes requires reelId (400)', async () => {
  await assert.rejects(listScenes({}), /reelId/)
})

test('addScene requires reelId (400) before touching anything', async () => {
  await assert.rejects(addScene({}), /reelId/)
})

test('addScene fails closed (503) without Supabase configured', async () => {
  await withEnv({}, async () => {
    await assert.rejects(addScene({ reelId: 'r1', ordem: 1 }), /SUPABASE_URL/)
  })
})
