import { ArrowDown, Map, TreePine, Shield, GraduationCap, Wrench, Hammer, Users, Heart } from 'lucide-react'

function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-warm-bg text-ink font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-ink-ghost" style={{ background: 'rgba(250,248,245,0.8)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        <nav className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2.5">
              <Logo size={32} />
              <span className="font-bold text-lg">Macher-Map</span>
            </a>
            <div className="flex items-center gap-6">
              <a href="#werkzeugkasten" className="hidden sm:block text-sm font-medium text-ink-soft hover:text-gold transition-colors">Werkzeugkasten</a>
              <a href="#bildung" className="hidden sm:block text-sm font-medium text-ink-soft hover:text-gold transition-colors">Bildung</a>
              <a href="https://github.com/lichtungooo/macher-map" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-ink-faint rounded-lg hover:border-gold hover:text-gold transition-colors">
                <GitHubIcon size={16} />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </div>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="min-h-screen flex items-center pt-16" style={{ background: 'linear-gradient(to bottom, rgba(232,117,26,0.06), rgba(250,248,245,1) 60%)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8" style={{ background: 'rgba(232,117,26,0.1)', color: '#E8751A' }}>
                Open Source — MIT-Lizenz
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}>
                Werkzeugkasten fuer{' '}
                <span style={{ color: '#E8751A' }}>Handwerk und Community</span>
              </h1>

              <p className="text-lg text-ink-soft leading-relaxed max-w-2xl mx-auto mb-10">
                Die Macher-Map verbindet Werkstaetten, Macher und Abenteuer auf einer Karte — mit Skill-Tree, Gamification und Community. Fuer Handwerker, Schulen und alle, die anpacken.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Link
                  to="/app"
                  className="px-6 py-3 text-white font-medium rounded-lg transition-colors"
                  style={{ background: '#E8751A' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#C4620A'}
                  onMouseLeave={e => e.currentTarget.style.background = '#E8751A'}
                >
                  Prototyp ansehen
                </Link>
                <a href="#werkzeugkasten" className="px-6 py-3 border border-ink-faint font-medium rounded-lg hover:border-gold hover:text-gold transition-colors">
                  Werkzeugkasten entdecken
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: Map, label: 'Community-Karte' },
                  { icon: TreePine, label: 'Skill-Tree & Gamification' },
                  { icon: Shield, label: 'Dezentrale Identitaet' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-center gap-3 text-ink-soft">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(232,117,26,0.1)' }}>
                      <item.icon size={20} style={{ color: '#E8751A' }} />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
              <a href="#was-ist" className="text-ink-faint hover:text-gold transition-colors">
                <ArrowDown size={24} />
              </a>
            </div>
          </div>
        </section>

        {/* Was ist die Macher-Map */}
        <section id="was-ist" className="py-20 bg-warm-section">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Was ist die Macher-Map?</h2>
              <p className="text-lg text-ink-soft leading-relaxed mb-8">
                Eine Community-Plattform, die Werkstaetten, Workshops und Handwerker auf einer Karte sichtbar macht. Jeder Macher baut einen Skill-Tree auf — Holz, Metall, Elektro. Jeder Workshop gibt Erfahrung. Skills leveln sichtbar. Duolingo fuer Handwerk.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Map, title: 'Karte', desc: 'Werkstaetten, Makerspaces und Abenteuer in der Naehe' },
                  { icon: TreePine, title: 'Skill-Tree', desc: 'Holz, Metall, Elektro — jeder Workshop gibt XP' },
                  { icon: Users, title: 'Gilden', desc: 'Holzgilde, Schweissergilde — Gemeinschaft, die traegt' },
                  { icon: Hammer, title: 'Quests', desc: 'Bau-Wochenenden, Repair-Cafes, Workshops auf der Karte' },
                ].map((f) => (
                  <div key={f.title} className="flex gap-4 p-4 bg-white rounded-xl">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(232,117,26,0.1)' }}>
                      <f.icon size={20} style={{ color: '#E8751A' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{f.title}</h3>
                      <p className="text-sm text-ink-soft">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Bildung */}
        <section id="bildung" className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(232,117,26,0.1)' }}>
                  <GraduationCap size={24} style={{ color: '#E8751A' }} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Bildung und Schulen</h2>
                  <p className="text-sm font-medium" style={{ color: '#E8751A' }}>Arbeitstitel: Wir sind wertvoll</p>
                </div>
              </div>
              <p className="text-lg text-ink-soft leading-relaxed mb-6">
                73.000 Ausbildungsplaetze im Handwerk bleiben jedes Jahr unbesetzt. Die Macher-Map baut die Bruecke: Schueler entdecken spielerisch ihre Begabungen, leveln Skills und finden ihren Weg ins Handwerk — mit Quests statt Noten und einem Skill-Tree, der zeigt, was in ihnen steckt.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-warm-section rounded-xl">
                  <h3 className="font-semibold mb-1">Potenzialentfaltung</h3>
                  <p className="text-sm text-ink-soft">Begabungen sichtbar machen, Quests statt Noten, Wir-Prozess statt Einzelkaempfer</p>
                </div>
                <div className="p-4 bg-warm-section rounded-xl">
                  <h3 className="font-semibold mb-1">Dezentrale Identitaet</h3>
                  <p className="text-sm text-ink-soft">Kinder brauchen kein Handy — ein NFC-Ring reicht. Datenschutzkonform, kostenlos</p>
                </div>
                <div className="p-4 bg-warm-section rounded-xl">
                  <h3 className="font-semibold mb-1">Handwerk erleben</h3>
                  <p className="text-sm text-ink-soft">Workshops in Filialen, Werkstaetten, Schulen — jede Erfahrung zaehlt und wird sichtbar</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Werkzeugkasten — Real Life Network */}
        <section id="werkzeugkasten" className="py-20 bg-warm-section">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Der Werkzeugkasten</h2>
              <p className="text-lg text-ink-soft leading-relaxed mb-10">
                Die Macher-Map baut auf dem Real Life Network — einem modularen Open-Source-Oekosystem mit zwei Fundamenten.
              </p>

              <div className="space-y-5">
                {/* Web of Trust */}
                <a href="https://web-of-trust.de" target="_blank" rel="noopener noreferrer" className="block p-6 bg-white border border-ink-ghost rounded-xl hover:border-gold/40 transition-colors group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(37,99,235,0.1)' }}>
                      <Shield size={24} style={{ color: '#2563eb' }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-gold transition-colors">Web of Trust</h3>
                      <p className="text-ink-soft leading-relaxed mb-3">
                        Dezentrale Identitaet — jeder Mensch traegt seine Identitaet selbst. 12 Worte, die nur er kennt. Kein zentraler Server sieht Klardaten. Ed25519 Signaturen, AES-256-GCM Verschluesselung, offline-faehig.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['BIP39', 'Ed25519', 'did:key', 'CRDT', 'Offline-First'].map((tag) => (
                          <span key={tag} className="px-2.5 py-1 text-xs font-medium bg-ink-ghost rounded-md">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </a>

                {/* Real Life Stack */}
                <a href="https://real-life-stack.de" target="_blank" rel="noopener noreferrer" className="block p-6 bg-white border border-ink-ghost rounded-xl hover:border-gold/40 transition-colors group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(34,197,94,0.1)' }}>
                      <Wrench size={24} style={{ color: '#22c55e' }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-gold transition-colors">Real Life Stack</h3>
                      <p className="text-ink-soft leading-relaxed mb-3">
                        Modulares UI-Toolkit mit 9 Bausteinen: Karte, Profile, Kalender, Gamification, Dashboard, Community, Marktplatz, Log, Benachrichtigungen. React, TypeScript, Tailwind.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['React 19', 'TypeScript', 'Tailwind v4', '9 Module', 'MIT-Lizenz'].map((tag) => (
                          <span key={tag} className="px-2.5 py-1 text-xs font-medium bg-ink-ghost rounded-md">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </a>

                {/* Architektur-Diagramm */}
                <div className="p-6 rounded-xl text-white font-mono text-sm leading-relaxed" style={{ background: '#1A1A1A' }}>
                  <pre className="overflow-x-auto">{`┌─────────────────────────────────────────┐
│            Die Macher-Map               │
│  Karte · Skill-Tree · Gilden · Quests   │
├─────────────────────────────────────────┤
│          Real Life Network              │
│  9 Module · Open Source · MIT-Lizenz    │
├──────────────────┬──────────────────────┤
│  Real Life Stack │     Web of Trust     │
│  UI · Module     │  Identitaet · CRDT  │
└──────────────────┴──────────────────────┘`}</pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partner + CTA */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Wir suchen Partner</h2>
              <p className="text-lg text-ink-soft leading-relaxed mb-6">
                Die Macher-Map ist der erste Space im Real Life Network. Der Code steht. Die Architektur traegt. Was fehlt: Partner, die Reichweite, Filialen und die Macher-Marke mitbringen. Handwerk hat den goldenen Boden — wir bauen die digitale Bruecke.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                {['Open Source', 'MIT-Lizenz', 'Dezentral', 'Offline-faehig', 'DSGVO-konform', 'Kein Tracking'].map((tag) => (
                  <span key={tag} className="px-3 py-1.5 text-sm font-medium border border-ink-faint rounded-full">{tag}</span>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="https://github.com/lichtungooo/macher-map" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 text-white font-medium rounded-lg transition-colors" style={{ background: '#1A1A1A' }}>
                  <GitHubIcon size={18} />
                  GitHub
                </a>
                <a href="https://real-life-stack.de/app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 border border-ink-faint font-medium rounded-lg hover:border-gold hover:text-gold transition-colors">
                  Real Life Stack Demo
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 text-white" style={{ background: '#1A1A1A' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <Logo size={26} />
                <span className="font-bold">Macher-Map</span>
              </div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Ein Space im Real Life Network.
                <br />Gebaut mit Herz und Saegemehl.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>Projekt</h3>
              <div className="flex flex-col gap-1.5">
                <a href="https://web-of-trust.de" target="_blank" rel="noopener noreferrer" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>Web of Trust</a>
                <a href="https://real-life-stack.de" target="_blank" rel="noopener noreferrer" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>Real Life Stack</a>
                <a href="https://github.com/lichtungooo/macher-map" target="_blank" rel="noopener noreferrer" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>GitHub</a>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>Rechtliches</h3>
              <div className="flex flex-col gap-1.5">
                <Link to="/impressum" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>Impressum</Link>
                <Link to="/datenschutz" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>Datenschutz</Link>
              </div>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Open Source — MIT-Lizenz — Fuer immer frei</span>
            <span className="text-xs flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Gebaut mit <Heart size={11} style={{ color: '#E8751A' }} /> von Machern fuer Macher
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
