# Contexto operacional — 11/09/2026

Constituição: KAIROS_AGI_BLUEPRINT_V1.md. Adendos: KAIROS_MEMORY_SYNC_V1.md e KAIROS_MEMORY_SYNC_V1_1.md. AGENTS.md define papéis. Não reiniciar a arquitetura.

## Estado atual
- Missão 003 implementada como arquitetura operacional local: oito módulos Clone, Content Brain, pipeline e aprovação versionada. Nenhum serviço externo conectado.
- Dados demonstrativos removidos da interface. Receita, CRM, Coins e métricas externas indisponíveis até conexão real. Contadores editoriais/Clone vêm de registros do navegador.
- Instagram oficial informado: `_kairosdigital_`. Sem autenticação Meta, sem métricas consultadas.
- Clone: `kairos.clone.v1`; editorial: `kairos.editorial.real.v1`. Acervo demonstrativo antigo preservado na chave anterior, fora da interface.
- KAIROS é robô do Founder; Arthur e memórias de cliente continuam isolados.
- Adendo V1.1 inclui Money Hunter, Score Kairos e Ideas Vault como arquitetura futura. Papéis configurados não significam agentes executando.
- Triagem do GitHub: 49 repositórios acessíveis inventariados; metadados, árvores e documentos técnicos selecionados. Não é auditoria integral nem validação de serviços em produção. Relatório detalhado fica em memory/private/repository-audit/REPOSITORY_COMPOSITION.md, fora do Git público.
- Clone não gera voz, rosto, imagem nem vídeo. VideoProvider preparado e desligado. Client Edition não ativada. Vault vazio.
- Nenhuma despesa contratada; outros repositórios e processos de produção não alterados.
- Missão 004: Video Engine cria motion videos do zero a partir de roteiro e também edita vídeo real local. Storyboard, animação, marca, trilha, corte e download WebM rodam no navegador; arquivos e roteiro não são enviados a servidor.
- Integration Control Plane: página e endpoint server-side verificam configuração de Meta, Google, X e do futuro token store. Nenhuma credencial ou conta está conectada ainda.

## Consolidação Kairos — 14/09/2026
Founder autorizou consolidar kairos-command, kairos-os e kairos-agi-core num único braço operacional ("usar o que já tem, e se não tiver, criar"). Este Core segue como base (decisão registrada em docs/REUSE_PROVENANCE.md e docs/REPOSITORY_REUSE_STRATEGY.md). Arthur é bot de cliente (Allfix), fora de escopo; KAIROS é o agente WhatsApp pessoal do Founder (`62981554992`, pm2 `kairos`, VPS 2.24.199.205).

Missão 006, Fase 1 entregue: Dashboard lê receita do mês, receita total, MRR e clientes ativos/total do Supabase mestre (schema `command`, mesmo banco do kairos-command) via `api/business-metrics.mjs`; frota de agentes WhatsApp e alertas críticos via `api/agent-status.mjs`. Ambas as rotas são server-side, só leitura, atrás de Basic Auth própria deste projeto e desbloqueadas por sessão. Nenhuma migration/RLS de origem alterada.

Missão 006, Fase 2 entregue: chat consultivo com qualquer um dos 27 agentes do organograma (`AgentsPage` → botão "Conversar"), provider de LLM trocável em `api/_providers/` — Anthropic e OpenAI (planos pagos do Founder) primeiro, OpenRouter só reserva de último caso, nunca default. Nenhum agente tem executor conectado; o chat nunca finge ter agido. Mesma Basic Auth do Painel Operacional.

Missão 006, Fase 3 entregue: schema do Content Engine desenhado em `kairos-command/supabase/migrations/0020_content_engine.sql` (`content_jobs`, `content_assets`, `content_calendar`, `avatars`, `prompt_library`) — **pendente de aplicar em produção** pelo Founder via SQL Editor do Supabase. Neste Core, `api/content-jobs.mjs` já lê o pipeline real e permite ao Founder registrar uma ideia nova (fica em etapa=ideia até o motor de geração existir); `ContentEnginePanel` no Dashboard. Sem a migration aplicada, tudo reporta "indisponível"/503 citando o arquivo pendente — nunca fabrica job. Próximas fases planejadas: motor de geração (roteiro/imagem/vídeo/legenda) e OAuth do YouTube.

Missão 006 — Hunter Skill: investigação encerrada em 14/09/2026 sem mudança neste Core. Não havia consolidação pendente: o Hunter da Sofia (painel em `kairos-command` + motor na VPS da Sofia + ponte HTTP já aplicada em produção) já funciona ponta a ponta; `kairos-hunter-skill` é template não usado e `kairos-leadgen` é produto diferente. Ajuste feito ficou só em `kairos-command` (correção de doc/comentário desatualizado, commit `834cc7d`).

