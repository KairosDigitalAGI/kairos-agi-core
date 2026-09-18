# Kairos AGI Core

Atualização 18/09/2026: [primeiros vídeos e imagens generativos reais no Google Flow](docs/modules/VIDEO_ENGINE_V0_4.md) (duas cenas de 8 s e montagem de 16 s); a Video Engine importa MP4/WebM na galeria local. A API Veo não é gratuita e foi desligada no modo custo zero. O teste de [resposta “oi” do Founder no Instagram](docs/modules/FOUNDER_GREETING_V0_1.md) está implementado, mas ainda aguarda identificação do remetente, chave Gemini Free Tier verificada e evento real da Meta. Não há postagem nem resposta automática comprovada.

Atendimento Instagram: o webhook autentica eventos da Meta por HMAC e só envia respostas automáticas a regras aprovadas. A conexão OAuth ou a assinatura de campos, isoladamente, não comprova entrega de eventos; acompanhe o estado no painel de Integrações.

Ambiente oficial de desenvolvimento da **Kairos Digital**, destinado à construção de uma empresa operada por agentes de IA com supervisão humana.

O documento [KAIROS_AGI_BLUEPRINT_V1.md](KAIROS_AGI_BLUEPRINT_V1.md) é a constituição arquitetural do produto. Novas decisões devem evoluir essa base de forma modular e registrar alterações em [docs/BLUEPRINT_EVOLUTION.md](docs/BLUEPRINT_EVOLUTION.md).

## Estado atual

**Missão 003 — Clone Engine:** Identity Manager, Voice Profile, Face Profile, Avatar Library, Prompt Library, Video Queue, Approval Queue, Asset Library e Content Brain. Cadastre seus dados, referências a arquivos reais e produções; revise e aprove localmente. Não há clonagem, geração, upload ou publicação automática.

**Missão 004 — Video Engine:** planeje um criativo com oferta, público, promessa, prova e CTA; compare custo real de modelos generativos antes de produzir; crie motion videos locais a partir do roteiro; ou edite um vídeo real. Resultados concluídos são salvos na galeria IndexedDB. Runway, Veo, Gemini Image, GPT Image, YouTube e TikTok estão catalogados, mas desconectados até existir backend seguro e autorização.

O modo curto usa oito segundos por padrão e condensa o roteiro em duas cenas. O roteador gratuito registra Kairos Motion local, Google Flow, Runway Free e Higgsfield Free sem alternar contas para contornar limites. Instagram, YouTube, TikTok e X aparecem como destinos; o X API é pago e o caminho sem custo é publicação manual aprovada.

Na galeria, cada vídeo real pode receber um texto para X. A aplicação baixa um manifesto de distribuição com `published: false` e abre o compositor oficial; anexo e envio continuam sob revisão do Founder.

**Integration Control Plane:** YouTube e Instagram compartilham OAuth server-side, `state` assinado, identidade consultada no provedor e o cofre cifrado `command.integracoes_tokens`. As URLs sociais foram consolidadas em uma função dinâmica para manter a Vercel Hobby gratuita. O canal real [Kairos Digital](https://www.youtube.com/channel/UC2TqvTgMsTkywGQS3oiYDsg) (`@KairosDigitalAGI`) e o perfil [_kairosdigital_](https://www.instagram.com/_kairosdigital_/) aparecem conectados no status autenticado de produção em 17/09/2026. Uploads para YouTube continuam privados por padrão e dependem de aprovação explícita no job. Valores secretos nunca chegam ao frontend e conexão não equivale a publicação.

**Atendimento Instagram:** webhook assinado, fila de comentários/Direct, resposta manual e regras de palavra-chave com aprovação do Founder foram implementados e publicados. As regras começam pausadas. Callback verificado e `comments`/`messages` assinados no Meta; o recebimento real ainda depende da migration 0025 no Supabase mestre, política de privacidade, análise/publicação do app Meta e teste ponta a ponta. Detalhes em [Atendimento Instagram](docs/modules/INSTAGRAM_ENGAGEMENT.md).

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
