import { useState, type FormEvent } from 'react'
import { LockKeyhole, ShieldCheck, Unlock } from 'lucide-react'
import { useOperationsAuth } from '../../core/OperationsAuthProvider'
import './operations.css'

// Desbloqueia, só nesta aba/sessão, os dois endpoints que leem dado real do
// schema `command` (receita, MRR, clientes, frota de agentes). A credencial
// nunca é a mesma do login do site — é o KAIROS_USER/KAIROS_PASS configurado
// só para este projeto na Vercel do kairos-agi-core (ver api/_auth.js).
export function OperationsUnlock() {
  const { header, setCredentials, clear } = useOperationsAuth()
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')

  if (header) {
    return (
      <div className="ops-unlock ops-unlock-active glass-panel">
        <ShieldCheck size={16} />
        <span>Painel Operacional desbloqueado nesta sessão.</span>
        <button type="button" onClick={clear}>Trancar</button>
      </div>
    )
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!user || !pass) return
    setCredentials(user, pass)
    setPass('')
  }

  return (
    <form className="ops-unlock glass-panel" onSubmit={onSubmit}>
      <LockKeyhole size={16} />
      <span>Receita, MRR e frota real ficam trancados até desbloquear com a credencial do Painel Operacional.</span>
      <input
        type="text"
        autoComplete="username"
        placeholder="usuário"
        value={user}
        onChange={(event) => setUser(event.target.value)}
      />
      <input
        type="password"
        autoComplete="current-password"
        placeholder="senha"
        value={pass}
        onChange={(event) => setPass(event.target.value)}
      />
      <button type="submit"><Unlock size={14} /> Desbloquear</button>
    </form>
  )
}
