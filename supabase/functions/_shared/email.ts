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

/**
 * denomailer 1.6.0's quoted-printable encoder is buggy: it discards the
 * `data.replaceAll('=','=3D')` result, so '=' is never escaped and the output
 * is invalid QP. Lenient clients (Gmail, Apple Mail) tolerate it, but classic
 * Outlook (Word engine) mis-decodes it and strips the inline styles, so the
 * email renders as flat, unstyled gray boxes. Encode each MIME part as base64
 * — decoded correctly by every client incl. Outlook — and pass them via
 * `mimeContent`, which denomailer emits verbatim (no QP step).
 */
function base64Part(mimeType: string, body: string): { mimeType: string; content: string; transferEncoding: string } {
  const bytes = new TextEncoder().encode(body)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return { mimeType, content: btoa(bin).replace(/.{1,76}/g, '$&\r\n'), transferEncoding: 'base64' }
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
      mimeContent: [
        base64Part('text/plain; charset="utf-8"', options.text ?? options.subject),
        base64Part('text/html; charset="utf-8"', options.html),
      ],
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
                &copy; ${new Date().getFullYear()} BelegPilot by Predivo GmbH. Alle Rechte vorbehalten.
              </p>
              <p style="margin:4px 0 0;font-size:12px;color:#a1a1aa;">
                Swiss-made
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

/** Welcome email — sent after profile completion */
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

/** Trial ending soon — sent 3 days before trial expiry */
export function trialEndingEmail(
  userName: string,
  daysLeft: number,
): { subject: string; html: string } {
  const firstName = userName.split(' ')[0]

  return {
    subject: `Ihr BelegPilot-Testzeitraum endet in ${daysLeft} Tag${daysLeft === 1 ? '' : 'en'}`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1A1D23;">Ihr Testzeitraum endet bald, ${firstName}</h1>
      <p style="margin:0 0 12px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Ihr kostenloser Testzeitraum läuft in <strong>${daysLeft} Tag${daysLeft === 1 ? '' : 'en'}</strong> ab.
        Upgraden Sie jetzt, um Ihre Belege weiterhin mit KI-gestützter Extraktion zu verarbeiten.
      </p>
      <p style="margin:0 0 12px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Pläne ab <strong>CHF 29/Monat</strong> — Jahrespläne sparen Ihnen ca. 2 Monate.
      </p>
      ${button('Plan wählen', `${APP_URL}/pricing`)}
      <p style="margin:0;font-size:13px;color:#71717a;">
        Noch nicht bereit? Kein Problem — Ihre Daten bleiben gespeichert und Sie können jederzeit upgraden.
      </p>
    `),
  }
}

/** Payment failed — sent when Stripe reports a failed charge */
export function paymentFailedEmail(
  userName: string,
): { subject: string; html: string } {
  const firstName = userName.split(' ')[0]

  return {
    subject: 'Handlung erforderlich: Zahlung fehlgeschlagen — BelegPilot',
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1A1D23;">Zahlungsproblem, ${firstName}</h1>
      <p style="margin:0 0 12px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Wir konnten Ihre letzte Zahlung für BelegPilot nicht verarbeiten. Dies liegt häufig an einer abgelaufenen Karte oder unzureichendem Guthaben.
      </p>
      <p style="margin:0 0 12px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Bitte aktualisieren Sie Ihre Zahlungsmethode, um Ihr Konto aktiv zu halten.
      </p>
      ${button('Zahlungsmethode aktualisieren', `${APP_URL}/settings`)}
      <p style="margin:0;font-size:13px;color:#71717a;">
        Falls Sie glauben, dass dies ein Fehler ist, antworten Sie einfach auf diese E-Mail.
      </p>
    `),
  }
}

