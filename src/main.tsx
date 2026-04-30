import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Service Worker: nur in Production registrieren.
// Im Dev (vite dev) wuerde der SW Code aggressiv cachen und alte Versionen
// von Komponenten ausliefern (z.B. Dialoge die nicht mehr richtig rendern).
// Existierende SW-Registrierungen werden in Dev aktiv unregistriert + Caches geloescht.
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
    })
  } else {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const reg of regs) reg.unregister()
    })
    if ('caches' in window) {
      caches.keys().then((keys) => {
        for (const key of keys) caches.delete(key)
      })
    }
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
