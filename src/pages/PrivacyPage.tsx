import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-16 px-6" style={{ background: '#FDFCF9', fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-8" style={{ color: 'rgba(10,10,10,0.5)', textDecoration: 'none', fontSize: '0.82rem' }}>
          <ArrowLeft size={14} /> Zurueck
        </Link>

        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 400, color: '#1A1A1A', marginBottom: '1rem' }}>
          Datenschutzerklaerung
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'rgba(10,10,10,0.45)', marginBottom: '3rem' }}>
          Stand: April 2026
        </p>

        <div style={{ fontSize: '0.92rem', lineHeight: 1.8, color: 'rgba(10,10,10,0.75)' }}>

          <h2 style={h2Style}>1. Verantwortlicher</h2>
          <p>
            Kollektiv Lichtung e.V.<br />
            Waldstr. 9<br />
            34587 Felsberg<br />
            E-Mail: hallo@macher-map.org
          </p>

          <h2 style={h2Style}>2. Welche Daten wir erheben</h2>
          <p>
            Wir erheben nur, was fuer die Funktion der Plattform noetig ist:
          </p>
          <ul style={listStyle}>
            <li><strong>Bei der Registrierung:</strong> E-Mail-Adresse, Passwort (verschluesselt gespeichert als bcrypt-Hash — wir sehen dein Passwort nie im Klartext).</li>
            <li><strong>Im Profil (freiwillig):</strong> Name, Profilbild, Macher-Motto, Biografie, Telegram-Name.</li>
            <li><strong>Dein Pin:</strong> Die geografische Position, die du selbst waehlst.</li>
            <li><strong>Abenteuer und Werkstaetten:</strong> Titel, Beschreibung, Position, Zeit, Bild.</li>
            <li><strong>Verbindungen:</strong> Wer durch wen zur Plattform eingeladen wurde.</li>
            <li><strong>Newsletter:</strong> Wenn du zustimmst, senden wir dir Informationen zu Abenteuern und Werkstaetten.</li>
          </ul>

          <h2 style={h2Style}>3. Was wir nicht tun</h2>
          <ul style={listStyle}>
            <li>Keine Weitergabe an Dritte. Deine E-Mail-Adresse bleibt bei uns.</li>
            <li>Kein Tracking, keine Werbung, keine Analyse-Tools.</li>
            <li>Keine Cookies ausser technisch notwendiger Session-Token.</li>
            <li>Kein Verkauf von Daten.</li>
          </ul>

          <h2 style={h2Style}>4. Wo deine Daten liegen</h2>
          <p>
            Alle Daten liegen auf einem Server in Deutschland (Strato, Berlin).
            Bilder und Datenbank sind nur fuer unsere Anwendung erreichbar.
            Die Verbindung ist TLS-verschluesselt (https).
          </p>

          <h2 style={h2Style}>5. Deine Rechte</h2>
          <p>Du hast jederzeit das Recht:</p>
          <ul style={listStyle}>
            <li><strong>auf Auskunft</strong> — im Profil unter Einstellungen findest du den Button "Meine Daten herunterladen".</li>
            <li><strong>auf Loeschung</strong> — im Profil unter Einstellungen kannst du dein Konto und alle deine Daten mit einem Klick loeschen.</li>
            <li><strong>auf Berichtigung</strong> — du kannst dein Profil jederzeit aendern.</li>
            <li><strong>auf Widerruf der Einwilligung</strong> — den Newsletter kannst du jederzeit abbestellen.</li>
            <li><strong>auf Beschwerde</strong> bei der Datenschutzbehoerde deines Bundeslandes.</li>
          </ul>

          <h2 style={h2Style}>6. Rechtsgrundlage</h2>
          <p>
            Die Verarbeitung deiner Daten erfolgt auf Grundlage deiner Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)
            und zur Erfuellung des Nutzungsvertrags (Art. 6 Abs. 1 lit. b DSGVO).
          </p>

          <h2 style={h2Style}>7. Speicherdauer</h2>
          <p>
            Deine Daten bleiben gespeichert, solange dein Konto besteht.
            Wenn du dein Konto loeschst, werden alle persoenlichen Daten innerhalb von 7 Tagen unwiderruflich entfernt.
          </p>

          <h2 style={h2Style}>8. Kontakt</h2>
          <p>
            Fragen zum Datenschutz: <a href="mailto:hallo@macher-map.org" style={{ color: '#E8751A' }}>hallo@macher-map.org</a>
          </p>
        </div>
      </div>
    </div>
  )
}

const h2Style = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontSize: '1.3rem',
  fontWeight: 500,
  color: '#1A1A1A',
  marginTop: '2rem',
  marginBottom: '0.6rem',
}

const listStyle = {
  paddingLeft: '1.2rem',
  marginBottom: '1rem',
}
