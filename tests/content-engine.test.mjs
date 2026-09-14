import test from 'node:test'
import assert from 'node:assert/strict'
import { computeContentPipeline, createContentJob, generateScript, approveContentJob, generateImage } from '../api/_content.js'

const KEYS = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'OPENROUTER_API_KEY', 'KAIROS_LLM_PROVIDER']

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

test('content pipeline reports unavailable (never an empty-but-real pipeline) without Supabase configured', async () => {
  await withEnv({}, async () => {
    const out = await computeContentPipeline()
    assert.equal(out.source, 'unavailable')
    assert.deepEqual(out.jobs, [])
  })
})

test('content pipeline surfaces the pending-migration hint instead of a generic 500 when the table does not exist yet', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('relation "command.content_jobs" does not exist', { status: 404 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      const out = await computeContentPipeline()
      assert.equal(out.source, 'unavailable')
      assert.match(out.reason, /0020_content_engine\.sql/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('createContentJob fails closed (503) without Supabase configured, never pretending a job was created', async () => {
  await withEnv({}, async () => {
    await assert.rejects(createContentJob({ titulo: 'ideia nova' }), /SUPABASE_URL/)
  })
})

test('createContentJob surfaces the pending-migration hint on write failure', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('relation "command.content_jobs" does not exist', { status: 404 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      await assert.rejects(createContentJob({ titulo: 'ideia nova' }), /0020_content_engine\.sql/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

// --- generateScript: só roda com um clique explícito do Founder, nunca em lote ---

test('generateScript requires a jobId (400) before touching anything', async () => {
  await assert.rejects(generateScript({}), /jobId/)
})

test('generateScript fails closed (503) without Supabase configured', async () => {
  await withEnv({}, async () => {
    await assert.rejects(generateScript({ jobId: 'abc' }), /SUPABASE_URL/)
  })
})

test('generateScript reports 404 when the job does not exist', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify([]), { status: 200 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      await assert.rejects(generateScript({ jobId: 'abc' }), /não encontrado/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('generateScript refuses (409) a job that is not in etapa=ideia — never regenerates silently', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify([{ id: 'abc', titulo: 'x', etapa: 'roteiro', briefing: {} }]), { status: 200 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      await assert.rejects(generateScript({ jobId: 'abc' }), /etapa "roteiro"/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

// --- gate de aprovação: o schema (comentário em content_assets.gratuito na
// migration 0020) exige aprovado:true antes de qualquer gasto com provider
// pago — separado do clique "Gerar roteiro" em si. ---

test('generateScript refuses (402) a job that has not been explicitly approved for paid spend', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify([{ id: 'abc', titulo: 'x', etapa: 'ideia', briefing: {}, aprovado: false }]), { status: 200 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x', ANTHROPIC_API_KEY: 'x' }, async () => {
      await assert.rejects(generateScript({ jobId: 'abc' }), /aprovado:false/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('generateScript fails closed without any paid LLM provider configured (job already approved)', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify([{ id: 'abc', titulo: 'x', etapa: 'ideia', briefing: {}, aprovado: true }]), { status: 200 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      await assert.rejects(generateScript({ jobId: 'abc' }), /nenhum provider de LLM configurado/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('generateScript writes the real script and advances the job to etapa=roteiro on success (already approved)', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, opts = {}) => {
    const href = String(url)
    if (href.includes('api.anthropic.com')) {
      return new Response(JSON.stringify({ content: [{ type: 'text', text: 'CENA 1: ...' }], usage: { input_tokens: 10, output_tokens: 20 }, model: 'claude-sonnet-5', stop_reason: 'end_turn' }), { status: 200 })
    }
    if (href.includes('content_jobs') && (!opts.method || opts.method === 'GET')) {
      return new Response(JSON.stringify([{ id: 'abc', titulo: 'x', etapa: 'ideia', briefing: { publico: 'clínicas' }, aprovado: true }]), { status: 200 })
    }
    if (href.includes('content_assets') && opts.method === 'POST') {
      return new Response(JSON.stringify([{ id: 'asset-1', job_id: 'abc', tipo: 'roteiro', conteudo: 'CENA 1: ...' }]), { status: 201 })
    }
    if (href.includes('content_jobs') && opts.method === 'PATCH') {
      return new Response(JSON.stringify([{ id: 'abc', titulo: 'x', etapa: 'roteiro' }]), { status: 200 })
    }
    throw new Error(`fetch inesperado neste teste: ${opts.method || 'GET'} ${href}`)
  }
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x', ANTHROPIC_API_KEY: 'x' }, async () => {
      const out = await generateScript({ jobId: 'abc' })
      assert.equal(out.job.etapa, 'roteiro')
      assert.equal(out.asset.tipo, 'roteiro')
      assert.equal(out.asset.conteudo, 'CENA 1: ...')
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

// --- approveContentJob: a ação que liga o "interruptor" de aprovado:true ---

test('approveContentJob fails closed (503) without Supabase configured, never pretending approval happened', async () => {
  await withEnv({}, async () => {
    await assert.rejects(approveContentJob({ jobId: 'abc' }), /SUPABASE_URL/)
  })
})

test('approveContentJob reports 404 when the job does not exist', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify([]), { status: 200 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      await assert.rejects(approveContentJob({ jobId: 'abc' }), /não encontrado/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('approveContentJob writes aprovado:true/aprovado_por/aprovado_em on success', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, opts = {}) => {
    const href = String(url)
    if (!opts.method || opts.method === 'GET') {
      return new Response(JSON.stringify([{ id: 'abc' }]), { status: 200 })
    }
    if (opts.method === 'PATCH') {
      const body = JSON.parse(opts.body)
      assert.equal(body.aprovado, true)
      assert.equal(body.aprovado_por, 'founder')
      assert.ok(body.aprovado_em)
      return new Response(JSON.stringify([{ id: 'abc', etapa: 'ideia', ...body }]), { status: 200 })
    }
    throw new Error(`fetch inesperado neste teste: ${opts.method || 'GET'} ${href}`)
  }
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      const job = await approveContentJob({ jobId: 'abc', aprovadoPor: 'founder' })
      assert.equal(job.aprovado, true)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

// --- generateImage: etapa roteiro→imagem, só OpenAI gera imagem neste Core ---

test('generateImage requires a jobId (400) before touching anything', async () => {
  await assert.rejects(generateImage({}), /jobId/)
})

test('generateImage fails closed (503) without Supabase configured', async () => {
  await withEnv({}, async () => {
    await assert.rejects(generateImage({ jobId: 'abc' }), /SUPABASE_URL/)
  })
})

test('generateImage reports 404 when the job does not exist', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify([]), { status: 200 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      await assert.rejects(generateImage({ jobId: 'abc' }), /não encontrado/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('generateImage refuses (409) a job that is not in etapa=roteiro', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify([{ id: 'abc', titulo: 'x', etapa: 'ideia', briefing: {}, aprovado: true }]), { status: 200 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      await assert.rejects(generateImage({ jobId: 'abc' }), /etapa "ideia"/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('generateImage refuses (402) a job that has not been approved for paid spend', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify([{ id: 'abc', titulo: 'x', etapa: 'roteiro', briefing: {}, aprovado: false }]), { status: 200 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x', OPENAI_API_KEY: 'x' }, async () => {
      await assert.rejects(generateImage({ jobId: 'abc' }), /aprovado:false/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('generateImage fails closed (503) without OPENAI_API_KEY — the only image provider in this Core', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify([{ id: 'abc', titulo: 'x', etapa: 'roteiro', briefing: {}, aprovado: true }]), { status: 200 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      await assert.rejects(generateImage({ jobId: 'abc' }), /OPENAI_API_KEY/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('generateImage writes the real image and advances the job to etapa=imagem on success', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, opts = {}) => {
    const href = String(url)
    if (href.includes('api.openai.com/v1/images/generations')) {
      return new Response(JSON.stringify({ data: [{ b64_json: Buffer.from('fake-png').toString('base64') }], model: 'gpt-image-1' }), { status: 200 })
    }
    if (href.includes('/storage/v1/object/')) {
      return new Response('{}', { status: 200 })
    }
    if (href.includes('content_jobs') && (!opts.method || opts.method === 'GET')) {
      return new Response(JSON.stringify([{ id: 'abc', titulo: 'x', etapa: 'roteiro', briefing: {}, aprovado: true }]), { status: 200 })
    }
    if (href.includes('content_assets') && (!opts.method || opts.method === 'GET')) {
      return new Response(JSON.stringify([{ conteudo: 'CENA 1: ...' }]), { status: 200 })
    }
    if (href.includes('content_assets') && opts.method === 'POST') {
      return new Response(JSON.stringify([{ id: 'asset-2', job_id: 'abc', tipo: 'imagem', storage_path: 'content-assets/content-jobs/abc/imagem-1.png' }]), { status: 201 })
    }
    if (href.includes('content_jobs') && opts.method === 'PATCH') {
      return new Response(JSON.stringify([{ id: 'abc', titulo: 'x', etapa: 'imagem' }]), { status: 200 })
    }
    throw new Error(`fetch inesperado neste teste: ${opts.method || 'GET'} ${href}`)
  }
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x', OPENAI_API_KEY: 'x' }, async () => {
      const out = await generateImage({ jobId: 'abc' })
      assert.equal(out.job.etapa, 'imagem')
      assert.equal(out.asset.tipo, 'imagem')
      assert.ok(out.asset.storage_path)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})
