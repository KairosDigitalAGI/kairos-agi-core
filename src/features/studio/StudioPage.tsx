import { useEffect, useState } from 'react'
import { Camera, Clapperboard, FileText, ImagePlus, LibraryBig, LockKeyhole, PanelsTopLeft, Pause, Play, Save, Sparkles, UsersRound } from 'lucide-react'
import { ContentEnginePanel } from '../dashboard/ContentEnginePanel'
import { FilmLibraryPage } from '../../engines/video/FilmLibraryPage'
import { VideoPage } from '../../engines/video/VideoPage'
import { PrivateCloneVault } from './PrivateCloneVault'
import { characterDirections, STUDIO_PRODUCTION_DRAFT_KEY, storyboards, toProductionDraft } from './storyboard'
import './studio.css'

type StudioTab = 'story' | 'cast' | 'production' | 'library'
type Continuation = 'paused' | 'manual'
type Episode = { number: string; title: string; status: string; summary: string; narration: string; hook: string; screenplay: string }
const EPISODE_STORAGE_KEY = 'kairos.signal.episodes.v2'

const episodes: Episode[] = [
  { number: '01', title: 'A hora certa desperta', status: 'Roteiro coral · 96 s', summary: 'Dentro da Founder Tower, uma ideia enviada de madrugada acorda um elenco de agentes. Eles discordam sobre velocidade, contexto e risco até o Founder escolher a primeira missão.', narration: '“Uma ideia não precisa esperar a hora perfeita. Ela precisa encontrar a hora certa.”', hook: 'Quando a ampulheta vira, todo mundo precisa escolher o que fazer com o tempo.', screenplay: `CENA 1 · O GRÃO · 0–8s
Um grão violeta cai no vazio e desenha a ampulheta Kairos. Dolly-out revela a Founder Tower.
NARRADOR: “Toda ideia começa pequena.”

CENA 2 · SINAL · 8–16s
Um celular real vibra; a frase “e se a gente criasse algo útil?” entra como luz na torre.
KAIROS: “Recebi uma ideia. Querem que eu abra uma missão?”

CENA 3 · ORION · 16–24s
ORION emerge de uma ampulheta orbital.
ORION: “Antes: qual problema ela resolve? Velocidade sem direção é só barulho.”

CENA 4 · HUNTER AI · 24–32s
Hunter AI, um orc analista com selo de ampulheta no ombro, abre um mapa holográfico.
HUNTER AI: “Posso procurar sinais. Mas sinal não é cliente, e oportunidade não é promessa.”

CENA 5 · INSTAGRAM AI · 32–40s
A avatar azul desenha três quadros no ar.
INSTAGRAM AI: “Se a ideia for clara, eu transformo em história. Primeiro, alguém precisa sentir.”

CENA 6 · CFO · 40–48s
Uma figura de vidro azul segura uma moeda luminosa sem valor exibido.
CFO: “E antes de gastar, definimos o limite. Criatividade também precisa de um orçamento.”

CENA 7 · QA AI · 48–56s
QA AI marca cada quadro com uma luz verde ou âmbar.
QA AI: “Eu não marco ‘pronto’. Eu marco o que foi provado.”

CENA 8 · KAIROS RESPONDE · 56–64s
KAIROS reúne os painéis, nenhum deles é enviado.
KAIROS: “Então eu preparo opções, o elenco revisa e o Founder escolhe.”

CENA 9 · MONEY HUNTER · 64–72s
Uma mensageira futurista atravessa uma ponte de luz com relatórios em branco.
MONEY HUNTER: “Dinheiro não é o começo da história. Valor é. Sem valor, não existe conversa que dure.”

CENA 10 · O FUNDADOR · 72–80s
A câmera sai pela tela e encontra o Founder em silhueta; ele não fala, apenas toca “revisar”.
ORION: “Decisão humana registrada.”

CENA 11 · QUARTA PAREDE · 80–88s
KAIROS olha para a câmera; a ampulheta se reflete no visor.
KAIROS: “Você não precisa fazer tudo sozinho. Mas precisa saber o que não vai delegar.”

CENA 12 · MARCA · 88–96s
A torre se dobra até virar a ampulheta da Kairos Digital.
TEXTO: “Kairos Digital · construa a hora certa.”` },
  { number: '02', title: 'A cidade que trabalha junto', status: 'Roteiro coral · 96 s', summary: 'O elenco visita uma cidade virtual onde cada agente enxerga uma parte do problema. A conversa mostra que ferramenta, criatividade, dinheiro e responsabilidade precisam caminhar juntos.', narration: '“A pergunta não é quem a tecnologia substitui. É o que pessoas ganham quando recuperam o próprio tempo.”', hook: 'A próxima decisão sai da tela.', screenplay: `CENA 1 · CIDADE KAIROS · 0–8s
Trilhas da ampulheta conectam negócios fictícios em uma cidade de vidro.
INSTAGRAM AI: “Cada janela tem uma história. Qual merece ser contada primeiro?”

CENA 2 · HUNTER E KAIROS · 8–16s
Hunter AI aponta sinais; KAIROS organiza cartões em ‘revisar’.
HUNTER AI: “Encontrei pedidos. Não vou prometer nada antes de entender o contexto.”
KAIROS: “Eu transformo contexto em próxima ação.”

CENA 3 · CPO · 16–24s
CPO monta um protótipo holográfico.
CPO: “Uma boa ferramenta não faz alguém parecer ocupado. Ela faz a próxima entrega ficar mais clara.”

CENA 4 · CFO E MONEY HUNTER · 24–32s
Os dois observam um relógio de energia, sem números.
CFO: “Quanto custa tentar?”
MONEY HUNTER: “Menos do que prometer o que não podemos cumprir.”

CENA 5 · INSTAGRAM AI · 32–40s
Ela projeta uma cena e a descarta.
INSTAGRAM AI: “Não quero viralizar uma mentira. Quero uma pessoa reconhecer a própria dor.”

CENA 6 · QA AI · 40–48s
QA interrompe com uma faixa âmbar.
QA AI: “Então comprovem a origem, mostrem o limite e deixem a escolha visível.”

CENA 7 · ORION · 48–56s
ORION equilibra os avatares dentro de uma ampulheta transparente.
ORION: “Estratégia é escolher o que fica de fora para o essencial caber.”

CENA 8 · PULSE ARENA · 56–64s
Avatares cooperam numa arena de energia não violenta.
KAIROS: “Aqui ninguém ganha por apertar o botão mais rápido. Ganha quem resolve junto.”

CENA 9 · O CLIENTE-ARQUÉTIPO · 64–72s
Uma personagem ficcional vê a cidade pelo celular.
CLIENTE: “Então vocês fazem tudo por mim?”

CENA 10 · RESPOSTA DO ELENCO · 72–80s
Coro de agentes, em sobreposição suave.
ELENCO: “Não. Nós preparamos o caminho para você decidir melhor.”

CENA 11 · PORTAL · 80–88s
O mapa torna-se tela de celular real; a mão humana toca ‘aprovar’.
ORION: “A ferramenta é rápida. O propósito continua humano.”

CENA 12 · GANCHO · 88–96s
A ampulheta cria um portal para o mundo físico.
TEXTO: “Agora sai da tela.”` },
  { number: '03', title: 'Do outro lado da ampulheta', status: 'Roteiro coral · 96 s', summary: 'A ficção atravessa o monitor e encontra a vida real. O Founder escolhe presença, enquanto o elenco prepara uma opção clara para o dia seguinte.', narration: '“A máquina pode preparar o caminho. Mas a vida continua sendo o motivo da viagem.”', hook: 'A próxima missão começa quando a tela apaga.', screenplay: `CENA 1 · CORTE ABRUPTO · 0–8s
O portal vira a luz de um monitor em uma sala real. Zoom-out revela o Founder.
FOUNDER: “Eu tive uma ideia. Não tenho uma noite inteira.”

CENA 2 · KAIROS NO CELULAR · 8–16s
KAIROS surge no painel, com a ampulheta no visor.
KAIROS: “Me diga o objetivo. Eu devolvo opções, não decisões.”

CENA 3 · TOWER RESPONDE · 16–24s
Cada agente acende em seu andar.
ORION: “Uma missão. Um responsável. Uma prova.”

CENA 4 · CONFLITO · 24–32s
Hunter AI quer explorar um caminho; QA AI segura a faixa.
HUNTER AI: “Existe um sinal lá fora.”
QA AI: “Então trazemos evidência antes de transformar sinal em verdade.”

CENA 5 · HISTÓRIA · 32–40s
Instagram AI projeta o primeiro frame do filme.
INSTAGRAM AI: “Eu conto a jornada. Sem fingir que a chegada já aconteceu.”

CENA 6 · LIMITE · 40–48s
CFO fecha um círculo de luz.
CFO: “E o limite?”
KAIROS: “Todo gasto precisa de aprovação. Toda publicação precisa de confirmação.”

CENA 7 · VIDA · 48–56s
O Founder fecha o celular e segue para um momento com a família; não há rostos identificáveis.
NARRADOR: “Tempo com quem importa não deveria ser o preço de construir.”

CENA 8 · TURNO DA NOITE · 56–64s
Na Tower, o elenco prepara roteiro, referências e perguntas para revisão.
MONEY HUNTER: “Amanhã, valor primeiro. A conversa vem depois.”

CENA 9 · MANHÃ · 64–72s
O Founder abre o painel com escolhas claras, nada marcado como enviado.
FOUNDER: “Agora eu entendo o próximo passo.”

CENA 10 · QUARTA PAREDE · 72–80s
KAIROS atravessa o vidro do monitor, sem sair dele fisicamente.
KAIROS: “Essa não é uma história sobre robôs substituindo pessoas.”

CENA 11 · CORO FINAL · 80–88s
Todos os agentes se organizam em volta da ampulheta.
ELENCO: “É uma história sobre pessoas com mais tempo para criar.”

CENA 12 · MARCA · 88–96s
A ampulheta gira; a cidade e a sala real se unem no mesmo reflexo.
TEXTO: “Kairos Digital · construa a hora certa.”` },
]

