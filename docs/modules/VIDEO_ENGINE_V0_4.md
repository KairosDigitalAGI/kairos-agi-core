# Video Engine — Missão 004

## O que funciona
O fluxo principal cria um vídeo do zero a partir de título e roteiro. Cada frase ou linha vira uma cena animada com tipografia, fundo procedural, partículas, transição, identidade de cor, marca e trilha ambiente sintetizada opcional. O storyboard aparece antes da geração. Não é necessário enviar um vídeo de entrada.

O modo Editar arquivo permite escolher um vídeo real no computador, assistir ao original, definir início e fim, selecionar proporção e qualidade, aplicar texto de marca e uma imagem de logo, manter ou remover o áudio original, adicionar música local e renderizar. Os dois fluxos produzem WebM baixável.

O processamento ocorre no navegador com Canvas, Web Audio e MediaRecorder. Roteiro, arquivo, logo, música e saída não são enviados a Vercel, Kairos, Meta ou provedores de IA. A operação não usa créditos de API.

## Geração nativa e limites
- Entrada: título e roteiro de até 3.000 caracteres; cada linha ou frase forma uma cena.
- Estilos: Kairos Cyber, Minimalista e Alta energia.
- Duração: 2 a 8 segundos por cena, até 12 cenas.
- Áudio: trilha ambiente original sintetizada localmente; narração por voz ainda não é gerada.

## Pós-produção e formatos
- Entrada: qualquer vídeo decodificado pelo navegador, incluindo normalmente MP4, MOV e WebM. A compatibilidade real depende dos codecs instalados.
- Saída: WebM com VP9 ou VP8 e Opus, conforme suporte do navegador.
- Proporção: original, vertical 9:16, quadrado 1:1 ou horizontal 16:9. O enquadramento preenche a tela e corta excedentes centralmente.
- Qualidade: econômica até 480p, equilibrada até 720p ou alta até 1080p.
- Limites locais: até 500 MB e até 10 minutos por renderização.

## Estado e dados reais
O painel não inclui resultados de exemplo. Na criação, duração e cenas vêm do roteiro do Founder. Na edição, tamanho, duração e resolução vêm do arquivo escolhido. O histórico `kairos.video.jobs.v1` registra apenas trabalhos realmente iniciados, seu tipo, horário, estado, duração, tamanhos e erro real. O arquivo resultante vive somente na sessão e deve ser baixado antes de fechar ou recarregar.

## Segurança e falhas
Nome de saída é normalizado para evitar caracteres de caminho. A renderização pode ser cancelada. Erro de decodificação, falta de codec, navegador incompatível ou falha de armazenamento são mostrados sem criar resultado falso. A página recomenda Chrome ou Edge atualizados quando MediaRecorder/captureStream não estão disponíveis.

Logo e música devem pertencer ao Founder ou ter licença. O sistema não valida direitos autorais. Marca d'água e logo são composição visual; não provam autoria.

## Relação com Clone e providers
Video AI abre este painel pelo organograma. Produções aprovadas no Clone ainda não transferem arquivos automaticamente: o catálogo do Clone armazena referências textuais, enquanto esta Engine manipula arquivos temporários. A união exige backend/armazenamento seguro na Missão Supabase.

Google Flow, Higgsfield, Kling, Runway e Pika permanecem desligados. A geração nativa cria motion graphics a partir do roteiro; ela não sintetiza pessoas ou cenas fotorealistas. Esse tipo de geração exige um modelo externo ou infraestrutura local pesada. O pipeline FFmpeg já existente no `kairos3` continua candidato a worker de alta fidelidade; conectar o processo produtivo e seus arquivos requer validação separada para não interromper a instância ativa.
