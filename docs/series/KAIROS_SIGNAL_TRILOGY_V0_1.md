# Kairos Signal — Trilogia de Lançamento v0.1

## Propósito

Uma minissérie vertical original para apresentar, com linguagem de ficção científica, o que a Kairos Digital pretende construir: processos visíveis, criação com revisão humana e uso responsável de IA. A história não promete renda, emprego, resultado comercial ou automação já ativa.

**Formato:** três episódios de 48 a 64 segundos, cada um composto por 6 a 8 planos curtos de até 8 s.
**Canais:** 9:16 para Reels, TikTok e Shorts; uma montagem 16:9 pode ser criada depois.
**Regra de lançamento:** nenhum episódio é publicado sem revisão do Founder e confirmação do canal.

## Universo e linguagem

A abertura parece acontecer dentro de um computador: Founder Tower, interfaces de vidro, luz roxa Kairos e cidade noturna abstrata. Aos poucos, a câmera revela que a ficção nasce na tela de uma pessoa real. A quebra da quarta parede não afirma que a IA está consciente nem que controla pessoas: ela convida o público a decidir o que quer construir com a tecnologia.

- Paleta: roxo Kairos `#7C3AED`, azul elétrico, preto e branco de interface.
- Câmera: dolly-in lento, orbitas curtas, macro de interface, rack focus, match-cut tela→mundo e uma saída abrupta para o ambiente real.
- Montagem: uma ideia por plano; texto na tela só quando complementar a voz.
- Limite: objetos, marcas e cenários devem ser originais; a referência de vídeo do Founder serve para estudar processo, não para copiar estética, roteiro ou personagens.

## Episódio 1 — “O sinal dentro da tela”

**Mensagem:** IA não substitui propósito; ela torna o processo visível quando existe direção humana.

| Plano | Duração | Imagem e câmera | Voz/texto |
| --- | ---: | --- | --- |
| 1 | 8 s | Macro de um pixel roxo acendendo em uma tela escura; dolly-out revela uma cidade virtual. | “E se a próxima empresa não nascesse em um prédio?” |
| 2 | 8 s | Travelling pela Founder Tower, interfaces vazias aguardando decisões. | “E se ela nascesse de uma decisão?” |
| 3 | 8 s | KAIROS como sinal luminoso organiza cartões de missão sem marcar nada como concluído. | “Uma missão. Um responsável. Uma prova.” |
| 4 | 8 s | ORION constrói um mapa de prioridades em luz; câmera orbital curta. | “IA não é mágica. É método com velocidade.” |
| 5 | 8 s | A câmera atravessa um painel transparente e encontra o Founder em silhueta, ainda no mundo virtual. | “Mas alguém precisa escolher o que importa.” |
| 6 | 8 s | O Founder olha diretamente para a lente; glitch suave abre uma janela na cena. | “Você não está só vendo uma tela.” |
| 7 | 8 s | Match-cut: o brilho do monitor vira luz real no rosto do Founder. | “Você está vendo uma escolha.” |

**Gancho:** “Amanhã, a cidade responde.”

## Episódio 2 — “A cidade que aprendeu”

**Mensagem:** tecnologia amplia capacidade quando serve pessoas, negócios e criatividade com limites claros.

| Plano | Duração | Imagem e câmera | Voz/texto |
| --- | ---: | --- | --- |
| 1 | 8 s | Uma cidade virtual acorda com trilhas de luz que conectam ateliês, clínicas fictícias e pequenos negócios sem nomes reais. | “No futuro, trabalho não desaparece. Ele muda de forma.” |
| 2 | 8 s | Instagram AI transforma um briefing aprovado em storyboard; câmera over-the-shoulder. | “Ideia vira roteiro. Roteiro vira cena. Cena vira conversa.” |
| 3 | 8 s | Hunter AI encontra oportunidades marcadas apenas como ‘para revisão’, sem contato automático. | “Oportunidade sem contexto é só ruído.” |
| 4 | 8 s | Pulse Arena: participantes cooperam para resolver missões com energia visual, sem violência e sem moeda real. | “A competição mais interessante é construir algo útil juntos.” |
| 5 | 8 s | O brilho da arena forma um portal na forma de um navegador. | “A pergunta nunca foi: quem a IA vai substituir?” |
| 6 | 8 s | A lente atravessa o portal e mostra uma mão humana fechando um cartão de aprovação. | “A pergunta é: quem vai aprender a dirigir a ferramenta?” |
| 7 | 8 s | Olhar direto para a câmera; a interface pausa. | “Talvez seja você.” |

**Gancho:** “Agora sai da tela.”

## Episódio 3 — “Do outro lado do clique”

**Mensagem:** a ficção aponta para uma operação real que precisa de gente, critérios e entregas verificáveis.

| Plano | Duração | Imagem e câmera | Voz/texto |
| --- | ---: | --- | --- |
| 1 | 8 s | O portal fecha em um monitor real; a câmera dá um zoom-out abrupto e revela o Founder diante dele. | “Tudo isso parecia distante.” |
| 2 | 8 s | Ambiente de trabalho real, luz de manhã, tela com o painel Kairos desfocada ao fundo. | “Até a hora em que você percebe que já pode começar.” |
| 3 | 8 s | KAIROS aparece somente como interface no monitor; sem alegar tarefas concluídas. | “Organizar demanda. Criar conteúdo. Revisar antes de enviar.” |
| 4 | 8 s | Wilson entra apenas quando houver imagem e autorização de uso registradas; na versão atual, usar enquadramento de dupla sem rosto ou omitir o plano. | “Pessoas no comando. Ferramentas trabalhando a favor.” |
| 5 | 8 s | Founder toca o monitor; a interface ‘quebra’ a quarta parede e ocupa brevemente a lente. | “A tela não é o fim da história.” |
| 6 | 8 s | Close real, natural, direto para câmera. | “É onde a próxima missão começa.” |
| 7 | 8 s | Marca Kairos Digital, sem promessa de resultado. | “Kairos Digital. Construa a hora certa.” |

