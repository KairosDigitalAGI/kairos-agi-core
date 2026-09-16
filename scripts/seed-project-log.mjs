#!/usr/bin/env node
// Semeia o Mapa do Projeto (command.project_log) com o histórico real das
// Fases 1-13 da Missão 006, extraído de docs/context/CHANGELOG.md e do git
// log deste repo. Roda uma vez, depois que a migration
// supabase/migrations/0023_project_log.sql (repo kairos-command) tiver sido
// aplicada em produção — antes disso a API responde 503/"unavailable" e
// este script reporta exatamente isso, sem fingir sucesso.
//
// Uso: node scripts/seed-project-log.mjs
// Credenciais: KAIROS_USER/KAIROS_PASS no ambiente (mesmas do Painel
// Operacional). Alvo por padrão é a produção; PROJECT_LOG_URL sobrescreve.
import { env, exit } from 'node:process'

const entries = [
  { agent: 'claude-code', phase: 'Fase 1', type: 'done', title: 'Dashboard conectado a receita/MRR/clientes e frota reais', description: 'business-metrics e agent-status passam a ler command.receitas/clientes/agents de verdade, com Basic Auth (KAIROS_USER/KAIROS_PASS) e "indisponível" explícito sem inventar número.', commit: '4efb06c', deployed: true },
  { agent: 'claude-code', phase: 'Fase 2', type: 'done', title: 'Chat consultivo com qualquer agente do organograma', description: 'api/agent-chat.mjs com prioridade Anthropic→OpenAI→OpenRouter. Rótulo organizacional, sem alegar execução real (nenhum agente tem executor conectado).', commit: '45b2add', deployed: true },
  { agent: 'claude-code', phase: 'Fase 3', type: 'done', title: 'Schema e primeira fatia do Content Engine', description: 'command.content_jobs/content_assets/content_calendar/avatars/prompt_library desenhados na migration 0020_content_engine.sql. Pipeline ideia→roteiro→imagem→vídeo→publicado.', commit: 'c62f771', deployed: true },
  { agent: 'claude-code', phase: 'Fase 4', type: 'done', title: 'OAuth do YouTube com cofre de tokens cifrado', description: 'command.integracoes_tokens (migration 0021) guarda access_token/refresh_token cifrados AES-256-GCM (api/_crypto.js). Primeira integração social real da empresa.', commit: 'f7fac7e', deployed: true },
  { agent: 'claude-code', phase: 'Fase 5', type: 'done', title: 'Geração real de roteiro no Content Engine', description: 'generateScript(jobId) via provider pago, gate aprovado:true antes de qualquer gasto — regra de ouro reaproveitada em todas as fases seguintes.', commit: '27c4398', deployed: true },
  { agent: 'claude-code', phase: 'Fase 6', type: 'done', title: 'Geração real de imagem de capa no Content Engine', description: 'api/_providers/openai.js#generateImage (gpt-image-1). Bucket content-assets no Supabase Storage (migration 0022).', commit: '0257d8f', deployed: true },
  { agent: 'claude-code', phase: 'Fase 7', type: 'done', title: 'Video Engine free-tier real (Veo + fallback Kling)', description: 'generateVideo(jobId, tier) tenta Google Veo grátis primeiro, cai pro Kling v1.6 do fal.ai quando a cota estoura — mas o fallback não é de fato gratuito, então segue exigindo aprovado:true.', commit: '0e3429e', deployed: true },
  { agent: 'claude-code', phase: 'Fase 8', type: 'done', title: 'Publicação real no YouTube', description: 'postToYoutube sobe o vídeo real (privacyStatus:"private") e grava content_calendar/content_jobs. Rotas de content-jobs consolidadas num único [action].mjs para caber no teto de 12 functions do Hobby.', commit: 'ab766af', deployed: true },
  { agent: 'claude-code', phase: 'Pós-Fase 8', type: 'bug', title: 'Correção pós-Fase 8: 3 alegações de bug confrontadas com produção', description: 'As 3 "correções" pedidas foram verificadas contra o sistema real antes de qualquer código: nenhuma era bug de fato (gate do Painel Operacional, contador "1/2" honesto, callback do YouTube já existente) — nada alterado, com o motivo escrito para cada uma.', commit: '83924e5', deployed: true },
  { agent: 'claude-code', phase: 'Fase 9', type: 'done', title: 'Avatar Studio — progresso real dos 27 agentes', description: 'command.avatars guarda só nivel/xp/coins/conquistas por agente_slug; identidade continua em src/data/agentRegistry.json, nunca duplicada no banco.', commit: '90276ac', deployed: true },
  { agent: 'claude-code', phase: 'Fase 10', type: 'done', title: 'Story Engine — narrativa e feed sobre número real', description: 'generateDailyNarrative recalcula métricas reais antes de narrar; getAgentActivity rotula content_jobs pelo departamento dono da etapa. Core chega a 12/12 rotas, o teto do Hobby.', commit: '541b1ed', deployed: true },
  { agent: 'claude-code', phase: 'Fase 11', type: 'done', title: 'Social OAuth consolidado + Instagram OAuth real', description: 'Instagram ganha OAuth real, token longo cifrado e validação de perfil. As 4 rotas físicas do YouTube viram api/integrations/[provider]/[action].mjs, caindo de 12 para 9 functions. Corrigido também o travamento do login operacional antes do OAuth.', commit: 'c6bbb17', deployed: true },
  { agent: 'claude-code', phase: 'Fase 12', type: 'done', title: 'Publicação real de Reels no Instagram', description: 'Fluxo assíncrono de 3 passos da Content Publishing API (container→status→publish), idempotente e resumível via content_calendar.status="agendado". Polling configurável (INSTAGRAM_POLL_INTERVAL_MS/INSTAGRAM_POLL_MAX_TENTATIVAS). 122/122 testes.', commit: '75ffecb', deployed: true },
  { agent: 'claude-code', phase: 'Fase 13', type: 'done', title: 'YouTube e Instagram: botão "Ver conta conectada"', description: 'computeYoutubeStatus/computeInstagramStatus passam a devolver profileUrl (canal real do YouTube via account_id; @username real do Instagram), nunca fabricado — null quando o provedor não garante um identificador seguro. 124/124 testes.', commit: 'c54a230', deployed: true },
  { agent: 'claude-code', phase: 'Fase 11', type: 'todo', title: 'Integração real do X (Twitter): sem OAuth nem conta armazenada', description: 'api/integrations/status.mjs trata X como mode:"manual-free" — não existe command.integracoes_tokens para X, então não há "conta conectada" real para expor ainda. Decisão pendente: OAuth pago do X ou campo manual de handle.', commit: null, deployed: false },
  { agent: 'claude-code', phase: 'Missão 007', type: 'idea', title: 'Expansão multiagente: geração generativa + growth + vendas + operação', description: 'Pedido do Founder: engines generativas (higgsfield, higgsclub, kling, seedance 2.5, google flow, dola.ia) e um organograma amplo cobrindo tendências, criativo, anúncio, vendas, suporte, entrega, financeiro e trading. Escopo inicial proposto: divulgação midiática, crescimento orquestrado por IA, postagem constante + resposta automática, produto digital grátis para engajamento.', commit: null, deployed: false },
]

async function main() {
  const user = env.KAIROS_USER
  const pass = env.KAIROS_PASS
  if (!user || !pass) {
    console.error('KAIROS_USER/KAIROS_PASS não estão no ambiente — exporte as mesmas credenciais do Painel Operacional antes de rodar.')
    exit(1)
  }
  const base = (env.PROJECT_LOG_URL || 'https://kairos-agi-core.vercel.app').replace(/\/+$/, '')
  const auth = `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`

  let ok = 0
  for (const entry of entries) {
    const response = await fetch(`${base}/api/project-log`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: auth },
      body: JSON.stringify(entry),
    })
    if (!response.ok) {
      const body = await response.text().catch(() => '')
      console.error(`Falhou "${entry.title}": ${response.status} ${body.slice(0, 200)}`)
      continue
    }
    ok += 1
    console.log(`Semeado: [${entry.type}] ${entry.phase} — ${entry.title}`)
  }
  console.log(`${ok}/${entries.length} entradas semeadas.`)
  if (ok < entries.length) exit(1)
}

main().catch((e) => {
  console.error(`Falha ao semear o Mapa do Projeto: ${e.message}`)
  exit(1)
})
