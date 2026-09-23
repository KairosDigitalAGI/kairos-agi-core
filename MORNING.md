# MORNING.md — Relatório do trabalho noturno autônomo (23/09/2026)

Branch: `night/2026-09-23` (a partir de `main`, commit `c54a230`). Nenhum merge em `main`, nenhum deploy em produção, nenhuma chamada paga real, nenhum envio/publicação real — só push de branch (Vercel preview liberado) e mocks. Todos os 6 commits abaixo já estão em `origin/night/2026-09-23`.

## Resumo em 5 linhas
1. Rotas Vercel consolidadas de 10 para 3 arquivos dinâmicos (item 2 do backlog), sem mudar nenhuma URL/método/resposta pública — 9 slots livres no plano Hobby.
2. Estúdio Kairos (item 3) entregue na parte sem gasto real: schema, guarda de orçamento agregado, cliente fal.ai e 4 agentes de texto (tudo testado só com mock), UI de personagens/reels no Dashboard.
3. Webhook de DM/comentários do Instagram (item 4) entregue: recepção com verificação de assinatura real, log Supabase, rascunho de resposta por IA OFF por padrão com toggle na UI — nunca envia nada de verdade.
4. X/Twitter display-only (item 5) entregue: engine órfão da Missão 004 (`distributionPackage.ts`) reaproveitado para vídeo remoto, botão "Preparar post no X" no Content Engine abre `x.com/intent/post` pronto — nunca chama a API do X. Item 6 (dívida técnica geral) segue para a próxima etapa desta mesma sessão.
5. 216/216 testes passando, typecheck limpo, build limpo — confirmado nesta sessão antes de fechar o relatório.
6. Três migrations novas esperando aplicação manual do Founder (0025, 0026, e a 0023 da sessão anterior que já estava pendente); nenhuma foi aplicada — não há acesso de escrita ao Supabase de produção neste ambiente.

## Status por item do backlog

| Item | Status | Commits | Testes |
| --- | --- | --- | --- |
| 1. Mapa do Projeto (verificação) | done — já existia, íntegro, nada a implementar | (nenhum, só verificação) | 8 pré-existentes (`tests/project-log.test.mjs`) |
| 2. Consolidação de Vercel Functions | done | `08bcdf7`, `20c7865` | 19 novos (roteador) |
| 3. Estúdio Kairos (parte sem gasto) | partial — backend+UI base prontos, editor de cenas e UI dos agentes de texto faltando | `c9c3164`, `016e867`, `e5f803a` | 46 novos (`tests/studio.test.mjs`, `tests/studio-agents.test.mjs`, 8 no roteador) |
| 4. Instagram DM + comentários (webhook) | done — recepção, verificação de assinatura, log, toggle e rascunho por IA prontos; envio real de resposta é fluxo futuro (fora do escopo proibido de hoje) | `b324355` | 22 novos (`tests/instagram-webhook.test.mjs`) |
| 5. X (Twitter) display/link-only | done — reaproveita `distributionPackage.ts` (Missão 004, antes órfão sem UI); botão no Content Engine abre `x.com/intent/post`, nunca chama a API | `009c25e` | 5 novos (`tests/video.test.mjs`, `tests/content-engine.test.mjs`) |
| 6. Dívida técnica geral | in progress — próxima etapa desta sessão | — | — |
| Documentação (CHANGELOG/MISSION_QUEUE/MASTER_CONTEXT/BLUEPRINT_EVOLUTION) | done | `466ee26` (Fase 16), `900f074` (Fase 17), este commit de docs (Fase 18) | — |

Total da suíte ao final da sessão: **216/216 passando**, `npm run typecheck` e `npm run build` limpos (build gera aviso de chunk >500kB em `OfficeGeometry`, pré-existente, não é regressão desta noite).

## Bloqueios que precisam do Founder

