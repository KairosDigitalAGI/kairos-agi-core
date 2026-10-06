import { useMemo, useState } from 'react'
import { BarChart3, FileUp, Trash2 } from 'lucide-react'
import { SectionHeader } from '../../ui/SectionHeader'
import { createMetricBatch, loadMetricBatches, METRICS_HEADER, saveMetricBatches, summarizeMetrics, type EcommerceMetricBatch } from './ecommerceMetrics'

const brl = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function EcommerceMetricsPanel() {
  const [batches, setBatches] = useState<EcommerceMetricBatch[]>(() => loadMetricBatches())
  const [sourceLabel, setSourceLabel] = useState('')
  const [csv, setCsv] = useState('')
  const [message, setMessage] = useState('')
  const summary = useMemo(() => summarizeMetrics(batches), [batches])
  const persist = (next: EcommerceMetricBatch[]) => { setBatches(next); saveMetricBatches(next) }
  const importBatch = () => {
    try { const batch = createMetricBatch(csv, sourceLabel); persist([batch, ...batches]); setCsv(''); setSourceLabel(''); setMessage(`${batch.rows.length} linhas importadas localmente.`) }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Falha ao importar métricas.') }
  }
  const readFile = async (file?: File) => { if (!file) return; setCsv(await file.text()); setSourceLabel(file.name) }
  return <article className="glass-panel moneylab-card ecommerce-metrics"><SectionHeader eyebrow="Métricas oficiais · importação assistida" title="Resultado observado do canal" action={<BarChart3 size={18}/>}/><p className="metrics-intro">Exporte o relatório da plataforma, normalize as seis colunas e revise antes de importar. O arquivo fica apenas neste navegador; nenhuma API ou conta é conectada.</p>
    <div className="metrics-kpis">{summary?<><div><span>Cliques</span><strong>{summary.clicks}</strong></div><div><span>Pedidos</span><strong>{summary.orders}</strong></div><div><span>Vendas</span><strong>{brl(summary.salesBrl)}</strong></div><div><span>Comissão validada</span><strong>{brl(summary.commissionBrl)}</strong></div><div><span>Conversão</span><strong>{summary.conversionPct===null?'Indisponível':`${summary.conversionPct.toFixed(2)}%`}</strong></div><div><span>Cancelamentos</span><strong>{summary.cancellations}</strong></div></>:<div className="metrics-unavailable"><span>Fonte</span><strong>Indisponível</strong><small>Nenhum relatório oficial importado.</small></div>}</div>
    <div className="metrics-import"><label>Nome do relatório<input value={sourceLabel} onChange={event=>setSourceLabel(event.target.value)} placeholder="Ex.: relatório oficial 2026-10-05.csv"/></label><label className="metrics-file"><FileUp size={15}/> Selecionar CSV<input type="file" accept=".csv,text/csv" onChange={event=>void readFile(event.target.files?.[0])}/></label><label className="metrics-csv">CSV normalizado<textarea value={csv} onChange={event=>setCsv(event.target.value)} placeholder={`${METRICS_HEADER}\n2026-10-05,0,0,0,0,0`}/></label><button onClick={importBatch}>Revisar e importar</button></div>{message&&<p className="metrics-message">{message}</p>}
    {batches.length>0&&<div className="metrics-batches">{batches.map(batch=><article key={batch.id}><div><strong>{batch.sourceLabel}</strong><span>{batch.rows.length} linhas · {new Date(batch.importedAt).toLocaleString('pt-BR')}</span></div><button onClick={()=>persist(batches.filter(item=>item.id!==batch.id))} aria-label={`Remover ${batch.sourceLabel}`}><Trash2 size={13}/></button></article>)}</div>}
  </article>
}
