import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, ExternalLink, KeyRound, PlugZap, RefreshCw, ShieldCheck } from 'lucide-react'
import { integrationCatalog } from '../../core/integrationCatalog'
import { useOperationsAuth } from '../../core/OperationsAuthProvider'
import { useYoutubeIntegration } from '../../core/useYoutubeIntegration'
import { OperationsUnlock } from '../dashboard/OperationsUnlock'
import type { IntegrationStatusResponse } from '../../types/integration'
import './integrations.css'

const emptyStatus: IntegrationStatusResponse = {
  checkedAt: '', tokenStoreConfigured: false,
  providers: integrationCatalog.map(provider => ({ id: provider.id, oauthConfigured: false, connected: false, mode: provider.id === 'x' ? 'manual-free' : 'oauth', missingConfiguration: [] })),
}

// Lê o sinal que o redirect de /api/integrations/youtube/callback deixa na
// query string (?youtube=connected|error&reason=...) uma única vez no boot
// desta página, e limpa a URL — nunca carrega token, só um aviso de
// sucesso/erro pro Founder ler.
function useYoutubeRedirectBanner() {
  const [banner, setBanner] = useState<{ tone: 'ok' | 'erro'; texto: string } | null>(null)
  useEffect(() => {
    const url = new URL(window.location.href)
    const sinal = url.searchParams.get('youtube')
    if (!sinal) return
    if (sinal === 'connected') setBanner({ tone: 'ok', texto: 'Canal do YouTube conectado.' })
    else if (sinal === 'error') setBanner({ tone: 'erro', texto: url.searchParams.get('reason') || 'Não foi possível conectar o YouTube.' })
    url.searchParams.delete('youtube')
    url.searchParams.delete('reason')
    window.history.replaceState(null, '', url.pathname + url.search + url.hash)
  }, [])
  return banner
}

export function IntegrationsPage() {
  const [status, setStatus] = useState(emptyStatus)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { header } = useOperationsAuth()
  const youtube = useYoutubeIntegration()
  const redirectBanner = useYoutubeRedirectBanner()

  const refresh = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch('/api/integrations/status', { headers: { accept: 'application/json' }, cache: 'no-store' })
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('Endpoint indisponível')
      setStatus(await response.json() as IntegrationStatusResponse)
    } catch {
      setError('O status do servidor não está disponível neste ambiente. Nenhuma conexão foi presumida.')
      setStatus(emptyStatus)
    } finally { setLoading(false) }
  }, [])
  useEffect(() => { void refresh() }, [refresh])
  useEffect(() => { if (redirectBanner?.tone === 'ok') void youtube.refresh() }, [redirectBanner, youtube])

  const youtubeConnected = youtube.state.status === 'ok' && youtube.state.data.connected
  const youtubeAccountLabel = youtube.state.status === 'ok' && youtube.state.data.connected ? youtube.state.data.accountLabel : null

  return <section className="page-stack integrations-page">
    <header className="glass-panel integrations-hero">
      <div><span className="eyebrow"><PlugZap size={14} /> CONTROL PLANE</span><h2>Integrações da Founder Edition</h2><p>Estado lido do servidor. Segredos nunca são enviados para este painel.</p></div>
      <button onClick={() => void refresh()} disabled={loading}><RefreshCw size={15} />{loading ? 'Verificando…' : 'Atualizar status'}</button>
    </header>
    {error && <p className="integration-alert" role="alert">{error}</p>}
    {redirectBanner && <p className="integration-alert" data-tone={redirectBanner.tone} role="status">{redirectBanner.texto}</p>}
    <OperationsUnlock />
    <div className="integration-summary">
      <article className="glass-panel"><ShieldCheck size={19} /><span>Armazenamento seguro</span><strong>{status.tokenStoreConfigured ? 'Configurado' : 'Pendente'}</strong><small>Supabase + chave de criptografia no servidor</small></article>
      <article className="glass-panel"><KeyRound size={19} /><span>OAuth pronto</span><strong>{status.providers.filter(item => item.mode === 'oauth' && item.oauthConfigured).length}/{status.providers.filter(item => item.mode === 'oauth').length}</strong><small>Credenciais detectadas sem revelar valores</small></article>
      <article className="glass-panel"><CheckCircle2 size={19} /><span>Contas conectadas</span><strong>{(youtubeConnected ? 1 : 0)}</strong><small>Nenhuma conta é inferida pelo login do navegador</small></article>
    </div>
    <div className="integration-grid">{integrationCatalog.map(definition => {
      const provider = status.providers.find(item => item.id === definition.id) ?? emptyStatus.providers[0]
      const connected = definition.id === 'youtube' ? youtubeConnected : provider.connected
      const ready = provider.mode === 'manual-free' || (provider.oauthConfigured && status.tokenStoreConfigured)
      return <article className="glass-panel integration-card" key={definition.id}>
        <div className="integration-card-head"><div><span className="eyebrow">{definition.cost}</span><h3>{definition.label}</h3></div><span className={`integration-state ${connected ? 'connected' : ready ? 'ready' : ''}`}>{connected ? 'Conectada' : ready ? 'Preparada' : 'Configuração pendente'}</span></div>
        <p>{definition.purpose}</p><small>{definition.requirement}</small>
        {provider.missingConfiguration.length > 0 && <div className="missing-config"><strong>Servidor precisa de:</strong>{provider.missingConfiguration.map(item => <code key={item}>{item}</code>)}</div>}
        {definition.id === 'youtube' && <div className="integration-actions">
          {!header && <small>Desbloqueie o Painel Operacional acima para conectar.</small>}
          {header && youtubeConnected && <>
            <small>Canal conectado: <strong>{youtubeAccountLabel || 'sem nome informado pelo Google'}</strong></small>
            <button type="button" onClick={() => void youtube.disconnect()}>Desconectar</button>
          </>}
          {header && !youtubeConnected && <>
            <button type="button" onClick={() => void youtube.connect()} disabled={youtube.connecting || provider.missingConfiguration.length > 0}>
              {youtube.connecting ? 'Abrindo o Google…' : 'Conectar canal'}
            </button>
            {youtube.connectError && <small role="alert">{youtube.connectError}</small>}
            {youtube.state.status === 'erro' && <small role="alert">{youtube.state.mensagem}</small>}
          </>}
        </div>}
        <a href={definition.portalUrl} target="_blank" rel="noreferrer">Abrir portal oficial <ExternalLink size={14} /></a>
      </article>
    })}</div>
    <footer className="glass-panel integration-runway"><span className="eyebrow">LANÇAMENTO · 7 DIAS</span><ol><li><strong>Dia 1</strong> Identidades, OAuth e armazenamento seguro</li><li><strong>Dia 2</strong> Fila de publicação e aprovação no servidor</li><li><strong>Dia 3</strong> Instagram e YouTube em ambiente de teste</li><li><strong>Dia 4</strong> Produção diária de vídeos de 8 segundos</li><li><strong>Dia 5</strong> Métricas reais e aprendizado editorial</li><li><strong>Dia 6</strong> QA, limites e recuperação de falhas</li><li><strong>Dia 7</strong> Primeira rotina operacional acompanhada</li></ol></footer>
  </section>
}
