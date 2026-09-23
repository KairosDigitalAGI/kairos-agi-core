# MORNING.md — Relatório do trabalho noturno autônomo (23/09/2026)

Branch: `night/2026-09-23` (a partir de `main`, commit `c54a230`). Nenhum merge em `main`, nenhum deploy em produção, nenhuma chamada paga real — só push de branch (Vercel preview liberado) e mocks. Todos os 5 commits abaixo já estão em `origin/night/2026-09-23`.

## Resumo em 5 linhas
1. Rotas Vercel consolidadas de 10 para 3 arquivos dinâmicos (item 2 do backlog), sem mudar nenhuma URL/método/resposta pública — 9 slots livres no plano Hobby.
2. Estúdio Kairos (item 3) entregue na parte sem gasto real: schema, guarda de orçamento agregado, cliente fal.ai e 4 agentes de texto (tudo testado só com mock), UI de personagens/reels no Dashboard.
3. Itens 4, 5 e 6 do backlog (Instagram DM/comentários, X display-only, dívida técnica geral) **não foram iniciados** — sem tempo/contexto restante nesta sessão; ficam para a próxima.
4. 191/191 testes passando, typecheck limpo, build limpo — confirmado nesta sessão antes de fechar o relatório.
5. Duas migrations novas esperando aplicação manual do Founder (0025, e a 0023 da sessão anterior que já estava pendente); nenhuma foi aplicada — não há acesso de escrita ao Supabase de produção neste ambiente.

## Status por item do backlog

| Item | Status | Commits | Testes |
| --- | --- | --- | --- |
| 1. Mapa do Projeto (verificação) | done — já existia, íntegro, nada a implementar | (nenhum, só verificação) | 8 pré-existentes (`tests/project-log.test.mjs`) |
| 2. Consolidação de Vercel Functions | done | `08bcdf7`, `20c7865` | 19 novos (roteador) |
| 3. Estúdio Kairos (parte sem gasto) | partial — backend+UI base prontos, editor de cenas e UI dos agentes de texto faltando | `c9c3164`, `016e867`, `e5f803a` | 46 novos (`tests/studio.test.mjs`, `tests/studio-agents.test.mjs`, 8 no roteador) |
| 4. Instagram DM + comentários (webhook) | blocked — não iniciado | — | — |
| 5. X (Twitter) display/link-only | blocked — não iniciado | — | — |
| 6. Dívida técnica geral | blocked — não iniciado além do que os itens 2/3 já cobriram de cobertura de teste | — | — |
| Documentação (CHANGELOG/MISSION_QUEUE/MASTER_CONTEXT/BLUEPRINT_EVOLUTION) | done | `466ee26` | — |

Total da suíte ao final da sessão: **191/191 passando**, `npm run typecheck` e `npm run build` limpos (build gera aviso de chunk >500kB em `OfficeGeometry`, pré-existente, não é regressão desta noite).

## Bloqueios que precisam do Founder

1. **Migration 0023 (`command.project_log`)** — segue pendente de aplicar em produção desde a Fase 14 (sessão anterior a esta noite). Sem ela, o Mapa do Projeto real (leitura/escrita) não funciona em produção; a entrada de log desta sessão (ver seção "Mapa do Projeto" abaixo) não pôde ser gravada por esse motivo.
2. **Migration 0025 (`command.characters`/`reels`/`scenes`/`studio_spend` + bucket `"studio"`)** — redigida em `kairos-agi-core/supabase/migrations/0025_estudio_kairos.sql`, **não** em `kairos-command` como é a convenção de todas as migrations anteriores do schema `command`. Desvio deliberado: a árvore de trabalho de `kairos-command` tinha mudanças não commitadas de outra sessão em paralelo nesta mesma noite, e mexer nela era mais arriscado que o desvio de convenção. Documentado no cabeçalho do arquivo SQL e em `docs/BLUEPRINT_EVOLUTION.md`. **Ação sugerida**: o Founder copia o conteúdo para `kairos-command/supabase/migrations/` (renumerando se já existir uma 0025 lá) e aplica no SQL Editor do Supabase, mesmo fluxo de sempre.
3. **Env vars de produção pendentes** para o Estúdio Kairos funcionar de verdade (fora do preview, sem mock): `STUDIO_BUDGET_USD` (teto de gasto agregado — sem ela, toda chamada paga do Estúdio falha fechado com 503 by design), `FAL_KEY` (já deve existir desde a Fase 7, reaproveitada aqui), `OPENROUTER_API_KEY` (idem, reaproveitada). Nenhuma foi lida, impressa ou alterada nesta sessão.
4. **Decisão do Founder**: revisar e aprovar (ou pedir ajuste) no preview antes de decidir merge em `main` — ver passo a passo abaixo.

