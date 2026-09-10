# Kairos AGI Core

Ambiente oficial de desenvolvimento da **Kairos Digital**, destinado à construção de uma empresa operada por agentes de IA com supervisão humana.

O documento [KAIROS_AGI_BLUEPRINT_V1.md](KAIROS_AGI_BLUEPRINT_V1.md) é a constituição arquitetural do produto. Novas decisões devem evoluir essa base de forma modular e registrar alterações em [docs/BLUEPRINT_EVOLUTION.md](docs/BLUEPRINT_EVOLUTION.md).

## Estado atual

**Missão 002 — Instagram editorial:** crie e edite ideias, organize datas, avance no pipeline, mantenha prompts e aprove conteúdos pelo Dashboard. Os dados editoriais ficam neste navegador. Analytics são fictícios, imagens/vídeos são briefings e a Graph API está desconectada. Nenhuma publicação automática ocorre.

Comece por [contexto](docs/context/MASTER_CONTEXT.md), [changelog](docs/context/CHANGELOG.md), [fila de missões](docs/context/MISSION_QUEUE.md) e [guia da Engine](docs/modules/INSTAGRAM_ENGINE_V0_2.md). O protocolo para futuras sessões está em AGENTS.md. As missões 003–008 estão planejadas; não estão implementadas.

O Kairos Core v0.1 implementa a primeira Founder Edition funcional com Dashboard, World 3D, Missões, CRM, Instagram Engine e Kairos Coins. Os dados são mockados e nenhuma API externa está conectada. A aplicação está publicada na Vercel Hobby, com deploy automático a partir da branch `main` do GitHub. O backend dedicado ainda aguarda uma vaga no plano Free do Supabase.

- GitHub: <https://github.com/KairosDigitalAGI/kairos-agi-core>
- Produção: <https://kairos-agi-core.vercel.app/>
- Vercel: <https://vercel.com/kairos-digital-s-projects/kairos-agi-core>

## Organização

```text
src/core/         Estado e seletores compartilhados do Kairos Core
src/world/        Founder Tower e agentes em React Three Fiber
src/engines/      Engines operacionais, começando pelo Instagram
src/features/     Dashboard, Missões, CRM e recursos de produto
src/ui/           Componentes visuais reutilizáveis
src/data/mock/    Dados demonstrativos sem informações reais
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
