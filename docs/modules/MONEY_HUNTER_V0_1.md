# Money Hunter v0.1 — Central de Demandas

## Objetivo

Converter uma oportunidade observada em fonte autorizada em uma fila comercial rastreável: triagem, qualificação, proposta pronta e acompanhamento de resposta.

## Implementado

- Página `Hunter` no Founder OS, com fundo 3D contextual já existente.
- Captura local de título, fonte, link, orçamento informado e escopo observado.
- Quatro etapas de trabalho e inspector de oportunidade.
- Link de retorno à fonte e avanço explícito da fila local.

## Limites deliberados

- Não há robô de scraping, login de plataforma, envio de proposta, mensagem de WhatsApp ou contratação.
- Dados capturados vivem na sessão do navegador; não constituem CRM, Vault ou auditoria.
- O módulo não calcula chance, margem, receita ou Score Kairos quando a fonte não os fornece.
- Uma etapa “aguardando resposta” só representa organização local; confirmação real deve ser registrada pela plataforma.

## Próxima evolução

Conectar fontes que tenham API ou exportação autorizada, persistir oportunidades no backend, gerar rascunhos de proposta com fontes e histórico e exigir aprovação antes de qualquer comunicação externa.

## Persistência local v0.2

As oportunidades capturadas agora são salvas em `localStorage` versionado (`kairos.hunter.opportunities.v1`) e recuperadas depois de recarregar. `domain.ts` concentra a criação e as transições permitidas; `storage.ts` valida registros antes de carregá-los. Isso preserva trabalho real no navegador, mas ainda não equivale a CRM compartilhado, banco, auditoria de servidor ou integração com uma plataforma.