**CTA:** “Acompanhe a construção. Fale com a Kairos quando estiver pronto para transformar uma ideia em processo.”

## Plano de geração com o teto atual

1. Validar que `content_jobs`, `content_assets` e o bucket `content-assets` estão disponíveis no Supabase mestre.
2. Criar um job para **Plano 1 do Episódio 1**, com prompt textual e `aprovado:true` somente para esse teste.
3. Executar uma única geração Seedance de 8 s pela Gateway. O teto técnico de US$ 5 continua sem recarga; o custo efetivo será o uso retornado pelo provedor.
4. Conferir o vídeo e o campo `usage` na Biblioteca de filmes. Sem dado de uso, não estimar custo.
5. Só então decidir quantos planos seguintes cabem no saldo real. O restante pode ser blockout 3D/local sem custo até a próxima aprovação.

## Prompt do establishing shot textual

> Original cinematic vertical 9:16 sci-fi establishing shot, eight seconds. A single violet pixel wakes in darkness and expands into a futuristic Founder Tower inside a computer interface, abstract neon-blue city beyond the glass, calm volumetric lighting, slow dolly out, subtle particles, precise architecture, no people, no readable text, no logos, no known characters, no copyrighted design, no watermark. The final frame leaves open space for an original Kairos overlay.

## Regras de continuidade

- Founder: usar somente referências privadas autorizadas; não enviar imagens a um provedor sem autorização específica de destino.
- Wilson: permanece **pendente** até receber imagens e confirmação de que ele autorizou o uso audiovisual. Não gerar sua semelhança antes disso.
- KAIROS e ORION: são entidades ficcionais/abstratas; usar suas bíblias visuais, não identidade humana.
- Toda cena recebe identificador, prompt, modelo, seed se o provedor devolver, versão do personagem, custo/usage quando disponível e status de aprovação.
- A Biblioteca é a fonte operacional do vídeo concluído; o press kit não entra nela.


## Evolução coral v0.2

A trilogia passa a ter **96 segundos por episódio**, em doze planos de oito segundos. A nova versão substitui a locução contínua por conversas curtas entre KAIROS, ORION, Instagram AI, Hunter AI, CFO, Money Hunter, QA AI, CPO, Founder e Cliente-arquétipo. O conflito dramático é produtivo: velocidade versus direção, oportunidade versus evidência, criatividade versus limite e execução versus decisão humana.

Os agentes são personagens ficcionais que dramatizam papéis configurados do produto; a fala não afirma que um executor real trabalhou, pesquisou, gastou, falou com cliente ou concluiu tarefa. O Founder mantém a decisão final.


## Gramática de câmera v0.3

A série não deve parecer uma gravação plana. Cada plano recebe um verbo de câmera e uma intenção narrativa antes de entrar no provider:

- **Macro e microtextura:** grão de luz, visor, superfície de vidro, íris ou poro somente quando uma pessoa autorizada estiver em cena.
- **Dolly-in e dolly-out:** aproximar uma pergunta, revelar contexto depois de uma resposta.
- **Órbita, parallax e rack focus:** apresentar o elenco e trocar foco entre personagem, interface e ampulheta.
- **Zoom óptico/digital controlado:** só em descoberta, alerta ou quebra da quarta parede; evitar pulsação aleatória.
- **Match-cut e transição de profundidade:** ampulheta→tela, tela→vida real, reflexo→olho, sempre preservando a continuidade de cor.
- **Plano fixo:** reservado a decisão humana, emoção ou CTA; é contraste deliberado, não ausência de direção.

Para o establishing shot textual Seedance, a receita é macro de partículas e vidro → dolly-out lento → órbita curta em torno da Founder Tower → match-cut para a ampulheta. Nenhum close humano é enviado nesse primeiro take.

## Padrão final de realismo — mundo fora da tela

Nos takes físicos do Episódio 01, Matheus e Vilson são pessoas reais no Brasil contemporâneo de 2026. A direção deve buscar fotografia de cinema, e não aparência de avatar: close de pele com poros e microexpressões, olhos com reflexo e movimento de pupila natural, cabelo e tecido reagindo ao vento, sol atravessando janelas, sombras coerentes, reflexos verdadeiros, perspectiva física, profundidade de campo óptica e som ambiente discreto. O corte entre a Founder Tower digital e o mundo externo deve aumentar a fidelidade perceptível de propósito: o público percebe que saiu da simulação antes mesmo de a fala explicar isso.

A performance permanece humana: pausa antes de responder, respiração, olhar fora de quadro, gesto econômico e fala conversada. Não acelerar a dicção para preencher 60 segundos. A marca Kairos Digital entra exclusivamente pelo lockup original em pós-produção local e por elementos cenográficos aprovados, sem pedir texto ou tipografia ao modelo generativo.
