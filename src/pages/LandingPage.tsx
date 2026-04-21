import Header from '../components/Header'
import Hero from '../components/Hero'
import Kunstprojekt from '../components/Kunstprojekt'
import MapPreview from '../components/MapPreview'
import LiveFeed from '../components/LiveFeed'
import Support from '../components/Support'
import Footer from '../components/Footer'
import { useReveal } from '../hooks/useReveal'

export default function LandingPage() {
  useReveal()

  return (
    <div className="min-h-screen" style={{ background: '#fff' }}>
      <Header />
      <main>
        <Hero />
        <Kunstprojekt />
        <MapPreview />
        <LiveFeed />
        <Support />
      </main>
      <Footer />
    </div>
  )
}
