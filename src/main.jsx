import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/phase2'
import './i18n/phase4'
import './i18n/phase5'
import './i18n/phase6'
import './i18n/phase7'
import './i18n/phase8'
import './i18n/phase9'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthProvider'
import AppErrorBoundary from './components/AppErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <AuthProvider>
        <AppErrorBoundary>
          <App />
        </AppErrorBoundary>
      </AuthProvider>
    </Suspense>
  </StrictMode>,
)
