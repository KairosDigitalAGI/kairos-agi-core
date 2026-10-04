import { useMemo, useState } from 'react'
import { CheckCircle2, ClipboardList, PackageSearch, Trash2 } from 'lucide-react'
import { SectionHeader } from '../../ui/SectionHeader'
import { buildEditorialBrief, createCatalogCandidate, estimateGrossCommission, loadCatalog, saveCatalog, type CatalogCandidate, type CatalogDraft } from './ecommerceCatalog'

const today = () => new Date().toISOString().slice(0, 10)
const emptyDraft = (): CatalogDraft => ({ title: '', productUrl: '', priceBrl: 0, commissionPct: 0, sourceCheckedAt: today(), evidenceNote: '' })
const brl = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function EcommerceCatalogPanel() {
  const [items, setItems] = useState<CatalogCandidate[]>(() => loadCatalog())
  const [draft, setDraft] = useState<CatalogDraft>(() => emptyDraft())
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const verified = useMemo(() => items.filter(item => item.status === 'verificado'), [items])

  const persist = (next: CatalogCandidate[]) => { setItems(next); saveCatalog(next) }
  const add = () => {
    try { const candidate = createCatalogCandidate(draft); persist([candidate, ...items]); setDraft(emptyDraft()); setMessage('Candidato salvo localmente como rascunho.') }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível salvar.') }
  }
  const setStatus = (id: string, status: CatalogCandidate['status']) => persist(items.map(item => item.id === id ? { ...item, status } : item))
  const remove = (id: string) => { persist(items.filter(item => item.id !== id)); if (selected === id) setSelected(null) }

  return <article className="glass-panel moneylab-card ecommerce-catalog"><SectionHeader eyebrow="Catálogo assistido" title="Cesta real de produtos para o piloto" action={<PackageSearch size={18}/>}/><p className="catalog-intro">Cadastre somente produtos observados na plataforma oficial. O cálculo mostra comissão bruta potencial por venda; impostos, cancelamentos e variações continuam fora até a plataforma devolver os valores reais.</p>
    <div className="catalog-form"><label>Produto<input value={draft.title} onChange={event=>setDraft({...draft,title:event.target.value})} placeholder="Nome exibido no anúncio"/></label><label>URL oficial<input value={draft.productUrl} onChange={event=>setDraft({...draft,productUrl:event.target.value})} placeholder="https://produto.mercadolivre.com.br/..."/></label><label>Preço observado (R$)<input type="number" min="0" step="0.01" value={draft.priceBrl||''} onChange={event=>setDraft({...draft,priceBrl:Number(event.target.value)})}/></label><label>Comissão observada (%)<input type="number" min="0" max="100" step="0.01" value={draft.commissionPct||''} onChange={event=>setDraft({...draft,commissionPct:Number(event.target.value)})}/></label><label>Conferido em<input type="date" value={draft.sourceCheckedAt} onChange={event=>setDraft({...draft,sourceCheckedAt:event.target.value})}/></label><label className="catalog-evidence">Evidência<textarea value={draft.evidenceNote} onChange={event=>setDraft({...draft,evidenceNote:event.target.value})} placeholder="Onde a elegibilidade e a comissão foram conferidas"/></label><button onClick={add}>Salvar candidato</button></div>
    {message&&<p className="catalog-message">{message}</p>}<div className="catalog-summary"><span>{items.length} candidatos locais</span><span>{verified.length} verificados</span><span>{selected?'Briefing disponível':'Selecione um verificado para o briefing'}</span></div>
    {items.length===0?<div className="catalog-empty"><PackageSearch size={22}/><strong>Nenhum produto cadastrado</strong><span>A cesta permanece vazia até existir evidência real.</span></div>:<div className="catalog-list">{items.map(item=><article key={item.id} data-status={item.status}><header><div><strong>{item.title}</strong><span>{item.status}</span></div><b>{brl(estimateGrossCommission(item))} bruto/venda</b></header><p>{brl(item.priceBrl)} · {item.commissionPct}% · conferido em {item.sourceCheckedAt}</p><small>{item.evidenceNote}</small><div><a href={item.productUrl} target="_blank" rel="noreferrer">Abrir fonte</a>{item.status==='rascunho'&&<button onClick={()=>setStatus(item.id,'verificado')}><CheckCircle2 size={13}/> Marcar verificado</button>}{item.status==='verificado'&&<button onClick={()=>setSelected(selected===item.id?null:item.id)}><ClipboardList size={13}/> Briefing</button>}<button className="catalog-delete" onClick={()=>remove(item.id)} aria-label={`Excluir ${item.title}`}><Trash2 size={13}/></button></div>{selected===item.id&&<pre>{buildEditorialBrief(item)}</pre>}</article>)}</div>}
  </article>
}
