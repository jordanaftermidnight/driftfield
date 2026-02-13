import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { AuthCallback } from './components/auth/AuthCallback'
import './index.css'
import DriftfieldApp from './DriftfieldApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<DriftfieldApp />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
