# Contexto operacional

## Leitura
A identidade, stack e regras fundadoras permanecem no [MASTER_CONTEXT da raiz](../../MASTER_CONTEXT.md). A constituição está em [Blueprint V1](../../KAIROS_AGI_BLUEPRINT_V1.md); o adendo adotado está em [Memory Sync V1](../../KAIROS_MEMORY_SYNC_V1.md). Este documento é a entrada operacional, sem duplicar a constituição.

## Estado após Missão 002
- Missão 001: aplicação React/Vite/TypeScript com Dashboard, World, CRM e Tasks demonstrativos.
- Missão 002: criação e edição de ideias, pipeline de oito etapas, calendário, prompts, revisão e aprovação compartilhadas entre Instagram e Dashboard.
- Dados editoriais persistem no localStorage deste navegador, chave kairos.editorial.v1. Não há sincronização entre abas/dispositivos ou contas; usar uma aba de edição por vez.
- Aprovação pertence a uma revisão. Qualquer edição invalida aprovação. A fila Publicação contém aprovados ainda não publicados.
- Analytics são fictícios, não métricas da conta. Imagem e vídeo são briefings textuais, não mídia gerada.
- KAIROS é o robô do Founder. Arthur não participa da Founder Edition.
- ORB = Operational Runtime Beacon, hardware futuro.
- APIs, banco, Vault real, autenticação e modelos de IA permanecem desconectados.

## Operação
Começar por [fila](MISSION_QUEUE.md) e [histórico](CHANGELOG.md). Evoluir os módulos existentes e documentar todas as mudanças. Manter custo zero. Não confundir estado editorial local com produção autônoma.
