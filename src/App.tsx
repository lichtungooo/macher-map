import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import MapApp from './pages/MapApp'
import AdminPanel from './pages/AdminPanel'
import InvitePage from './pages/InvitePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<MapApp />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/invite" element={<InvitePage />} />
      </Routes>
    </BrowserRouter>
  )
}
