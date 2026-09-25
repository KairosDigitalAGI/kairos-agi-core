export type StoryboardFrame = {
  scene: number
  title: string
  duration: string
  camera: string
  transition: string
  visual: string
  prompt: string
}

export type StudioProductionDraft = { title: string; briefing: string }
export const STUDIO_PRODUCTION_DRAFT_KEY = 'kairos.signal.production-draft.v1'

export function toProductionDraft(episodeNumber: string, episodeTitle: string, frame: StoryboardFrame): StudioProductionDraft {
  return {
    title: `Kairos Signal · EP${episodeNumber} · Cena ${String(frame.scene).padStart(2, '0')} — ${frame.title}`,
    briefing: `${frame.visual}\n\nCâmera: ${frame.camera}. Transição: ${frame.transition}.\n\nPrompt de geração:\n${frame.prompt}`,
  }
}

const common = 'original Kairos Digital universe, vertical 9:16, deep black, electric blue, Kairos violet and magenta, luminous hourglass motif, premium cinematic sci-fi, no readable text, no third-party logos, no watermark'

// EP00 character base descriptions — copy into GPT Image 2.5 prompts for consistency
export const ep00CharacterBases = {
  matheus: 'Brazilian man, 27 years old, South American phenotype. Curly dark brown hair, natural texture, medium length. Dark brown almond-shaped eyes, thick arched dark eyebrows. Well-groomed beard: full goatee connected to mustache, medium density, dark brown/black. Warm olive/light tan skin tone. Athletic-solid build, broad shoulders, ~1.78m. Strong jawline with beard, slightly angular face. Default outfit: charcoal grey button overshirt over black t-shirt, dark charcoal pants, black low-top sneakers. Expression: confident, slight knowing smirk, strategic sharp gaze.',
  vilson: 'Brazilian man, early-to-mid 30s, South American phenotype. Straight jet-black hair, medium length, slightly swept to one side, undercut fade at the sides. Dark brown almond-shaped eyes, thick well-defined dark eyebrows. Clean-cut goatee beard: chin beard connected to mustache, well-groomed, black, sharp edges. Light-medium warm tan skin. Very muscular and athletic build, very broad shoulders, physically imposing presence. Strong square jawline. Signature: very wide, open, bright white-tooth smile. Black fitness smartband on left wrist.',
}

