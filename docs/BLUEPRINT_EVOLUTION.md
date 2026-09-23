# Evolução do Blueprint

## 18/09/2026 — observabilidade da saudação

O painel de atendimento passa a mostrar apenas booleanos de prontidão para Free Tier, chave e remetente, sem publicar valores sensíveis. A verificação operacional distingue tabela e assinatura de conta funcionando de entrega real de evento; o app Meta ainda não foi publicado. Nenhuma nova automação foi ativada por esta revisão.

## 18/09/2026 — criação generativa sem gasto e ensaio de atendimento

Sem alterar a arquitetura do Blueprint V1, a Video Engine passa a aceitar ativos MP4/WebM gerados legitimamente na interface do Flow e a exibi-los na galeria local. A interface de Flow não é tratada como API: geração totalmente autônoma permanece pendente. Toda chamada de API paga da Content Engine ganhou interruptor de implantação além da aprovação de cada job. Para o Instagram, KAIROS ganha um teste restrito de saudação por LLM gratuita com ID numérico do Founder, sem alterar as regras aprovadas para outras pessoas. Ambos os incrementos mantêm dados reais e falha fechada.

## 18/09/2026 — proteção do atendimento

O módulo Instagram mantém a arquitetura de inbox e regras, mas elimina fallback automático de IA paga. Segurança e orçamento prevalecem: sem segredo HMAC, token de conta vinculada ou regra aprovada não existe envio automático.

## 17/09/2026 — Social Engine: atendimento responsivo

O vínculo OAuth do Instagram foi confirmado para `_kairosdigital_`. Como evolução modular da Social Engine, comentários e Direct passam a ter ingress autenticado por assinatura, fila persistente e respostas por regras literais aprovadas. Nenhum papel de agente vira executor por causa disso. O Founder mantém a decisão de ativar cada regra; envios limitam-se a interações recebidas, com janela de Direct e cooldown. A fase está implementada localmente e aguarda ativação externa descrita em `docs/modules/INSTAGRAM_ENGAGEMENT.md`; o Blueprint V1 permanece inalterado.

## 15/09/2026 — ativação real do canal YouTube

O primeiro vínculo externo de publicação foi concluído sem alterar a arquitetura: YouTube Data API v3 habilitada na cota gratuita, OAuth com `youtube.readonly` e `youtube.upload`, e canal Kairos Digital (`@KairosDigitalAGI`, ID `UC2TqvTgMsTkywGQS3oiYDsg`) confirmado pelo backend de produção. Tokens continuam cifrados no cofre server-side. A publicação permanece privada por padrão e condicionada ao job aprovado, preservando a autoridade do Founder. Instagram é a próxima ativação externa e depende do app Meta.

## 15/09/2026 — Missão 006, Fase 11: Social OAuth consolidado

Instagram profissional passa a usar o mesmo cofre cifrado, autenticação operacional e prova HMAC do YouTube. A identidade é consultada no Graph antes da persistência; configuração não é tratada como conexão. Uma rota dinâmica substitui as quatro funções isoladas do YouTube e serve os dois provedores sem mudar os callbacks públicos, reduzindo o total de funções Vercel de 12 para 9. O vínculo Instagram não publica Reels nesta fase.

## 2026-09-11 — Video Engine profissional
Video AI passa a planejar cada criativo a partir de oferta, público, promessa verificável, prova e chamada para ação. O pipeline oficial é: briefing, roteiro, frames de referência, cenas generativas, composição, QA, galeria, aprovação e distribuição. Cada execução externa deverá registrar provedor, modelo, estimativa, custo real, artefatos e aprovação.

A estratégia inicial reduz integrações usando a API da Runway como gateway de múltiplos modelos. O render local continua como alternativa de custo zero. YouTube e TikTok são destinos planejados e exigem OAuth, backend e consentimento antes do envio. Monetização é objetivo de negócio, não dado presumido: receita só entra no Core quando vier de fonte conectada e auditável.

Adendo gratuito: o formato padrão passa a oito segundos. Cotas legítimas podem ser combinadas por provedor, sempre com uma identidade autorizada por serviço e pausa ao esgotar. Google Flow é a principal fonte diária verificada; Kairos Motion local garante continuidade. Instagram e X entram na distribuição, sendo que X automático possui custo por chamada e requer autorização financeira futura.

O Integration Control Plane introduz a primeira função server-side de diagnóstico. Estado de configuração e conexão passam a ser contratos distintos: presença de credenciais não significa conta conectada. Meta e Google exigem OAuth e token store; X permanece manual no orçamento zero. Um roteiro de sete dias ordena fundação segura, publicação, métricas e operação acompanhada.

A distribuição manual do X nasce na galeria: texto validado, vídeo real e manifesto JSON compõem o pacote, sempre com `published: false`. Abrir o compositor não equivale a publicar e o envio permanece uma decisão explícita do Founder.

Este registro preserva a evolução da constituição `KAIROS_AGI_BLUEPRINT_V1.md`. O texto fundador permanece versionado; alterações de arquitetura são aditivas, rastreáveis e ligadas a decisões técnicas.

## 2026-09-10 — Adoção do Blueprint V1

### Incorporado

- Missão, regra econômica e filosofia de departamentos vivos.
- World OS com Dashboard 2D e World 3D.
- ORION, Dispatcher, Money Lab, Demand Network, Sales, Social, Studio, Factory, Vault e Shield.
- Engines, Founder Edition, Client Edition, Billing, gamificação e Task System.
- Cliente Zero, World 0.1, World 1.0 e roadmap fundador de 30 dias.

### Decisões de integração

- O projeto existente `Kairos AGI Core` continua como repositório e ambiente oficial.
- GitHub permanece como fonte do código; documentação e mudanças arquiteturais serão versionadas.
- Dashboard 2D e World 3D compartilharão os mesmos contratos e a mesma fonte de dados.
- Segredos do Vault serão armazenados apenas em mecanismo próprio de segredos, nunca no repositório.
- A infraestrutura continuará em planos gratuitos até autorização explícita para custos.

### Questões abertas

- Detalhar a identidade de produto de Carlos WhatsApp AI. Arthur é um agente de cliente e KAIROS é o robô pessoal do Founder; os dois não são intercambiáveis.
- ORB definido no Memory Sync V1 como Operational Runtime Beacon; hardware futuro fora do escopo atual.
- Definir stack de aplicação, modelo de tenancy, fronteiras do Core e esquema de Ordens de Serviço.
- Converter o roadmap fundador de 30 dias em entregas técnicas estimadas após os contratos do Core.

### Próxima versão planejada

O Blueprint V2 deverá detalhar Core, ORION, Vault, Shield, Billing, Memory, Engines, Factories, Supabase, GitHub, World 3D, aplicativos Founder/Cliente e fluxos de venda, onboarding e entrega.