const dialogueBeats: Record<string, Array<{ speaker: string; line: string }>> = {
  '01': [{ speaker: 'KAIROS', line: 'Recebi uma ideia. Querem que eu abra uma missão?' }, { speaker: 'ORION', line: 'Velocidade sem direção é só barulho.' }, { speaker: 'HUNTER AI', line: 'Sinal não é cliente; oportunidade não é promessa.' }, { speaker: 'INSTAGRAM AI', line: 'Primeiro, alguém precisa sentir.' }, { speaker: 'QA AI', line: 'Eu marco o que foi provado.' }, { speaker: 'FOUNDER', line: 'Revisar.' }],
  '02': [{ speaker: 'INSTAGRAM AI', line: 'Qual história merece ser contada primeiro?' }, { speaker: 'CFO', line: 'Quanto custa tentar?' }, { speaker: 'QA AI', line: 'Mostrem o limite e deixem a escolha visível.' }, { speaker: 'CLIENTE', line: 'Então vocês fazem tudo por mim?' }, { speaker: 'ELENCO', line: 'Nós preparamos o caminho para você decidir melhor.' }],
  '03': [{ speaker: 'FOUNDER', line: 'Eu tive uma ideia. Não tenho uma noite inteira.' }, { speaker: 'KAIROS', line: 'Eu devolvo opções, não decisões.' }, { speaker: 'QA AI', line: 'Evidência antes de transformar sinal em verdade.' }, { speaker: 'FOUNDER', line: 'Agora eu entendo o próximo passo.' }, { speaker: 'ELENCO', line: 'Pessoas com mais tempo para criar.' }],
}


