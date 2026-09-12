import { useMemo, useState } from 'react'
import { ArrowRight, BadgeDollarSign, BrainCircuit, Link2Off, ShieldCheck } from 'lucide-react'
import type { CampaignBrief } from '../../types/video'
import { distributionConnections } from './distribution'
import { buildConversionScript, estimateCampaign, generativeModels, VIDEO_PRICING_VERIFIED_AT } from './providerCatalog'

const initialBrief: CampaignBrief = {
  product: '', audience: '', promise: '', proof: '', callToAction: '', durationSeconds: 30,
  videoModelId: 'browser-local', imageModelId: 'runway-gemini-2.5-flash', imageCount: 0,
}

const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

interface Props { onUseScript: (title: string, script: string) => void }

export function ProductionPlanner({ onUseScript }: Props) {
  const [brief, setBrief] = useState(initialBrief)
  const estimate = useMemo(() => estimateCampaign(brief), [brief])
  const script = useMemo(() => buildConversionScript(brief), [brief])
  const videoModels = generativeModels.filter(model => model.media === 'video')
  const imageModels = generativeModels.filter(model => model.media === 'image')
  const selectedVideo = videoModels.find(model => model.id === brief.videoModelId)!

  return <section className="production-planner">
    <article className="glass-panel production-brief">
      <div className="editorial-row"><div><span className="eyebrow"><BrainCircuit size={13} /> DIREÇÃO CRIATIVA</span><h2>Planejar criativo de conversão</h2></div><span className="data-badge">dados informados pelo Founder</span></div>
      <div className="brief-fields">
        <label>Produto ou oferta<input value={brief.product} placeholder="O que será vendido?" onChange={event => setBrief({ ...brief, product: event.target.value })} /></label>
        <label>Público<input value={brief.audience} placeholder="Para quem é o vídeo?" onChange={event => setBrief({ ...brief, audience: event.target.value })} /></label>
        <label>Promessa principal<input value={brief.promise} placeholder="Qual transformação real entrega?" onChange={event => setBrief({ ...brief, promise: event.target.value })} /></label>
        <label>Prova ou diferencial<input value={brief.proof} placeholder="Resultado, demonstração ou mecanismo" onChange={event => setBrief({ ...brief, proof: event.target.value })} /></label>
        <label>Chamada para ação<input value={brief.callToAction} placeholder="Ex.: Fale com a Kairos no Instagram" onChange={event => setBrief({ ...brief, callToAction: event.target.value })} /></label>
      </div>
      <div className="planner-flow" aria-label="Pipeline de produção"><span>Oferta</span><ArrowRight size={14} /><span>Roteiro</span><ArrowRight size={14} /><span>Frames</span><ArrowRight size={14} /><span>Cenas IA</span><ArrowRight size={14} /><span>QA</span><ArrowRight size={14} /><span>Galeria</span></div>
      <button className="primary-button render-button" disabled={!script} onClick={() => onUseScript(brief.product.trim(), script)}>Usar roteiro no gerador local</button>
    </article>

    <aside className="glass-panel cost-planner">
      <div><span className="eyebrow"><BadgeDollarSign size={13} /> ORÇAMENTO ANTES DE GERAR</span><h3>{estimate.status === 'free' ? 'Custo de API zero' : `${money(estimate.totalUsd)} estimados`}</h3><p>{selectedVideo.capability}</p></div>
      <label>Modelo de vídeo<select value={brief.videoModelId} onChange={event => setBrief({ ...brief, videoModelId: event.target.value })}>{videoModels.map(model => <option key={model.id} value={model.id}>{model.label} · {model.usdPerUnit ? `${money(model.usdPerUnit)}/s` : 'grátis'}</option>)}</select></label>
      <div className="video-fields"><label>Duração<input type="number" min="5" max="180" step="5" value={brief.durationSeconds} onChange={event => setBrief({ ...brief, durationSeconds: Number(event.target.value) })} /></label><label>Frames<input type="number" min="0" max="30" value={brief.imageCount} onChange={event => setBrief({ ...brief, imageCount: Number(event.target.value) })} /></label></div>
      <label>Modelo de imagem<select value={brief.imageModelId} onChange={event => setBrief({ ...brief, imageModelId: event.target.value })}>{imageModels.map(model => <option key={model.id} value={model.id}>{model.label} · até {money(model.usdPerUnit)}/imagem</option>)}</select></label>
      <div className="cost-breakdown"><span>Vídeo <strong>{money(estimate.videoUsd)}</strong></span><span>Imagens <strong>{money(estimate.imagesUsd)}</strong></span><span>Total máximo exibido <strong>{money(estimate.totalUsd)}</strong></span></div>
      {selectedVideo.connected ? <p className="connection-state connected"><ShieldCheck size={15} />Disponível neste navegador</p> : <p className="connection-state"><Link2Off size={15} />API ainda não conectada; nenhum gasto pode ocorrer.</p>}
      <small>USD · tabela verificada em {new Date(`${VIDEO_PRICING_VERIFIED_AT}T12:00:00`).toLocaleDateString('pt-BR')}. Impostos, câmbio e novas tentativas não incluídos.</small>
    </aside>

    <article className="glass-panel distribution-panel">
      <div><span className="eyebrow">DISTRIBUIÇÃO</span><h3>Publicação preparada, contas desconectadas</h3></div>
      <div>{distributionConnections.map(connection => <article key={connection.channel}><div><strong>{connection.label}</strong><span>Envio por API: {money(connection.publishCostUsd)}</span></div><p>{connection.requirement}</p><a href={connection.sourceUrl} target="_blank" rel="noreferrer">Documentação oficial</a></article>)}</div>
      <p className="distribution-note">A publicação só será liberada depois do login, revisão do vídeo e confirmação explícita do envio.</p>
    </article>
  </section>
}
