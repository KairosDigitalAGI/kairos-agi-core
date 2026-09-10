# Kairos AGI Core

Ambiente oficial de desenvolvimento da **Kairos Digital**, destinado à construção de uma empresa operada por agentes de IA com supervisão humana.

## Estado atual

A fundação documental e a organização do monorepo estão publicadas. A página inicial está em produção na Vercel Hobby, com deploy automático a partir da branch `main` do GitHub. O backend dedicado ainda aguarda uma vaga no plano Free do Supabase.

- GitHub: <https://github.com/KairosDigitalAGI/kairos-agi-core>
- Produção: <https://kairos-agi-core.vercel.app/>
- Vercel: <https://vercel.com/kairos-digital-s-projects/kairos-agi-core>

## Organização

```text
apps/             Aplicações: Dashboard Kairos OS e serviços futuros
packages/         Bibliotecas, contratos e conectores compartilhados
memory/           Conhecimento curado e decisões aprovadas
docs/             Backlog, operação e documentação de configuração
scripts/          Utilitários de desenvolvimento
MEMORY_IMPORT/    Recepção local de exportações futuras (não versionadas)
```

Leia [MASTER_CONTEXT.md](MASTER_CONTEXT.md), [ARCHITECTURE.md](ARCHITECTURE.md), [ROADMAP.md](ROADMAP.md) e [backlog](docs/DASHBOARD_BACKLOG.md).

## Stack oficial

GPT-6 Astra, Codex, GitHub, Vercel, Supabase, OpenRouter, Gemini Flash, Hostinger VPS, n8n, Google Flow, ElevenLabs e Obsidian.

## Desenvolvimento

Branch principal: `main`. Mudanças futuras em branches `codex/`. Nenhum gerenciador de pacotes ou framework foi instalado ainda. A arquitetura abaixo é proposta inicial, sujeita às decisões registradas em `memory/decisions/`.

Não colocar segredos em Git. Exportações brutas e dados privados ficam locais até revisão e autorização de destino. Manter os serviços em planos gratuitos. Qualquer recurso pago exige autorização explícita. Os nomes da stack que não têm status acima são componentes planejados.
