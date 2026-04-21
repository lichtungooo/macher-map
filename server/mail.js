import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'mail.your-server.de',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'frieden@lichtung.ooo',
    pass: process.env.SMTP_PASS,
  },
})

const FROM = '"Lichtung" <frieden@lichtung.ooo>'
const BASE = process.env.BASE_URL || 'https://lichtung.ooo'

function footer() {
  return `
    <hr style="border: none; border-top: 1px solid rgba(10,10,10,0.06); margin: 28px 0;" />
    <p style="font-size: 12px; color: rgba(10,10,10,0.35); line-height: 1.6;">
      Deine Daten sind bei uns sicher. Wir geben deine E-Mail-Adresse nicht an Dritte weiter.
    </p>
    <p style="font-size: 14px; font-style: italic; color: rgba(10,10,10,0.4); margin-bottom: 4px;">
      Frieden kommt aus dem Herzen.
    </p>
    <p style="font-size: 12px; color: rgba(10,10,10,0.3);">
      Lichtung — <a href="${BASE}" style="color: #D4A843; text-decoration: none;">lichtung.ooo</a><br/>
      Traeger: Kollektiv Lichtung e.V.
    </p>
  `
}

export async function sendVerifyEmail(email, token) {
  const link = `${BASE}/app?verify=${token}`
  await transporter.sendMail({
    from: FROM, to: email,
    subject: 'Bestaetigung deiner E-Mail — Lichtung',
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background: #FDFCF9;">
        <p style="font-size: 20px; color: #0A0A0A;">Willkommen bei Lichtung.</p>
        <p style="font-size: 15px; color: rgba(10,10,10,0.55); line-height: 1.7; margin-bottom: 28px;">
          Bitte bestaetigen deine E-Mail-Adresse, damit wir dich ueber Friedensveranstaltungen informieren koennen.
        </p>
        <a href="${link}" style="display: inline-block; padding: 16px 36px; background: #0A0A0A; color: #fff; text-decoration: none; border-radius: 8px; font-family: sans-serif; font-size: 15px; font-weight: 500;">
          E-Mail bestaetigen
        </a>
        <p style="font-size: 12px; color: rgba(10,10,10,0.3); margin-top: 28px;">
          Du kannst diesen Schritt auch spaeter nachholen.
        </p>
        ${footer()}
      </div>
    `,
  })
}

export async function sendResetEmail(email, token) {
  const link = `${BASE}/app?reset=${token}`
  await transporter.sendMail({
    from: FROM, to: email,
    subject: 'Passwort zuruecksetzen — Lichtung',
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background: #FDFCF9;">
        <p style="font-size: 20px; color: #0A0A0A;">Passwort zuruecksetzen</p>
        <p style="font-size: 15px; color: rgba(10,10,10,0.55); line-height: 1.7; margin-bottom: 28px;">
          Klicke auf den Button, um ein neues Passwort zu vergeben.
        </p>
        <a href="${link}" style="display: inline-block; padding: 16px 36px; background: #0A0A0A; color: #fff; text-decoration: none; border-radius: 8px; font-family: sans-serif; font-size: 15px; font-weight: 500;">
          Neues Passwort setzen
        </a>
        <p style="font-size: 12px; color: rgba(10,10,10,0.3); margin-top: 28px;">
          Der Link ist 1 Stunde gueltig. Falls du kein neues Passwort angefordert hast, ignoriere diese Mail.
        </p>
        ${footer()}
      </div>
    `,
  })
}

export async function sendNewsletter(recipients, subject, bodyHtml) {
  let sent = 0
  for (const { email, name } of recipients) {
    try {
      await transporter.sendMail({
        from: FROM, to: email,
        subject,
        html: `
          <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background: #FDFCF9;">
            ${name ? `<p style="font-size: 15px; color: rgba(10,10,10,0.55);">Lieber ${name},</p>` : ''}
            ${bodyHtml}
            ${footer()}
          </div>
        `,
      })
      sent++
    } catch (err) {
      console.error(`Newsletter an ${email} fehlgeschlagen:`, err.message)
    }
  }
  return sent
}
