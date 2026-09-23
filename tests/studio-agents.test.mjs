import test from 'node:test'
import assert from 'node:assert/strict'
import { PROMPTS, runStrategist, runScreenwriter, runDirector, runQA } from '../api/_studio_agents.js'

const KEYS = ['OPENROUTER_API_KEY', 'STUDIO_AGENTS_OPENROUTER_MODEL']

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

function mockOpenRouter(text, { model = 'mistralai/mistral-small-3.2-24b-instruct:free' } = {}) {
  return async (url) => {
    const href = String(url)
    if (href.includes('openrouter.ai/api/v1/chat/completions')) {
      return new Response(JSON.stringify({
        choices: [{ message: { content: text }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 10, completion_tokens: 20 },
        model,
      }), { status: 200 })
    }
    throw new Error(`fetch inesperado neste teste: ${href}`)
  }
}

test('every agent prompt has a version string, so a reel can later record which prompt produced it', () => {
  for (const key of ['estrategista', 'roteirista', 'diretor', 'qa']) {
    assert.ok(PROMPTS[key], `PROMPTS.${key} deveria existir`)
    assert.match(PROMPTS[key].version, /^v\d+$/)
    assert.ok(PROMPTS[key].system.length > 0)
  }
})

test('runStrategist requires titulo before touching anything', async () => {
  await assert.rejects(runStrategist({}), /titulo/)
})

test('runStrategist fails closed (503) without OPENROUTER_API_KEY configured', async () => {
  await withEnv({}, async () => {
    await assert.rejects(runStrategist({ titulo: 'Lançamento do produto X' }), /OPENROUTER_API_KEY/)
  })
})

test('runStrategist returns the MOCKED OpenRouter text tagged with the prompt version', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = mockOpenRouter('Ângulo: bastidores autênticos. Tom: leve. Público: donos de pequenos negócios.')
  try {
    await withEnv({ OPENROUTER_API_KEY: 'x' }, async () => {
      const out = await runStrategist({ titulo: 'Lançamento do produto X', briefing: { publico: 'PMEs' } })
      assert.match(out.text, /Ângulo/)
      assert.equal(out.promptVersion, PROMPTS.estrategista.version)
      assert.equal(out.model, 'mistralai/mistral-small-3.2-24b-instruct:free')
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('runScreenwriter requires titulo and estrategia before touching anything', async () => {
  await assert.rejects(runScreenwriter({}), /titulo/)
  await assert.rejects(runScreenwriter({ titulo: 'x' }), /estrategia/)
})

test('runScreenwriter returns the MOCKED scene-by-scene script', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = mockOpenRouter('CENA 1: abre com o personagem cumprimentando.\nCENA 2: mostra o problema.\nCENA 3: mostra a solução.')
  try {
    await withEnv({ OPENROUTER_API_KEY: 'x' }, async () => {
      const out = await runScreenwriter({ titulo: 'Lançamento', estrategia: 'bastidores autênticos', numScenes: 3 })
      assert.match(out.text, /CENA 1/)
      assert.equal(out.promptVersion, PROMPTS.roteirista.version)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('runDirector requires roteiro before touching anything', async () => {
  await assert.rejects(runDirector({}), /roteiro/)
})

test('runDirector returns the MOCKED per-scene visual prompts', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = mockOpenRouter('CENA 1: wide shot, blue-haired character waving, studio background.')
  try {
    await withEnv({ OPENROUTER_API_KEY: 'x' }, async () => {
      const out = await runDirector({ roteiro: 'CENA 1: abre com o personagem cumprimentando.', promptVisualPersonagem: 'jovem, cabelo azul' })
      assert.match(out.text, /CENA 1/)
      assert.equal(out.promptVersion, PROMPTS.diretor.version)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('runQA requires roteiro and promptsVisuais before touching anything', async () => {
  await assert.rejects(runQA({}), /roteiro/)
  await assert.rejects(runQA({ roteiro: 'x' }), /promptsVisuais/)
})

test('runQA parses "APROVADO" as aprovado:true', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = mockOpenRouter('APROVADO\nRoteiro consistente, sem dado inventado.')
  try {
    await withEnv({ OPENROUTER_API_KEY: 'x' }, async () => {
      const out = await runQA({ roteiro: 'CENA 1: ...', promptsVisuais: 'CENA 1: ...' })
      assert.equal(out.aprovado, true)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('runQA parses "REVISAR" as aprovado:false', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = mockOpenRouter('REVISAR\nA cena 2 perde a cor do cabelo do personagem.')
  try {
    await withEnv({ OPENROUTER_API_KEY: 'x' }, async () => {
      const out = await runQA({ roteiro: 'CENA 1: ...', promptsVisuais: 'CENA 1: ...' })
      assert.equal(out.aprovado, false)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})
