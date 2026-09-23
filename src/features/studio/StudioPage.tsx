import { useEffect, useState } from 'react'
import { Bot, Clapperboard, FileText, ImagePlus, LibraryBig, LockKeyhole, Pause, Play, Sparkles, UsersRound } from 'lucide-react'
import { ContentEnginePanel } from '../dashboard/ContentEnginePanel'
import { FilmLibraryPage } from '../../engines/video/FilmLibraryPage'
import { VideoPage } from '../../engines/video/VideoPage'
import './studio.css'

type StudioTab = 'story' | 'cast' | 'production' | 'library'
type Continuation = 'paused' | 'manual'

const episodes = [
  { number: '01', title: 'O sinal dentro da tela', status: 'Em desenvolvimento', summary: 'Um pixel violeta revela a Founder Tower dentro de uma interface. KAIROS e ORION mostram que tecnologia só avança com direção humana.', narration: '“E se a próxima empresa não nascesse em um prédio? E se ela nascesse de uma decisão?”', hook: 'Amanhã, a cidade responde.' },
  { number: '02', title: 'A cidade que aprendeu', status: 'Roteiro definido', summary: 'Uma cidade virtual conecta criatividade, negócios e revisão humana. A Pulse Arena transforma competição em construção útil.', narration: '“A pergunta nunca foi quem a IA vai substituir. É quem vai aprender a dirigir a ferramenta.”', hook: 'Agora sai da tela.' },
  { number: '03', title: 'Do outro lado do clique', status: 'Roteiro definido', summary: 'O portal se fecha num monitor real. A ficção encontra pessoas, critérios e entregas verificáveis da Kairos Digital.', narration: '“A tela não é o fim da história. É onde a próxima missão começa.”', hook: 'Kairos Digital. Construa a hora certa.' },
]

const cast = [
  { name: 'Founder', role: 'Narrador e presença humana', state: 'Referências privadas locais', detail: 'O press kit do Founder não é publicado, copiado para o repositório nem enviado a um provedor por esta tela. Uma edição ou geração exige escolher o destino e autorizar aquele envio.' },
  { name: 'KAIROS', role: 'Robô pessoal do Founder', state: 'Bíblia visual v0.1', detail: 'Entidade ficcional: cerâmica preta, visor violeta e luz azul. Faz a ponte entre missão, memória operacional e interface.' },
  { name: 'ORION', role: 'Coordenação estratégica', state: 'Bíblia visual v0.1', detail: 'Entidade ficcional abstrata de vidro e órbitas de luz. Aparece como mapa de prioridades, nunca como pessoa real.' },
  { name: 'Wilson', role: 'Participação futura autorizada', state: 'Aguardando referências e consentimento', detail: 'Ainda não há material autorizado no Studio. A série usa enquadramento sem rosto ou omite essa participação até o registro correto.' },
]