/** Plan changed — sent after a subscription upgrade/downgrade */
export function planChangedEmail(
  userName: string,
  newPlan: string,
  isUpgrade: boolean,
): { subject: string; html: string } {
  const firstName = userName.split(' ')[0]
  const planDisplay = newPlan.charAt(0).toUpperCase() + newPlan.slice(1)
  const verb = isUpgrade ? 'geupgradet' : 'geändert'

  return {
    subject: `Ihr BelegPilot-Plan wurde auf ${planDisplay} ${verb}`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1A1D23;">Plan ${verb}, ${firstName}</h1>
      <p style="margin:0 0 12px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Ihr BelegPilot-Abonnement wurde auf den <strong>${planDisplay}</strong>-Plan ${verb}.
        ${isUpgrade ? 'Ihre neuen Limits sind sofort aktiv.' : 'Die Änderung tritt am Ende Ihres aktuellen Abrechnungszeitraums in Kraft.'}
      </p>
      ${button('Konto anzeigen', `${APP_URL}/settings`)}
    `),
  }
}

/** Account deleted confirmation — nDSG compliance */
export function accountDeletedEmail(
  userName: string,
): { subject: string; html: string } {
  const firstName = userName.split(' ')[0]

  return {
    subject: 'Ihr BelegPilot-Konto wurde gelöscht',
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1A1D23;">Konto gelöscht, ${firstName}</h1>
      <p style="margin:0 0 12px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Ihr BelegPilot-Konto und alle zugehörigen Daten wurden wie gewünscht unwiderruflich gelöscht.
      </p>
      <p style="margin:0 0 12px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Falls dies ein Versehen war oder Sie zurückkehren möchten, können Sie sich jederzeit neu registrieren.
      </p>
      <p style="margin:0;font-size:13px;color:#71717a;">
        Es tut uns leid, Sie gehen zu sehen. Haben Sie Feedback? Antworten Sie auf diese E-Mail — wir freuen uns über Ihre Rückmeldung.
      </p>
    `),
  }
}

/** Usage alert — sent at 80% and 100% document quota */
export function usageAlertEmail(
  userName: string,
  orgName: string,
  currentUsage: number,
  limit: number,
  percentage: number,
): { subject: string; html: string } {
  const firstName = userName.split(' ')[0]
  const isAtLimit = percentage >= 100

  return {
    subject: isAtLimit
      ? `Dokumentenlimit erreicht — BelegPilot`
      : `${percentage}% Ihres Dokumentenlimits erreicht — BelegPilot`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1A1D23;">${isAtLimit ? 'Dokumentenlimit erreicht' : 'Nutzungswarnung'}, ${firstName}</h1>
      <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
        ${isAtLimit
          ? `<strong>${orgName}</strong> hat das monatliche Dokumentenlimit von <strong>${limit} Belegen</strong> erreicht. Neue Uploads werden bis zum nächsten Abrechnungszeitraum pausiert.`
          : `<strong>${orgName}</strong> hat <strong>${currentUsage} von ${limit}</strong> Belegen (${percentage}%) diesen Monat verarbeitet.`
        }
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
        <tr>
          <td width="50%" style="padding:12px;background:#fafafa;border-radius:6px 0 0 6px;border:1px solid #e4e4e7;border-right:none;text-align:center;">
            <p style="margin:0;font-size:24px;font-weight:700;color:#1A1D23;">${currentUsage}</p>
            <p style="margin:4px 0 0;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Verarbeitet</p>
          </td>
          <td width="50%" style="padding:12px;background:#fafafa;border-radius:0 6px 6px 0;border:1px solid #e4e4e7;text-align:center;">
            <p style="margin:0;font-size:24px;font-weight:700;color:${isAtLimit ? '#E9A23B' : '#0E7C6B'};">${limit}</p>
            <p style="margin:4px 0 0;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Limit</p>
          </td>
        </tr>
      </table>
      ${isAtLimit
        ? button('Plan upgraden', `${APP_URL}/pricing`)
        : button('Nutzung anzeigen', `${APP_URL}/dashboard`)
      }
    `),
  }
}
