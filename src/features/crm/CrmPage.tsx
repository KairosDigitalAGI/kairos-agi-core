import { ArrowUpRight, Filter, MoreHorizontal, Plus, Search } from 'lucide-react'
import { crmClients } from '../../data/mock'
import { SectionHeader } from '../../ui/SectionHeader'

export function CrmPage() {
  return (
    <div className="page-stack">
      <section className="pipeline-grid">
        {['Lead', 'Qualificação', 'Proposta', 'Ativo'].map((stage, index) => (
          <article className="pipeline-card" key={stage}><span>{stage}</span><strong>{[42, 18, 7, 3][index]}</strong><small>{['+12 esta semana', '6 aguardando ação', 'R$ 18,4k potencial', 'R$ 12,4k MRR'][index]}</small></article>
        ))}
      </section>
      <section className="glass-panel crm-panel">
        <SectionHeader eyebrow="CLIENTE ZERO" title="Pipeline Kairos" action={<div className="table-actions"><button><Search size={15} /> Buscar</button><button><Filter size={15} /> Filtrar</button><button className="primary-button"><Plus size={15} /> Novo lead</button></div>} />
        <div className="table-scroll">
          <table>
            <thead><tr><th>Cliente</th><th>Empresa</th><th>Pipeline</th><th>Próxima ação</th><th>Responsável</th><th>OS</th><th><span className="sr-only">Ações</span></th></tr></thead>
            <tbody>{crmClients.map((client) => (
              <tr key={client.id}>
                <td><strong>{client.name}</strong><small>{client.id}</small></td><td>{client.company}</td>
                <td><span className={`pipeline-chip stage-${client.pipeline.toLowerCase().replace('ç','c')}`}>{client.pipeline}</span></td>
                <td>{client.nextAction}</td><td>{client.owner}</td><td><button className="os-link">{client.serviceOrder}<ArrowUpRight size={13} /></button></td><td><button className="icon-button"><MoreHorizontal size={17} /></button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>
      <p className="privacy-note">Dados demonstrativos com identificadores anônimos. Nenhuma informação real de cliente é usada nesta versão.</p>
    </div>
  )
}