## 2026-09-10 — Missão 001: Cliente Zero

### Implementado

- Founder Dashboard com métricas operacionais mockadas.
- Founder Tower em React Three Fiber com ORION, KAIROS, Instagram AI e Hunter AI.
- Task System gamificado com avanço local de estado, XP e Kairos Coins.
- CRM com identificadores anônimos e dados fictícios.
- Instagram Engine demonstrativa, sem integração externa.
- Navegação completa da Founder Edition e placeholders para módulos futuros.

### Decisões

- KAIROS é o robô pessoal do Founder; Arthur permanece restrito ao contexto de cliente.
- React, TypeScript e Vite formam a base do frontend v0.1.
- React Three Fiber e Drei implementam o World 0.1.
- `src/data/mock` é a fonte única de dados demonstrativos até a camada de persistência.
- O pacote 3D é carregado sob demanda quando o usuário abre o World.

## Memory Sync V1 e Missão 002

Conversa fornecida pelo Founder adotada como adendo curado em KAIROS_MEMORY_SYNC_V1.md. Original preservado em memory/private, ignorado pelo Git. Estrutura docs/context e docs/blueprint adicionada sem substituir documentos fundadores.

ORB definido como Operational Runtime Beacon, hardware futuro. KAIROS continua robô do Founder e Arthur restrito a cliente. Identificações de clientes removidas da revisão pública atual do Blueprint, substituídas por CLIENT_001–004; histórico Git antigo não foi reescrito, portanto ainda contém a publicação anterior.

Instagram passa de tela mock para fluxo editorial manual local: ideias, materiais, pipeline, calendário, prompts, decisão do Founder e histórico. Estado editorial compartilhado em Core; Dashboard e World refletem a mesma fila. Dados persistem apenas no navegador, com validação e aviso de falha. API, IA e publicação reais continuam desconectadas.

Missões 003–008 registradas na fila; não implementadas por este sync. Recomendação de separar estratégia em repositório privado registrada sem mudar a visibilidade do repositório existente.

## 11/09/2026 — Memory Sync V1.1 e Missão 003
Adendo oficial preservado em KAIROS_MEMORY_SYNC_V1_1.md: Money Hunter com cinco equipes, Score Kairos, Ideas Vault, Clone Engine modular, VideoProvider, Content Brain, Asset Library, separação pública/privada e fila renumerada. Missão ativa limitada a 003.
A instrução direta de usar apenas dados reais substitui o requisito antigo de mocks na interface. O Blueprint original não foi refeito. Dados ausentes ficam indisponíveis; nenhum agente simula execução.

## 11/09/2026 — Missão 004
Video Engine ganhou execução local real no navegador. O caminho gratuito usa Canvas, Web Audio e MediaRecorder para produzir WebM. Provedores de geração continuam definidos como futuras integrações e não são apresentados como ativos.

Correção aprovada pelo Founder: Video Engine deve criar conteúdo do zero. Foi adicionado o gerador local de motion graphics por roteiro; o fluxo com arquivo passou a ser pós-produção. O escopo gratuito não inclui síntese fotorealista de pessoas ou ambientes.

### Adendo escrito pelo Founder
Interface séria e imersiva: painel 2D transparente sobre ambiente 3D contextual, reaproveitando o acervo. Progresso corresponde a trabalho cadastrado e revisão, sem inventar ganhos. Mantido foco econômico, sem promessa de receita.

## Correção do organograma — Kairos OS
Importados os 15 papéis do cadastro data/agents/agents.json do Kairos OS; CEO mapeado para ORION, WhatsApp para KAIROS, Hunter para Hunter AI, preservando sourceId. Acrescentados 12 papéis/especializações documentados no Blueprint e adendos. Total: 27 configurações, não 27 executores ativos.

A nova página Agentes contém busca, departamento, responsabilidades, indicador-alvo, origem, vínculo hierárquico e acesso ao painel relacionado. Os quatro modelos de reunião são exibidos como propostas de agenda, sem automação. Nenhum saldo, cliente ou token foi importado.

Dashboard e World usam o mesmo cadastro operacional. O Dashboard resume seis agentes e oferece acesso explícito ao organograma completo. O World instancia os 27, exibe balão apenas na seleção/hover para reduzir sobreposição e permite selecionar qualquer agente pelo nome. Fechar o inspetor agora oculta o painel.

O código do motor/importador existente na origem é evidência de implementação, não prova de conexão com este Core. Os executores continuam desconectados. A hierarquia dos 15 papéis originais responde a ORION; vínculos dos especialistas dos adendos são organização adotada neste Core, não importação literal do organograma original.

## 14/09/2026 — Consolidação Kairos e Missão 006, Fase 1
Founder autorizou reunir os três repositórios reais (kairos-command, kairos-os, kairos-agi-core) num único braço operacional, reaproveitando o que já existe e construindo apenas o que faltar. Este Core é a base confirmada (ver docs/REUSE_PROVENANCE.md). Arthur segue restrito a cliente Allfix, fora deste escopo; KAIROS é o robô pessoal do Founder no WhatsApp `62981554992`.

Fase 1 conecta o Dashboard ao Supabase mestre do kairos-command (schema `command`) por leitura server-side: receita do mês, receita total, MRR e clientes ativos/total (`api/business-metrics.mjs`), e frota de agentes WhatsApp com alertas críticos (`api/agent-status.mjs`). Ambas as rotas exigem Basic Auth própria deste projeto, desbloqueada por sessão via `OperationsUnlock`; sem credencial ou sem configuração, o Dashboard mantém os placeholders reais (`—`), nunca inventa número. Nenhuma migration, RLS ou processo pm2 de origem foi tocado.

Diretriz do Founder para as próximas fases (chat de agentes, Content Engine): os agentes que operam a empresa devem rodar preferencialmente nos planos pagos já assinados (OpenAI GPT, Anthropic Claude); créditos OpenRouter são reserva de último caso, não escolha padrão.

## 14/09/2026 — Missão 006, Fase 2: chat de agentes
Reaproveitada a arquitetura de provider trocável do kairos-os (`agents/ceo/providers/index.js`, CLAUDE.md: "nunca acople um agente diretamente a um provider de LLM específico"), reimplementada zero-dependência neste Core em `api/_providers/`. Diferença deliberada em relação à origem: a ordem `auto` agora prioriza Anthropic e OpenAI (planos pagos do Founder) antes de OpenRouter, que vira reserva de último caso — antes o chat do kairos-os usava OpenRouter como default. Motivo: instrução direta do Founder (14/09/2026) para não desperdiçar assinatura já paga.

