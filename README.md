# Kairos AGI Core

Atualização 18/09/2026: [primeiros vídeos e imagens generativos reais no Google Flow](docs/modules/VIDEO_ENGINE_V0_4.md) (duas cenas de 8 s e montagem de 16 s); a Video Engine importa MP4/WebM na galeria local. A API Veo não é gratuita e foi desligada no modo custo zero. O teste de [resposta “oi” do Founder no Instagram](docs/modules/FOUNDER_GREETING_V0_1.md) está implementado; as tabelas de atendimento e a assinatura da conta foram confirmadas em produção. Falta o app Meta publicar e entregar um evento real, identificar o ID do Founder e vincular uma chave Gemini de projeto Free Tier. Não há postagem nem resposta automática comprovada.

Atualização 23/09/2026: o Content Engine recebeu adaptador isolado para Seedance 2.5 pela Vercel AI Gateway. Ele usa OIDC do deployment, exige aprovação por job e uma flag exclusiva; não gera, não publica nem envia referências do Founder até as migrations do Engine estarem aplicadas. Veja [Seedance Gateway](docs/modules/SEEDANCE_GATEWAY_V0_1.md).

Atendimento Instagram: o webhook autentica eventos da Meta por HMAC e só envia respostas automáticas a regras aprovadas. A conexão OAuth ou a assinatura de campos, isoladamente, não comprova entrega de eventos; acompanhe o estado no painel de Integrações.

Ambiente oficial de desenvolvimento da **Kairos Digital**, destinado à construção de uma empresa operada por agentes de IA com supervisão humana.

O documento [KAIROS_AGI_BLUEPRINT_V1.md](KAIROS_AGI_BLUEPRINT_V1.md) é a constituição arquitetural do produto. Novas decisões devem evoluir essa base de forma modular e registrar alterações em [docs/BLUEPRINT_EVOLUTION.md](docs/BLUEPRINT_EVOLUTION.md).

## Estado atual

**Missão 003 — Clone Engine:** Identity Manager, Voice Profile, Face Profile, Avatar Library, Prompt Library, Video Queue, Approval Queue, Asset Library e Content Brain. Cadastre seus dados, referências a arquivos reais e produções; revise e aprove localmente. Não há clonagem, geração, upload ou publicação automática.

**Missão 004 — Video Engine:** planeje um criativo com oferta, público, promessa, prova e CTA; compare custo real de modelos generativos antes de produzir; crie motion videos locais a partir do roteiro; ou edite um vídeo real. Resultados concluídos são salvos na galeria IndexedDB. Runway, Veo, Gemini Image, GPT Image, YouTube e TikTok estão catalogados, mas desconectados até existir backend seguro e autorização.

O modo curto usa oito segundos por padrão e condensa o roteiro em duas cenas. O roteador gratuito registra Kairos Motion local, Google Flow, Runway Free e Higgsfield Free sem alternar contas para contornar limites. Instagram, YouTube, TikTok e X aparecem como destinos; o X API é pago e o caminho sem custo é publicação manual aprovada.

Na galeria, cada vídeo real pode receber um texto para X. A aplicação baixa um manifesto de distribuição com `published: false` e abre o compositor oficial; anexo e envio continuam sob revisão do Founder.

