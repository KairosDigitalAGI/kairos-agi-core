# Evolução do Blueprint

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
- Definir o significado e os limites do ORB.
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