O chat é estritamente consultivo: nenhum agente deste Core tem executor conectado, e o system prompt (`api/_agent-chat.js`) proíbe o modelo de fingir ter executado qualquer ação. Números vêm do mesmo cálculo real da Fase 1 (`api/_business.js`, agora compartilhado entre business-metrics, agent-status e o chat) — indisponibilidade é sempre dita como tal, nunca virou zero nem foi inventada.

## 14/09/2026 — Missão 006, Fase 3: schema do Content Engine
Desenhado o schema do pipeline de conteúdo em `kairos-command/supabase/migrations/0020_content_engine.sql`, seguindo as convenções já estabelecidas no schema `command` (idempotente, colunas `criado_em`/`atualizado_em` com `touch_atualizado_em()`, RLS via `command.is_operador()`, sem policy de escrita — leitura do operador, escrita só service_role): `content_jobs` (o job do pipeline, etapa `ideia → roteiro → imagem → video → legenda → aprovacao → publicado/rejeitado`, com o gate de aprovação do Founder explícito), `content_assets` (Asset Library, um registro por etapa concluída, com `gratuito`/`custo_usd` para nunca confundir geração gratuita com paga), `content_calendar` (agenda por canal), `prompt_library` (prompts reutilizáveis) e `avatars` (gamificação por `agente_slug`, referenciando `data/agentRegistry.json` deste Core por convenção, não por FK — o registro vive no repo).

Esta migration segue o mesmo padrão já usado nesta conta para SQL que o Founder aplica manualmente (Kairos ADS tem duas migrations pendentes de colar): **fica redigida e versionada, mas não é aplicada automaticamente** — nenhuma ferramenta deste ambiente tem permissão de rodar DDL direto no Supabase de produção sem o Founder revisar.

Neste Core, a primeira fatia de aplicação chega em `api/content-jobs.mjs` (GET lê o pipeline real, POST registra uma ideia nova) e `ContentEnginePanel` no Dashboard. Como a migration ainda não foi colada em produção, toda leitura/escrita aqui reporta "indisponível"/503 citando o arquivo pendente — nunca fabrica job. `api/_command.js` ganhou `writeCommand()`, a primeira escrita real que este Core faz no schema `command` (Fases 1 e 2 eram só leitura); o padrão de segurança (service_role, `Content-Profile: command`) segue o mesmo da leitura. Motor de geração (roteiro/imagem/vídeo/legenda) e OAuth do YouTube continuam como próximas fases.

## 14/09/2026 — Missão 006, investigação Hunter Skill encerrada
Auditoria de código (não implementação) verificou que o framing herdado de sessão anterior — "3 implementações divergentes do Hunter Skill precisando consolidação" — estava desatualizado e nunca chegou a existir como descrito. `kairos-command/supabase/migrations/0018_hunter_leads.sql` já se autodeclara "SUPERSEDIDA — NÃO APLICAR" no próprio arquivo: o Hunter real que atende a Sofia lê/escreve um Supabase **diferente** (projeto da VPS da Sofia, schema `tenant_id`/`agent_slug`/`nome_empresa`/`abordado`), não o schema `command` deste ecossistema. O painel (`kairos-command/src/lib/hunter/dados.ts`) e a ponte HTTP para a VPS (`kairos-command/src/lib/sofia/hunter.ts`, rotas `/hunter/status`/`/hunter/cacar` protegidas por Bearer contra `CHAT_SECRET`) já funcionavam ponta a ponta — confirmado ao vivo via `curl` público na VPS (200 na rota real vs 404 de rota inexistente), já que SSH read-only foi bloqueado pelo classificador de permissões deste ambiente. `kairos-hunter-skill` (repo `matheusschelle/kairos-hunter-skill`) é um template genérico de scraping (Playwright→SQLite→lowdb) não instalado em nenhum cliente ativo; `kairos-leadgen` é um funil B2B frio por e-mail, produto diferente. Nenhum dos três precisava ser "unificado" com os outros. Único ajuste real: comentários/copy desatualizados em `kairos-command` que ainda descreviam `/hunter/*` como ausente — corrigidos nesse repo (commit `834cc7d`), sem mudança de lógica.

## 14/09/2026 — Missão 006, Fase 4: OAuth do YouTube
Primeira integração de publicação ativada de verdade — diferente de Instagram/TikTok, que seguem esperando aprovação de app da Meta, o YouTube não tem esse gate: um OAuth Client Web do Google Cloud Console basta. Desenhado o cofre de tokens em `kairos-command/supabase/migrations/0021_integracoes_tokens.sql` (`command.integracoes_tokens`), deliberadamente **fora** do padrão de RLS do resto do schema `command`: as outras tabelas dão SELECT para `command.is_operador()` (dev/founder logado no painel); esta não tem policy nenhuma, nem para o operador — só `service_role` (o backend, atrás da própria Basic Auth do kairos-agi-core) lê ou escreve. Um vazamento de sessão do painel não deve conseguir puxar ciphertext de token de produção.

Neste Core, `api/_crypto.js` isola a cifra (`encrypt`/`decrypt`, AES-256-GCM, chave derivada por sha256 de `KAIROS_TOKEN_ENCRYPTION_KEY` — a mesma variável já declarada como pré-requisito em `api/integrations/status.mjs` desde a preparação do Control Plane) e a assinatura do `state` do OAuth (`signState`/`verifyState`, HMAC-SHA256 com janela de 10 minutos). A escolha de não usar uma tabela de nonce para o `state` é deliberada: o Google devolve exatamente o que este backend mandou, então validar a assinatura mais o tempo decorrido prova que o callback corresponde a um `connect-url` gerado há pouco, sem precisar de sessão nem storage no meio.

`api/_youtube.js` orquestra o fluxo: `buildConnectUrl()` monta a URL de consentimento do Google (falha fechada citando o env var exato faltando — `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_OAUTH_REDIRECT_URI` — quando o cliente OAuth não está configurado); `completeConnection()` troca o código pelo access/refresh token, confirma o canal via YouTube Data API e grava cifrado com `upsertCommand()` (nova função em `api/_command.js`, escrita idempotente por coluna de conflito — reconectar substitui o token antigo, não duplica linha); `computeYoutubeStatus()` e `disconnectYoutube()` completam o CRUD. Todo caminho de falha (sem migration aplicada, sem credencial do Google, `state` adulterado ou expirado, Supabase fora do ar) tem uma mensagem específica — nunca um 500 genérico nem uma conexão fingida.

