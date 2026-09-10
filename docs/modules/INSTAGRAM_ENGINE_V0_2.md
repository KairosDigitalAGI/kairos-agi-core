# Instagram Engine — Missão 002

## Fluxo
Nova ideia exige título e tema. Categoria, prioridade e data alimentam filtros e calendário. O editor guarda pesquisa, roteiro, briefing de imagem, briefing de vídeo e legenda.

Etapas: Ideia → Pesquisa → Roteiro → Imagem → Vídeo → Legenda → Aprovação → Publicação. Avançar exige o material da etapa. Aprovação não pode ser pulada pelo botão Avançar. O Founder lê todos os campos, aprova a revisão ou solicita ajustes com motivo obrigatório; ajustes retornam ao roteiro. Edição invalida a aprovação e, se já estava na fila de publicação, retorna à legenda.

Publicação significa fila aprovada bloqueada pela API desconectada. Nenhum conteúdo é enviado à Meta. Briefings não são arquivos de imagem/vídeo; a produção é manual nesta missão.

## Estado
EditorialProvider monta uma única instância acima de App. Dados persistem em localStorage (kairos.editorial.v1); navegação entre módulos não perde edições. Formato inválido gera aviso e mantém dados originais sem sobrescrever. Falha de gravação é informada e conserva o estado em memória. Não há sincronização entre abas/dispositivos; editar em uma aba por vez. Não usar esta camada para dados sensíveis.

ApprovalQueue é reutilizada no Instagram e Dashboard. useFounderAgents deriva o status de Instagram AI da mesma fila e o World recebe os agentes por props. Demais métricas da Missão 001 continuam mocks.

## Prompts e calendário
Prompts podem ser criados, editados e copiados. Variáveis textuais como {{tema}} são instruções para preenchimento manual; nenhum LLM é executado. Calendário ordena datas editoriais e agrupa itens sem data ao final; não agenda posts remotamente.

## Integração futura
InstagramGateway estabelece o limite de domínio. disconnectedGateway.publish rejeita sempre, sem requests ou credenciais. Futuro adapter será no servidor com escopos, conta e versão Meta verificados na missão de integração. Nenhum endpoint específico foi presumido nesta entrega.

## Validação
npm test cobre sequência, bloqueios, aprovação/revisão, invalidação, prompts, serialização e adapter fechado. npm run build valida TypeScript e bundle. Revisão visual/interativa de navegador não foi executada nesta missão.