const cast = [
  { name: 'Founder', role: 'Narrador e presença humana', state: 'Referências privadas locais', detail: 'A decisão final é humana. O press kit do Founder permanece no cofre privado local e não é enviado por esta tela.' },
  { name: 'KAIROS', role: 'Assistente pessoal · pessoa-avatar Kairos', state: 'Retrato v3 disponível', image: '/characters/kairos-portrait-v3.png', detail: 'Mediador humano do elenco: recebe a ideia, organiza opções e devolve a decisão ao Founder. A nova ficha usa a ampulheta como tatuagem, broche ou detalhe do figurino.' },
  { name: 'ORION', role: 'Coordenação estratégica · guardião-ampulheta', state: 'Retrato v3 disponível', image: '/characters/orion-portrait-v3.png', detail: 'Guardião de contexto e prioridades. Corpo, núcleo e silhueta repetem a geometria da ampulheta Kairos.' },
  { name: 'Instagram AI', role: 'Direção criativa · avatar azul', state: 'Retrato v3 disponível', image: '/characters/instagram-ai-portrait-v3.png', detail: 'Traduz intenção em narrativa, storyboard e conversa. Cabelo azul, lentes de holograma e emblema magenta.' },
  { name: 'Hunter AI', role: 'Pesquisa e qualificação · orc analista', state: 'Retrato v3 disponível', image: '/characters/hunter-ai-portrait-v3.png', detail: 'Procura sinais e os entrega para revisão; nunca confunde oportunidade com resultado. Ombreira com ampulheta gravada.' },
  { name: 'CFO', role: 'Limites e custo · entidade de vidro azul', state: 'Retrato v3 disponível', image: '/characters/cfo-portrait-v3.png', detail: 'Pergunta pelo limite antes de qualquer avanço. Sua ampulheta tem grãos azuis e nunca exibe saldo inventado.' },
  { name: 'Money Hunter', role: 'Valor e estratégia comercial · mensageira futurista', state: 'Retrato v3 disponível', image: '/characters/money-hunter-portrait-v3.png', detail: 'Liga necessidade humana a uma proposta de valor, sem prometer dinheiro ou conversão automática.' },
  { name: 'QA AI', role: 'Qualidade e evidência · sentinela âmbar', state: 'Retrato v3 disponível', image: '/characters/qa-ai-portrait-v3.png', detail: 'Interrompe atalhos e exige prova. Carrega uma ampulheta em forma de selo de validação.' },
  { name: 'CPO', role: 'Produto e experiências · arquiteto de protótipos', state: 'Retrato v3 disponível', image: '/characters/cpo-portrait-v3.png', detail: 'Transforma hipótese em protótipo revisável. O capacete projeta a marca Kairos como uma ampulheta geométrica.' },
  { name: 'Cliente-arquétipo', role: 'Olhar do público · personagem ficcional', state: 'Personagem ficcional', detail: 'Faz as perguntas que a audiência faria. Não representa nem reproduz uma pessoa ou cliente real.' },
  { name: 'Vilson', role: 'Sócio · participação futura', state: 'Referências privadas recebidas', detail: 'Cinco referências estão guardadas no cofre privado local. Ele entra no roteiro somente depois da atualização do Founder e da definição de sua cena; nada é enviado a provedor por esta tela.' },
]

