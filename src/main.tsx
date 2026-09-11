import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { EditorialProvider } from './core/EditorialProvider'
import { CloneProvider } from './core/CloneProvider'
import './styles.css'
import './engines/instagram/editorial.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EditorialProvider><CloneProvider><App /></CloneProvider></EditorialProvider>
  </StrictMode>,
)
