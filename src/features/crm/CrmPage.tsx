import { SectionHeader } from '../../ui/SectionHeader'
export function CrmPage() {
  return <div className="page-stack">
    <section className="pipeline-grid">{['Lead', 'Qualificação', 'Proposta', 'Ativo'].map(stage => <article className="pipeline-card" key={stage}><span>{stage}</span><strong>—</strong><small>Fonte não conectada</small></article>)}</section>
    <section className="glass-panel crm-panel"><SectionHeader eyebrow="CLIENTE ZERO" title="Pipeline Kairos" /><p>Nenhum CRM conectado. Os clientes serão exibidos após autenticação e conexão com a fonte autorizada.</p><p>Dados de clientes não são incluídos no código público desta plataforma.</p></section>
  </div>
}
