# Mapa do Projeto

## Estado

Página persistente no dashboard (`roadmap` no sidebar) que registra tudo que já foi feito, o que falta e novas ideias sobre o próprio desenvolvimento do kairos-agi-core. Qualquer agente (Claude Code, Codex) ou o Founder grava uma entrada ao fim de cada sessão de trabalho — regra em `AGENTS.md`, seção "Regra obrigatória — atualização do Mapa". Append-only por convenção: nenhuma entrada é editada ou apagada por este projeto, histórico completo sempre.

## Schema

`command.project_log` (migration `supabase/migrations/0023_project_log.sql`, repo kairos-command — **pendente de aplicar em produção**, mesma pendência de toda migration nova deste Core até o Founder colar no SQL Editor do Supabase):

| coluna | tipo | notas |
| --- | --- | --- |
| `id` | uuid | gerado |
| `created_at` | timestamptz | gerado |
| `agent` | text | `claude-code` \| `codex` \| `founder` |
| `phase` | text | rótulo livre (ex.: "Fase 13", "Missão 007"), texto, não FK |
| `type` | text | `done` \| `todo` \| `idea` \| `bug` |
| `title` | text | obrigatório |
| `description` | text | opcional |
| `commit` | text | hash curto, quando existir |
| `deployed` | boolean | default `false` |

RLS habilitado, sem policy de insert/update/delete (só `service_role` escreve, sempre atrás do Basic Auth do próprio Core).

## Contrato

- `GET /api/project-log`: lista todas as entradas, mais recentes primeiro. **Sem Basic Auth de propósito** — o Mapa é feito pra ser visível sem desbloquear o Painel Operacional, e nunca carrega segredo.
- `POST /api/project-log`: registra uma entrada nova. Exige a mesma Basic Auth do Painel Operacional (`KAIROS_USER`/`KAIROS_PASS`).

Lógica em `api/_project-log.js`; rota `route="project-log"` dentro de `api/[route].mjs` desde a consolidação geral da Fase 15 (era arquivo próprio, `api/project-log.mjs`, quando esta página foi entregue na Fase 14 — 10/12 Serverless Functions naquele momento; ver `docs/context/CHANGELOG.md`).

## Interface

`ProjectMapPage` (`src/features/projectmap/`): contador de progresso (% de entradas `done`), filtros por tipo, grid de cards com fase/agente/commit/timestamp, e um formulário "Adicionar entrada" visível só quando o Painel Operacional está desbloqueado.

## Uso por agentes

```
node scripts/log-update.mjs --agent="claude-code" --phase="Fase 14" --type="done" --title="..." --description="..." --commit="abc1234" --deployed
```

`scripts/seed-project-log.mjs` semeia o histórico real das Fases 1-13 (extraído de `docs/context/CHANGELOG.md` e do git log) assim que a migration 0023 estiver aplicada — antes disso, a API responde `source:"unavailable"` e o script reporta a falha real, sem fingir sucesso.