export function StudioPage() {
  const [tab, setTab] = useState<StudioTab>('story')
  const [continuation, setContinuation] = useState<Continuation>(() => localStorage.getItem('kairos.signal.continuation') === 'manual' ? 'manual' : 'paused')
  const [editRequest, setEditRequest] = useState(() => localStorage.getItem('kairos.signal.edit-request') ?? '')
  const [saved, setSaved] = useState(false)

  useEffect(() => { localStorage.setItem('kairos.signal.continuation', continuation) }, [continuation])
  const saveEditRequest = () => { localStorage.setItem('kairos.signal.edit-request', editRequest.trim()); setSaved(true); window.setTimeout(() => setSaved(false), 2500) }

  return <div className="page-stack studio-page">
    <section className="glass-panel studio-hero">
      <div><span className="eyebrow">KAIROS STUDIO · HISTÓRIAS, ELENCO E PRODUÇÃO</span><h2>O centro criativo da Kairos</h2><p>Uma única sala para construir a história, manter o elenco consistente, preparar cenas, acompanhar geração e preservar os filmes. É o ponto de encontro entre as ferramentas conectadas e o acervo da Founder Edition.</p></div>
      <div className="studio-hero-state"><span>HISTÓRIA ATIVA</span><strong>Kairos Signal</strong><small>Trilogia vertical · 3 episódios</small></div>
    </section>

    <nav className="studio-tabs" aria-label="Áreas do Studio">
      <button className={tab === 'story' ? 'active' : ''} onClick={() => setTab('story')}><FileText size={16} />História</button>
      <button className={tab === 'cast' ? 'active' : ''} onClick={() => setTab('cast')}><UsersRound size={16} />Elenco</button>
      <button className={tab === 'production' ? 'active' : ''} onClick={() => setTab('production')}><Clapperboard size={16} />Produção</button>
      <button className={tab === 'library' ? 'active' : ''} onClick={() => setTab('library')}><LibraryBig size={16} />Biblioteca</button>
    </nav>

    {tab === 'story' && <>
      <section className="glass-panel studio-continuation"><div><span className="eyebrow">CONTINUIDADE DA SÉRIE</span><h3>Como a Kairos Signal continua</h3><p>{continuation === 'paused' ? 'A produção está pausada. Nada é gerado, gasto ou publicado automaticamente.' : 'Modo manual: o roteiro e os pedidos ficam prontos, mas cada geração e publicação exige a ação correspondente no pipeline operacional.'}</p></div><div className="studio-switch"><button className={continuation === 'paused' ? 'selected' : ''} onClick={() => setContinuation('paused')}><Pause size={15} />Pausada</button><button className={continuation === 'manual' ? 'selected' : ''} onClick={() => setContinuation('manual')}><Play size={15} />Manual</button></div></section>
      <section className="studio-autopilot-note"><LockKeyhole size={18} /><div><strong>Autopilot ainda não está liberado</strong><p>Ele só pode ser ativado após crédito real, provider configurado, job persistido, limite de gasto e uma integração social que confirme remotamente cada publicação. A Kairos não agenda nem posta enquanto uma dessas provas faltar.</p></div></section>
      <section className="studio-episode-grid">{episodes.map(episode => <article className="glass-panel studio-episode" key={episode.number}><span>EPISÓDIO {episode.number}</span><h3>{episode.title}</h3><small>{episode.status}</small><p>{episode.summary}</p><blockquote>{episode.narration}</blockquote><footer>{episode.hook}</footer></article>)}</section>
    </>}

    {tab === 'cast' && <>
      <section className="glass-panel studio-cast-intro"><div><span className="eyebrow">ELENCO · KAIROS SIGNAL</span><h3>Personagens organizados por história</h3><p>Este é o elenco da trilogia. Cada história futura terá sua própria ficha de elenco, referências, objetos, roupas e versões. Clones pessoais permanecem separados das personagens ficcionais.</p></div><Bot size={32} /></section>
      <section className="studio-cast-grid">{cast.map(member => <article className="glass-panel studio-cast-card" key={member.name}><div><span className="studio-cast-mark">{member.name === 'Founder' ? <LockKeyhole size={18} /> : <Sparkles size={18} />}</span><div><strong>{member.name}</strong><small>{member.role}</small></div></div><em>{member.state}</em><p>{member.detail}</p>{member.name === 'Founder' && <button onClick={() => setTab('production')}>Preparar edição segura</button>}</article>)}</section>
    </>}

    {tab === 'production' && <>
      <section className="glass-panel studio-edit-request"><div><span className="eyebrow"><ImagePlus size={13} /> PEDIDO DE EDIÇÃO</span><h3>Melhorar imagem ou preparar uma nova cena</h3><p>Descreva a alteração: personagem, episódio, enquadramento, roupa, objeto, luz ou continuidade. O pedido fica salvo neste navegador para ser usado no gerador escolhido.</p></div><textarea value={editRequest} onChange={event => setEditRequest(event.target.value)} maxLength={2400} placeholder="Ex.: Episódio 1, plano 5: manter a paleta violeta, corrigir o reflexo do visor de KAIROS e deixar espaço para legenda…" rows={6} /><div><button className="primary-button" onClick={saveEditRequest}>Salvar pedido local</button>{saved && <span className="studio-saved">Pedido salvo neste navegador.</span>}</div></section>
      <section className="studio-provider-note"><LockKeyhole size={18} /><p>O Studio organiza o pedido e o acervo. Enviar imagens do Founder, Wilson ou qualquer clone para GPT, Higgsfield, Seedance ou outro destino continua bloqueado até a escolha explícita do provedor e a autorização daquele envio.</p></section>
      <ContentEnginePanel />
      <VideoPage />
    </>}

    {tab === 'library' && <><section className="glass-panel studio-library-intro"><LibraryBig size={28} /><div><span className="eyebrow">ACERVO DA HISTÓRIA</span><h3>Filmes, cenas e versões</h3><p>O acervo operacional mostra apenas itens devolvidos por um provider ou salvos localmente. A ausência de vídeo significa que ainda não houve geração verificável.</p></div></section><FilmLibraryPage embedded /></>}
  </div>
}
