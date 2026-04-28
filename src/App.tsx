import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import LandingPage from './pages/LandingPage'
import PrivacyPage from './pages/PrivacyPage'
import ImpressumPage from './pages/ImpressumPage'

const MapApp = lazy(() => import('./pages/MapApp'))
const AdminPanel = lazy(() => import('./pages/AdminPanel'))
const InvitePage = lazy(() => import('./pages/InvitePage'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-ink-soft">Laden...</div>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<MapApp />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/invite" element={<InvitePage />} />
          <Route path="/datenschutz" element={<PrivacyPage />} />
          <Route path="/impressum" element={<ImpressumPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
