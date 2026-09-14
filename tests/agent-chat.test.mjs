import test from 'node:test'
import assert from 'node:assert/strict'
import { selectProvider } from '../api/_providers/index.js'
import { handleAgentChat } from '../api/_agent-chat.js'

const KEYS = ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'OPENROUTER_API_KEY', 'KAIROS_LLM_PROVIDER', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']

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

test('auto provider prioritizes the paid plans (Anthropic, then OpenAI) over OpenRouter', async () => {
  await withEnv({ OPENROUTER_API_KEY: 'x' }, () => {
    assert.equal(selectProvider('auto').name, 'openrouter')
  })
  await withEnv({ OPENAI_API_KEY: 'x', OPENROUTER_API_KEY: 'x' }, () => {
    assert.equal(selectProvider('auto').name, 'openai')
  })
  await withEnv({ ANTHROPIC_API_KEY: 'x', OPENAI_API_KEY: 'x', OPENROUTER_API_KEY: 'x' }, () => {
    assert.equal(selectProvider('auto').name, 'claude')
  })
})

test('auto provider fails closed with a clear message when nothing is configured', async () => {
  await withEnv({}, () => {
    assert.throws(() => selectProvider('auto'), /ANTHROPIC_API_KEY.*OPENAI_API_KEY.*OPENROUTER_API_KEY/s)
  })
})

test('explicit provider name overrides auto priority', async () => {
  await withEnv({}, () => {
    assert.equal(selectProvider('openrouter').name, 'openrouter')
    assert.throws(() => selectProvider('bogus'), /provider desconhecido/)
  })
})

test('agent chat rejects malformed requests before touching any provider', async () => {
  await withEnv({}, async () => {
    assert.equal((await handleAgentChat({ body: {} })).status, 400)
    assert.equal((await handleAgentChat({ body: { agentId: 'orion' } })).status, 400)
    assert.equal((await handleAgentChat({ body: { agentId: 'ghost', messages: [{ role: 'user', content: 'oi' }] } })).status, 404)
    assert.equal((await handleAgentChat({ body: { agentId: 'orion', messages: [{ role: 'assistant', content: 'oi' } ] } })).status, 400)
  })
})

test('agent chat fails closed (503) without exposing which credential is missing to a client that never authenticated the provider', async () => {
  await withEnv({}, async () => {
    const out = await handleAgentChat({ body: { agentId: 'orion', messages: [{ role: 'user', content: 'status?' }] } })
    assert.equal(out.status, 503)
    assert.match(out.body.erro, /ANTHROPIC_API_KEY|OPENAI_API_KEY|OPENROUTER_API_KEY/)
  })
})

test('agent chat never fabricates business numbers when command schema is unconfigured', async () => {
  await withEnv({ ANTHROPIC_API_KEY: 'x' }, async () => {
    const calls = []
    const fakeProvider = {
      name: 'claude',
      async chat({ system }) {
        calls.push(system)
        return { text: 'ok', usage: {}, model: 'claude-sonnet-5', stopReason: 'end_turn' }
      },
    }
    const out = await handleAgentChat({ body: { agentId: 'orion', messages: [{ role: 'user', content: 'quanto faturamos?' }] } }, { provider: fakeProvider })
    assert.equal(out.status, 200)
    assert.match(calls[0], /indisponível/)
    assert.doesNotMatch(calls[0], /R\$\s*\d/)
  })
})
