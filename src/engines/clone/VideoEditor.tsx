import { useState } from 'react'
import { useClone } from '../../core/CloneProvider'
import type { CloneDraft, CloneVideo } from '../../types/clone'
import { providerIds, socialChannels } from './catalog'
import { emptyCloneDraft } from './domain'
export function VideoEditor({ video, close }: { video?: CloneVideo; close: () => void }) {
  const { state, dispatch } = useClone()
  const [draft, setDraft] = useState<CloneDraft>(video || emptyCloneDraft)
  const change = (key: keyof CloneDraft, value: string) => setDraft(d => ({ ...d, [key]: value }))
  const options = (kind: string, type?: string) => state.records.filter(r => r.kind === kind && (!type || r.fields.type === type))
  return <form className="glass-panel editor-form" onSubmit={e => { e.preventDefault(); if (!draft.channels.length) return; const saved = dispatch({ type: 'save', id: video?.id || crypto.randomUUID(), draft, at: new Date().toISOString() }); if (saved) close() }}>
    <h3>{video ? 'Editar produção' : 'Nova produção'}</h3><p>Edição reinicia a revisão das etapas. Nenhuma mídia será gerada ou publicada.</p>
    <label>Título<input required maxLength={160} value={draft.title} onChange={e => change('title', e.target.value)} /></label>
    <div className="editor-fields">
      {([{ key: 'identityId', label: 'Identidade autorizada', records: options('identity') }, { key: 'promptId', label: 'Prompt cadastrado', records: options('prompt') }, { key: 'imageAssetId', label: 'Imagem real', records: options('asset', 'Imagem') }, { key: 'videoAssetId', label: 'Vídeo real', records: options('asset', 'Vídeo') }, { key: 'thumbnailAssetId', label: 'Thumbnail real', records: options('asset', 'Thumbnail') }] as const).map(field => <label key={field.key}>{field.label}<select value={draft[field.key]} onChange={e => change(field.key, e.target.value)}><option value="">Selecionar depois</option>{field.records.map(record => <option key={record.id} value={record.id}>{record.name} · v{record.revision}</option>)}</select></label>)}
      <label>Engine planejada<select value={draft.provider} onChange={e => change('provider', e.target.value)}>{providerIds.map(id => <option key={id} value={id}>{id} · {id === 'manual' ? 'arquivo produzido por você' : 'desconectada'}</option>)}</select></label>
    </div>
    <fieldset className="clone-channels"><legend>Canais de destino · sem publicação</legend>{socialChannels.map(channel => <label key={channel}><input type="checkbox" checked={draft.channels.includes(channel)} onChange={e => setDraft(d => ({ ...d, channels: e.target.checked ? [...d.channels, channel] : d.channels.filter(c => c !== channel) }))} />{channel}</label>)}</fieldset>
    {!draft.channels.length && <p role="alert">Selecione pelo menos um canal.</p>}
    <label>Roteiro<textarea rows={5} maxLength={20000} value={draft.script} onChange={e => change('script', e.target.value)} /></label>
    <label>Legenda base<textarea rows={4} maxLength={12000} value={draft.caption} onChange={e => change('caption', e.target.value)} /></label>
    <div className="editorial-actions"><button className="primary-button" disabled={!draft.channels.length || !draft.title.trim()}>Salvar produção</button><button type="button" onClick={close}>Cancelar</button></div>
  </form>
}