const pressKits = [
  { title: 'ORION + KAIROS', image: '/characters/orion-kairos-press-kit-v2.png', members: 'Coordenação estratégica e presença humana', description: 'ORION protege o contexto como uma ampulheta viva; KAIROS recebe a ideia e devolve escolhas claras ao Founder.' },
  { title: 'INSTAGRAM AI + QA AI', image: '/characters/instagram-qa-press-kit-v1.png', members: 'Direção criativa e qualidade', description: 'A criadora azul dá forma à história; a sentinela âmbar exige prova, consistência e limites visíveis.' },
  { title: 'HUNTER AI + MONEY HUNTER', image: '/characters/hunter-money-press-kit-v1.png', members: 'Pesquisa e proposta de valor', description: 'O orc analista encontra sinais; a mensageira converte contexto em proposta sem vender promessas vazias.' },
  { title: 'CPO + CFO', image: '/characters/cpo-cfo-press-kit-v1.png', members: 'Produto e orçamento', description: 'O arquiteto transforma hipótese em protótipo; a entidade de vidro protege o limite antes de qualquer gasto.' },
]

function initialEpisodeDrafts() {
  const original = Object.fromEntries(episodes.map(episode => [episode.number, episode])) as Record<string, Episode>
  try { return { ...original, ...JSON.parse(localStorage.getItem(EPISODE_STORAGE_KEY) ?? '{}') } } catch { return original }
}

