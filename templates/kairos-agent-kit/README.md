# Kairos Agent Kit Template

Base reutilizável para um agente KAIROS. Este template não contém runtime de cliente, credenciais, sessão de mensageria, histórico ou dados de CRM.

## Camadas

- `src/config`: valida nomes de configuração e falha quando estiver incompleta.
- `src/core`: contrato de evento e resposta do agente.
- `src/skills`: registro declarativo de capacidades por instalação.
- `src/tenancy`: contexto isolado por Founder ou cliente.
- `src/audit`: eventos operacionais sem conteúdo sensível.

Antes de ativar um canal, crie um ambiente isolado e uma revisão humana de mensagens externas. O WhatsApp é opcional e requer reconexão oficial por instalação.