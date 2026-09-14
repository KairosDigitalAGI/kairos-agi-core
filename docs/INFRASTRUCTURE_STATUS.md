# Estado da infraestrutura

Atualizado em 10 de setembro de 2026.

| Componente | Estado | Plano/custo | Referência |
| --- | --- | --- | --- |
| ChatGPT Project | Ativo | Plus atual | Kairos Master, Engenharia, Comercial, Conteúdo e Infraestrutura |
| GitHub | Ativo | Gratuito; repositório público | <https://github.com/KairosDigitalAGI/kairos-agi-core> |
| Codex local | Ativo | Conta atual | Checkout local ligado a `origin/main` |
| Codex web | Pendente | Sem compra | Autorização do conector GitHub não conclui no fluxo web |
| Vercel | Ativo | Hobby gratuito | <https://kairos-agi-core.vercel.app/> |
| Deploy automático | Ativo | Incluído no Hobby | Commits em `main` geram deployments |
| Supabase | Em uso (leitura + escrita) | Free, projeto do kairos-command | Fase 1/2 da Missão 006 leem schema `command` via Service Role, server-side; Fase 3 grava `command.content_jobs` (ideias do Founder); Fase 4 grava `command.integracoes_tokens` (tokens OAuth cifrados). Migrations `0020_content_engine.sql` e `0021_integracoes_tokens.sql` redigidas, pendentes de aplicar em produção pelo Founder. Nenhum projeto pausado, criado ou alterado |
| Google Cloud (OAuth Client, YouTube Data API) | Pendente | Free (cota gratuita do Google) | Fase 4 da Missão 006 (integração do YouTube) espera o Founder criar um OAuth Client Web em <https://console.cloud.google.com/apis/credentials> e habilitar a YouTube Data API v3 — criação de conta/console é proibida para o agente. Sem isso, `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_OAUTH_REDIRECT_URI` ficam ausentes e a conexão falha fechado com esse motivo |
| OpenAI (ChatGPT/API) | Ativo | Plano pago do Founder | Prioridade para agentes que operam a empresa (chat, Content Engine) |
| Anthropic (Claude) | Ativo | Plano pago do Founder | Prioridade junto com OpenAI para agentes que operam a empresa |
| OpenRouter | Reserva | Créditos | Usar só quando os planos OpenAI/Anthropic não cobrirem o caso; não é o default |

## Política de custo

Usar planos gratuitos e alternativas de custo zero ou quase zero. Não habilitar upgrades, add-ons, consumo pago ou compromissos financeiros sem autorização explícita do responsável.

Para os agentes que operam a empresa (14/09/2026): priorizar os planos pagos já assinados pelo Founder — OpenAI (GPT) e Anthropic (Claude). OpenRouter e seus créditos ficam como reserva de último caso, não como escolha padrão de modelo.