export const ep00GptPrompts: Record<number, { title: string; tool: string; prompt: string }> = {
  1: {
    title: 'Abertura — Mundo em Caos Digital',
    tool: 'GPT Image 2.5',
    prompt: 'Cinematic aerial view of a major Brazilian city at night, São Paulo skyline. Dark stormy atmosphere. Dozens of glowing smartphone screens float and fall through the dark air — each shows a WhatsApp chat with unanswered messages, missed call notifications, "LEAD PERDIDO" alerts, red warning icons. Some screens shatter as they fall. City below: distant warm amber street lights vs cold electric blue screen glow. Rain-slicked reflections on glass towers. Editorial photography style, ultra-sharp, photorealistic, 16:9 cinematic widescreen, dramatic chiaroscuro, film grain. Palette: deep navy black, warm amber, cold electric blue.',
  },
  2: {
    title: 'Fundadores — Visão e Determinação',
    tool: 'GPT Image 2.5 + Base Matheus + Base Vilson',
    prompt: 'Cinematic portrait of two Brazilian startup co-founders side by side in a modern home office at night. Left (MATHEUS): curly dark brown hair, dark brown eyes, well-groomed goatee beard, warm olive skin, athletic build, charcoal grey button overshirt over black t-shirt, confident slight smirk, sharp camera gaze. Right (VILSON): straight jet-black hair swept to side undercut, dark brown eyes, clean-cut black goatee, light-medium tan skin, very muscular broad-shouldered build, navy blue button-up shirt, black smartband on left wrist, wide charismatic smile turning to determined conviction. Background: modern desk with monitors showing dashboards, city skyline at night through window, warm desk lamp + cool blue tech light. Both looking at camera: "we will change the game forever" energy. 16:9, shallow DoF, front-left key light, anamorphic flares, photorealistic.',
  },
  3: {
    title: 'Arthur + Kairos — Sistemas IA em Ação',
    tool: 'GPT Image 2.5',
    prompt: 'Futuristic split-screen holographic interface in a dark tech room. Left panel: a glowing WhatsApp-style chat interface floating as a hologram, green text streams: "Lead qualificado", "Respondendo...", "Proposta enviada", 02:17 AM timestamp, lead scoring data. Right panel: a glowing futuristic hourglass symbol — neon blue at top transitioning through violet to magenta at base — pulsing, digital particles flowing through center. Between panels: data streams connecting them. Pure black background with subtle blue circuit grid. Colors: #00e5a0 green (left), #e040fb magenta + #7b2fff violet (right). Photorealistic render, ultra-sharp, 16:9 cinematic.',
  },
  4: {
    title: 'Cliente — Reação ao Bot às 2AM',
    tool: 'GPT Image 2.5',
    prompt: 'Candid cinematic shot: Brazilian businessman, 45-50 years old, business casual, sitting at his office desk late at night. Holding smartphone with both hands, jaw dropped open, eyes wide in disbelief and amazement. Phone screen shows WhatsApp: "VENDA FECHADA ✓ R$12.400,00 — 02:17" — message from AI bot "Arthur". Expression: pure shock turning slowly to amazed smile. Dark office, single desk lamp creating warm light on face. Coffee mug on desk. Phone screen light illuminates face from below for dramatic bottom lighting. Photorealistic editorial photography, shallow DoF with bokeh, 16:9. Mood: "the AI actually closed a deal while I was sleeping."',
  },
  5: {
    title: 'Matheus — Close Dramático VO',
    tool: 'GPT Image 2.5 + Base Matheus',
    prompt: 'Extreme cinematic close-up portrait of MATHEUS: Brazilian man 27yo, curly dark brown hair, dark brown almond eyes thick eyebrows, full goatee beard connected to mustache dark brown/black, warm olive skin, slightly angular jaw. Frame: face and upper shoulders only, filling 70% of frame. Lighting: dramatic single key light from front-left casting strong directional shadow, rim light from behind-right in electric blue/violet (#7b2fff). Background: pure dark gradient deep navy to black, very subtle purple/blue halo. Expression: intense direct camera gaze, extremely confident, slight asymmetric smirk — absolute authority and conviction, "the boss" shot. Photorealistic, ultra-sharp eyes, cinema portrait, anamorphic 2.39:1, moody contrast.',
  },
  6: {
    title: 'Logo Reveal — Kairos Digital',
    tool: 'GPT Image 2.5',
    prompt: 'Epic brand reveal: Kairos Digital logo centered on near-black background (#040409). Logo: (1) futuristic 3D hourglass of neon light rails — electric blue (#00b4ff) top triangle, transitioning through violet (#7b2fff) to magenta (#e040fb) bottom triangle, glowing digital particle "sand" flowing through narrow center; (2) below hourglass: "KAIROS" in wide-spaced silver-chrome metallic uppercase letters, sleek industrial sans-serif; (3) below: "—DIGITAL—" in magenta (#e040fb) with thin horizontal flanking lines. Multi-color glow halo: blue top, violet center, magenta bottom. Subtle particle dust floating. Background: #040409 dark navy with barely visible circuit board grid. Premium brand reveal frame, ultra-sharp 3D render quality, 16:9, perfect symmetry.',
  },
}