## Riscos e dívida técnica registrados

- **Estúdio Kairos incompleto**: falta UI para editor/lista de cenas (`command.scenes`) e para os 4 agentes de texto (estrategista/roteirista/diretor/QA) — o backend e os testes existem (`api/_studio.js`, `api/_studio_agents.js`), só não há botão no Dashboard ainda. Geração de vídeo por cena (a etapa mais cara do pipeline, provavelmente Kling via fal.ai) também não foi implementada.
- **Guarda de orçamento é nova e só testada com mock**: `assertBudgetAvailable()` nunca rodou contra o Supabase real nem contra o fal.ai real. Antes de liberar geração real de imagem/vídeo no Estúdio, vale um teste manual único e controlado (ex.: `STUDIO_BUDGET_USD=1` e confirmar que a segunda chamada realmente nega com 402).
- **Migration 0025 fora do lugar de costume** (ver bloqueio 2 acima) — risco de ser esquecida se o Founder só olhar `kairos-command/supabase/migrations/` por hábito.
- **Itens 4-6 do backlog inteiros pendentes** — nenhum código escrito para webhook do Instagram, modo X, ou limpeza geral de dívida técnica além do que os itens 2/3 trouxeram de brinde.
- Nada de dívida técnica nova foi encontrada nas partes já existentes do Core durante esta sessão (não houve varredura geral, só o trabalho dos itens 2 e 3).

## Mapa do Projeto (`command.project_log`)

Tentativa de registrar via `node scripts/log-update.mjs` **não executada** nesta sessão: como a migration 0023 segue pendente em produção (bloqueio 1 acima), a chamada falharia fechado (503) contra o Supabase real — não há valor em rodá-la sem a tabela existir, e este próprio MORNING.md cumpre o papel de registro da sessão. Quando o Founder aplicar a 0023, o comando equivalente para preencher o histórico desta noite seria:

```
node scripts/log-update.mjs --agent="claude-code" --phase="Fase 15" --type="done" --title="Consolidação de rotas Vercel (10→3)" --description="Ver docs/context/CHANGELOG.md, Missão 006 Fase 15" --commit="20c7865" --deployed
node scripts/log-update.mjs --agent="claude-code" --phase="Fase 16" --type="done" --title="Estúdio Kairos: backend+UI sem gasto real" --description="Ver docs/context/CHANGELOG.md, Missão 006 Fase 16" --commit="e5f803a"
node scripts/log-update.mjs --agent="claude-code" --phase="Fase 16" --type="todo" --title="Estúdio Kairos: editor de cenas e UI dos agentes de texto" --description="Backend e testes prontos (api/_studio.js, api/_studio_agents.js); falta UI"
node scripts/log-update.mjs --agent="claude-code" --phase="Backlog noturno" --type="todo" --title="Itens 4-6 do backlog noturno não iniciados" --description="Instagram DM/comentários, X display-only, dívida técnica geral"
```

(Sem `--deployed` nos itens 3/4 porque nada foi publicado em produção.)

## Passo a passo para o Founder revisar e mesclar pela manhã

1. `git fetch && git log origin/night/2026-09-23 ^main --oneline` para ver os 5 commits desta noite.
2. Abrir o preview do Vercel gerado automaticamente pelo push da branch (procurar no dashboard da Vercel pelo deploy de `night/2026-09-23`) e conferir visualmente o novo painel "Estúdio Kairos" no Dashboard — sem `STUDIO_BUDGET_USD` configurada no preview, os botões de geração vão falhar com 503 (comportamento esperado, não bug).
3. Copiar `supabase/migrations/0025_estudio_kairos.sql` para `kairos-command/supabase/migrations/` (bloqueio 2) e aplicar junto com a 0023 pendente (bloqueio 1) no SQL Editor do Supabase.
4. Definir `STUDIO_BUDGET_USD` em produção (ex.: `1.00` para um teste inicial controlado) — `FAL_KEY`/`OPENROUTER_API_KEY` já devem existir desde fases anteriores.
5. Rodar `npm test && npm run typecheck && npm run build` localmente ou confiar no preview, se ainda não tiver confiado.
6. Se aprovado: `git checkout main && git merge night/2026-09-23` (ou abrir PR, se preferir revisão por diff) e fazer o deploy de produção manualmente — nada disso foi feito automaticamente, por proibição explícita desta sessão.
7. Depois do merge, considerar retomar os itens 4-6 do backlog (Instagram DM/comentários, X, dívida técnica) e o restante do Estúdio Kairos (editor de cenas, UI dos agentes, geração de vídeo por cena) em uma próxima sessão.
