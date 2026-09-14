# Fila de missões — Memory Sync V1.1

| Missão | Estado | Escopo |
| --- | --- | --- |
| 001 | Fundação entregue; fontes externas pendentes | Dashboard, World e módulos iniciais; exemplos retirados |
| 002 | Editorial local entregue | Instagram, prompts, aprovação; Graph API desconectada |
| 003 | Implementada | Clone Engine arquitetural, catálogo local e pipeline; sem clonagem ou geração |
| 004 | Implementada e corrigida | Geração motion do zero por roteiro e pós-produção local; render e download WebM |
| 004.1 | Implementada | Control Plane de integrações e plano operacional de sete dias; credenciais ainda pendentes |
| 005 | Planejada | KAIROS WhatsApp; preservar operação existente e validar conexão separada |
| 006 | Fase 1 entregue (14/09/2026) | Supabase Core; leitura real de `command.receitas`/`command.clientes`/`command.agents` (mestre kairos-command) via Vercel Functions server-side, gated por Basic Auth própria; RLS e schemas de origem não foram alterados |
| 007 | Planejada | Billing Center; sem cobrança ou upgrade automático autorizado |
| 008 | Planejada | Money Hunter Intelligence Center e Ideas Vault |
| 009 | Planejada | Founder Mobile App |
| 010 | Planejada | World 0.2, incluindo Money Hunter |

A numeração 003–008 anterior foi substituída por esta fila em 11/09/2026. Missão 004 foi autorizada posteriormente. Nenhuma publicação ou integração externa foi ativada.

Correção autorizada após Missão 003: organograma completo importado e exposto no painel/World. A Missão 004 foi ampliada após validação do Founder: criação do zero é o fluxo principal; edição virou pós-produção. Nenhum serviço externo foi ativado.

Missão 006 — Fase 1 (14/09/2026): consolidação autorizada pelo Founder ("usar o que já tem, e se não tiver, criar") para reunir kairos-command, kairos-os e kairos-agi-core em um único braço operacional. Esta fase liga o Dashboard a dado real já existente no Supabase mestre (schema `command`, dono: kairos-command) sem duplicar base nem tocar RLS/migrations de origem: `api/business-metrics.mjs` (receita do mês, receita total, MRR, clientes ativos/total) e `api/agent-status.mjs` (frota `command.agents` + últimos alertas críticos de `command.events`) leem via PostgREST server-side com `SUPABASE_SERVICE_ROLE_KEY`, atrás de Basic Auth própria (`KAIROS_USER`/`KAIROS_PASS` deste projeto, distinta da do kairos-os). Nunca chama pm2; apenas lê o snapshot que o sidecar do kairos-command já escreve. Pendente: provisionar as env vars de produção na Vercel e integrar o chat de agentes (OpenRouter/kairos-os) nas próximas fases.