export const storyboards: Record<string, StoryboardFrame[]> = {
  '00': [
    { scene: 1, title: 'Abertura — O Mundo em Caos', duration: '0–5 s', camera: 'Aéreo cinematográfico · câmera drone descendente', transition: 'Fade in + digital glitch', visual: 'Vista aérea de cidade brasileira à noite. Dezenas de telas de celular flutuam no ar escuro mostrando mensagens sem resposta, leads perdidos, alertas "LEAD PERDIDO". Mood: caos antes da solução.', prompt: ep00GptPrompts[1].prompt + ' [USE GPT IMAGE 2.5 → então gerar vídeo com Seedance 2.5 usando esta imagem como referência]' },
    { scene: 2, title: 'Fundadores — Visão', duration: '5–10 s', camera: 'Plano médio · movimento lento em direção à câmera · shallow DoF', transition: 'Cross dissolve suave', visual: 'Matheus e Vilson lado a lado no home office noturno. Monitores com dashboards atrás. Viram juntos para câmera com convicção absoluta.', prompt: ep00GptPrompts[2].prompt + ' [USE GPT IMAGE 2.5 com fotos de referência do Matheus e Vilson do Cofre Privado]' },
    { scene: 3, title: 'Arthur + Kairos em Ação', duration: '10–15 s', camera: 'Split-screen holográfico · câmera fixa com parallax digital', transition: 'Data stream wipe', visual: 'Interface dividida: Arthur (dashboard WhatsApp em tempo real) à esquerda e símbolo Kairos pulsando à direita. Dados fluindo entre os sistemas.', prompt: ep00GptPrompts[3].prompt },
    { scene: 4, title: 'Cliente Chocado', duration: '15–20 s', camera: 'Plano médio · push-in lento revelando expressão', transition: 'Jump cut para expressão de espanto', visual: 'Empresário brasileiro no escritório à noite. Segura celular mostrando "VENDA FECHADA R$12.400 — 02:17". Queixo caindo. Incrédulo.', prompt: ep00GptPrompts[4].prompt },
    { scene: 5, title: 'Matheus VO — Close Intenso', duration: '20–25 s', camera: 'Extreme close-up · câmera direta · key light dramático', transition: 'Hard cut direto', visual: 'Close extremo do Matheus direto para câmera. Olhar fulminante. "The boss" energy. Luz lateral forte criando sombra dramática.', prompt: ep00GptPrompts[5].prompt + ' [USE GPT IMAGE 2.5 com foto de referência do Matheus do Cofre Privado]' },
    { scene: 6, title: 'Logo Reveal — Call to Action', duration: '25–30 s', camera: 'Dolly-out simétrico a partir do logo · surgindo do centro', transition: 'Fade from black + luz pulsante', visual: 'Logo Kairos Digital surge do centro com pulso de luz. Texto "KAIROS DIGITAL" materializa. Partículas ao redor. Tagline final.', prompt: ep00GptPrompts[6].prompt },
  ],
  '01': [
    { scene: 1, title: 'O grão', duration: '0–8 s', camera: 'Macro extremo → dolly-out lento', transition: 'Partículas formam a ampulheta', visual: 'Um grão violeta atravessa uma superfície de vidro e acende a Founder Tower.', prompt: `${common}. Extreme macro of a violet particle moving through etched glass, subtle microtexture, slow dolly out revealing the Founder Tower inside an abstract computer, controlled parallax.` },
    { scene: 2, title: 'O sinal', duration: '8–16 s', camera: 'Push-in de celular → rack focus', transition: 'Reflexo vira corredor da Tower', visual: 'Uma ideia chega à noite; o brilho no celular abre um corredor de luz.', prompt: `${common}. A generic phone glow reflected on glass, rack focus from a human hand silhouette to a futuristic blue-violet corridor, the hourglass appears only as an abstract light mark.` },
    { scene: 4, title: 'Caça ao sinal', duration: '24–32 s', camera: 'Órbita curta + over-the-shoulder', transition: 'Mapa dobra em cards de revisão', visual: 'Hunter AI lê um mapa holográfico, com o emblema de ampulheta na ombreira.', prompt: `${common}. Fictional analyst orc avatar in a tailored dark coat, small luminous hourglass shoulder emblem, examining abstract opportunity signals that stay unlabeled, short orbital camera move.` },
    { scene: 7, title: 'Prova', duration: '48–56 s', camera: 'Macro de selo → zoom-out controlado', transition: 'Âmbar vira violeta', visual: 'QA AI valida um quadro, sem transformar revisão em execução.', prompt: `${common}. Amber sentinel avatar stamps an abstract hourglass-shaped verification seal onto a floating storyboard, macro of glass texture then controlled zoom out, no completed task indicators.` },
    { scene: 10, title: 'Decisão', duration: '72–80 s', camera: 'Atravessa a tela → plano médio', transition: 'Interface vira luz real', visual: 'A câmera encontra a silhueta do Founder; a escolha permanece humana.', prompt: `${common}. Silhouette only of a founder at a desk touching a review control, no face identity, screen light transitions into real room light, deliberate calm medium shot.` },
    { scene: 12, title: 'Marca', duration: '88–96 s', camera: 'Dolly-out simétrico', transition: 'Tower dobra em ampulheta', visual: 'A Founder Tower se reduz à assinatura de ampulheta da Kairos Digital.', prompt: `${common}. The futuristic tower folds into an original neon hourglass symbol, symmetric dolly out, clear empty lower third reserved for a post-production Kairos Digital lockup.` },
  ],
  '02': [
    { scene: 1, title: 'Cidade Kairos', duration: '0–8 s', camera: 'Drone virtual → descida suave', transition: 'Trilhas convergem em uma ampulheta', visual: 'Pequenos negócios fictícios se conectam por trilhas de luz.', prompt: `${common}. Abstract night city of independent fictional studios and shops, blue and violet light paths converging toward an hourglass-shaped hub, virtual aerial descent.` },
    { scene: 3, title: 'Protótipo', duration: '16–24 s', camera: 'Over-the-shoulder + parallax', transition: 'Esboço vira holograma', visual: 'CPO transforma uma hipótese em protótipo revisável.', prompt: `${common}. Fictional product architect projects a translucent prototype from an hourglass-shaped device, over-the-shoulder camera, subtle parallax, no readable interface text.` },
    { scene: 6, title: 'O limite', duration: '40–48 s', camera: 'Dolly-in curto', transition: 'Faixa âmbar interrompe o fluxo', visual: 'QA torna limite e origem visíveis antes da escolha.', prompt: `${common}. Amber quality sentinel interrupts a flowing violet scene with a calm translucent boundary, short dolly in, tactile glass particles, respectful and non-alarmist.` },
    { scene: 8, title: 'Pulse Arena', duration: '56–64 s', camera: 'Órbita ampla', transition: 'Energia vira portal', visual: 'Avatares cooperam em uma arena sem violência nem moeda real.', prompt: `${common}. Diverse fictional avatars cooperatively solve an abstract energy puzzle in a nonviolent virtual arena, wide orbit, hourglass energy core, no score, no currency.` },
    { scene: 11, title: 'A escolha', duration: '80–88 s', camera: 'Match-cut tela → mão', transition: 'Portal vira smartphone', visual: 'Uma mão humana aprova uma opção clara, sem rosto identificável.', prompt: `${common}. Match cut from a glowing portal to an anonymous hand reviewing a simple choice on a phone, shallow depth of field, no readable text, no person identity.` },
    { scene: 12, title: 'Portal', duration: '88–96 s', camera: 'Zoom-out abrupto controlado', transition: 'Ampulheta abre para o físico', visual: 'O mundo virtual anuncia a passagem para a realidade.', prompt: `${common}. Original neon hourglass becomes a portal between digital city and a quiet real workspace, controlled abrupt zoom out, cinematic depth transition.` },
  ],
  '03': [
    { scene: 1, title: 'Corte para o real', duration: '0–8 s', camera: 'Zoom-out abrupto', transition: 'Portal vira monitor', visual: 'A luz de um monitor revela uma sala real, sem identidade facial.', prompt: `${common}. Abrupt but smooth zoom out from a violet portal into a real-world monitor glow in a calm night workspace, anonymous silhouette only, realistic textures.` },
    { scene: 2, title: 'KAIROS no celular', duration: '8–16 s', camera: 'Macro de visor → rack focus', transition: 'Visor projeta a Tower', visual: 'KAIROS aparece como avatar de interface e devolve opções.', prompt: `${common}. Original humanoid digital assistant avatar contained inside a phone interface, luminous hourglass crest on chest display, macro screen texture then rack focus, no text.` },
    { scene: 5, title: 'Primeiro frame', duration: '32–40 s', camera: 'Dolly lateral', transition: 'Frame cresce em storyboard', visual: 'Instagram AI projeta o primeiro frame da história.', prompt: `${common}. Fictional blue-haired creative avatar projects a storyboard frame through layered glass panels, side dolly, magenta accent and hourglass hologram, no text.` },
    { scene: 7, title: 'Tempo', duration: '48–56 s', camera: 'Plano fixo intencional', transition: 'Reflexo de janela → ampulheta', visual: 'A vida continua enquanto a história aguarda revisão.', prompt: `${common}. Quiet real domestic moment seen only as non-identifying silhouettes, phone closed on a table, violet hourglass reflection in window, intentional static composition.` },
    { scene: 10, title: 'Quarta parede', duration: '72–80 s', camera: 'Push-in + quebra de vidro', transition: 'Visor ocupa a lente', visual: 'KAIROS fala através do vidro, sem sair do universo digital.', prompt: `${common}. Original assistant avatar looks through a glass display toward camera, subtle fourth-wall effect, controlled push in, the luminous hourglass reflected on the visor.` },
    { scene: 12, title: 'Uma mesma hora', duration: '88–96 s', camera: 'Órbita final + dolly-out', transition: 'Cidade e sala se unem', visual: 'O digital e o físico compartilham o mesmo reflexo de ampulheta.', prompt: `${common}. Digital tower and real workspace merge in one reflective hourglass surface, final orbital move and symmetrical dolly out, leave space for original brand lockup.` },
  ],
}

