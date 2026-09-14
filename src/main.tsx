import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { EditorialProvider } from './core/EditorialProvider'
import { CloneProvider } from './core/CloneProvider'
import { OperationsAuthProvider } from './core/OperationsAuthProvider'
import './styles.css'
import './engines/instagram/editorial.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OperationsAuthProvider>
      <EditorialProvider><CloneProvider><App /></CloneProvider></EditorialProvider>
    </OperationsAuthProvider>
  </StrictMode>,
)
