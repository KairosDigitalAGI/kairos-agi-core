# Cidade Inteligente como entrada do Kairos AGI

Em 24/10/2026, a cidade da VPS passou a apresentar o Core em um portal interno e um indicador do Maestro que lê `activeRuns`. A mesa abre threads manuais no Maestro e permite escolher clones editáveis de `agi-core` e `cidade` no sandbox. Os personagens visuais não são prova de processos ativos; `/threads` e `/thread` são a fonte observada de execução e custo.

Fonte: repositório privado `matheusschelle/kairos-ecossistema-vivo`, commits `a058738`, `2367164` e `62a0584`. O código do Maestro foi versionado ali e instalado na VPS com backup e verificação de `/health` e `/workspaces`. A tela inicial oferece acesso à mesa e ao Core antes do término do 3D. As alterações locais anteriores em `dados.js` e `inventario.js` foram preservadas. O processo `kairos-world` duplicado no PM2 foi removido; o servidor da cidade permanece atendendo 8790, com watchdog do cron a cada minuto.

O Core segue hospedado e autenticado separadamente. O portal é integração de navegação; não copia o banco Supabase nem cria autorização cruzada. O Maestro aceita apenas workspaces conhecidos, mas CORS é proteção para navegador, não autenticação. O executor ainda usa as permissões de filesystem do processo na VPS. `headroom:false` indica que o proxy de cota não respondeu; há custo observado em threads anteriores. Nenhuma tarefa de IA foi iniciada nesta entrega e nenhum agendamento 24/7 de IA paga foi ativado.

Próximo contrato: ordem de serviço autenticada Core → Maestro, recibos de estado e custo, isolamento real do processo, teto de orçamento e kill-switch testado. Só depois tratar uma rotina contínua como executor operacional. A migration 0028 do CRM é independente e permanece pendente.
