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

export const storyboards: Record<string, StoryboardFrame[]> = {
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
