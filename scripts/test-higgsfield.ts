/**
 * Higgsfield SDK — teste Seedance 2.5 text-to-video
 * Executa UMA geração billable. Não rodar sem confirmar.
 * Uso: npx tsx scripts/test-higgsfield.ts
 */

// Carrega .env.local antes de tudo
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

try {
  const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
  for (const line of raw.split('\n')) {
    const match = /^([^#=\s]+)\s*=\s*(.*)$/.exec(line.trim())
    if (match) process.env[match[1]] = match[2]
  }
} catch {
  // .env.local ausente — variáveis já podem estar no ambiente
}

import { config, higgsfield } from '@higgsfield/client/v2'

const credentials = process.env.HF_CREDENTIALS
if (!credentials) {
  console.error('HF_CREDENTIALS não encontrado. Adicione ao .env.local: HF_CREDENTIALS=id:secret')
  process.exit(1)
}

config({ credentials })

async function main() {
  console.log('Submetendo geração Seedance 2.5...')

  const result = await higgsfield.subscribe('bytedance/seedance-2.5/text-to-video', {
    input: {
      prompt: 'A cinematic scene at sunset',
      duration: 5,
      resolution: '720p',
      aspect_ratio: '16:9',
      generate_audio: true,
    },
    withPolling: true,
  })

  if (result.status === 'completed') {
    const url = result.video?.url
    if (url) {
      console.log('Concluído. URL do vídeo:', url)
    } else {
      console.warn('Concluído mas sem URL no campo video. Resposta completa:', JSON.stringify(result))
    }
  } else if (result.status === 'failed') {
    console.error('Geração falhou:', JSON.stringify(result))
    process.exit(1)
  } else if (result.status === 'nsfw') {
    console.warn('Conteúdo bloqueado por moderação (nsfw):', JSON.stringify(result))
    process.exit(1)
  } else {
    console.warn('Status inesperado:', result.status, JSON.stringify(result))
    process.exit(1)
  }
}

main().catch(err => { console.error(err); process.exit(1) })
