# Mapa do Projeto

## Estado

Página persistente no dashboard (`roadmap` no sidebar) que registra tudo que já foi feito, o que falta e novas ideias sobre o próprio desenvolvimento do kairos-agi-core. Qualquer agente (Claude Code, Codex) ou o Founder grava uma entrada ao fim de cada sessão de trabalho — regra em `AGENTS.md`, seção "Regra obrigatória — atualização do Mapa". Append-only por convenção: nenhuma entrada é editada ou apagada por este projeto, histórico completo sempre.

## Schema

`command.project_log` (migration `supabase/migrations/0023_project_log.sql`, repo kairos-command — aplicada e validada no Supabase mestre em 01/10/2026):

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

RLS habilitado, sem policy de insert/update/delete. O `service_role` possui apenas `usage` no schema, `select`/`insert` na tabela e acesso à sequência legada quando ela existe; toda escrita continua atrás do Basic Auth do próprio Core.

## Contrato

- `GET /api/project-log`: lista todas as entradas, mais recentes primeiro. **Sem Basic Auth de propósito** — o Mapa é feito pra ser visível sem desbloquear o Painel Operacional, e nunca carrega segredo.
- `POST /api/project-log`: registra uma entrada nova. Exige a mesma Basic Auth do Painel Operacional (`KAIROS_USER`/`KAIROS_PASS`).

Lógica em `api/_project-log.js`; rota em `api/project-log.mjs` (arquivo próprio — havia margem no teto de 12 Serverless Functions do plano Hobby, 10/12 depois desta fase).

## Interface

`ProjectMapPage` (`src/features/projectmap/`): contador de progresso, filtros por tipo, grid de cards com fase/agente/commit/timestamp, e um formulário "Adicionar entrada" visível só quando o Painel Operacional está desbloqueado.

O histórico continua append-only. Uma entrada `done` mais recente resolve uma entrada `todo` ou `bug` anterior quando os títulos normalizados são iguais. O registro antigo permanece visível em **Todos** com o selo **Resolvido**, mas deixa o contador e o filtro de itens abertos. Uma nova entrada `todo` ou `bug` posterior com o mesmo título reabre o trabalho. Essa projeção é calculada em `projectMapState.ts`; nenhum registro do Supabase é atualizado ou apagado.

## Uso por agentes

```
node scripts/log-update.mjs --agent="claude-code" --phase="Fase 14" --type="done" --title="..." --description="..." --commit="abc1234" --deployed
```

`scripts/seed-project-log.mjs` pode semear o histórico real das Fases 1-13 (extraído de `docs/context/CHANGELOG.md` e do git log). A API foi validada com leitura e inserção reais em 01/10/2026; falhas futuras continuam sendo reportadas sem presumir sucesso.
