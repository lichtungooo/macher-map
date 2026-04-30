import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import PrivacyPage from './pages/PrivacyPage'
import ImpressumPage from './pages/ImpressumPage'

/**
 * macher-map.org — reduzierte Landing-Seite.
 *
 * Die App selbst lebt jetzt unter https://real-life.network/macher
 * Diese Domain zeigt nur noch die Macher-DNA + Verweise zur App.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/datenschutz" element={<PrivacyPage />} />
        <Route path="/impressum" element={<ImpressumPage />} />
      </Routes>
    </BrowserRouter>
  )
}
