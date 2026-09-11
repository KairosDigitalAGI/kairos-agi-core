# Clone Engine — Missão 003

## Entrega
Clone Engine na sidebar, com Identity Manager, Voice Profile, Face Profile, Avatar Library, Prompt Library, Video Queue, Approval Queue e Asset Library. Content Brain é um catálogo adicional reutilizável. Todos começam vazios e aceitam somente cadastro manual; não há perfis, avatares ou resultados sintéticos pré-carregados.

## Módulos e contratos
| Módulo | Registros e comportamento |
| --- | --- |
| Identity Manager | Titular, identidade/estilo, status da autorização, referência e escopo. Autorização pendente/revogada impede aprovação. |
| Voice Profile | Titular, referência local à amostra, estilo e direitos. Sem gravação, treinamento ou TTS. |
| Face Profile | Titular, referências locais de fotos e direitos. Sem upload ou processamento biométrico. |
| Avatar Library | Nome, referência do avatar, estilo e direitos. Não cria imagens. |
| Prompt Library | Objetivo, entrada, saída, engine, categoria, corpo e revisão automática. |
| Video Queue | Identidade, prompt, canais, engine planejada, roteiro, legenda e referências a imagem/vídeo/thumbnail. |
| Approval Queue | Expõe os materiais/referências, exige revisão manual, aprova uma versão ou pede ajustes com feedback. Reutilizada no Dashboard. |
| Asset Library | Logos, cores, fontes, avatares, músicas, vídeos, B-Rolls, vozes, imagens e thumbnails. Referências textuais com origem/direitos. |
| Content Brain | Categorias, gatilhos, hooks, roteiros, CTAs, objeções, nichos e produtos com origem declarada. |

## Pipeline
Ideia → Roteiro → Prompt → Imagem → Vídeo → Legenda → Thumbnail → Aprovação Founder → Publicação.

Avançar exige o material correspondente. Aprovação revalida todos os materiais e a identidade autorizada. Edição do vídeo reinicia as etapas e invalida aprovação. Alteração em qualquer registro da biblioteca invalida conservadoramente todas as aprovações existentes. Registros de biblioteca são versionados; aprovação também fixa a revisão global do catálogo.

Publicação significa apenas fila de aprovados aguardando conexão, nunca publicação efetuada. Arquivos referenciados devem ser conferidos pelo Founder fora do app: o catálogo não comprova existência, conteúdo, autorização jurídica ou integridade do arquivo. Não há prévia de mídia porque nenhum arquivo é carregado.

## Persistência e privacidade
CloneProvider guarda os registros no localStorage `kairos.clone.v1`, com validação de formato. Falha de leitura preserva o conteúdo; falha de gravação não aplica a alteração. Mudança detectada em outra aba bloqueia novas gravações até recarregar. Esta proteção é de melhor esforço; localStorage não oferece transações entre abas. Exportar catálogo baixa JSON do estado local para backup. Não há importador nem sincronização de dispositivos nesta missão.

Referências não são buscadas por rede. Não cadastrar segredos, links assinados ou biometria bruta. A plataforma pública entrega código; os cadastros não são enviados ao GitHub ou Vercel. localStorage não é Vault nem armazenamento criptografado; outras pessoas com acesso ao mesmo navegador podem ler o catálogo.

## Arquitetura de provedores e canais
VideoProvider define requisição com edition, tenantId, videoId, revision, prompt, idempotencyKey e budgetCents; resultado contempla estado e custo conhecido ou indisponível. manual, Google Flow, Higgsfield, Kling, Runway e Pika estão todos desconectados. generate sempre falha sem rede/cobrança. Não se presume API ou plano gratuito desses fornecedores.

Canais cadastráveis: Instagram, TikTok, YouTube Shorts, Threads, LinkedIn, X, Pinterest e Facebook Reels. Compartilham a produção base; adaptar formato e legenda por canal é contrato futuro da Video/Social Engine, não publicação implementada.

Founder Edition é a única edição executável agora. Client Edition tem contrato de edição, mas exige autenticação, tenant e módulos contratados no servidor antes de ativação. Não existe alternância local que conceda acesso a dados de clientes.

## Arquivos
- src/types/clone.ts: contratos compartilhados.
- src/core/CloneProvider.tsx: persistência e estado único.
- src/engines/clone/catalog.ts: campos das bibliotecas e canais.
- src/engines/clone/domain.ts: etapas, validação, revisão e aprovação.
- src/features/libraries/LibraryPanel.tsx: formulário e catálogo reutilizados por sete categorias.
- src/engines/clone/VideoEditor.tsx: cadastro de produção.
- src/engines/clone/CloneApprovalQueue.tsx: revisão compartilhada com Dashboard.
- src/engines/clone/videoProvider.ts: adaptadores desconectados.

## Reaproveitamento e limites
Preservadas as camadas Core/Engines/Features/UI e componentes SectionHeader. Do acervo existente foram adotadas as separações catálogo/provedor/fila/aprovação; nenhum serviço legado foi executado ou copiado com seus segredos. O motor FFmpeg já encontrado é candidato à Missão 004, não parte desta entrega.

Prompts novos do Clone ficam exclusivamente no catálogo. Prompts editoriais existentes do Instagram permanecem no armazenamento legado para evitar perda; unificação e migração para um catálogo autenticado continuam pendentes.

Validação: npm test cobre sequência, consentimento, tipo dos ativos, revisão, dados corrompidos e bloqueio de provedores. npm run build valida TypeScript e bundle. Sem teste visual automatizado ou chamadas a APIs.
