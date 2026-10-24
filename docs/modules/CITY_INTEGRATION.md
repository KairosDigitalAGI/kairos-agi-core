# Cidade Inteligente como entrada do Kairos AGI

Em 24/10/2026, a cidade da VPS passou a apresentar o Core em um portal interno e um indicador do Maestro que lê `activeRuns`. A mesa abre threads manuais no Maestro e permite escolher clones editáveis de `agi-core` e `cidade` no sandbox. Os personagens visuais não são prova de processos ativos; `/threads` e `/thread` são a fonte observada de execução e custo.

Fonte: repositório privado `matheusschelle/kairos-ecossistema-vivo`, commits `a058738`, `2367164` e `62a0584`. O código do Maestro foi versionado ali e instalado na VPS com backup e verificação de `/health` e `/workspaces`. A tela inicial oferece acesso à mesa e ao Core antes do término do 3D. As alterações locais anteriores em `dados.js` e `inventario.js` foram preservadas. O processo `kairos-world` duplicado no PM2 foi removido; o servidor da cidade permanece atendendo 8790, com watchdog do cron a cada minuto.

O Core segue hospedado e autenticado separadamente. O portal é integração de navegação; não copia o banco Supabase nem cria autorização cruzada. O Maestro aceita apenas workspaces conhecidos, mas CORS é proteção para navegador, não autenticação. O executor ainda usa as permissões de filesystem do processo na VPS. `headroom:false` indica que o proxy de cota não respondeu; há custo observado em threads anteriores. Nenhuma tarefa de IA foi iniciada nesta entrega e nenhum agendamento 24/7 de IA paga foi ativado.

Próximo contrato: ordem de serviço autenticada Core → Maestro, recibos de estado e custo, isolamento real do processo, teto de orçamento e kill-switch testado. Só depois tratar uma rotina contínua como executor operacional. A migration 0028 do CRM é independente e permanece pendente.

## Terminais privados — Missão 046

`terminais.html` é aberto pela barra da cidade, pela mesa e pelo computador do Founder ao sentar. Após login privado, o Founder vê workspaces, disponibilidade de Claude Code/Codex, sessões tmux abertas e saída do terminal. Texto enviado ao terminal é explícito; a página não inicia tarefas. Claude Code 2.1.309 está autenticado na VPS; Codex CLI 0.164.0 está instalado e precisa de `codex login --device-auth`. A própria página pode iniciar o fluxo e mostrar o código para o Founder concluir no ChatGPT.

Projetos de clientes são pastas e registros privados por código `CLIENT_001`, selecionáveis na mesa. O agrupamento visual existe na lista de terminais, ainda não como prédios dinâmicos do mundo 3D. O navegador guarda a autenticação só na sessão da aba; o hash scrypt reside apenas no config privado do Maestro. O terminal roda como o usuário do Maestro, portanto não serve como sandbox de sistema operacional. Não houve execução de tarefa de IA nesse teste: o smoke abriu e encerrou uma sessão vazia. O resumo deste trabalho foi salvo manualmente no Obsidian e confirmado em `/api/obsidian`. O login Codex não concede acesso ao histórico de conversas do app ChatGPT; transferência automática desse histórico não foi implementada.

Após a revisão de segurança, todas as rotas legadas do Maestro que executam comandos ou expõem tarefas, arquivos e ações do app exigem o mesmo login privado. `/health` e a lista básica `/workspaces` seguem legíveis dentro do Tailnet. A mesa de voz pede credenciais antes de enviar ou abrir histórico; chamada sem login retorna 401. Essa autenticação não substitui o isolamento do processo no sistema operacional.

O Core publica leitura autenticada e restrita da fila técnica em `GET /api/hunter?action=dev-requests`. A cidade faz proxy de servidor para servidor usando a credencial que o Founder acabou de validar na mesa; não guarda essa credencial em configuração permanente. A interface mostra pedidos reais e só prepara o texto no terminal escolhido. A confirmação do pedido continua regida pela fila original; nenhuma tarefa é enviada à IA só por aparecer na lista. A devolução de eventos e resultado à fila ainda não existe.

Em produção, a rota do Core e a ponte da cidade retornaram 1 pedido no momento do teste; a chamada sem login retornou 401. Cidade commit `3690c7b`, Core commit `cce9078`.

## Cofre mestre e presença real — 24/10/2026

O Kairos Command lê o repositório privado `kairos-brain` pelo GitHub. A cidade agora lê uma cópia desse mesmo cofre na VPS, atualizada por `git pull --ff-only` a cada cinco minutos quando limpa. A instância foi verificada com 48 notas; a pasta legada de 8 notas foi preservada. O grafo possui cache de cinco minutos. O painel **Infraestrutura ao vivo** verifica n8n e Maestro localmente; acesso ao Command é linkado, mas seus dados operacionais ainda não foram importados para a cidade.

No Escritório, uma sessão só entra como terminal quando o tmux correspondente existe. Duas sessões Claude Code reais foram abertas, uma para `cidade` e outra para `agi-core`, ambas **aguardando**: iniciar o CLI sem pedido não comprova trabalho nem consome uma tarefa de IA. Clicar no monitor permite conversar no terminal correto. Conversas `.jsonl` antigas deixaram de manter avatares falsamente ativos; o Codex deste app no computador do Founder continua sem sincronização automática à VPS. O Codex CLI da VPS precisa de login.

Fonte: cidade commit `465afb5`; cofre privado commit `24e7473`. Fluxos n8n, dados Supabase/Command, atendimento WhatsApp, publicação e entrega ao cliente ainda exigem contratos autenticados, isolamento por cliente, recibo de execução, revisão humana e testes com dados reais. Nenhuma dessas ações foi ativada por esta integração.
## Catálogo GitHub e Vercel — 24/10/2026

A Cidade recebeu catálogo privado de repositórios GitHub autorizados. O sincronizador prepara cópias por `clone`/`fetch` e interrompe a atualização se a worktree estiver suja; não envia código, não força checkout e não cria deployment. Um projeto manual sem origem Git fica pendente/restrito e não libera uma sessão Claude Code/Codex.

A mesa privada oferece o login oficial da Vercel por sessão tmux exclusiva, com estado obtido de `vercel whoami`. A tela não persiste senha, token ou cartão. O login é condição técnica, não consentimento de operação: a escolha da conta/time, criação de repositório, criação de projeto Vercel e publicação devem ser fluxos explícitos, separados e revisáveis. O Maestro real foi atualizado com backup, checks de sintaxe e healthcheck 200; a rota continua recusando acesso sem autenticação privada.
