import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'mail.your-server.de',
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.SMTP_USER || 'frieden@lichtung.ooo',
    pass: process.env.SMTP_PASS,
  },
})

export async function sendMagicLink(email, token) {
  const baseUrl = process.env.BASE_URL || 'https://lichtung.ooo'
  const link = `${baseUrl}/app?token=${token}`

  await transporter.sendMail({
    from: '"Licht fuer Frieden" <frieden@lichtung.ooo>',
    to: email,
    subject: 'Dein Licht wartet — Licht fuer Frieden',
    text: [
      'Willkommen bei Licht fuer Frieden.',
      '',
      'Klicke auf diesen Link, um dein Profil zu erstellen und dein Licht auf die Karte zu setzen:',
      '',
      link,
      '',
      'Der Link ist 15 Minuten gueltig.',
      '',
      'Deine Daten sind bei uns sicher. Wir geben deine E-Mail-Adresse nicht an Dritte weiter.',
      'Du erhaeltst nur Nachrichten, wenn du den Newsletter aktiviert hast.',
      '',
      'Frieden kommt aus dem Herzen.',
      'Licht fuer Frieden — lichtung.ooo',
      'Traeger: Kollektiv Lichtung e.V.',
    ].join('\n'),
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background: #FDFCF9;">
        <p style="font-size: 20px; color: #0A0A0A; margin-bottom: 8px; font-weight: 400;">
          Willkommen bei Licht fuer Frieden.
        </p>
        <p style="font-size: 15px; color: rgba(10,10,10,0.55); line-height: 1.7; margin-bottom: 28px;">
          Klicke auf den Button, um dein Profil zu erstellen und dein Licht auf die Weltkarte zu setzen.
        </p>
        <a href="${link}" style="display: inline-block; padding: 16px 36px; background: #0A0A0A; color: #fff; text-decoration: none; border-radius: 8px; font-family: sans-serif; font-size: 15px; font-weight: 500;">
          Mein Licht setzen
        </a>
        <p style="font-size: 12px; color: rgba(10,10,10,0.3); margin-top: 28px;">
          Der Link ist 15 Minuten gueltig.
        </p>
        <hr style="border: none; border-top: 1px solid rgba(10,10,10,0.06); margin: 28px 0;" />
        <p style="font-size: 12px; color: rgba(10,10,10,0.35); line-height: 1.6; margin-bottom: 16px;">
          Deine Daten sind bei uns sicher. Wir geben deine E-Mail-Adresse nicht an Dritte weiter.
          Du erhaeltst nur Nachrichten, wenn du den Newsletter aktiviert hast.
        </p>
        <p style="font-size: 14px; font-style: italic; color: rgba(10,10,10,0.4); margin-bottom: 4px;">
          Frieden kommt aus dem Herzen.
        </p>
        <p style="font-size: 12px; color: rgba(10,10,10,0.3);">
          Licht fuer Frieden — <a href="https://lichtung.ooo" style="color: #D4A843; text-decoration: none;">lichtung.ooo</a><br/>
          Traeger: Kollektiv Lichtung e.V.
        </p>
      </div>
    `,
  })
}
