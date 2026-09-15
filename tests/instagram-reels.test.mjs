import test from 'node:test'
import assert from 'node:assert/strict'
import { postToInstagram } from '../api/_content.js'
import { encrypt } from '../api/_crypto.js'

const KEYS = [
  'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'KAIROS_TOKEN_ENCRYPTION_KEY',
  'META_APP_ID', 'META_APP_SECRET', 'META_OAUTH_REDIRECT_URI',
  'INSTAGRAM_POLL_INTERVAL_MS', 'INSTAGRAM_POLL_MAX_TENTATIVAS',
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

const baseEnv = { SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x', KAIROS_TOKEN_ENCRYPTION_KEY: 'chave-de-teste-bem-longa' }

// --- postToInstagram: etapa video→publicado via Reels assíncrono, mesmo gate de aprovado que postToYoutube ---

test('postToInstagram requires a jobId (400) before touching anything', async () => {
  await assert.rejects(postToInstagram({}), /jobId/)
})

test('postToInstagram fails closed (503) without Supabase configured', async () => {
  await withEnv({}, async () => {
    await assert.rejects(postToInstagram({ jobId: 'abc' }), /SUPABASE_URL/)
  })
})

test('postToInstagram reports 404 when the job does not exist', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify([]), { status: 200 })
  try {
    await withEnv(baseEnv, async () => {
      await assert.rejects(postToInstagram({ jobId: 'abc' }), /não encontrado/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('postToInstagram refuses (409) a job that is not in etapa=video', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify([{ id: 'abc', titulo: 'x', etapa: 'imagem', briefing: {}, aprovado: true }]), { status: 200 })
  try {
    await withEnv(baseEnv, async () => {
      await assert.rejects(postToInstagram({ jobId: 'abc' }), /etapa "imagem"/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('postToInstagram refuses (402) a job in etapa=video that has not been approved by the Founder — publishing reuses the same spend gate', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify([{ id: 'abc', titulo: 'x', etapa: 'video', briefing: {}, aprovado: false }]), { status: 200 })
  try {
    await withEnv(baseEnv, async () => {
      await assert.rejects(postToInstagram({ jobId: 'abc' }), /aprovado:false/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('postToInstagram refuses (409) an approved job in etapa=video with no video content_asset recorded', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, opts = {}) => {
    const href = String(url)
    if (href.includes('content_jobs') && (!opts.method || opts.method === 'GET')) {
      return new Response(JSON.stringify([{ id: 'abc', titulo: 'x', etapa: 'video', briefing: {}, aprovado: true }]), { status: 200 })
    }
    if (href.includes('content_assets')) {
      return new Response(JSON.stringify([]), { status: 200 })
    }
    throw new Error(`fetch inesperado neste teste: ${opts.method || 'GET'} ${href}`)
  }
  try {
    await withEnv(baseEnv, async () => {
      await assert.rejects(postToInstagram({ jobId: 'abc' }), /nenhum content_asset de vídeo/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('postToInstagram short-circuits (never calls the Instagram API again) when content_calendar already shows this asset published', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, opts = {}) => {
    const href = String(url)
    if (href.includes('content_jobs') && (!opts.method || opts.method === 'GET')) {
      return new Response(JSON.stringify([{ id: 'abc', titulo: 'x', etapa: 'video', briefing: {}, aprovado: true }]), { status: 200 })
    }
    if (href.includes('content_assets')) {
      return new Response(JSON.stringify([{ id: 'asset-1', storage_path: 'https://example.test/videos/final.mp4' }]), { status: 200 })
    }
    if (href.includes('content_calendar') && (!opts.method || opts.method === 'GET')) {
      return new Response(JSON.stringify([{ id: 'cal-1', status: 'publicado', referencia_externa: 'media-ja-publicado' }]), { status: 200 })
    }
    if (href.includes('content_jobs') && opts.method === 'PATCH') {
      return new Response(JSON.stringify([{ id: 'abc', titulo: 'x', etapa: 'publicado' }]), { status: 200 })
    }
    throw new Error(`fetch inesperado neste teste (não deveria chamar o Instagram de novo): ${opts.method || 'GET'} ${href}`)
  }
  try {
    await withEnv(baseEnv, async () => {
      const out = await postToInstagram({ jobId: 'abc' })
      assert.equal(out.status, 'publicado')
      assert.equal(out.mediaId, 'media-ja-publicado')
      assert.equal(out.job.etapa, 'publicado')
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('postToInstagram resumes an already-created container instead of opening a second one on retry', async () => {
  const originalFetch = globalThis.fetch
  let tokenCiphertext
  const igUserId = 'ig-42'
  const creationId = 'creation-existing'
  globalThis.fetch = async (url, opts = {}) => {
    const href = String(url)
    if (href.includes('content_jobs') && (!opts.method || opts.method === 'GET')) {
      return new Response(JSON.stringify([{ id: 'abc', titulo: 'Ideia legal', etapa: 'video', briefing: {}, aprovado: true }]), { status: 200 })
    }
    if (href.includes('content_assets') && (!opts.method || opts.method === 'GET')) {
      return new Response(JSON.stringify([{ id: 'asset-1', storage_path: 'https://example.test/videos/final.mp4' }]), { status: 200 })
    }
    if (href.includes('content_calendar') && (!opts.method || opts.method === 'GET')) {
      return new Response(JSON.stringify([{ id: 'cal-1', status: 'agendado', referencia_externa: creationId }]), { status: 200 })
    }
    if (href.includes('integracoes_tokens') && (!opts.method || opts.method === 'GET')) {
      return new Response(JSON.stringify([{ account_id: igUserId, access_token_enc: tokenCiphertext, expires_at: new Date(Date.now() + 40 * 24 * 3600_000).toISOString() }]), { status: 200 })
    }
    if (href === `https://graph.instagram.com/${igUserId}/media`) {
      throw new Error('não deveria criar um segundo container — o existente deveria ser reaproveitado')
    }
    if (href.startsWith(`https://graph.instagram.com/${creationId}`)) {
      return new Response(JSON.stringify({ status_code: 'FINISHED' }), { status: 200 })
    }
    if (href === `https://graph.instagram.com/${igUserId}/media_publish`) {
      const body = new URLSearchParams(opts.body)
      assert.equal(body.get('creation_id'), creationId)
      return new Response(JSON.stringify({ id: 'media-resumed' }), { status: 200 })
    }
    if (href.includes('content_calendar') && opts.method === 'PATCH') {
      const body = JSON.parse(opts.body)
      assert.equal(body.status, 'publicado')
      assert.equal(body.referencia_externa, 'media-resumed')
      return new Response(JSON.stringify([{ id: 'cal-1', ...body }]), { status: 200 })
    }
    if (href.includes('content_jobs') && opts.method === 'PATCH') {
      return new Response(JSON.stringify([{ id: 'abc', titulo: 'Ideia legal', etapa: 'publicado' }]), { status: 200 })
    }
    throw new Error(`fetch inesperado neste teste: ${opts.method || 'GET'} ${href}`)
  }
  try {
    await withEnv(baseEnv, async () => {
      tokenCiphertext = encrypt('token-valido')
      const out = await postToInstagram({ jobId: 'abc' })
      assert.equal(out.status, 'publicado')
      assert.equal(out.mediaId, 'media-resumed')
      assert.equal(out.job.etapa, 'publicado')
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('postToInstagram creates the container, polls until FINISHED, publishes and records content_calendar/content_jobs on success', async () => {
  const originalFetch = globalThis.fetch
  let tokenCiphertext
  let tentativasDeStatus = 0
  const igUserId = 'ig-42'
  const creationId = 'creation-99'
  globalThis.fetch = async (url, opts = {}) => {
    const href = String(url)
    if (href.includes('content_jobs') && (!opts.method || opts.method === 'GET')) {
      return new Response(JSON.stringify([{ id: 'abc', titulo: 'Ideia legal', etapa: 'video', briefing: {}, aprovado: true }]), { status: 200 })
    }
    if (href.includes('content_assets') && (!opts.method || opts.method === 'GET')) {
      return new Response(JSON.stringify([{ id: 'asset-1', storage_path: 'https://example.test/videos/final.mp4' }]), { status: 200 })
    }
    if (href.includes('content_calendar') && (!opts.method || opts.method === 'GET')) {
      return new Response(JSON.stringify([]), { status: 200 })
    }
    if (href.includes('integracoes_tokens') && (!opts.method || opts.method === 'GET')) {
      return new Response(JSON.stringify([{ account_id: igUserId, access_token_enc: tokenCiphertext, expires_at: new Date(Date.now() + 40 * 24 * 3600_000).toISOString() }]), { status: 200 })
    }
    if (href === `https://graph.instagram.com/${igUserId}/media`) {
      const body = new URLSearchParams(opts.body)
      assert.equal(body.get('video_url'), 'https://example.test/videos/final.mp4')
      assert.equal(body.get('media_type'), 'REELS')
      return new Response(JSON.stringify({ id: creationId }), { status: 200 })
    }
    if (href.includes('content_calendar') && opts.method === 'POST') {
      const body = JSON.parse(opts.body)
      assert.equal(body.canal, 'instagram')
      assert.equal(body.status, 'agendado')
      assert.equal(body.referencia_externa, creationId)
      return new Response(JSON.stringify([{ id: 'cal-2', ...body }]), { status: 201 })
    }
    if (href.startsWith(`https://graph.instagram.com/${creationId}`)) {
      tentativasDeStatus += 1
      const status_code = tentativasDeStatus === 1 ? 'IN_PROGRESS' : 'FINISHED'
      return new Response(JSON.stringify({ status_code }), { status: 200 })
    }
    if (href === `https://graph.instagram.com/${igUserId}/media_publish`) {
      return new Response(JSON.stringify({ id: 'media-final' }), { status: 200 })
    }
    if (href.includes('content_calendar') && opts.method === 'PATCH') {
      const body = JSON.parse(opts.body)
      assert.equal(body.status, 'publicado')
      assert.equal(body.referencia_externa, 'media-final')
      return new Response(JSON.stringify([{ id: 'cal-2', ...body }]), { status: 200 })
    }
    if (href.includes('content_jobs') && opts.method === 'PATCH') {
      return new Response(JSON.stringify([{ id: 'abc', titulo: 'Ideia legal', etapa: 'publicado' }]), { status: 200 })
    }
    throw new Error(`fetch inesperado neste teste: ${opts.method || 'GET'} ${href}`)
  }
  try {
    await withEnv({ ...baseEnv, INSTAGRAM_POLL_INTERVAL_MS: '1' }, async () => {
      tokenCiphertext = encrypt('token-valido')
      const out = await postToInstagram({ jobId: 'abc' })
      assert.equal(out.job.etapa, 'publicado')
      assert.equal(out.mediaId, 'media-final')
      assert.equal(out.status, 'publicado')
      assert.equal(tentativasDeStatus, 2)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('postToInstagram returns status "processando" (not an error) when the container is still IN_PROGRESS after the poll budget — safe to retry', async () => {
  const originalFetch = globalThis.fetch
  let tokenCiphertext
  const igUserId = 'ig-42'
  const creationId = 'creation-lenta'
  globalThis.fetch = async (url, opts = {}) => {
    const href = String(url)
    if (href.includes('content_jobs') && (!opts.method || opts.method === 'GET')) {
      return new Response(JSON.stringify([{ id: 'abc', titulo: 'Ideia legal', etapa: 'video', briefing: {}, aprovado: true }]), { status: 200 })
    }
    if (href.includes('content_assets') && (!opts.method || opts.method === 'GET')) {
      return new Response(JSON.stringify([{ id: 'asset-1', storage_path: 'https://example.test/videos/final.mp4' }]), { status: 200 })
    }
    if (href.includes('content_calendar') && (!opts.method || opts.method === 'GET')) {
      return new Response(JSON.stringify([]), { status: 200 })
    }
    if (href.includes('integracoes_tokens') && (!opts.method || opts.method === 'GET')) {
      return new Response(JSON.stringify([{ account_id: igUserId, access_token_enc: tokenCiphertext, expires_at: new Date(Date.now() + 40 * 24 * 3600_000).toISOString() }]), { status: 200 })
    }
    if (href === `https://graph.instagram.com/${igUserId}/media`) {
      return new Response(JSON.stringify({ id: creationId }), { status: 200 })
    }
    if (href.includes('content_calendar') && opts.method === 'POST') {
      const body = JSON.parse(opts.body)
      return new Response(JSON.stringify([{ id: 'cal-3', ...body }]), { status: 201 })
    }
    if (href.startsWith(`https://graph.instagram.com/${creationId}`)) {
      return new Response(JSON.stringify({ status_code: 'IN_PROGRESS' }), { status: 200 })
    }
    throw new Error(`fetch inesperado neste teste (não deveria publicar ainda): ${opts.method || 'GET'} ${href}`)
  }
  try {
    await withEnv({ ...baseEnv, INSTAGRAM_POLL_INTERVAL_MS: '1', INSTAGRAM_POLL_MAX_TENTATIVAS: '2' }, async () => {
      tokenCiphertext = encrypt('token-valido')
      const out = await postToInstagram({ jobId: 'abc' })
      assert.equal(out.status, 'processando')
      assert.equal(out.creationId, creationId)
      assert.equal(out.job.id, 'abc')
      assert.notEqual(out.job.etapa, 'publicado')
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})
