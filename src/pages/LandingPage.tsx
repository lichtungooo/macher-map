import Header from '../components/Header'
import Hero from '../components/Hero'
import Vision from '../components/Vision'
import MapPreview from '../components/MapPreview'
import HowItWorks from '../components/HowItWorks'
import Calendar from '../components/Calendar'
import Network from '../components/Network'
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
        <Vision />
        <MapPreview />
        <HowItWorks />
        <Calendar />
        <Network />
        <Support />
      </main>
      <Footer />
    </div>
  )
}
