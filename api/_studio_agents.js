// Agentes de texto do Estúdio Kairos (Missão 006, Fase 16): estrategista,
// roteirista, diretor e QA — cadeia que transforma um título em roteiro
// cena a cena + prompts visuais, antes de qualquer geração paga de
// imagem/vídeo (essa parte fica no fal.ai, api/_studio.js).
//
// Provider fixo: OpenRouter, NUNCA selectProvider()/auto. Decisão deliberada
// desta fase, diferente do resto do Core (que prioriza Anthropic/OpenAI
// pagos — ver api/_providers/index.js): o modelo padrão do OpenRouter neste
// repo (OPENROUTER_MODEL, ver api/_providers/openrouter.js) já é um modelo
// ":free" de verdade (sem cobrança por uso). Como o backlog desta fase é
// "só a parte que não gasta dinheiro", os quatro agentes de texto rodam
// nesse tier gratuito por padrão — só trocar OPENROUTER_MODEL para um modelo
// pago passaria a gerar custo, e mesmo assim sem o gate de fal.ai/imagem que
// este módulo não tem (texto é considerado custo desprezível/gratuito por
// convenção do próprio backlog, não por ausência de guard).
import * as openrouter from './_providers/openrouter.js'

// Prompts versionados: cada mudança de texto bump a versão, para o
// studio_spend/reels poder registrar "gerado com prompt vX" no futuro sem
// ambiguidade sobre qual instrução produziu qual roteiro.
export const PROMPTS = {
  estrategista: {
    version: 'v1',
    system: [
      'Você é o Estrategista do Estúdio Kairos.',
      'Recebe um título/tema de reel e devolve, em português do Brasil, uma linha editorial curta: ângulo, tom e público-alvo em até 4 linhas.',
      'Nunca invente dado real de cliente, receita ou métrica da empresa. Nunca proponha personagem novo — o personagem já existe e é dado como contexto.',
      'Responda só com a linha editorial, sem comentário nem formatação markdown.',
    ].join('\n'),
  },
  roteirista: {
    version: 'v1',
    system: [
      'Você é o Roteirista do Estúdio Kairos.',
      'Recebe a linha editorial do Estrategista e o número de cenas desejado. Devolve o roteiro completo em português do Brasil, uma cena por linha, no formato exato:',
      'CENA <n>: <fala/ação da cena em até 2 frases>',
      'Nunca inclua nenhum texto fora desse formato (sem título, sem comentário, sem markdown).',
    ].join('\n'),
  },
  diretor: {
    version: 'v1',
    system: [
      'Você é o Diretor de Fotografia do Estúdio Kairos.',
      'Recebe o roteiro cena a cena e a descrição visual do personagem. Devolve, para CADA cena, um prompt de geração de vídeo em inglês, uma linha por cena, no formato exato:',
      'CENA <n>: <prompt visual em inglês, descrevendo enquadramento, ação e cenário — sempre incluindo a aparência do personagem>',
      'Nunca inclua texto fora desse formato.',
    ].join('\n'),
  },
  qa: {
    version: 'v1',
    system: [
      'Você é o QA editorial do Estúdio Kairos.',
      'Recebe o roteiro final e os prompts visuais de um reel. Responda só com uma destas duas primeiras palavras: "APROVADO" ou "REVISAR", seguida de até 3 linhas explicando o motivo em português do Brasil.',
      'Reprove (REVISAR) se: o roteiro promete algo que a empresa não pode cumprir, usa dado real não fornecido no contexto, ou os prompts de cena perderam a consistência visual do personagem entre cenas.',
    ].join('\n'),
  },
}

function agentModel() {
  return process.env.STUDIO_AGENTS_OPENROUTER_MODEL || undefined
}

async function runAgent(agentKey, userContent) {
  const def = PROMPTS[agentKey]
  if (!def) throw new Error(`agente desconhecido: ${agentKey}`)
  if (!openrouter.hasCredentials()) {
    const err = new Error('nenhum provider de texto do Estúdio configurado: defina OPENROUTER_API_KEY na Vercel.')
    err.status = 503
    throw err
  }
  let resultado
  try {
    resultado = await openrouter.chat({
      system: def.system,
      messages: [{ role: 'user', content: userContent }],
      maxTokens: 900,
      ...(agentModel() ? { model: agentModel() } : {}),
    })
  } catch (e) {
    const err = new Error(`openrouter (agente ${agentKey}): ${e.message}`)
    err.status = e.status && e.status >= 400 && e.status < 600 ? e.status : 502
    throw err
  }
  return { text: resultado.text, model: resultado.model, promptVersion: def.version, usage: resultado.usage }
}

export async function runStrategist({ titulo, briefing }) {
  if (typeof titulo !== 'string' || !titulo.trim()) {
    const err = new Error('titulo é obrigatório')
    err.status = 400
    throw err
  }
  const partes = briefing && typeof briefing === 'object'
    ? Object.entries(briefing).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n')
    : ''
  const userContent = [`Título do reel: ${titulo}`, partes && `Briefing:\n${partes}`].filter(Boolean).join('\n\n')
  return runAgent('estrategista', userContent)
}

export async function runScreenwriter({ titulo, estrategia, numScenes = 3 }) {
  if (typeof titulo !== 'string' || !titulo.trim()) {
    const err = new Error('titulo é obrigatório')
    err.status = 400
    throw err
  }
  if (typeof estrategia !== 'string' || !estrategia.trim()) {
    const err = new Error('estrategia é obrigatória (saída do Estrategista)')
    err.status = 400
    throw err
  }
  const userContent = `Título do reel: ${titulo}\nLinha editorial: ${estrategia}\nNúmero de cenas: ${Number(numScenes) || 3}`
  return runAgent('roteirista', userContent)
}

export async function runDirector({ roteiro, promptVisualPersonagem }) {
  if (typeof roteiro !== 'string' || !roteiro.trim()) {
    const err = new Error('roteiro é obrigatório (saída do Roteirista)')
    err.status = 400
    throw err
  }
  const userContent = [
    `Roteiro:\n${roteiro}`,
    promptVisualPersonagem && `Aparência do personagem: ${promptVisualPersonagem}`,
  ].filter(Boolean).join('\n\n')
  return runAgent('diretor', userContent)
}

export async function runQA({ roteiro, promptsVisuais }) {
  if (typeof roteiro !== 'string' || !roteiro.trim()) {
    const err = new Error('roteiro é obrigatório')
    err.status = 400
    throw err
  }
  if (typeof promptsVisuais !== 'string' || !promptsVisuais.trim()) {
    const err = new Error('promptsVisuais é obrigatório (saída do Diretor)')
    err.status = 400
    throw err
  }
  const userContent = `Roteiro:\n${roteiro}\n\nPrompts visuais:\n${promptsVisuais}`
  const resultado = await runAgent('qa', userContent)
  const aprovado = /^APROVADO/i.test(resultado.text.trim())
  return { ...resultado, aprovado }
}