Missão 006, Fase 4 entregue: OAuth do YouTube — primeira integração de publicação ativada de verdade (Instagram/TikTok seguem esperando aprovação da Meta). Cofre de tokens cifrados em `kairos-command/supabase/migrations/0021_integracoes_tokens.sql` (`command.integracoes_tokens`, RLS sem nenhuma policy — só `service_role` lê) — **pendente de aplicar em produção**. Neste Core: `api/_crypto.js` (AES-256-GCM para os tokens, HMAC com janela de 10 min para o `state` do OAuth) e `api/_youtube.js` orquestram consentimento → troca de código → confirmação do canal → gravação cifrada; rotas em `api/integrations/youtube/`; botão "Conectar canal" na `IntegrationsPage`. Sem a migration ou sem o cliente OAuth do Google configurado (`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_OAUTH_REDIRECT_URI`), tudo falha fechado com o motivo exato. Ativação real depende do Founder criar o OAuth Client Web no Google Cloud Console — fora do que este agente pode fazer sozinho.

Missão 006, Fase 5 entregue: primeiro estágio do motor de geração do Content Engine — roteiro real a partir de uma ideia (`etapa ideia→roteiro`), um clique do Founder por job, nunca em lote. `api/_content.js#generateScript` valida `jobId`, busca o job real (404 se não existe, 409 se a etapa não é `ideia` — nunca regenera silenciosamente), chama o provider pago via `selectProvider` (mesma prioridade Anthropic → OpenAI → OpenRouter da Fase 2; 503 se nenhum estiver configurado), grava o roteiro em `command.content_assets` e avança `content_jobs.etapa` para `roteiro` via `patchCommand` (novo helper em `api/_command.js`). Rota `api/content-jobs/generate-script.mjs`, atrás da mesma Basic Auth; botão "Gerar roteiro" em `ContentEnginePanel` por job em etapa `ideia`. Sem a migration `0020_content_engine.sql` aplicada ou sem provider de LLM configurado, falha fechado citando o motivo exato — nunca finge ter gerado nada. O gate de etapa `aprovacao` fica mais adiante no pipeline (pré-publicação, documentado assim no comentário da própria tabela `content_jobs`) — mas o gate de *gasto*, `content_jobs.aprovado` (booleano separado, comentário em `content_assets.gratuito`), é anterior e obrigatório: corrigido no mesmo dia após auto-revisão, `generateScript` agora recusa com 402 sem `aprovado:true`, e uma ação explícita separada (`approveContentJob`, botão "Aprovar geração paga") liga esse booleano antes de qualquer chance de "Gerar roteiro" aparecer. 10 testes no total entre as duas entregas (`tests/content-engine.test.mjs`), 60/60 passando no Core inteiro.

Missão 006, Fase 6 entregue: geração real de imagem de capa (`etapa roteiro→imagem`) no Content Engine, via OpenAI (`api/_providers/openai.js#generateImage`) — único provider deste Core com esse recurso, sem fallback. Bucket público `content-assets` no Supabase Storage (migration `kairos-command/supabase/migrations/0022_content_assets_bucket.sql`, **pendente de aplicar**); `api/_storage.js` novo sobe o binário via REST puro. `generateImage()` segue a mesma cascata de falha fechada e reaproveita o gate `content_jobs.aprovado` da correção pós-Fase 5 — a aprovação é por job, não por etapa, então um job já aprovado para o roteiro não precisa reaprovar para a imagem. Botão "Gerar imagem" no `ContentEnginePanel`, jobs em etapa=roteiro. 7 testes novos, total 67/67 passando.

## Próxima missão
Missão 005 (KAIROS WhatsApp) permanece planejada. Exige mapear a instância real e seu acesso antes de conectar o Core, sem interromper o processo atual. Ver docs/modules/VIDEO_ENGINE_V0_4.md.

## Adendo visual
Painel transparente sobre escritório 3D contextual, reaproveitado do kairos-os. EmptyState adaptado do kairos-command. Progresso ligado aos registros locais e às aprovações; sem atividade ou ganhos fictícios. Não representa World 0.2 completo.

## Correção do organograma — Kairos OS
Importados os 15 papéis do cadastro data/agents/agents.json do Kairos OS; CEO mapeado para ORION, WhatsApp para KAIROS, Hunter para Hunter AI, preservando sourceId. Acrescentados 12 papéis/especializações documentados no Blueprint e adendos. Total: 27 configurações, não 27 executores ativos.

A nova página Agentes contém busca, departamento, responsabilidades, indicador-alvo, origem, vínculo hierárquico e acesso ao painel relacionado. Os quatro modelos de reunião são exibidos como propostas de agenda, sem automação. Nenhum saldo, cliente ou token foi importado.

Dashboard e World usam o mesmo cadastro operacional. O Dashboard resume seis agentes e oferece acesso explícito ao organograma completo. O World instancia os 27, exibe balão apenas na seleção/hover para reduzir sobreposição e permite selecionar qualquer agente pelo nome. Fechar o inspetor agora oculta o painel.

O código do motor/importador existente na origem é evidência de implementação, não prova de conexão com este Core. Os executores continuam desconectados. A hierarquia dos 15 papéis originais responde a ORION; vínculos dos especialistas dos adendos são organização adotada neste Core, não importação literal do organograma original.