1. **Migration 0023 (`command.project_log`)** — segue pendente de aplicar em produção desde a Fase 14 (sessão anterior a esta noite). Sem ela, o Mapa do Projeto real (leitura/escrita) não funciona em produção; a entrada de log desta sessão (ver seção "Mapa do Projeto" abaixo) não pôde ser gravada por esse motivo.
2. **Migration 0025 (`command.characters`/`reels`/`scenes`/`studio_spend` + bucket `"studio"`)** — redigida em `kairos-agi-core/supabase/migrations/0025_estudio_kairos.sql`, **não** em `kairos-command` como é a convenção de todas as migrations anteriores do schema `command`. Desvio deliberado: a árvore de trabalho de `kairos-command` tinha mudanças não commitadas de outra sessão em paralelo nesta mesma noite, e mexer nela era mais arriscado que o desvio de convenção. Documentado no cabeçalho do arquivo SQL e em `docs/BLUEPRINT_EVOLUTION.md`. **Ação sugerida**: o Founder copia o conteúdo para `kairos-command/supabase/migrations/` (renumerando se já existir uma 0025 lá) e aplica no SQL Editor do Supabase, mesmo fluxo de sempre.
3. **Env vars de produção pendentes** para o Estúdio Kairos funcionar de verdade (fora do preview, sem mock): `STUDIO_BUDGET_USD` (teto de gasto agregado — sem ela, toda chamada paga do Estúdio falha fechado com 503 by design), `FAL_KEY` (já deve existir desde a Fase 7, reaproveitada aqui), `OPENROUTER_API_KEY` (idem, reaproveitada). Nenhuma foi lida, impressa ou alterada nesta sessão.
4. **Migration 0026 (`command.integration_settings`/`instagram_webhook_events`)** — mesmo desvio de local e mesmo motivo da migration 0025 (ver item 2 acima), redigida em `kairos-agi-core/supabase/migrations/0026_instagram_webhook.sql`. **Ação sugerida**: mesma da 0025 — copiar para `kairos-command/supabase/migrations/` e aplicar.
5. **Env vars novas para o webhook do Instagram funcionar de verdade**: `META_APP_SECRET` (segredo do app Meta, usado só para verificar `X-Hub-Signature-256` — nunca lido/impresso nesta sessão) e `META_WEBHOOK_VERIFY_TOKEN` (valor arbitrário escolhido pelo Founder, cadastrado igual nos dois lados: env var da Vercel e campo "Verify Token" do app Meta). Sem essas duas, o webhook responde 503 (fail-closed), nunca finge estar funcionando.
6. **Cadastro no app da Meta**: o Founder precisa registrar a URL `https://<domínio-de-produção>/api/integrations/instagram-webhook` como Callback URL do webhook (produto Webhooks, campos `messages` e `comments`) no painel de desenvolvedores da Meta — isso não pode ser feito por este ambiente (fora do escopo de credenciais desta sessão).
7. **Decisão do Founder**: revisar e aprovar (ou pedir ajuste) no preview antes de decidir merge em `main` — ver passo a passo abaixo.

## Riscos e dívida técnica registrados

- **Estúdio Kairos incompleto**: falta UI para editor/lista de cenas (`command.scenes`) e para os 4 agentes de texto (estrategista/roteirista/diretor/QA) — o backend e os testes existem (`api/_studio.js`, `api/_studio_agents.js`), só não há botão no Dashboard ainda. Geração de vídeo por cena (a etapa mais cara do pipeline, provavelmente Kling via fal.ai) também não foi implementada.
- **Guarda de orçamento é nova e só testada com mock**: `assertBudgetAvailable()` nunca rodou contra o Supabase real nem contra o fal.ai real. Antes de liberar geração real de imagem/vídeo no Estúdio, vale um teste manual único e controlado (ex.: `STUDIO_BUDGET_USD=1` e confirmar que a segunda chamada realmente nega com 402).
- **Migrations 0025 e 0026 fora do lugar de costume** (ver bloqueios 2 e 4 acima) — risco de serem esquecidas se o Founder só olhar `kairos-command/supabase/migrations/` por hábito.
- **Webhook do Instagram nunca envia resposta de verdade** — só rascunha e loga. Implementar o envio real (`POST /me/messages` para DM, reply de comentário) fica para uma sessão futura explicitamente autorizada, por estar fora do escopo proibido de hoje ("nunca publicar/comentar/enviar DM real").
- **`api/integrations/instagram-webhook.mjs` é a primeira rota do Core no formato Web Standard `fetch(request)`** em vez do handler Node `(req,res)` do resto do projeto — motivo técnico documentado no cabeçalho do arquivo e em `docs/BLUEPRINT_EVOLUTION.md` (corpo bruto exigido pela verificação de assinatura da Meta). Consumiu 1 dos 9 slots liberados na Fase 15 (4/12 usados agora, 8 livres).
- **Item 6 do backlog pendente** — limpeza geral de dívida técnica além do que os itens 2/3/4/5 trouxeram de brinde é a próxima etapa desta mesma sessão.
- **`distributionPackage.ts` (Missão 004) ainda tem código morto residual**: as funções originais baseadas em `StoredVideo`/Blob local (`distributionManifest`, etc.) não foram removidas ao estender o módulo para vídeo remoto — deixadas de propósito, sem decidir unilateralmente se ainda servem para o fluxo antigo de vídeo local. Ver `docs/BLUEPRINT_EVOLUTION.md`, Fase 18.
- Nada de dívida técnica nova foi encontrada nas partes já existentes do Core durante esta sessão (não houve varredura geral, só o trabalho dos itens 2, 3, 4 e 5).

## Mapa do Projeto (`command.project_log`)