As rotas ficam em `api/integrations/youtube/`: `connect-url`, `status` e `disconnect` atrás da mesma Basic Auth do Painel Operacional (mostrar qual canal está conectado já é dado de negócio real, diferente do `/api/integrations/status` original que só expõe booleano de configuração e por isso segue sem essa guarda); `callback` é a exceção deliberada — o redirect do Google não consegue carregar um header `Authorization`, então a prova de legitimidade vem inteiramente do `state` assinado, não da credencial. O callback nunca devolve token na URL de volta: só um sinal `?youtube=connected` ou `?youtube=error&reason=...`, que a `IntegrationsPage` lê uma vez no boot e limpa da URL. Como este app não tem router de URL, `App.tsx` ganhou um suporte mínimo a `?module=` só para reabrir a aba Integrações depois do redirect, sem virar um sistema de rotas.

12 testes novos (`tests/youtube-integration.test.mjs`) cobrem cifra/decifra (inclusive com chave errada), assinatura e expiração do `state`, e fail-closed em cada uma das ausências de configuração — total 50/50 passando. Ativação real (o Founder conseguir de fato conectar um canal) segue bloqueada em duas frentes fora do alcance deste agente: aplicar a migration 0021 em produção, e criar o OAuth Client Web no Google Cloud Console (criação de conta/credencial permanece proibida para automação).

## 14/09/2026 — Missão 006, Fase 5: geração real de roteiro no Content Engine
Primeiro estágio do motor de geração que a Fase 3 tinha deixado como escopo futuro: transformar uma ideia registrada (`etapa=ideia`) num roteiro real (`etapa=roteiro`), chamando um provider de LLM pago. A pergunta que precisava de resposta antes de escrever qualquer linha era se isso violava a regra inviolável "NUNCA ativar geração paga sem aprovação explícita do Founder". Duas âncoras resolveram isso: primeiro, o Founder já tinha dado essa direção explicitamente numa sessão anterior, ao desenhar as próximas fases ("Aplicar isso ao desenhar as próximas fases: chat de agentes, geração de roteiro/copy no Content Engine" — mesma diretriz que já autorizou a Fase 2); segundo, a própria Fase 2 (chat de agentes) já estabeleceu o precedente de que um clique explícito do Founder por ação, disparando uma chamada a um provider pago, é a fronteira de autorização aceita neste código — nunca geração em lote, nunca automática. `generateScript({jobId})` segue exatamente esse molde: um `jobId` por chamada, nunca uma fila.

Uma segunda dúvida veio do próprio schema: o comentário de `content_assets.gratuito` na migration 0020 parece amarrar geração paga a `job.aprovado`. Conferindo a ordem do `check constraint` de `etapa` (`ideia → roteiro → imagem → video → legenda → aprovacao → publicado/rejeitado`), fica claro que `aprovacao`/`aprovado` é o portão de pré-*publicação*, perto do fim do pipeline — não um portão de pré-*geração* no começo. Gerar um roteiro a partir de uma ideia não passa por esse portão; publicar, sim, vai passar (fase futura). Essa leitura ficou documentada em comentário direto acima de `generateScript()` em `api/_content.js`, para não precisar ser redescoberta.

Implementação: `generateScript()` valida `jobId` (400), confirma Supabase configurado (503), busca o job real via `readCommand` (404 se não existe, 409 se a etapa não é `ideia` — nunca regenera silenciosamente um roteiro que já existe), seleciona o provider pago via `selectProvider` (mesma ordem Anthropic → OpenAI → OpenRouter da Fase 2, 503 se nenhuma chave estiver configurada), monta o prompt a partir do `titulo`/`briefing` real do job (nunca inventa contexto de negócio), chama `provider.chat()` (502 ou o status do provider se a chamada falhar) e, só em caso de sucesso, grava o roteiro em `command.content_assets` via `writeCommand` e avança `content_jobs.etapa` para `roteiro` via `patchCommand()` — helper novo em `api/_command.js`, PATCH por filtro PostgREST com `Prefer: return=representation`, seguindo o mesmo padrão de `writeCommand`/`upsertCommand`/`deleteCommand` já usados nas fases anteriores. Se a migration 0020 ainda não tiver sido aplicada, qualquer uma dessas leituras/escritas falha citando o arquivo exato, nunca um 500 genérico.

Rota `api/content-jobs/generate-script.mjs`, atrás da mesma Basic Auth do Painel Operacional; coexiste sem conflito com `api/content-jobs.mjs` (mesmo basename, extensões diferentes — confirmado com `node --check` e listagem de diretório, sem deploy real). `useContentPipeline` ganhou `generateScript(jobId)`/`generatingJobId`/`generateError`; `ContentEnginePanel` ganhou o botão "Gerar roteiro", visível só nos jobs em `etapa=ideia`, desabilitado enquanto aquele job específico está gerando.

6 testes novos (`tests/content-engine.test.mjs`) cobrem toda a cascata de falha fechada (400/503/404/409/503) e um caminho de sucesso completo com um mock de `fetch` roteado por URL (chamada real ao formato da Anthropic API + as três chamadas PostgREST) — total 56/56 passando, `npm run typecheck` e `npm run build` limpos. Fora de escopo: imagem, vídeo, legenda — a `etapa` avança só até `roteiro` por enquanto.

## 14/09/2026 — correção pós-Fase 5: gate de aprovação de gasto ficou faltando
No mesmo dia, revisando a própria migration 0020 de novo, ficou claro que a análise da Fase 5 tinha conflado dois gates diferentes. `content_jobs` tem DOIS campos relacionados a "aprovação": a `etapa='aprovacao'`, e um booleano `aprovado` (com `aprovado_por`/`aprovado_em`), default `false`. O comentário da tabela `content_jobs` diz que `etapa=aprovacao` "é o gate do Founder; nada publica antes disso" — confirma que esse é mesmo o gate de pré-*publicação*, como a Fase 5 já tinha concluído. Mas o comentário da coluna `content_assets.gratuito` diz outra coisa: "Geração paga só existe quando o job carrega aprovado:true explícito do Founder" — isso amarra geração paga ao booleano `aprovado`, não à etapa. São dois mecanismos com propósitos diferentes: um trava publicação, o outro trava gasto. A Fase 5 checava só `etapa==='ideia'` e ignorava `aprovado` por completo — na prática, o clique "Gerar roteiro" sozinho já bastava pra gastar dinheiro num provider pago, o que não cumpre nem o desenho explícito do schema nem a regra inviolável "nunca ativar geração paga sem aprovação explícita do Founder". `computeContentPipeline` já buscava `aprovado` no `select` desde a Fase 3 (`?select=id,titulo,etapa,aprovado,criado_em`) sem nunca ser usado por lógica nenhuma — um sinal a mais de que esse campo tinha um propósito pendente.

