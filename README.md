# Kairos AGI Core

Ambiente oficial de desenvolvimento da **Kairos Digital**, destinado à construção de uma empresa operada por agentes de IA com supervisão humana.

## Estado inicial

Este repositório contém a fundação documental e a organização do monorepo. Não há agentes executando, aplicação publicada ou integrações autenticadas por estes arquivos.

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

Não colocar segredos em Git. Exportações brutas e dados privados ficam locais até revisão e autorização de destino. Integrações e planos pagos exigem a configuração correspondente; nomes registrados não significam serviços ativos.
