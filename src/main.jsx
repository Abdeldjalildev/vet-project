import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Suspense handles any future async translation loading smoothly */}
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <App />
    </Suspense>
  </StrictMode>,
)