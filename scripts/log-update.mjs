#!/usr/bin/env node
// Grava uma entrada no Mapa do Projeto (command.project_log) a partir da
// linha de comando — o jeito padrão que AGENTS.md pede pra qualquer agente
// (Claude Code, Codex) registrar o que fez ao fim de uma sessão.
//
// Uso:
//   node scripts/log-update.mjs --agent="claude-code" --phase="Fase 14" \
//     --type="done" --title="..." --description="..." --commit="abc1234" --deployed
//
// Credenciais: usa as MESMAS KAIROS_USER/KAIROS_PASS já configuradas na
// Vercel para o Painel Operacional (api/_auth.js) — nenhum segredo novo.
// Exporte as duas no shell antes de rodar. Alvo por padrão é a produção
// (https://kairos-agi-core.vercel.app); sobrescreva com PROJECT_LOG_URL
// para apontar num ambiente local (ex.: http://localhost:5173).
import { argv, env, exit } from 'node:process'

function parseArgs(args) {
  const out = { deployed: false }
  for (const arg of args) {
    if (arg === '--deployed') { out.deployed = true; continue }
    const match = /^--([a-z]+)=(.*)$/s.exec(arg)
    if (!match) continue
    out[match[1]] = match[2]
  }
  return out
}

async function main() {
  const args = parseArgs(argv.slice(2))
  const required = ['agent', 'type', 'title']
  const missing = required.filter((key) => !args[key])
  if (missing.length) {
    console.error(`Faltam argumentos obrigatórios: ${missing.map((k) => `--${k}`).join(', ')}`)
    exit(1)
  }
  const user = env.KAIROS_USER
  const pass = env.KAIROS_PASS
  if (!user || !pass) {
    console.error('KAIROS_USER/KAIROS_PASS não estão no ambiente — exporte as mesmas credenciais do Painel Operacional antes de rodar.')
    exit(1)
  }
  const base = (env.PROJECT_LOG_URL || 'https://kairos-agi-core.vercel.app').replace(/\/+$/, '')
  const auth = `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`

  const response = await fetch(`${base}/api/project-log`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: auth },
    body: JSON.stringify({
      agent: args.agent,
      phase: args.phase || null,
      type: args.type,
      title: args.title,
      description: args.description || null,
      commit: args.commit || null,
      deployed: args.deployed,
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    console.error(`${base}/api/project-log respondeu ${response.status}: ${body.slice(0, 300)}`)
    exit(1)
  }
  const { entry } = await response.json()
  console.log(`Registrado no Mapa do Projeto: [${entry.type}] ${entry.title} (id ${entry.id})`)
}

main().catch((e) => {
  console.error(`Falha ao registrar entrada: ${e.message}`)
  exit(1)
})
