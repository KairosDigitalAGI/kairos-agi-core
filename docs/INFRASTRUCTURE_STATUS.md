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
| Supabase | Em uso (leitura + escrita + Storage) | Free, projeto do kairos-command | Migrations `0020`, `0021` e `0022` aplicadas e verificadas em produção em 14/09/2026. `command.integracoes_tokens` recebe somente tokens cifrados via service role. |
| Google Cloud (OAuth Client, YouTube Data API) | Configurado; consentimento pendente | Free (cota gratuita do Google) | `GOOGLE_CLIENT_ID`/`SECRET`/`OAUTH_REDIRECT_URI` estão na Vercel. Falta concluir e validar o consentimento do canal real. |
| Meta / Instagram API | Aplicativo pendente | Free | O Core suporta Instagram Login profissional. Faltam `META_APP_ID`, `META_APP_SECRET`, `META_OAUTH_REDIRECT_URI` e o consentimento da conta `_kairosdigital_`. |
| OpenAI (ChatGPT/API) | Ativo | Plano pago do Founder | Prioridade para agentes que operam a empresa (chat, Content Engine) |
| Anthropic (Claude) | Ativo | Plano pago do Founder | Prioridade junto com OpenAI para agentes que operam a empresa |
| OpenRouter | Reserva | Créditos | Usar só quando os planos OpenAI/Anthropic não cobrirem o caso; não é o default |

## Política de custo

Usar planos gratuitos e alternativas de custo zero ou quase zero. Não habilitar upgrades, add-ons, consumo pago ou compromissos financeiros sem autorização explícita do responsável.

Para os agentes que operam a empresa (14/09/2026): priorizar os planos pagos já assinados pelo Founder — OpenAI (GPT) e Anthropic (Claude). OpenRouter e seus créditos ficam como reserva de último caso, não como escolha padrão de modelo.
