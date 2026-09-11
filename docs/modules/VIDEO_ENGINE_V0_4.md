# Video Engine — Missão 004

## O que funciona
O Founder pode escolher um vídeo real no computador, assistir ao original, definir início e fim, selecionar proporção e qualidade, aplicar texto de marca e uma imagem de logo, manter ou remover o áudio original, adicionar música local e renderizar. O resultado é um arquivo WebM baixável.

O processamento ocorre no navegador com Canvas, Web Audio e MediaRecorder. O arquivo, o logo, a música e a saída não são enviados a Vercel, Kairos, Meta ou provedores de IA. A operação não usa créditos de API.

## Formatos e limites
- Entrada: qualquer vídeo decodificado pelo navegador, incluindo normalmente MP4, MOV e WebM. A compatibilidade real depende dos codecs instalados.
- Saída: WebM com VP9 ou VP8 e Opus, conforme suporte do navegador.
- Proporção: original, vertical 9:16, quadrado 1:1 ou horizontal 16:9. O enquadramento preenche a tela e corta excedentes centralmente.
- Qualidade: econômica até 480p, equilibrada até 720p ou alta até 1080p.
- Limites locais: até 500 MB e até 10 minutos por renderização.

## Estado e dados reais
O painel não inclui vídeos de exemplo. Tamanho, duração e resolução vêm do arquivo escolhido. O histórico `kairos.video.jobs.v1` registra apenas nome, horário, estado, duração, tamanhos e erro real da execução. O arquivo resultante vive somente na sessão e deve ser baixado antes de fechar ou recarregar.

## Segurança e falhas
Nome de saída é normalizado para evitar caracteres de caminho. A renderização pode ser cancelada. Erro de decodificação, falta de codec, navegador incompatível ou falha de armazenamento são mostrados sem criar resultado falso. A página recomenda Chrome ou Edge atualizados quando MediaRecorder/captureStream não estão disponíveis.

Logo e música devem pertencer ao Founder ou ter licença. O sistema não valida direitos autorais. Marca d'água e logo são composição visual; não provam autoria.

## Relação com Clone e providers
Video AI abre este painel pelo organograma. Produções aprovadas no Clone ainda não transferem arquivos automaticamente: o catálogo do Clone armazena referências textuais, enquanto esta Engine manipula arquivos temporários. A união exige backend/armazenamento seguro na Missão Supabase.

Google Flow, Higgsfield, Kling, Runway e Pika permanecem desligados. Não há geração de vídeo por IA nesta versão. O pipeline FFmpeg já existente no `kairos3` é candidato a worker de alta fidelidade; conectar o processo produtivo e seus arquivos requer validação separada para não interromper a instância ativa.
