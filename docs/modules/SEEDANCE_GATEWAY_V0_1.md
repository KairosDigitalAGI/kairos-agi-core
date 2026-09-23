# Seedance via Vercel AI Gateway v0.1

## Objetivo

Este adaptador gera um único clipe Seedance 2.5 a partir de um job real do Content Engine. Ele existe para o primeiro teste vertical de 8 segundos da série **Kairos: A Hora Certa** sem abrir os demais provedores pagos.

## Conexão e credenciais

O deployment da Vercel autentica na AI Gateway pelo `VERCEL_OIDC_TOKEN` injetado pela própria plataforma. Nenhuma chave da Gateway é gravada no repositório, no frontend ou na documentação. Há uma chave de contingência criada no painel da Vercel com teto único de US$ 5 e sem recarga; ela não foi copiada para este Core porque o OIDC é o caminho preferencial.

O MCP oficial da Higgsfield continua fora deste runtime: ele precisa ser conectado pela conta Higgsfield no cliente que oferece o MCP. A integração Higgsfield usa créditos da conta do provedor, portanto não aproveita automaticamente a cota da Vercel.

## Guardas antes de qualquer chamada

1. As migrations `0020_content_engine.sql` e `0022_content_assets_bucket.sql` do repositório `kairos-command` precisam estar aplicadas no Supabase mestre.
2. O job real precisa estar na etapa `imagem` e ter `aprovado:true`.
3. Somente `KAIROS_ENABLE_SEEDANCE_GATEWAY=true` libera o tier `gateway`. Essa flag não libera OpenAI nem fal.ai.
4. A AI Gateway precisa receber OIDC no deployment ou uma chave de Gateway limitada no servidor.
5. Não há retry automático. Erro do provider interrompe o job e registra a falha ao invés de consumir outra tentativa.

O primeiro teste não envia rosto, voz ou press kit do Founder: é um establishing shot textual da Founder Tower. Referências biométricas exigem autorização específica e armazenamento privado antes de qualquer upload.

## Configuração do clipe inicial

- Modelo: `bytedance/seedance-2.5`
- Formato: 9:16, 1280×720, 8 segundos, áudio gerado
- Destino: bucket operacional `content-assets` do Supabase, após o provider devolver o arquivo
- Publicação: nenhuma. O clipe entra em `content_assets` e continua sujeito à aprovação de publicação existente.

## Custo e limite

A Vercel lista o Seedance 2.5 a **US$ 10,70 por 1 milhão de tokens de saída gerados**. A cobrança exata de um clipe depende do uso devolvido pela Gateway; o Core persiste `usage` no asset para auditoria e não estima um valor fictício antes da resposta. A Vercel informa que contas elegíveis sem pagamento podem receber US$ 5 em créditos a cada 30 dias, mas a elegibilidade e o saldo são confirmados apenas no painel/resposta da conta.

O teto de US$ 5 criado na chave impede gasto acima desse valor e não compra créditos nem renova automaticamente. Não há pagamento pendente para esse teste. Se a conta não tiver crédito elegível ou se a geração exceder o teto, a Gateway recusará a chamada; o Kairos não faz top-up nem tenta outro provedor.

Fontes oficiais: [modelo Seedance 2.5](https://vercel.com/ai-gateway/models/seedance-2.5), [preços da AI Gateway](https://vercel.com/docs/ai-gateway/pricing), [autenticação OIDC](https://vercel.com/docs/ai-gateway/authentication-and-byok) e [orçamentos](https://vercel.com/docs/ai-gateway/observability-and-spend/budgets).

## Próximo passo operacional

Aplicar as duas migrations pendentes, criar e aprovar o job do establishing shot e ativar temporariamente apenas `KAIROS_ENABLE_SEEDANCE_GATEWAY=true` no ambiente Production. Depois de uma única chamada bem-sucedida ou recusada, desligar a flag e conferir o `usage` retornado antes de qualquer nova geração.
