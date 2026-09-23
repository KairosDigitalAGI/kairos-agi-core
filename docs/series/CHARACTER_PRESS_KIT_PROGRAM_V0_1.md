# Programa de Press Kits de Personagem v0.1

## Finalidade

Este programa organiza a continuidade visual de personagens para a série Kairos. Ele cria especificações, não transfere, treina, publica ou armazena biometria. Cada pessoa real precisa de autorização específica de uso e de destino antes de qualquer envio a um provedor externo.

## Catálogo inicial

| Personagem | Tipo | Estado | Onde fica |
| --- | --- | --- | --- |
| Founder — Matheus | pessoa real, referências privadas | referências locais existentes; uso externo depende de autorização por destino | `memory/private/clones/founder/` |
| Wilson | pessoa real | aguardando imagens e confirmação de autorização | pasta privada a criar após consentimento |
| KAIROS | personagem ficcional/abstrato | pronto para direção visual | Character Bible público |
| ORION | personagem ficcional/abstrato | pronto para direção visual | Character Bible público |
| Cliente-arquétipo | personagem ficcional | opcional, sem semelhança de cliente real | Character Bible público |

## Entregáveis por personagem

1. **Folha de identidade:** nome narrativo, papel, frase de direção, paleta, materiais, objetos e invariantes.
2. **Rosto:** frontal, 3/4 esquerdo e direito, perfil esquerdo e direito; neutro, sorriso, atenção e fala.
3. **Corpo:** inteiro frontal, lateral esquerda/direita e costas; mãos e postura-base quando forem relevantes.
4. **Figurino:** roupa-base, variação casual, variação de cena e acessórios permitidos.
5. **Ambiente e objetos:** cenário-base, item assinatura, veículo/ferramenta quando necessário, cor e material.
6. **Folha de movimento:** caminhada, virar, sentar, olhar para uma interface e gesto para câmera.
7. **Controle:** versão, data, titular de direitos, consentimento, origem e onde pode ser usado.

A vista de cima é opcional e só entra quando contribui para cena/câmera. “Cor do olho”, marcas e demais detalhes só são registrados quando o titular autorizou e quando são necessários à continuidade.

## Convenção de arquivos privados

```text
memory/private/characters/<slug>/<yyyy-mm-dd>/
  identity.json
  face-front.png
  face-three-quarter-left.png
  face-three-quarter-right.png
  profile-left.png
  profile-right.png
  body-front.png
  body-left.png
  body-right.png
  body-back.png
  expressions.png
  wardrobe-base.png
  props.png
  consent.json
```

Nada dessa pasta entra no Git. O manifesto público só pode registrar estado geral, nunca imagem, voz, credencial, link assinado ou informação biométrica.

## Gate de autorização

Antes de usar uma pessoa real em imagem, vídeo ou voz, registrar: titular, escopo, destino do envio, finalidade, data e revogação. Para Wilson, a confirmação precisa declarar explicitamente que ele concorda em aparecer como personagem audiovisual da Kairos. A ausência dessa confirmação bloqueia geração e upload.

## Próxima ação

Produzir primeiro os press kits de KAIROS e ORION como personagens abstratos, sem usar materiais pessoais. Após a chegada das imagens do Wilson e confirmação de consentimento, criar o manifesto privado dele. O Founder só segue para um provedor escolhido depois de autorização específica de transmissão.
