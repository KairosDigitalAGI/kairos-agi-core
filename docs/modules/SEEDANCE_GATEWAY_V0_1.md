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

## Biblioteca operacional e fluxo textual

A Biblioteca de filmes agora reúne duas fontes sem misturá-las: os arquivos locais da Video Engine continuam em IndexedDB, enquanto `content_assets` mostra os vídeos gerados por providers no Supabase. Cada ativo operacional exibe o job de origem, provider, modelo e indicação de uso retornado; ausência de dado continua sendo ausência, não custo estimado.

Seedance pode partir diretamente de uma ideia aprovada usando texto, para o establishing shot inicial. Esse caminho não envia press kit, voz, imagem ou material biométrico do Founder. O botão só chama o servidor; o servidor mantém a flag, OIDC, teto e guarda de aprovação.

## 23/09/2026 — Briefing de trilogia acionável

O Content Engine agora aceita briefing textual ao registrar uma ideia e oferece o botão **Preparar teste Kairos Signal**. Ele apenas preenche título e briefing do establishing shot textual; o Founder ainda precisa registrar o job, aprová-lo e encontrar os guards de schema, flag, OIDC e orçamento antes de qualquer chamada da Gateway.


## Direção de câmera do primeiro take

O prompt visível no Content Engine inclui macro de partículas e textura de vidro, dolly-out e espaço para a marca adicionada na pós-produção. A gramática de câmera completa está no documento da série. O primeiro take permanece sem pessoa, rosto, voz ou referência biométrica.

## Integridade do prompt Seedance

A rota Gateway usa primeiro `briefing.roteiro` (depois `videoPrompt` ou `prompt`) como texto integral do modelo. O fallback descritivo serve somente para jobs legados que não tenham prompt explícito. Assim, o texto visível e aprovado no Studio é o mesmo material enviado à Gateway quando todos os gates forem atendidos.

## Pré-voo verificável

`GET /api/content-readiness` devolve somente sinais sanitizados de pré-voo: acesso ao pipeline, bucket, flag isolada e autenticação da Gateway. Ele não retorna credenciais nem cria jobs. O Content Engine o mostra antes da criação para que o Founder veja a diferença entre uma rota preparada e uma rota realmente habilitada.

## 24/09/2026 — orçamento visível e identidade de personagens

A rota Seedance 2.5 agora apresenta no Content Engine o intervalo de gasto do primeiro take, o teto da chave e o preço público do modelo. A tarifa é por tokens de saída; não há preço fixo público por segundo, logo o custo realizado é anotado apenas após a resposta do provider. A nova direção de arte adota ORION como guardião-ampulheta e KAIROS como pessoa-avatar. A geração do press kit depende de referências autorizadas; referências pessoais não são enviadas sem consentimento específico.
