// Supabase Storage server-side — zero dependência, mesmo espírito de
// api/_command.js (REST puro via fetch, credencial só server-side). Usado
// pelo Content Engine para guardar imagem/vídeo gerados (command.content_assets
// grava só o `storage_path`, nunca o binário). Bucket público "content-assets"
// (mesmo padrão do bucket "videos" já usado pelo kairos-command) — conteúdo é
// material de marketing da própria Kairos Digital, não dado sensível.
const BUCKET = 'content-assets'

function storageConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

// Sobe um objeto binário. `path` já deve vir seguro (sem espaço/acento — ver
// safePath()). Sem credencial, lança — quem chama decide como reportar.
export async function uploadToStorage(path, buffer, contentType) {
  if (!storageConfigured()) throw new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.')
  const base = process.env.SUPABASE_URL.replace(/\/+$/, '')
  const res = await fetch(`${base}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': contentType || 'application/octet-stream',
      'x-upsert': 'true',
    },
    body: buffer,
  })
  if (!res.ok) {
    const corpo = await res.text().catch(() => '')
    throw new Error(`storage ${BUCKET}/${path} respondeu ${res.status}: ${corpo.slice(0, 200)}`)
  }
  return `${BUCKET}/${path}`
}

export function publicStorageUrl(storagePath) {
  if (!process.env.SUPABASE_URL) return null
  const base = process.env.SUPABASE_URL.replace(/\/+$/, '')
  return `${base}/storage/v1/object/public/${storagePath}`
}

// `Ideia do Dom!.png` → `ideia-do-dom.png`. Storage não gosta de acento/espaço
// (mesma função, mesmo motivo do nomeSeguro() já usado pelo kairos-command).
export function safePath(nome) {
  const limpo = String(nome)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._/-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
  return limpo.slice(-120) || 'arquivo'
}