Tentativa de registrar via `node scripts/log-update.mjs` **não executada** nesta sessão: como a migration 0023 segue pendente em produção (bloqueio 1 acima), a chamada falharia fechado (503) contra o Supabase real — não há valor em rodá-la sem a tabela existir, e este próprio MORNING.md cumpre o papel de registro da sessão. Quando o Founder aplicar a 0023, o comando equivalente para preencher o histórico desta noite seria:

```
node scripts/log-update.mjs --agent="claude-code" --phase="Fase 15" --type="done" --title="Consolidação de rotas Vercel (10→3)" --description="Ver docs/context/CHANGELOG.md, Missão 006 Fase 15" --commit="20c7865" --deployed
node scripts/log-update.mjs --agent="claude-code" --phase="Fase 16" --type="done" --title="Estúdio Kairos: backend+UI sem gasto real" --description="Ver docs/context/CHANGELOG.md, Missão 006 Fase 16" --commit="e5f803a"
node scripts/log-update.mjs --agent="claude-code" --phase="Fase 16" --type="todo" --title="Estúdio Kairos: editor de cenas e UI dos agentes de texto" --description="Backend e testes prontos (api/_studio.js, api/_studio_agents.js); falta UI"
node scripts/log-update.mjs --agent="claude-code" --phase="Fase 17" --type="done" --title="Webhook de DM/comentários do Instagram + rascunho de resposta por IA" --description="Ver docs/context/CHANGELOG.md, Missão 006 Fase 17" --commit="b324355"
node scripts/log-update.mjs --agent="claude-code" --phase="Fase 17" --type="todo" --title="Envio real de resposta no Instagram (DM/comentário)" --description="Hoje só rascunha e loga; enviar de fato exige fluxo novo, fora do escopo proibido desta noite"
node scripts/log-update.mjs --agent="claude-code" --phase="Fase 18" --type="done" --title="X/Twitter display-link no Content Engine" --description="Ver docs/context/CHANGELOG.md, Missão 006 Fase 18" --commit="009c25e"
node scripts/log-update.mjs --agent="claude-code" --phase="Fase 18" --type="todo" --title="Limpar código morto residual de distributionPackage.ts (fluxo StoredVideo local, Missão 004)" --description="Não removido nesta sessão por não decidir unilateralmente se o fluxo antigo ainda é usado"
node scripts/log-update.mjs --agent="claude-code" --phase="Backlog noturno" --type="todo" --title="Item 6 do backlog noturno em andamento" --description="Dívida técnica geral, próxima etapa desta mesma sessão"
```

(Sem `--deployed` nos itens 3/4 porque nada foi publicado em produção.)

## Passo a passo para o Founder revisar e mesclar pela manhã

1. `git fetch && git log origin/night/2026-09-23 ^main --oneline` para ver os 6 commits desta noite.
2. Abrir o preview do Vercel gerado automaticamente pelo push da branch (procurar no dashboard da Vercel pelo deploy de `night/2026-09-23`) e conferir visualmente o novo painel "Estúdio Kairos" no Dashboard, o novo checkbox de rascunho por IA no card do Instagram em Integrações, e o botão "Preparar post no X" em cada job do Content Engine (só aparece quando o job já tem vídeo publicado) — sem `STUDIO_BUDGET_USD`/`META_APP_SECRET`/`META_WEBHOOK_VERIFY_TOKEN` configuradas no preview, os botões/toggle vão reportar indisponível ou falhar com 503 (comportamento esperado, não bug); o botão do X não depende de nenhuma env var nova, é só composição de link.
3. Copiar `supabase/migrations/0025_estudio_kairos.sql` e `supabase/migrations/0026_instagram_webhook.sql` para `kairos-command/supabase/migrations/` (bloqueios 2 e 4) e aplicar junto com a 0023 pendente (bloqueio 1) no SQL Editor do Supabase.
4. Definir `STUDIO_BUDGET_USD` em produção (ex.: `1.00` para um teste inicial controlado) — `FAL_KEY`/`OPENROUTER_API_KEY` já devem existir desde fases anteriores.
5. Definir `META_APP_SECRET` e `META_WEBHOOK_VERIFY_TOKEN` em produção e cadastrar a Callback URL do webhook (`https://<domínio-de-produção>/api/integrations/instagram-webhook`, campos `messages`+`comments`) no app da Meta (bloqueios 5 e 6).
6. Rodar `npm test && npm run typecheck && npm run build` localmente ou confiar no preview, se ainda não tiver confiado.
7. Se aprovado: `git checkout main && git merge night/2026-09-23` (ou abrir PR, se preferir revisão por diff) e fazer o deploy de produção manualmente — nada disso foi feito automaticamente, por proibição explícita desta sessão.
8. Depois do merge, considerar retomar os itens 5-6 do backlog (X display-only, dívida técnica), o restante do Estúdio Kairos (editor de cenas, UI dos agentes, geração de vídeo por cena) e um fluxo real de envio de resposta no Instagram (autorização explícita necessária) em uma próxima sessão.
