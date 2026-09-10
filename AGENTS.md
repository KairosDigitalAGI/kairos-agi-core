# Kairos AGI — protocolo de engenharia

Antes de cada missão, ler `docs/context/MASTER_CONTEXT.md`, `docs/context/CHANGELOG.md`, `docs/context/MISSION_QUEUE.md`, `KAIROS_AGI_BLUEPRINT_V1.md` e `ARCHITECTURE.md`.

Evoluir o projeto existente em TypeScript; reutilizar Core, Features, Engines, World, UI e tipos. KAIROS é o robô do Founder; Arthur pertence ao contexto de cliente. ORB significa Operational Runtime Beacon, hardware futuro fora do escopo atual.

Ao concluir uma missão: atualizar contexto, changelog, fila, arquitetura, README e documentação do módulo. Registrar mudanças do Blueprint em docs/BLUEPRINT_EVOLUTION.md. Não remover os documentos de contexto e blueprint; versionar suas evoluções. Informar resultado técnico, arquivos principais, limites, testes, próxima missão e commit.

Trabalhar em planos gratuitos. Não conectar APIs, publicar em redes sociais, contratar serviços ou introduzir despesas sem autorização correspondente. Credenciais e clientes identificados nunca entram em documentação pública. Usar CLIENT_001 etc.

Estado editorial compartilhado no EditorialProvider; regras em engines/instagram/domain.ts. World e Dashboard consomem useFounderAgents. Não duplicar essas regras nos componentes.

Validação da engine: `npm test` (Node 24) e `npm run build`. Dados locais não constituem Vault, autenticação ou auditoria inviolável.
