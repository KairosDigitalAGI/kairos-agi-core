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