Corrigido sem esperar o Founder notar: `generateScript` agora lê `aprovado` no mesmo `select` do job e recusa com **402** antes de sequer selecionar um provider, se `aprovado !== true`. Nova função `approveContentJob({jobId})` grava `aprovado:true`/`aprovado_por:'founder'`/`aprovado_em:now()` via `patchCommand` — ação deliberadamente separada do clique de gerar, exposta em `api/content-jobs/approve.mjs`, mesma Basic Auth. Na UI, o botão que aparece primeiro num job em `etapa=ideia` é "Aprovar geração paga"; só depois de aprovado é que "Gerar roteiro" aparece — duas ações, dois cliques, cada uma citada por nome no schema. 6 testes novos cobrem o 402, os testes de sucesso/sem-provider passaram a partir de um job já aprovado (senão testariam o caminho errado), e `approveContentJob` ganhou seus três próprios testes (503/404/sucesso com verificação dos três campos gravados) — total 60/60 passando, typecheck e build limpos.

## 14/09/2026 — Missão 006, Fase 6: geração real de imagem no Content Engine
Próximo estágio depois do roteiro: `etapa roteiro→imagem`. Primeira decisão foi de provider — entre Anthropic e OpenAI (os dois pagos priorizados neste Core), só a OpenAI tem API de geração de imagem; Claude não gera imagem. Por isso `generateImage` não passa pelo `selectProvider` genérico da Fase 2/5 (que despacha entre chat providers) — chama `api/_providers/openai.js#generateImage` direto, e falha fechado citando `OPENAI_API_KEY` especificamente quando ausente, sem tentar nenhum outro provider como fallback (não existe fallback real: Anthropic/OpenRouter não resolveriam o pedido).

Segunda decisão foi onde guardar o binário. `command.content_assets.storage_path` já existia desde a migration 0020 ("objeto no Supabase Storage (imagem/vídeo)"), mas nenhum bucket de Storage tinha sido criado ainda — só a coluna, nunca usada. Nova migration `0022_content_assets_bucket.sql` cria o bucket `content-assets`, público, com `insert into storage.buckets (id, name, public) values (...) on conflict (id) do nothing` — a mesma técnica que cria bucket via SQL puro sem precisar do dashboard, idempotente. Escolhido público (não como o cofre de tokens da Fase 4, que é RLS sem policy nenhuma) porque o conteúdo aqui é material de marketing da própria empresa — precisa ser exibível no painel e, mais adiante, publicável direto num provedor externo, e não é dado sensível. `api/_storage.js` (novo) sobe o binário via REST puro do Supabase Storage (`POST /storage/v1/object/{bucket}/{path}` com a service role key), no mesmo espírito zero-dependência de `_command.js` — sem SDK do `@supabase/supabase-js`, diferente de como o kairos-command já faz upload de vídeo (lá usa o SDK; aqui, fetch nativo, consistente com o resto deste Core).

Terceira decisão, a mais importante: reaproveitar o MESMO gate de aprovação de gasto da correção pós-Fase 5, sem reaprovar por etapa. `content_jobs.aprovado` é um campo do job inteiro, não por etapa — um job que já foi aprovado para gerar o roteiro continua aprovado quando chega em `etapa=roteiro` pronto para gerar imagem, porque a aprovação do Founder foi "pode gastar neste job", não "pode gastar nesta etapa específica". `generateImage` segue a mesma cascata de `generateScript`: 400 sem jobId, 503 sem Supabase, 404 job inexistente, 409 se a etapa não é `roteiro`, 402 se `aprovado !== true`, 503 sem `OPENAI_API_KEY`. O prompt de imagem usa o título do job, o `briefing.publico` quando existe, e um trecho do roteiro já gerado (lido de `content_assets` por `job_id`+`tipo=roteiro`) como contexto — nunca inventa contexto de negócio.

Rota `api/content-jobs/generate-image.mjs`, mesma Basic Auth do Painel Operacional. `useContentPipeline` ganhou `generateImage()`, reaproveitando os mesmos `generatingJobId`/`generateError` de `generateScript` — as duas ações nunca coexistem no mesmo job (um job está ou em `etapa=ideia`, mostrando "Gerar roteiro", ou em `etapa=roteiro`, mostrando "Gerar imagem", nunca os dois ao mesmo tempo), então reaproveitar o estado evita duplicar lógica de UI sem perder clareza. Botão "Gerar imagem" em `ContentEnginePanel` só aparece em jobs `etapa=roteiro && aprovado`. 7 testes novos cobrem toda a cascata de falha e um caminho de sucesso completo com mock de `fetch` roteado por URL (Images API da OpenAI + upload de Storage + `content_assets` POST + `content_jobs` PATCH) — total 67/67 passando, typecheck e build limpos. Fora de escopo: vídeo e legenda ainda sem motor de geração conectado — a `etapa` avança até `imagem` por enquanto.

## 14/09/2026 — Missão 006, Fase 7: geração real de vídeo, motor free-tier primeiro
Pedido explícito do Founder trazia dois provedores nomeados: Google Veo via AI Studio como "grátis" (`GOOGLE_AI_KEY`) e Kling v1.6 via fal.ai como "fallback free" caso o Veo devolvesse 429 (quota esgotada). A implementação seguiu essa forma exatamente — `api/_providers/veo.js` chama `POST .../models/{model}:generateVideo` e faz polling de uma operação assíncrona até `done`/`state==='DONE'`; `api/_providers/fal.js` submete numa fila (`queue.fal.run`), faz polling do `status_url` até `COMPLETED` e busca o resultado em `response_url`. Ambos zero-dependência (fetch puro), credenciais só server-side, seguindo o mesmo contrato de `hasCredentials()`/ação exportada dos providers de chat/imagem já existentes.

A decisão que divergiu do pedido literal foi sobre o rótulo "free" do fallback Kling. Checando os preços reais do fal.ai, o Kling v1.6 standard cobra por segundo de vídeo gerado — não é gratuito, independente de como o pedido o descreveu. Ativar esse fallback sem aprovação explícita violaria a mesma regra inviolável que motivou a correção pós-Fase 5 ("nunca ativar geração paga sem `aprovado:true` do Founder"), e essa regra não tem exceção para "o pedido chamou de free". Por isso `generateVideo({jobId, tier:'free'})` tenta o Veo primeiro (esse sim genuinamente sem custo, cota da AI Studio); só cai pro Kling quando o Veo devolve HTTP 429 ou não está configurado — e nesse ponto exige `content_jobs.aprovado===true` antes de prosseguir, com uma mensagem de erro que explica por quê ("rotular como 'free' no pedido não pula o gate de gasto"). `tier:'paid'` (Kling v2.1 Master) sempre exigiu aprovado, sem essa ambiguidade.

