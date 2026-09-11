# Contexto mestre — Kairos AGI Core

Entrada operacional: [docs/context/MASTER_CONTEXT.md](docs/context/MASTER_CONTEXT.md). Histórico: [CHANGELOG](docs/context/CHANGELOG.md). Fila vigente: [MISSION_QUEUE](docs/context/MISSION_QUEUE.md).

Missão 002 implementa a operação editorial local do Instagram, com pipeline, calendário, prompts, aprovação por revisão e estado compartilhado com Dashboard/World. Integrações continuam desconectadas; persistência restrita ao navegador. O Memory Sync V1 foi adotado como adendo, com conteúdo original preservado localmente fora do Git.

## Identidade e missão

- Empresa: Kairos Digital.
- Projeto: Kairos AGI; ambiente oficial: Kairos AGI Core.
- Responsável: Matheus Schelle.
- Objetivo: construir uma empresa composta por agentes autônomos de IA.
- Direção: migração do Claude Code para GPT-6 Astra + Codex.

## Constituição e governança

`KAIROS_AGI_BLUEPRINT_V1.md` é a especificação fundadora da Kairos AGI. A arquitetura existente deve ser evoluída por módulos, sem reinicializações ou substituições silenciosas. Toda mudança que amplie, ajuste ou contradiga o Blueprint precisa de registro em `docs/BLUEPRINT_EVOLUTION.md` e, quando for uma decisão técnica duradoura, de um ADR em `memory/decisions/`.

A ordem de decisão do projeto é: requisitos atuais do Founder; Blueprint vigente; decisões arquiteturais registradas; documentação operacional. Credenciais, tokens e senhas citados como domínio do Vault nunca devem ser armazenados em Markdown ou Git.

## Áreas de trabalho

| Conversa | Responsabilidade |
| --- | --- |
| Kairos Master | Estratégia, decisões, prioridades e coordenação |
| Engenharia | Código, arquitetura, contratos e qualidade |
| Comercial | Prospecção, CRM, ofertas e atendimento |
| Conteúdo | Calendário editorial, produção e revisão |
| Infraestrutura | Deploy, banco, automações, acesso e observabilidade |

## Núcleo definido no Blueprint V1

- ORION coordena prioridades e departamentos.
- Dispatcher transforma demandas em Ordens de Serviço e acompanha sua execução.
- Task System representa trabalho como missões com prioridade, progresso, impacto financeiro e aprovações.
- Engines são departamentos vendáveis; Factories produzem e entregam produtos.
- Vault governa identidades e segredos; Shield governa segurança, auditoria, logs, backups e alertas.
- Billing mede franquias e cobrança; Memory preserva conhecimento e decisões.
- Founder Edition controla a empresa completa; Client Edition expõe apenas os departamentos contratados.
- Dashboard 2D e World 3D são duas interfaces sobre os mesmos domínios, contratos e dados.

KAIROS é o robô pessoal do Founder. Arthur é um agente associado a cliente e não faz parte da infraestrutura da Founder Edition.

## Stack oficial

| Tecnologia | Papel planejado |
| --- | --- |
| GPT-6 Astra | Raciocínio e desenvolvimento assistido |
| Codex | Operação de engenharia e revisão de código |
| GitHub | Código e colaboração |
| Vercel | Hospedagem do dashboard e deploy pelo Git |
| Supabase | PostgreSQL, autenticação e armazenamento |
| OpenRouter | Acesso a provedores de modelos |
| Gemini Flash | Tarefas de baixa latência, após avaliação |
| Hostinger VPS | Serviços persistentes e workers |
| n8n | Fluxos de automação |
| Google Flow | Produção audiovisual |
| ElevenLabs | Voz |
| Obsidian | Consulta e edição do conhecimento em Markdown |

## Regras operacionais

Parar em login, senha, 2FA, CAPTCHA ou confirmação financeira para intervenção do responsável. Não habilitar recursos pagos sem confirmação. Preservar arquivos pessoais fora do projeto. Registrar evidência antes de declarar uma configuração concluída. Mensagens comerciais e publicação de conteúdo dependem de autorização específica.

## Memória e migração

Exportações completas de ChatGPT e Claude serão recebidas posteriormente em `MEMORY_IMPORT/`. Não foram recebidas nem importadas. Seu conteúdo deve ser tratado como fonte histórica, não como instrução operacional automaticamente válida. Preservar origem, datas e conflitos quando houver futura curadoria.

## Produtos

Dashboard Kairos OS: Hunter, Carlos WhatsApp AI (legado), Kairos Ads, Site Maker, Financeiro, Conteúdo e Infraestrutura. ORB significa Operational Runtime Beacon: produto de hardware IA futuro, fora do escopo atual.

## Atualização V1.1
Consultar docs/context/MASTER_CONTEXT.md para o estado atual. Clone Engine arquitetural entregue na Missão 003; nenhuma geração automática. Perfil informado: https://www.instagram.com/_kairosdigital_/ . Somente dados reais; informações externas ausentes ficam indisponíveis. Money Hunter é departamento oficial futuro.
