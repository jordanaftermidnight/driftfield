import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import DriftfieldApp from './DriftfieldApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DriftfieldApp />
  </StrictMode>,
)