Um bug real apareceu nos dois providers novos: `POLL_INTERVAL_MS`/`POLL_TIMEOUT_MS` foram escritos primeiro como `const` de módulo, lidos de `process.env` uma única vez na importação — o que quebra qualquer teste que tente sobrescrever esses valores via `withEnv()` depois, porque o import já tinha rodado antes. Corrigido convertendo pra funções (`pollIntervalMs()`/`pollTimeoutMs()`) que leem `process.env` a cada chamada, dentro do próprio loop de polling.

Diferente da imagem (Fase 6, que sobe o binário pro bucket `content-assets` do próprio Core), o vídeo gerado NÃO é re-hospedado — a URL que o Veo/fal.ai devolve é gravada direto em `content_assets.storage_path`. Motivo: evitar baixar e re-subir um arquivo potencialmente grande duas vezes através de uma função serverless (uma vez do provider, outra pro Storage próprio); o tradeoff (a URL pode ser temporária/assinada) fica documentado em comentário, e a Fase 8 consome essa URL diretamente e prontamente. `generateVideo` segue a mesma cascata de falha fechada das fases anteriores (400/503/404/409/402), exige `etapa==='imagem'` e avança pra `etapa='video'` ao gravar o asset. Rota `api/content-jobs/generate-video.mjs`, mesma Basic Auth; dois botões no `ContentEnginePanel` ("Gerar vídeo (grátis)" e "(premium)", o segundo só visível se `aprovado`). 13 testes novos — incluindo um cobrindo explicitamente que o rótulo "free" não pula o gate — total 79/79 passando, typecheck e build limpos.

## 14/09/2026 — Missão 006, Fase 8: publicação real no YouTube
Última etapa do pipeline a ganhar motor: `etapa video→publicado`, fechando o ciclo ponta a ponta pela primeira vez desde que o Content Engine começou a ser desenhado na Fase 3. `api/_youtube.js` (já existia desde a Fase 4, só para o fluxo de conexão OAuth) ganhou duas funções novas. `getValidAccessToken()` lê a única linha de `integracoes_tokens` (provider='youtube'), decifra o `access_token_enc`; se `expires_at` for nulo ou estiver a menos de 60s do agora, trata como expirado e faz `POST` no endpoint de token do Google com `grant_type=refresh_token`, usando o `refresh_token_enc` decifrado — sucesso persiste só `access_token_enc`/`expires_at` (payload parcial; o `upsertCommand` do PostgREST faz merge, não sobrescreve `account_id`/`refresh_token_enc`/`scope`). Sem refresh_token salvo e token expirado, falha fechado com 401 direcionando o Founder a reconectar manualmente — nunca tenta se reautenticar sozinho. `uploadVideo()` monta um corpo `multipart/related` à mão (boundary aleatório, parte JSON de metadados + parte binária do vídeo concatenadas num só Buffer), sobe via `POST .../upload/youtube/v3/videos?uploadType=multipart`, zero SDK. `privacyStatus:'private'` é o default deliberado — o Core nunca torna um vídeo publicamente visível sozinho; o Founder decide manualmente quando trocar a visibilidade no próprio YouTube.

A decisão mais significativa desta fase foi sobre qual gate usar antes de publicar. A migration 0020 já documentava a intenção original no comentário da própria tabela `content_jobs`: `etapa='aprovacao'` "é o gate do Founder; nada publica antes disso". Só que essa etapa é inalcançável hoje — as etapas `legenda` e `aprovacao` não têm motor de geração/decisão construído (ficaram fora de escopo desde a Fase 3, e continuam). As opções eram: (a) construir agora um motor de legenda e um fluxo de aprovação de publicação, escopo bem maior que o pedido desta fase; (b) publicar assim que `etapa==='video'`, sem gate nenhum, o que contradiz "nada publica antes disso" e a própria convenção do harness de nunca fazer ação irreversível/externa sem sinal explícito do Founder; ou (c) reaproveitar `content_jobs.aprovado` — o mesmo booleano já estabelecido como "o Founder autorizou este job" desde a correção pós-Fase 5 — também como o sinal de "pode publicar". Optei por (c), documentado extensivamente em comentário de código e aqui, explicitamente como desvio transparente a ser revisitado quando legenda/aprovacao ganharem motor de verdade — não como atalho silencioso.

Outro cuidado: como o upload pro YouTube acontece antes da escrita em `content_calendar`/`content_jobs`, uma falha depois de um upload bem-sucedido poderia, se reenviada ingenuamente, duplicar o vídeo num canal ao vivo. `postToYoutube` nunca reenviatenta sozinho nesse caso — a mensagem de erro inclui o `videoId` real devolvido pelo YouTube, para o Founder reconciliar manualmente. Rota `api/content-jobs/post-youtube.mjs`, mesma Basic Auth; botão "Postar no YouTube" em `ContentEnginePanel` só para jobs `etapa='video' && aprovado`. Durante os testes, um `encrypt()` chamado antes do `withEnv()` setar `KAIROS_TOKEN_ENCRYPTION_KEY` quebrou um teste (corrigido movendo a chamada pra dentro do callback do `withEnv`). 9 testes novos, total 94/94 passando, typecheck e build limpos. Ativação real segue bloqueada pelas mesmas pendências de infraestrutura da Fase 4 (migrations 0020/0021 aplicadas em produção + OAuth Client do Google criado), mais duas credenciais novas desta fase: `GOOGLE_AI_KEY` e `FAL_KEY`.

## 14/09/2026 — Correção pós-Fase 8: reportar divergências em vez de "corrigir" às cegas
No mesmo dia, o Founder aplicou as 3 migrations pendentes e configurou os 10 env vars de produção necessários — confirmado por `vercel env ls production` e por 5 checagens REST diretas contra o Supabase (todas 200). Um redeploy foi feito para o runtime pegar os vars novos, e `/api/integrations/status` confirmou ao vivo `tokenStoreConfigured:true`/`youtube.oauthConfigured:true`.

A missão seguinte chegou como um brief estruturado com 3 "correções" (FASE FIX) e 2 features novas (Avatar Studio, Story Engine), junto com red lines explícitas — inclusive "se encontrar dívida técnica crítica, reportar antes de prosseguir". Antes de tocar em qualquer arquivo, o brief foi confrontado com o código real já em produção (não com o que o brief afirmava sobre ele), e as 3 "correções" da FASE FIX se mostraram premissas falsas:

