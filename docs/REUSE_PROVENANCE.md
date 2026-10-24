# Proveniência do reaproveitamento

Reutilização solicitada explicitamente pelo Founder em 11/09/2026. Somente código de apresentação sem dados pessoais, credenciais, rotas privadas ou telemetria foi adaptado para o Core público. Repositórios originais não foram alterados.

## kairos-os
Fonte: https://github.com/matheusschelle/kairos-os/blob/7113aac7ea727090ebf714e889b2df353d6f6233/dashboards/founder/world/world.js

Commit: `7113aac7ea727090ebf714e889b2df353d6f6233`. Blob: `9692fad0d06ab5d0d84328b05377f92e7a03d721`.

## kairos-command
Fonte: https://github.com/matheusschelle/kairos-command/blob/686bdff72848573b36e9d7e1ca4093310b81e702/src/components/ui.tsx

Commit: `686bdff72848573b36e9d7e1ca4093310b81e702`. Blob: `bedb74fc39835ad4be21e596880e385c9d278459`.

## Adaptação concreta
- `src/world/legacy/officeGeometry.js`: disposição de 16 estações, paredes, faixas neon, corredor e móveis instanciados extraídos do escritório do kairos-os. Grupo Three.js isolado, materiais parametrizados por departamento e descarte de recursos. Mesa circular adaptada. Nenhum DEMO_METRICS, loader, fetch, agente simulado ou comunicação foi trazido.
- `src/world/OfficeGeometry.tsx`: encapsula a geometria no React Three Fiber. Compartilhada pelo fundo 2D e ambiente visitável.
- `src/ui/EmptyState.tsx`: adaptação do componente EmptyState do kairos-command, usando CSS e ícones existentes em vez de depender de Tailwind e tipos privados.
- `src/world/DepartmentBackdrop.tsx`: novo adaptador de câmera por departamento; transição com render sob demanda, limite de resolução e fallback sem WebGL.

A triagem dos demais repositórios está no relatório privado local. Não afirmar que todo o acervo foi fundido ou executado. Componentes de vídeo/CRM/financeiro do Command ainda exigem adaptadores autenticados e não foram conectados nesta missão.

## Organograma e reuniões
Cadastro consultado no GitHub em 11/09/2026: [data/agents/agents.json](https://github.com/matheusschelle/kairos-os/blob/7113aac7ea727090ebf714e889b2df353d6f6233/data/agents/agents.json). Quinze papéis preservados com sourceId; quatro modelos de reunião preservados. Metadados de implementação são declarações da origem, sem execução ou confirmação de conectividade neste Core. Doze papéis adicionais vêm do Blueprint e adendos e têm origem identificada separadamente.

## Video Engine
Capacidades e limites foram estudados no `kairos3/video-skill` no commit inventariado pela auditoria privada. O Core implementa código novo compatível com o navegador para corte, composição, áudio e download. Não copia credenciais, configuração, integrações de WhatsApp, transcrição ou chamadas do motor legado. O worker FFmpeg permanece no repositório de origem.

A correção generativa acrescenta código novo de storyboard e motion graphics em Canvas. Ela reaproveita a separação entre planejamento, render e entrega observada nos repositórios, mas não copia nem apresenta como conectados modelos ou serviços externos.

## CRM e control plane

O schema `command` e o contrato REST com `Accept-Profile`/`Content-Profile` seguem o control plane do `kairos-command` no commit `d92c53e`. A migration `0026_kairos_crm_dev_queue.sql` foi acrescentada ao repositório correspondente. A normalização do banco legado da VPS, a ponte idempotente e a UI do CRM são implementações novas deste Core; nenhum telefone, sessão ou histórico foi copiado para o Git.

## Cidade Inteligente — 24/10/2026

Fonte: `matheusschelle/kairos-ecossistema-vivo`, commits `a058738`, `2367164` e `62a0584`, implantados na VPS da cidade. O portal incorpora visualmente o Kairos AGI Core existente; a mesa reaproveita o Maestro da VPS e adiciona workspaces em clones separados. Nenhum componente do Core foi copiado para uma segunda fonte de verdade. A correspondência entre personagem e processo permanece explícita e não é inferida da cena 3D.

A Missão 046 evoluiu a mesma fonte privada nos commits `506e234` e `f2e91ec`: sessões tmux por projeto, terminal de navegador e catálogo de projetos de cliente. O Core registra a integração e seus limites; não importa configurações, credenciais, clientes nem histórico privado da VPS.

O commit `f312668` da mesma fonte protegeu também as rotas legadas do Maestro. A configuração de autenticação permanece na VPS privada.

O commit `3690c7b` da cidade apresenta a fila técnica do Core através do Maestro sem copiar o CRM inteiro nem armazenar credenciais no repositório.

O commit `465afb5` da cidade reutiliza o Maestro e as sessões tmux reais no Escritório, acrescenta interação com o terminal e observa a saúde local do n8n. A fonte do Obsidian é o repositório privado `matheusschelle/kairos-brain`, commit `24e7473`, já usado pelo Kairos Command; a cópia de leitura fica na VPS. Não foram importados dados transacionais ou credenciais do Command para o Core.

