/**
 * Shared SMTP email module for BelegPilot transactional emails.
 * Uses SMTP service via Deno's smtp client.
 *
 * Required env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */

import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

// ─── Config ──────────────────────────────────────────────────────────────────

interface SmtpConfig {
  hostname: string
  port: number
  username: string
  password: string
  from: string
}

function getSmtpConfig(): SmtpConfig {
  const hostname = Deno.env.get('SMTP_HOST')
  const port = Deno.env.get('SMTP_PORT')
  const username = Deno.env.get('SMTP_USER')
  const password = Deno.env.get('SMTP_PASS')
  const from = Deno.env.get('SMTP_FROM') ?? 'BelegPilot <noreply@belegpilot.predivo.ch>'

  if (!hostname || !port || !username || !password) {
    throw new Error('Missing SMTP configuration (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)')
  }

  return { hostname, port: parseInt(port, 10), username, password, from }
}

// ─── Send ────────────────────────────────────────────────────────────────────

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const config = getSmtpConfig()

  const client = new SMTPClient({
    connection: {
      hostname: config.hostname,
      port: config.port,
      tls: true,
      auth: {
        username: config.username,
        password: config.password,
      },
    },
  })

  try {
    await client.send({
      from: config.from,
      to: options.to,
      subject: options.subject,
      content: options.text ?? options.subject,
      html: options.html,
    })
  } finally {
    await client.close()
  }
}

// ─── Layout ──────────────────────────────────────────────────────────────────

const APP_URL = 'https://belegpilot.predivo.ch'

/** Wraps email body in a consistent branded layout */
function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>BelegPilot</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:24px 32px;background:#1A1D23;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:10px;">
                    <img src="https://belegpilot.predivo.ch/logo-email.png" alt="BelegPilot" width="32" height="32" style="display:block;border-radius:8px;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">BelegPilot</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #e4e4e7;">
              <p style="margin:0;font-size:12px;color:#71717a;line-height:1.5;">
                &copy; ${new Date().getFullYear()} BelegPilot &middot;
                <a href="${APP_URL}" style="color:#71717a;">belegpilot.predivo.ch</a>
              </p>
              <p style="margin:4px 0 0;font-size:12px;color:#a1a1aa;">
                Sie erhalten diese E-Mail, weil Sie ein BelegPilot-Konto besitzen.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/** Styled CTA button */
function button(text: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="background:#0E7C6B;border-radius:6px;">
      <a href="${href}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
        ${text}
      </a>
    </td>
  </tr>
</table>`
}

// ─── Templates ───────────────────────────────────────────────────────────────

/** Welcome email — sent after signup confirmation */
export function welcomeEmail(userName: string): { subject: string; html: string } {
  const firstName = userName.split(' ')[0]
  return {
    subject: `Willkommen bei BelegPilot, ${firstName}!`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1A1D23;">Willkommen bei BelegPilot, ${firstName}!</h1>
      <p style="margin:0 0 12px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Ihr 30-Tage-Testzeitraum ist jetzt aktiv. So starten Sie:
      </p>
      <ol style="margin:0 0 12px;padding-left:20px;font-size:15px;color:#3f3f46;line-height:1.8;">
        <li>Laden Sie Ihre ersten Belege hoch</li>
        <li>Lassen Sie die KI Daten automatisch extrahieren</li>
        <li>Prüfen, bestätigen und in Ihr ERP exportieren</li>
      </ol>
      <p style="margin:0 0 4px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Keine Kreditkarte nötig während des Testzeitraums.
      </p>
      ${button('Zum Dashboard', `${APP_URL}/dashboard`)}
      <p style="margin:0;font-size:13px;color:#71717a;">
        Benötigen Sie Hilfe? Antworten Sie einfach auf diese E-Mail.
      </p>
    `),
  }
}

/** Email confirmation — sent when user signs up */
export function confirmationEmail(userName: string, confirmUrl: string): { subject: string; html: string } {
  const firstName = userName.split(' ')[0]
  return {
    subject: 'Bestätigen Sie Ihre E-Mail-Adresse — BelegPilot',
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1A1D23;">E-Mail bestätigen</h1>
      <p style="margin:0 0 12px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Hallo ${firstName}, bitte bestätigen Sie Ihre E-Mail-Adresse, um Ihr BelegPilot-Konto zu aktivieren.
      </p>
      ${button('E-Mail bestätigen', confirmUrl)}
      <p style="margin:0;font-size:13px;color:#71717a;">
        Falls Sie kein Konto erstellt haben, können Sie diese E-Mail ignorieren.
      </p>
    `),
  }
}

/** Password reset — sent when user requests a password reset */
export function passwordResetEmail(userName: string, resetUrl: string): { subject: string; html: string } {
  const firstName = userName.split(' ')[0]
  return {
    subject: 'Passwort zurücksetzen — BelegPilot',
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1A1D23;">Passwort zurücksetzen</h1>
      <p style="margin:0 0 12px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Hallo ${firstName}, Sie haben angefordert, Ihr Passwort zurückzusetzen. Klicken Sie auf den Button unten, um ein neues Passwort zu wählen.
      </p>
      ${button('Neues Passwort wählen', resetUrl)}
      <p style="margin:0 0 12px;font-size:13px;color:#71717a;">
        Dieser Link ist 1 Stunde gültig.
      </p>
      <p style="margin:0;font-size:13px;color:#71717a;">
        Falls Sie kein Zurücksetzen angefordert haben, können Sie diese E-Mail ignorieren.
      </p>
    `),
  }
}

/** Magic link login — sent for passwordless auth */
export function magicLinkEmail(email: string, magicUrl: string): { subject: string; html: string } {
  return {
    subject: 'Ihr Anmeldelink — BelegPilot',
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1A1D23;">Anmeldelink</h1>
      <p style="margin:0 0 12px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Klicken Sie auf den Button unten, um sich bei BelegPilot anzumelden.
      </p>
      ${button('Jetzt anmelden', magicUrl)}
      <p style="margin:0;font-size:13px;color:#71717a;">
        Dieser Link ist 1 Stunde gültig. Falls Sie keine Anmeldung angefordert haben, können Sie diese E-Mail ignorieren.
      </p>
    `),
  }
}
