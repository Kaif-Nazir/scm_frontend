import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import StartupGate from './StartupGate.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StartupGate />
  </StrictMode>,
)