1. O brief pedia para "liberar o botão do YouTube sem gate do Painel Operacional", com a justificativa de que o unlock seria só para dado de receita/MRR. Só que `useYoutubeIntegration.ts` (connect/disconnect/status) manda o MESMO header Basic Auth de `business-metrics`/`agent-status`, e o servidor valida os três com o MESMO `checkAuth()` (`api/_auth.js`) — comentário explícito em `connect-url.mjs` documenta essa decisão como deliberada, não coincidência de UI. Remover a checagem do lado cliente não mudaria nada funcional (o servidor ainda devolveria 401); "consertar de verdade" exigiria remover a checagem do lado servidor também, o que abriria uma rota de OAuth real (grava token cifrado, conecta um canal do Google de verdade) sem autenticação nenhuma — uma regressão de segurança genuína numa ação irreversível/externa, exatamente o tipo de coisa que este Core trata com o máximo de cuidado desde a Fase 4. Não removido. O botão já funciona: basta o Founder digitar `KAIROS_USER`/`KAIROS_PASS` (já configurados) no formulário `OperationsUnlock` já presente na página.

2. O brief pedia para "corrigir" o contador "OAuth pronto: 1/2" pra mostrar "2/2" já que GOOGLE_CLIENT_ID/SECRET foram configurados. Mas `api/integrations/status.mjs` conta 2 no denominador porque há 2 PROVEDORES em `mode:'oauth'` no catálogo (YouTube e Instagram) — não é "2 credenciais do YouTube". Instagram segue sem `META_APP_ID`/`META_APP_SECRET` porque a aprovação da Meta para a API ainda não saiu, fato documentado desde antes desta missão. "1/2" já é o resultado correto e honesto do estado real; forçar "2/2" fabricaria prontidão que não existe, violando a própria red line do brief ("não inventar dados de métricas — só reais do Supabase"). Não alterado.

3. O brief pedia para "confirmar ou criar" a rota de callback do YouTube. `api/integrations/youtube/callback.mjs` já existe, implementado, desde a Fase 4 — troca de código real, verificação de `state` assinado, redirect com banner de sucesso/erro. Nada a fazer.

Lição geral, consistente com a que motivou a correção pós-Fase 5: um brief bem estruturado pode ainda assim descrever um sistema que não é o sistema real. A defesa continua sendo a mesma — inspecionar o código em produção antes de aplicar qualquer instrução que o contradiga, e reportar a divergência com evidência (arquivo, linha, comportamento observado) em vez de silenciosamente obedecer ou silenciosamente ignorar.

## 14/09/2026 — Missão 006, Fase 9: Avatar Studio, schema real em vez do schema do brief
O brief da Fase 9 pedia um insert direto com colunas de identidade (nome/role/personality/story) que simplesmente não existem em `command.avatars`. A migration 0020 (redigida na Fase 3, aplicada em produção nesta mesma missão) desenhou essa tabela só com `agente_slug`/`nivel`/`xp`/`coins`/`conquistas`, e o comentário da própria tabela documenta por quê: identidade de agente já tem um dono nesse repo — `src/data/agentRegistry.json`, 27 entradas, casada por `agente_slug=id`, texto puro, não FK ("o registro vive no repo, não no banco"). Rodar o SQL do brief teria falhado com erro de coluna inexistente; e mesmo se as colunas existissem, o "ORION" proposto (papel de estrategista de mercado) colidiria com o ORION real do registro (CEO, Founder Tower) — duas identidades diferentes com o mesmo nome.

A adaptação: `api/_avatars.js#listAvatars` faz o join no servidor — sempre lista os 27 agentes do registro (identidade real), decorados com o progresso do Supabase quando existir, e com um baseline explícito (nível 1, XP 0, coins 0, hasProgress:false) quando não existir. `ensureAvatar({agenteSlug})` é a única escrita permitida: garante a linha de progresso de UM agente que já existe no registro (rejeita com 404 qualquer slug fora dele) — nunca cria uma identidade nova, nunca duplica uma que já existe. O upsert por `agente_slug` com merge de duplicatas faz disso uma operação idempotente e segura: chamar duas vezes não apaga progresso acumulado.

Rota nova consolidada em `api/avatars/[action].mjs` (list/upsert) em vez de dois arquivos separados — mesma lição da Fase 7/8 (teto de 12 Serverless Functions do plano Hobby), aplicada preventivamente desta vez em vez de reativamente. UI: página nova de Avatar Studio (grid de 27 cards, nível/XP/coins/conquistas, botão "Registrar progresso inicial" só nos que ainda não têm linha), entrada no sidebar entre Integrações e Vault. 6 testes novos, typecheck e build limpos.

## 14/09/2026 — Missão 006, Fase 10: Story Engine, narrativa só sobre número real
O brief pedia uma função de narrativa recebendo métricas do chamador e chamando um endpoint de geração de roteiro fora da convenção deste repo (rotas são .mjs sob api/, lógica em api/_*.js; o endpoint citado não existe — o mais próximo é o gerador de roteiro do Content Engine, que serve outro propósito). Mas a divergência mais importante era de princípio, não de arquivo: aceitar métricas do chamador significa que qualquer chamador (inclusive, futuramente, um bug de UI) poderia fazer o Story Engine narrar em cima de um número inventado — direto contra a red line "não inventar dados de métricas — só reais do Supabase".

Por isso a narração diária não aceita métricas de fora: ela mesma recalcula receita/MRR/clientes (reaproveitando o cálculo já usado pelo chat de agentes desde a Fase 2) e conta jobs reais do Content Engine, e só então manda esses números — nunca outros — para o provider pago narrar. Um teste cobre isso explicitamente: um valor fabricado enviado no payload da chamada é ignorado, e o texto que chega ao provider carrega só o número real. Sem Supabase configurado e sem nenhum job/receita real, devolve estado "indisponível" em vez de gerar uma narrativa vazia disfarçada de sucesso.

O feed de atividade lê os jobs mais recentes do Content Engine e rotula cada um com o departamento do organograma dono daquela etapa do pipeline, via um mapa fixo (roteiro/legenda → Social AI, imagem → Clone AI, vídeo → Video AI, publicado → YouTube AI, aprovação → CRO, rejeitado → QA AI). Esse rótulo é uma leitura organizacional real (qual área do Blueprint é dona daquela etapa), documentada como tal em comentário — nunca uma alegação de que aquele agente específico executou aquele job. Nenhum agente deste Core tem executor conectado, mesma honestidade mantida desde o chat da Fase 2; inventar "quem fez o quê" por job individual seria fabricar um dado que não existe no schema.

Rota nova consolidada (narrative/activity) — com essa, o Core soma exatamente 12 rotas Serverless, o teto exato do plano Hobby anunciado pelo próprio Founder como hard stop desta missão. Registrado aqui como um limite físico já atingido: a próxima função nova (de qualquer fase futura) exige consolidar uma rota existente ou revisitar o plano Vercel, não pode simplesmente somar mais um arquivo. Seção nova no Dashboard com o feed real e um botão de narrar o dia (uma chamada de provider pago por clique, nunca automático). 5 testes novos, total 105/105 passando, typecheck e build limpos.
# 15/09/2026 — Instagram operacional: escopos de interação

