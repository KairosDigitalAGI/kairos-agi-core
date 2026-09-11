# Segurança

Vault é domínio futuro de segredos; nunca armazenar tokens no Git ou frontend. Shield reúne logs, backups, monitoramento e controle de acesso. Identidades de clientes em documentos públicos usam CLIENT_001 etc. Edições no arquivo atual não removem exposição em commits antigos.

A Graph API deverá ser conectada via servidor, com autorização do Founder, segredos privados, escopos mínimos, versão da API verificada, testes de conta e aprovação da revisão exata antes de publicar. O adapter atual sempre rejeita publicação. Aprovações locais são recurso de protótipo sem autenticação ou resistência a adulteração.

## V1.1
Vault permanece vazio. Não armazenar segredos em catálogos, arquivos públicos ou localStorage. Registros de Clone são declarações locais sem autenticação; não autorizam chamadas no servidor. Documentação bruta e auditoria de repositórios privados ficam em memory/private/, ignorada pelo Git.
