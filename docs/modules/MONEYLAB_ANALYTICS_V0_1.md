# Money Lab e Analytics v0.1

## Propósito

O Money Lab organiza a decisão comercial sem transformar intenção em caixa. O Analytics lê apenas as rotas autenticadas já existentes do Painel Operacional: `/api/business-metrics` e `/api/agent-status`.

## Fontes e limites

- Receita, MRR e clientes só aparecem quando o servidor retorna `source: "real"`.
- Estado da frota e alertas só aparecem quando `agent-status` retorna fonte real.
- A fila do Money Hunter é local ao navegador e serve para organizar oportunidades observadas. Ela não é CRM, contrato, receita, automação de contato ou evidência de envio.
- Instagram e YouTube seguem com métricas indisponíveis até suas APIs autorizadas exporem leituras verificáveis neste Core.

## Hunter e descoberta

`api/hunter.mjs` aceita somente `POST` autenticado e usa `api/_freelancerDiscovery.js`. O adaptador exige `FREELANCER_API_ACCESS_TOKEN` e `FREELANCER_API_PROJECTS_URL` apenas no servidor. Não há endpoint presumido, scraping, login automatizado, criação de lances, mensagens ou contato com cliente. Sem configuração válida, responde 503 com o motivo.

## Próximo incremento

Adicionar adaptadores oficiais aprovados, cada um com prova de origem, importação revisável e gate explícito antes de gerar ou enviar proposta. Persistir a fila no servidor somente quando houver schema, autenticação e política de retenção definidos.