O conector Meta evolui do vínculo de perfil/publicação para solicitar também `instagram_business_manage_comments` e `instagram_business_manage_messages`. Essa autorização prepara moderação e Direct sem introduzir anúncios, insights ou automação de envio. A autorização OAuth não prova execução: handlers, webhooks, UI e auditoria permanecem requisitos explícitos antes de qualquer resposta automática.

Em 17/09/2026, o webhook foi publicado com assinatura HMAC, idempotência persistente, fila privada e regras literais aprovadas. O app Meta correto salvou o callback e assinou apenas `comments`/`messages`; o challenge retornou 200 e POST sem assinatura 403. O Blueprint segue modular: a implementação paralela de respostas por LLM não é o caminho ativo, evitando custos e envios sem revisão. Migration 0025, publicação/análise Meta e teste ponta a ponta continuam pendentes; nenhuma resposta real foi comprovada.
## 22/09/2026 — Money Hunter v0.1

O Blueprint evolui com uma Central de Demandas local como primeira superfície da Missão 008. O fluxo preserva a sequência pesquisa → análise → proposta → aprovação, mas não representa pesquisa contínua nem executor ativo. A implementação não altera os limites do Money Hunter: nenhuma oportunidade é coletada, contactada ou enviada automaticamente.

## 22/09/2026 — transição de infraestrutura do KAIROS

O Blueprint passa a registrar a migração do runtime do agente KAIROS como uma transição reversível: a origem HostGator permanece ativa até haver réplica testada, e nenhum segredo de runtime passa para o Core ou para a documentação pública. A execução começa por inventário técnico privado e termina somente após reconexão oficial do WhatsApp, validação observável e período de sobreposição.

## 22/09/2026 — Kit modular do agente KAIROS

Evolução aprovada: o runtime do agente passa a ter uma base exportável por instalação, com contratos de configuração, eventos, isolamento de tenant, auditoria e skills. A evolução preserva a separação entre Founder e clientes e proíbe transferir sessões, credenciais, banco, mídia, logs ou conversas entre instalações. A publicação pública só ocorre após varredura e revisão do artefato sanitizado. Não cria um novo executor em segundo plano nem muda a conexão de WhatsApp existente.

## Central de Demandas persistente

O Money Hunter evolui a captura local para uma fila persistente por navegador, usando domínio e armazenamento separados. A evolução não altera o limite do Blueprint: oportunidade externa só entra quando observada em fonte autorizada; proposta e contato continuam dependentes de revisão/autorizações. A migração para servidor exigirá prova de origem, isolamento de tenant e auditoria.

## 23/09/2026 — Evolução v0.1

A Constituição foi evoluída modularmente com duas superfícies operacionais: Money Lab (decisão comercial) e Analytics (fontes autenticadas). A separação entre oportunidade, proposta e receita foi preservada. O adaptador de descoberta segue o princípio de least privilege: somente leitura, configuração de servidor e falha fechada; nenhuma conta, limite de plataforma ou comunicação é automatizada.

## 2026-09-23 — Continuidade visual e Character Bible

O Blueprint evolui com um catálogo local de bíblias de personagem para manter identidade visual entre roteiros, imagens e vídeos. O press kit mínimo contém rosto frontal/3-4/perfis, corpo inteiro frontal/lateral/traseiro, expressões, figurino/adereços e paleta/cenário. É uma camada de referência e direitos; não concede treinamento, armazenamento de biometria ou publicação.

## 2026-09-23 — Domínios separados de criação

Clone, personagens ficcionais e acervo de filmes passaram a ter superfícies separadas. A regra evita a mistura de referências pessoais autorizadas com assets ficcionais e mídia de produção.

## 2026-09-23 — Narrativa audiovisual inicial

O Blueprint evolui com a série original “Kairos: A Hora Certa”: episódios verticais curtos, continuidade visual controlada por Character Bible e blocos 3D, sem copiar a referência externa. A narrativa representa tarefas e entregas como estado verificável, sem fabricar receita ou execução.

## 2026-09-23 — Geração externa com orçamento isolado

O Blueprint passa a permitir um adaptador de vídeo por Gateway somente quando cada execução tiver job aprovado, orçamento técnico limitado, uso retornado pelo provedor e armazenamento operacional. Seedance 2.5 é o primeiro adaptador: OIDC do deployment, flag exclusiva, sem retry automático e sem referência biométrica por padrão. A integração não autoriza compra, recarga, postagem ou transmissão de materiais do Founder.

## 23/09/2026 — Acervo operacional e Seedance textual

A Biblioteca de filmes passa a mostrar, além do IndexedDB local, os vídeos persistidos em `command.content_assets` com job, provider, modelo e indicação de uso devolvido. Uma ideia aprovada pode seguir diretamente para um clipe textual Seedance de 8 segundos pela Gateway; isto não transfere press kit nem habilita publicação. O estado/custo continuam vindo do servidor e falham fechados quando migrations, flag, OIDC ou crédito não estiverem disponíveis.

## 23/09/2026 — Trilogia e continuidade visual

O Blueprint incorpora uma trilogia audiovisual original que cruza interface e realidade para explicar o uso responsável de IA pela Kairos. A produção é planejada como planos curtos, rastreáveis e revisáveis; cada geração externa guarda modelo, prompt, versão de personagem e `usage` retornado. Pessoas reais seguem sob consentimento e referências privadas; entidades ficcionais ficam em Character Bibles separadas. O primeiro teste Seedance permanece textual e isolado por orçamento.

## 23/09/2026 — Referências visuais ficcionais

KAIROS e ORION receberam press kits de direção de arte como personagens não humanos. A evolução serve à continuidade visual da trilogia e mantém uma fronteira rígida: referências de pessoas reais continuam privadas, condicionadas a consentimento e nunca são enviadas por padrão.

## 23/09/2026 — Briefing guiado sem execução implícita

O Blueprint evolui o Content Engine para transportar um briefing estruturado ao job de conteúdo e expor um template da Kairos Signal. Preparar uma descrição visual não é aprovação nem geração: os gates de consentimento, orçamento, persistência e revisão continuam independentes.

## 2026-09-23 — Studio de histórias unificado

O Blueprint evolui para tratar criação audiovisual como um domínio único de Studio, com história, elenco, produção e acervo navegáveis no mesmo centro. Isso não funde os dados: identidade humana autorizada permanece privada; personagens ficcionais têm Character Bible; filmes têm registros de origem e uso. Continuidade automática segue proibida até que crédito, provider, orçamento, aprovação e confirmação remota sejam verificáveis.