export function StudioPage() {
  const [tab, setTab] = useState<StudioTab>('story')
  const [selectedEpisode, setSelectedEpisode] = useState(episodes[0].number)
  const [episodeDrafts, setEpisodeDrafts] = useState<Record<string, Episode>>(initialEpisodeDrafts)
  const [continuation, setContinuation] = useState<Continuation>(() => localStorage.getItem('kairos.signal.continuation') === 'manual' ? 'manual' : 'paused')
  const [editRequest, setEditRequest] = useState(() => localStorage.getItem('kairos.signal.edit-request') ?? '')
  const [saved, setSaved] = useState(false)
  useEffect(() => { localStorage.setItem('kairos.signal.continuation', continuation) }, [continuation])
  const flashSaved = () => { setSaved(true); window.setTimeout(() => setSaved(false), 2500) }
  const saveEditRequest = () => { localStorage.setItem('kairos.signal.edit-request', editRequest.trim()); flashSaved() }
  const saveEpisodes = () => { localStorage.setItem(EPISODE_STORAGE_KEY, JSON.stringify(episodeDrafts)); flashSaved() }
  const episode = episodeDrafts[selectedEpisode]
  const updateEpisode = (field: keyof Episode, value: string) => setEpisodeDrafts(current => ({ ...current, [selectedEpisode]: { ...current[selectedEpisode], [field]: value } }))
  const prepareStoryboardFrame = (frame: (typeof storyboards)[string][number]) => {
    localStorage.setItem(STUDIO_PRODUCTION_DRAFT_KEY, JSON.stringify(toProductionDraft(episode.number, episode.title, frame)))
    setTab('production')
  }

  return <div className="page-stack studio-page">
    <section className="glass-panel studio-hero"><div><span className="eyebrow">KAIROS STUDIO · HISTÓRIAS, ELENCO E PRODUÇÃO</span><h2>O centro criativo da Kairos</h2><p>Uma única sala para construir a história, manter o elenco consistente, preparar cenas, acompanhar geração e preservar os filmes. A ampulheta Kairos guia cada peça visual. É o ponto de encontro entre as ferramentas conectadas e o acervo da Founder Edition.</p></div><div className="studio-hero-state"><img className="studio-brand-seal" src="/brand/kairos-digital-hourglass.jpg" alt="Assinatura Kairos Digital" /><span>HISTÓRIA ATIVA</span><strong>Kairos Signal</strong><small>Trilogia vertical · 3 episódios</small></div></section>
    <nav className="studio-tabs" aria-label="Áreas do Studio"><button className={tab === 'story' ? 'active' : ''} onClick={() => setTab('story')}><FileText size={16} />História</button><button className={tab === 'cast' ? 'active' : ''} onClick={() => setTab('cast')}><UsersRound size={16} />Elenco</button><button className={tab === 'production' ? 'active' : ''} onClick={() => setTab('production')}><Clapperboard size={16} />Produção</button><button className={tab === 'library' ? 'active' : ''} onClick={() => setTab('library')}><LibraryBig size={16} />Biblioteca</button></nav>
    {tab === 'story' && <><section className="glass-panel studio-continuation"><div><span className="eyebrow">CONTINUIDADE DA SÉRIE</span><h3>Como a Kairos Signal continua</h3><p>{continuation === 'paused' ? 'A produção está pausada. Nada é gerado, gasto ou publicado automaticamente.' : 'Modo manual: o roteiro e os pedidos ficam prontos, mas cada geração e publicação exige a ação correspondente no pipeline operacional.'}</p></div><div className="studio-switch"><button className={continuation === 'paused' ? 'selected' : ''} onClick={() => setContinuation('paused')}><Pause size={15} />Pausada</button><button className={continuation === 'manual' ? 'selected' : ''} onClick={() => setContinuation('manual')}><Play size={15} />Manual</button></div></section><section className="studio-autopilot-note"><LockKeyhole size={18} /><div><strong>Autopilot ainda não está liberado</strong><p>Ele só pode ser ativado após crédito real, provider configurado, job persistido, limite de gasto e uma integração social que confirme remotamente cada publicação.</p></div></section><section className="glass-panel studio-dialogue-deck"><div><span className="eyebrow">CONVERSA DO ELENCO · EPISÓDIO {episode.number}</span><h3>A história acontece entre as vozes</h3><p>Estas falas são a espinha do episódio. O roteiro completo abaixo traz a encenação e pode ser editado antes de qualquer geração.</p></div><ol>{(dialogueBeats[episode.number] ?? []).map((beat, index) => <li key={`${beat.speaker}-${index}`}><strong>{beat.speaker}</strong><span>“{beat.line}”</span></li>)}</ol></section><section className="glass-panel studio-storyboard"><div className="studio-storyboard-heading"><div><span className="eyebrow"><PanelsTopLeft size={13} /> LEITURA VISUAL GUIADA · EPISÓDIO {episode.number}</span><h3>Storyboard cinematográfico pronto para a fila</h3><p>São quadros de direção e prompts; ainda não são imagens ou vídeos gerados. Cada um preserva continuidade, marca e movimento de câmera antes de entrar em um job aprovado.</p></div><Camera size={28} /></div><div className="studio-storyboard-grid">{(storyboards[episode.number] ?? []).map(frame => <article key={frame.scene}><header><span>CENA {frame.scene} · {frame.duration}</span><strong>{frame.title}</strong></header><p>{frame.visual}</p><dl><div><dt>CÂMERA</dt><dd>{frame.camera}</dd></div><div><dt>TRANSIÇÃO</dt><dd>{frame.transition}</dd></div></dl><details><summary>Ver prompt de geração</summary><code>{frame.prompt}</code></details><button type="button" onClick={() => prepareStoryboardFrame(frame)}>Preparar no Content Engine</button></article>)}</div></section><section className="studio-episode-grid">{Object.values(episodeDrafts).map(item => <article className={`glass-panel studio-episode ${selectedEpisode === item.number ? 'selected' : ''}`} key={item.number} onClick={() => setSelectedEpisode(item.number)}><span>EPISÓDIO {item.number}</span><h3>{item.title}</h3><small>{item.status}</small><p>{item.summary}</p><blockquote>{item.narration}</blockquote><footer>{item.hook}</footer></article>)}</section><section className="glass-panel studio-screenplay"><div className="editorial-row"><div><span className="eyebrow">ROTEIRO COMPLETO · EPISÓDIO {episode.number}</span><h3>{episode.title}</h3><p>Edite a história, as falas, as cenas e o gancho. O rascunho fica salvo neste navegador até virar um job aprovado.</p></div><button className="primary-button" onClick={saveEpisodes}><Save size={15} />Salvar roteiro</button></div><div className="studio-script-fields"><label>Título<input value={episode.title} onChange={event => updateEpisode('title', event.target.value)} /></label><label>Resumo<input value={episode.summary} onChange={event => updateEpisode('summary', event.target.value)} /></label><label>Narração principal<textarea value={episode.narration} onChange={event => updateEpisode('narration', event.target.value)} rows={3} /></label><label>Roteiro e cenas<textarea value={episode.screenplay} onChange={event => updateEpisode('screenplay', event.target.value)} rows={18} /></label><label>Gancho final<input value={episode.hook} onChange={event => updateEpisode('hook', event.target.value)} /></label></div>{saved && <span className="studio-saved">Roteiro salvo neste navegador.</span>}</section></>}
    {tab === 'cast' && <><section className="glass-panel studio-cast-intro"><div><span className="eyebrow">ELENCO · KAIROS SIGNAL</span><h3>Personagens organizados por história</h3><p>Este é o elenco da trilogia. Cada história futura terá sua própria ficha de elenco, referências, objetos, roupas e versões.</p></div><img className="studio-cast-brand" src="/brand/kairos-digital-hourglass.jpg" alt="Ampulheta Kairos Digital" /></section><PrivateCloneVault /><section className="glass-panel studio-brand-bible"><span className="eyebrow">BÍBLIA VISUAL · KAIROS DIGITAL</span><h3>Uma assinatura que atravessa o universo</h3><div><p><strong>Ícone recorrente:</strong> a ampulheta aparece como selo, holograma, arquitetura, joia, tatuagem ou núcleo de cada agente.</p><p><strong>Paleta:</strong> violeta Kairos, azul elétrico, magenta e preto profundo; luz de borda e vidro dão unidade ao mundo físico e digital.</p><p><strong>Tipografia e encerramento:</strong> cada episódio reserva o lockup Kairos Digital e a frase “Construa a hora certa” para a marca final.</p></div></section><section className="studio-presskit-intro"><div><span className="eyebrow">ASSETS VISUAIS · ELENCO DO EPISÓDIO 01</span><h3>Quatro folhas de referência para a produção</h3><p>Estes são assets ficcionais de direção visual. Eles dão continuidade a rosto, roupa, objeto e assinatura da marca antes de qualquer cena em vídeo.</p></div></section><section className="studio-presskit-grid">{pressKits.map(kit => <article className="glass-panel studio-presskit-card" key={kit.title}><img src={kit.image} alt={`Press kit visual de ${kit.title}`} /><div><span>{kit.title}</span><small>{kit.members}</small><p>{kit.description}</p></div></article>)}</section><section className="glass-panel studio-character-directions"><div><span className="eyebrow">PRESS KIT DE DIREÇÃO · PERSONAGENS FICCIONAIS</span><h3>Identidade repetível antes de renderizar</h3><p>As folhas acima são a referência visual. Estas fichas registram os invariantes de roupa, objeto, marca e movimento para o prompt de cada cena.</p></div><div>{characterDirections.map(member => <article key={member.name}><strong>{member.name}</strong><span>{member.archetype}</span><dl><div><dt>MARCA</dt><dd>{member.marker}</dd></div><div><dt>OBJETO</dt><dd>{member.prop}</dd></div><div><dt>CÂMERA</dt><dd>{member.camera}</dd></div></dl></article>)}</div></section><section className="studio-cast-grid">{cast.map(member => <article className="glass-panel studio-cast-card" key={member.name}>{member.image && <img src={member.image} alt={`Retrato ficcional de ${member.name}`} />}<div><span className="studio-cast-mark">{member.name === 'Founder' || member.name === 'Vilson' ? <LockKeyhole size={18} /> : <Sparkles size={18} />}</span><div><strong>{member.name}</strong><small>{member.role}</small></div></div><em>{member.state}</em><p>{member.detail}</p>{member.name === 'Founder' && <button onClick={() => setTab('production')}>Preparar edição segura</button>}</article>)}</section></>}
    {tab === 'production' && <><section className="glass-panel studio-edit-request"><div><span className="eyebrow"><ImagePlus size={13} /> PEDIDO DE EDIÇÃO</span><h3>Melhorar imagem ou preparar uma nova cena</h3><p>Descreva a alteração: personagem, episódio, enquadramento, roupa, objeto, luz ou continuidade. O pedido fica salvo neste navegador para ser usado no gerador escolhido.</p></div><textarea value={editRequest} onChange={event => setEditRequest(event.target.value)} maxLength={2400} placeholder="Ex.: Episódio 1, plano 5: manter a paleta violeta, corrigir o reflexo do visor de KAIROS e deixar espaço para legenda…" rows={6} /><div><button className="primary-button" onClick={saveEditRequest}>Salvar pedido local</button>{saved && <span className="studio-saved">Pedido salvo neste navegador.</span>}</div></section><section className="studio-provider-note"><LockKeyhole size={18} /><p>O Studio organiza o pedido e o acervo. Enviar imagens do Founder, Wilson ou qualquer clone para GPT, Higgsfield, Seedance ou outro destino continua bloqueado até a escolha explícita do provedor e a autorização daquele envio.</p></section><ContentEnginePanel /><VideoPage /></>}
    {tab === 'library' && <><section className="glass-panel studio-library-intro"><LibraryBig size={28} /><div><span className="eyebrow">ACERVO DA HISTÓRIA</span><h3>Filmes, cenas e versões</h3><p>O acervo operacional mostra apenas itens devolvidos por um provider ou salvos localmente. A ausência de vídeo significa que ainda não houve geração verificável.</p></div></section><FilmLibraryPage embedded /></>}
  </div>
}