export const characterDirections = [
  { name: 'KAIROS', archetype: 'Pessoa-avatar Kairos · mediador humano do sistema', marker: 'Tatuagem ou broche da ampulheta Kairos, discreto e sempre visível', prop: 'Painel translúcido de opções', camera: 'Close de olhar; orbit curto; rack focus para o Founder' },
  { name: 'ORION', archetype: 'Guardião-ampulheta · entidade estratégica de vidro', marker: 'Corpo, núcleo e silhueta moldados como a ampulheta Kairos', prop: 'Mapa de prioridades sem dados reais', camera: 'Dolly-in lento; órbita simétrica; contra-plongée' },
  { name: 'Instagram AI', archetype: 'Diretora criativa de cabelo azul', marker: 'Lentes magenta e emblema de ampulheta', prop: 'Storyboard de vidro', camera: 'Dolly lateral; parallax; match-cut frame→cena' },
  { name: 'Hunter AI', archetype: 'Orc analista', marker: 'Ombreira gravada com ampulheta', prop: 'Mapa de sinais para revisão', camera: 'Over-the-shoulder; órbita curta; foco no gesto' },
  { name: 'QA AI', archetype: 'Sentinela âmbar', marker: 'Selo de validação em ampulheta', prop: 'Faixa de limite luminosa', camera: 'Macro de textura; zoom-out controlado; plano fixo de decisão' },
  { name: 'Money Hunter', archetype: 'Mensageira futurista', marker: 'Joia de ampulheta azul-violeta', prop: 'Ponte de valor, nunca saldo', camera: 'Travelling; luz de recorte; transição por reflexo' },
  { name: 'CFO', archetype: 'Entidade de vidro azul', marker: 'Areia azul em ampulheta interna', prop: 'Círculo de limite sem números', camera: 'Dolly-in econômico; close de vidro; rack focus' },
  { name: 'CPO', archetype: 'Arquiteto de protótipos', marker: 'Capacete com ícone Kairos geométrico', prop: 'Protótipo holográfico', camera: 'Over-the-shoulder; macro de material; parallax' },
]
