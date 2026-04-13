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
    from: '"Lichtung" <frieden@lichtung.ooo>',
    to: email,
    subject: 'Dein Licht wartet',
    text: `Willkommen bei Lichtung.\n\nKlicke auf diesen Link, um dein Profil zu erstellen und dein Licht auf die Karte zu setzen:\n\n${link}\n\nDer Link ist 15 Minuten gueltig.\n\nFrieden kommt aus dem Herzen.\nLichtung — lichtung.ooo`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <p style="font-size: 18px; color: #0A0A0A; margin-bottom: 8px;">Willkommen bei Lichtung.</p>
        <p style="font-size: 15px; color: rgba(10,10,10,0.55); line-height: 1.7; margin-bottom: 24px;">
          Klicke auf den Link, um dein Profil zu erstellen und dein Licht auf die Karte zu setzen.
        </p>
        <a href="${link}" style="display: inline-block; padding: 14px 32px; background: #0A0A0A; color: #fff; text-decoration: none; border-radius: 8px; font-family: sans-serif; font-size: 14px;">
          Mein Licht setzen
        </a>
        <p style="font-size: 12px; color: rgba(10,10,10,0.3); margin-top: 32px;">
          Der Link ist 15 Minuten gueltig.
        </p>
        <hr style="border: none; border-top: 1px solid rgba(10,10,10,0.06); margin: 24px 0;" />
        <p style="font-size: 13px; font-style: italic; color: rgba(10,10,10,0.4);">
          Frieden kommt aus dem Herzen.<br />
          Lichtung — lichtung.ooo
        </p>
      </div>
    `,
  })
}