**Integration Control Plane:** YouTube e Instagram compartilham OAuth server-side, `state` assinado, identidade consultada no provedor e o cofre cifrado `command.integracoes_tokens`. As URLs sociais foram consolidadas em uma função dinâmica para manter a Vercel Hobby gratuita. O canal real [Kairos Digital](https://www.youtube.com/channel/UC2TqvTgMsTkywGQS3oiYDsg) (`@KairosDigitalAGI`) e o perfil [_kairosdigital_](https://www.instagram.com/_kairosdigital_/) aparecem conectados no status autenticado de produção em 17/09/2026. Uploads para YouTube continuam privados por padrão e dependem de aprovação explícita no job. Valores secretos nunca chegam ao frontend e conexão não equivale a publicação.

**Atendimento Instagram:** webhook assinado, fila de comentários/Direct, resposta manual e regras de palavra-chave com aprovação do Founder foram implementados e publicados. Há uma regra de Direct ativa cadastrada no banco; a inbox e a assinatura `comments`/`messages` da conta respondem em produção. O app Meta ainda não está publicado e nenhum evento real chegou à fila; faltam análise/publicação e teste ponta a ponta. Detalhes em [Atendimento Instagram](docs/modules/INSTAGRAM_ENGAGEMENT.md).

Sem dados fictícios na interface. Métricas do Instagram ainda não são consultadas por este módulo; receita, clientes, XP e Coins só aparecem quando sua fonte real está disponível.

A aplicação continua em React/Vite/TypeScript, hospedada na Vercel e sincronizada com main. Dados de edição ficam somente no navegador. Clone oferece exportação JSON para backup; não é Vault nem banco autenticado. As Missões 003 e 004 estão implementadas; as Missões 005–010 permanecem planejadas.

- [Produção](https://kairos-agi-core.vercel.app/)
- [GitHub](https://github.com/KairosDigitalAGI/kairos-agi-core)
- [Guia Clone](docs/modules/CLONE_ENGINE_V0_3.md)
- [Guia Video Engine](docs/modules/VIDEO_ENGINE_V0_4.md)
- [Dados reais e migração](docs/modules/REAL_DATA_POLICY.md)
- [Contexto](docs/context/MASTER_CONTEXT.md), [histórico](docs/context/CHANGELOG.md), [fila](docs/context/MISSION_QUEUE.md)

## Organização

```text
src/core/         Estado e seletores compartilhados do Kairos Core
src/world/        Founder Tower e agentes em React Three Fiber
src/engines/      Engines operacionais, começando pelo Instagram
src/features/     Dashboard, Missões, CRM e recursos de produto
src/ui/           Componentes visuais reutilizáveis
src/data/         Configuração operacional; fixtures mock isoladas dos componentes
src/types/        Contratos compartilhados
apps/             Aplicações e serviços futuros
packages/         Bibliotecas, contratos e conectores compartilhados
memory/           Conhecimento curado e decisões aprovadas
docs/             Backlog, operação e documentação de configuração
scripts/          Utilitários de desenvolvimento
MEMORY_IMPORT/    Recepção local de exportações futuras (não versionadas)
```

Leia [KAIROS_AGI_BLUEPRINT_V1.md](KAIROS_AGI_BLUEPRINT_V1.md), [MASTER_CONTEXT.md](MASTER_CONTEXT.md), [ARCHITECTURE.md](ARCHITECTURE.md), [ROADMAP_V0_1.md](ROADMAP_V0_1.md) e [documentação dos módulos](docs/modules/README.md).

## Stack oficial

GPT-6 Astra, Codex, GitHub, Vercel, Supabase, OpenRouter, Gemini Flash, Hostinger VPS, n8n, Google Flow, ElevenLabs e Obsidian.

## Desenvolvimento

Requisitos: Node.js 24 para executar aplicação e testes de domínio com TypeScript nativo.

```bash
npm install
npm run dev
```

Para validar a entrega: `npm test`, `npm run typecheck` e `npm run build`.

Branch principal: `main`. Mudanças futuras em branches `codex/`. O frontend usa React, TypeScript, Vite, React Three Fiber, Drei e Lucide. Decisões duradouras devem ser registradas em `memory/decisions/`.

Não colocar segredos em Git. Exportações brutas e dados privados ficam locais até revisão e autorização de destino. Manter os serviços em planos gratuitos. Qualquer recurso pago exige autorização explícita. Os nomes da stack que não têm status acima são componentes planejados.

## Painel imersivo
Escritório 3D do kairos-os reaproveitado como fundo contextual do painel de vidro. Alterne entre departamentos, visite o ambiente ou use modo foco. A trilha de preparação do Clone reflete cadastros e aprovações reais locais. [Proveniência](docs/REUSE_PROVENANCE.md) e [guia](docs/modules/IMMERSIVE_WORKSPACE.md).

## Organograma consolidado
A página Agentes reúne 15 papéis importados do Kairos OS e 12 do Blueprint/adendos. O World usa os mesmos 27 registros. Responsabilidades e modelos de reunião preservados; nenhum executor foi conectado automaticamente. Ver docs/modules/AGENT_ORGANOGRAM.md.
## Money Hunter v0.1

O módulo Hunter possui uma Central de Demandas para registrar oportunidades reais já vistas em fonte autorizada, qualificar o escopo e preparar a fila comercial. A automação de coleta e comunicação continua desligada até existir fonte permitida, persistência e aprovação por ação.

## Migração da infraestrutura KAIROS

O agente pessoal do Founder permanece na VPS de origem até uma réplica ser validada. O roteiro e o inventário seguro estão em `docs/modules/KAIROS_VPS_MIGRATION.md` e `scripts/kairos-vps-inventory.sh`; ambos excluem segredos, sessões e dados de conversas.

## Kairos Agent Kit

A base reutilizável do agente está em `templates/kairos-agent-kit/`. O exportador `scripts/export-kairos-agent-kit.sh` monta uma cópia sanitizada do runtime de uma VPS e inclui contratos TypeScript para configuração, tenancy, auditoria e skills. Ela não inclui `.env`, sessões de WhatsApp, bancos, mídias, logs ou chaves. A publicação em um repositório público continua bloqueada até a exportação passar pelo scanner e por uma revisão de `git status`. Veja [guia do kit](docs/modules/KAIROS_AGENT_KIT.md) e [contratos de skills](docs/modules/KAIROS_AGENT_SKILLS.md).

## Central de Demandas persistente

O Money Hunter mantém registros inseridos pelo Founder no navegador entre recargas. Esta persistência é local, validada e separada do contrato de domínio; ela não conecta fontes, não acessa plataformas e não envia propostas. A evolução para CRM server-side exige isolamento de tenant, prova de origem e auditoria.

## Money Lab, Analytics e descoberta autenticada

A central financeira e o Analytics agora saíram de placeholder. Eles são leitura segura de dados reais quando as rotas autenticadas estão disponíveis e exibem indisponibilidade sem preencher lacunas. O Money Hunter permanece uma fila local revisável; o adaptador Freelancer é somente leitura, requer configuração server-side e não executa ações na plataforma. Documentação: `docs/modules/MONEYLAB_ANALYTICS_V0_1.md`.

## Character Bible / Press kit

A Clone Engine possui uma Character Bible local para registrar as referências que tornam um personagem consistente entre cenas: vistas de rosto e corpo, expressões, figurino, paleta, cenário, invariantes visuais e direitos. Materiais do Founder permanecem privados e não são enviados ao repositório.

## Clone, Personagens e Biblioteca

A navegação separa a identidade autorizada do Founder, as bíblias de personagens e a galeria privada de filmes. A Video Engine cria e edita; a Biblioteca mantém os resultados locais.

## Série Kairos: A Hora Certa

A narrativa oficial inicial para os canais da Kairos é uma série curta sobre construir uma empresa com evidência e entregas reais. A bíblia, o arco, o piloto e o processo de blockout estão em `docs/series/KAIROS_SERIES_BIBLE_V0_1.md`. Referências pessoais do Founder ficam privadas.

## Acervo operacional da Gateway

A Biblioteca de filmes agora mostra os vídeos persistidos em `command.content_assets` juntamente com a galeria local. O registro da Gateway guarda provider, modelo, uso devolvido e job de origem. Seedance aceita texto de uma ideia aprovada para o primeiro establishing shot; esse caminho não recebe referências do Founder. Migrations, OIDC, flag e teto de custo continuam obrigatórios. Consulte `docs/modules/SEEDANCE_GATEWAY_V0_1.md`.

## Trilogia audiovisual e press kits

A história ativa de lançamento agora é a [Trilogia Kairos Signal](docs/series/KAIROS_SIGNAL_TRILOGY_V0_1.md): três vídeos verticais que saem de um mundo dentro da tela para uma cena real, sem promessa financeira ou automação fictícia. O [programa de press kits](docs/series/CHARACTER_PRESS_KIT_PROGRAM_V0_1.md) mantém clones autorizados, personagens ficcionais e biblioteca de filmes em domínios separados.

O primeiro teste de vídeo continua sendo um plano textual de 8 segundos. Antes de acionar a Gateway, o Core precisa confirmar a disponibilidade real de `content_jobs`, `content_assets` e do bucket `content-assets`; o uso retornado pelo provedor, e não uma estimativa, decide os próximos planos.

A página **Personagens** agora mostra os primeiros press kits ficcionais de KAIROS e ORION. Eles são referências de direção de arte para os vídeos; clones de pessoas continuam privados e sujeitos a consentimento.

O Content Engine passou a aceitar briefing por job e disponibiliza um template de preenchimento do establishing shot da Kairos Signal. O template não muda o gate de custo nem dá autorização de execução; a origem do job e sua aprovação continuam no servidor.

## Kairos Studio

O menu agora reúne **História, Elenco, Produção e Biblioteca** no [Kairos Studio](docs/modules/KAIROS_STUDIO_V0_1.md). A série ativa fica visível com roteiro e narração; clones pessoais continuam privados, e qualquer produção automática fica pausada até haver provedor, crédito, aprovação e confirmação de publicação.


O Studio agora inclui roteiro integral editável por episódio, cenas, falas e a leitura guiada com referências visuais públicas de KAIROS e ORION. Rascunhos ficam no navegador até se tornarem jobs aprovados; imagens pessoais seguem fora do site público.



## Identidade Kairos Digital

A ampulheta oficial está aplicada à navegação e ao Kairos Studio. Ela é a assinatura do universo audiovisual: violeta, azul elétrico, magenta, vidro e preto profundo. A [bíblia visual do Studio](docs/modules/KAIROS_STUDIO_V0_1.md) orienta personagens e cenários, mantendo os clones pessoais no cofre privado local.


## Kairos Signal coral

O [Kairos Studio](https://kairos-agi-core.vercel.app/?module=studio) traz uma trilogia editável de três episódios de 96 segundos, com conversas entre os personagens da Founder Tower. São roteiros ficcionais: os diálogos explicam a visão da Kairos sem declarar ações reais, vendas, gastos ou agentes executando.


## Produção controlada

Na área Produção do Studio, escolha **Seedance 2.5** para o teste externo isolado ou **Kairos Motion local** para um render sem API. O prompt inicial fica visível e editável antes de virar job. A publicação automática segue bloqueada enquanto o Instagram não comprovar publicação e atendimento em produção.

## Storyboard cinematográfico

O Studio agora inclui uma [leitura visual guiada](docs/series/KAIROS_SIGNAL_STORYBOARD_V0_1.md) para cada episódio da Kairos Signal: direção de câmera, transição, intenção e prompt por quadro. Os cartões ainda não são imagens nem vídeos; eles preparam jobs aprovados sem gastar crédito ou expor clones.

## Storyboard para job sem execução

O Studio permite preparar um quadro para o Content Engine, carregando localmente título, câmera, transição e prompt. O registro do job continua explícito; não houve chamada de Gateway, geração, gasto ou publicação.

## Prompt integral para Seedance

O campo de prompt no Content Engine passou a ser a fonte direta da chamada Seedance para jobs novos. Direção de câmera, restrições de personagens e marca não são reduzidas pelo backend. A chamada externa continua bloqueada até as condições operacionais reais; nenhum vídeo foi gerado nesta mudança.

## Pré-voo real no Content Engine

A área Produção agora mostra os sinais sanitizados de pipeline, bucket, flag Seedance e autenticação da AI Gateway. O painel não presume disponibilidade, saldo ou criação: consulta o deployment e apresenta o estado retornado.

### Orçamento de geração visível

O Kairos Studio mostra o modelo, o prompt, as verificações de pré-voo e o teto de gasto do primeiro take. A previsão é apresentada como limite, não como custo inventado: Seedance 2.5 publica preço por tokens de saída; a cobrança exata é persistida no acervo depois do retorno da Gateway. A direção de arte v0.4 consolida ORION como guardião-ampulheta e KAIROS como pessoa-avatar, aguardando referências autorizadas antes do render do press kit.

## Elenco visual completo da Kairos Signal

O Studio passou a exibir quatro folhas de assets ficcionais que cobrem o elenco do episódio 01: ORION + KAIROS, Instagram AI + QA AI, Hunter AI + Money Hunter e CPO + CFO. Elas ficam em `public/characters/`, carregam a ampulheta Kairos como assinatura e servem de referência para continuidade. Não representam clones humanos, não treinam modelos e não acionam geração de vídeo.
