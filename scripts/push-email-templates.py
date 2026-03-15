"""
Push BelegPilot email templates to Supabase Auth via Management API.
Adapted from ReplyFlow's exact template structure.
"""
import json, urllib.request, sys

SB_TOKEN = sys.argv[1] if len(sys.argv) > 1 else ""
PROJECT_REF = "lybpfwzpoiutuqggbixg"

if not SB_TOKEN:
    print("Usage: python push-email-templates.py <SUPABASE_ACCESS_TOKEN>")
    sys.exit(1)

# Brand constants
BRAND = "BelegPilot"
ACCENT = "#0E7C6B"
ACCENT_BG = "#ecfdf5"
ACCENT_BORDER = "#6ee7b7"
URL = "https://belegpilot.predivo.ch"
LOGO_URL = f"{URL}/apple-touch-icon.png"
FONT = "'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,'Helvetica Neue',Arial,sans-serif"
FOOTER = "&copy; 2026 Predivo GmbH &middot; Bahnhofstrasse 55 &middot; 6403 K&uuml;ssnacht am Rigi"
PREHEADER_PAD = "&nbsp;&zwnj;" * 45


def email_shell(preheader, body):
    return (
        '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" '
        '"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
        '<html xmlns="http://www.w3.org/1999/xhtml"><head>'
        '<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>'
        '<meta name="viewport" content="width=device-width,initial-scale=1.0"/>'
        f'<title>{BRAND}</title></head>'
        f'<body style="margin:0;padding:0;font-family:{FONT};background-color:#f4f4f5;'
        '-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">'
        f'<div style="display:none;font-size:1px;color:#f4f4f5;line-height:1px;'
        f'max-height:0;max-width:0;opacity:0;overflow:hidden;">{preheader}</div>'
        f'<div style="display:none;max-height:0;overflow:hidden;">{PREHEADER_PAD}</div>'
        '<!--[if mso | IE]><table role="presentation" width="100%" bgcolor="#f4f4f5">'
        '<tr><td align="center"><![endif]-->'
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" '
        'style="background-color:#f4f4f5;"><tr><td align="center" style="padding:40px 16px;">'
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="480" '
        'style="max-width:480px;width:100%;">'
        # Logo row
        '<tr><td align="center" style="padding-bottom:28px;">'
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>'
        f'<td style="vertical-align:middle;"><img src="{LOGO_URL}" alt="{BRAND}" width="32" height="32" '
        'style="display:block;width:32px;height:32px;border-radius:6px;border:0;" /></td>'
        f'<td style="padding-left:10px;font-family:{FONT};font-size:20px;font-weight:700;'
        f'color:{ACCENT};letter-spacing:-0.02em;vertical-align:middle;">{BRAND}</td>'
        '</tr></table></td></tr>'
        # Card
        '<tr><td style="background-color:#ffffff;border:1px solid #e4e4e7;border-radius:12px;'
        f'padding:36px 32px;" bgcolor="#ffffff">{body}</td></tr>'
        # Footer
        '<tr><td align="center" style="padding-top:24px;">'
        f'<p style="margin:0;font-family:{FONT};font-size:12px;color:#a1a1aa;line-height:1.5;">'
        f'{FOOTER}</p>'
        f'<p style="margin:8px 0 0;font-family:{FONT};font-size:12px;">'
        f'<a href="{URL}" style="color:{ACCENT};text-decoration:none;">belegpilot.predivo.ch</a></p>'
        '</td></tr></table></td></tr></table>'
        '<!--[if mso | IE]></td></tr></table><![endif]--></body></html>'
    )


def otp_box(otp_type):
    return (
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
        f'<td align="center" style="background-color:{ACCENT_BG};border:2px solid {ACCENT_BORDER};'
        f'border-radius:10px;padding:20px 16px;" bgcolor="{ACCENT_BG}">'
        '<a href="{{ .SiteURL }}/auth/verify?token={{ .Token }}&amp;email={{ .Email }}'
        f'&amp;type={otp_type}" style="font-family:{FONT};font-size:32px;font-weight:700;'
        f'letter-spacing:6px;color:{ACCENT};text-decoration:none;">'
        '{{ .Token }}</a></td></tr></table>'
    )


def cta_button(text, href):
    return (
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" '
        'align="center" style="margin:0 auto;"><tr>'
        f'<td align="center" bgcolor="{ACCENT}" style="background-color:{ACCENT};'
        'border-radius:8px;mso-padding-alt:14px 40px;">'
        f'<a href="{href}" target="_blank" style="display:inline-block;font-family:{FONT};'
        'font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;padding:14px 40px;'
        'mso-line-height-rule:exactly;line-height:normal;">'
        f'<!--[if mso]>&nbsp;&nbsp;&nbsp;<![endif]-->{text}'
        '<!--[if mso]>&nbsp;&nbsp;&nbsp;<![endif]--></a></td></tr></table>'
    )


def heading(text):
    return (
        f'<h1 style="margin:0 0 8px;font-family:{FONT};font-size:22px;font-weight:700;'
        f'color:#18181b;text-align:center;">{text}</h1>'
    )


def para(text):
    return (
        f'<p style="margin:0 0 24px;font-family:{FONT};font-size:15px;color:#71717a;'
        f'line-height:1.6;text-align:center;">{text}</p>'
    )


def small(text, margin="16px 0 0"):
    return (
        f'<p style="margin:{margin};font-family:{FONT};font-size:13px;color:#a1a1aa;'
        f'text-align:center;">{text}</p>'
    )


# === CONFIRMATION (signup OTP) ===
confirmation = email_shell(
    "Ihr BelegPilot-Best\u00e4tigungscode ist {{ .Token }}",
    heading("E-Mail best\u00e4tigen")
    + para("Geben Sie diesen Code ein, um Ihre E-Mail zu best\u00e4tigen und Ihr BelegPilot-Konto zu erstellen.")
    + otp_box("signup")
    + small("Dieser Code ist 10 Minuten g\u00fcltig. Oder klicken Sie auf den Code, um sich direkt zu verifizieren.", "0 0 20px")
    + cta_button("E-Mail best\u00e4tigen", "{{ .ConfirmationURL }}")
    + small("Falls Sie dies nicht angefordert haben, k\u00f6nnen Sie diese E-Mail ignorieren.")
)

# === MAGIC LINK (login OTP) ===
magic_link = email_shell(
    "Ihr BelegPilot-Anmeldecode ist {{ .Token }}",
    heading("Bei BelegPilot anmelden")
    + para("Verwenden Sie den Code unten oder klicken Sie auf den Button, um sich anzumelden.")
    + otp_box("login")
    + small("Dieser Code ist 10 Minuten g\u00fcltig. Oder klicken Sie auf den Code, um sich direkt anzumelden.", "0 0 20px")
    + cta_button("Bei BelegPilot anmelden", "{{ .ConfirmationURL }}")
    + small("Falls Sie dies nicht angefordert haben, k\u00f6nnen Sie diese E-Mail ignorieren.")
)

# === RECOVERY (password reset) ===
recovery = email_shell(
    "Setzen Sie Ihr BelegPilot-Passwort zur\u00fcck. Klicken Sie auf den Link in dieser E-Mail.",
    heading("Passwort zur\u00fccksetzen")
    + para("Wir haben eine Anfrage erhalten, das Passwort f\u00fcr Ihr BelegPilot-Konto zur\u00fcckzusetzen. Klicken Sie auf den Button unten, um ein neues Passwort zu w\u00e4hlen.")
    + cta_button("Passwort zur\u00fccksetzen", "{{ .ConfirmationURL }}")
    + small("Dieser Link ist 10 Minuten g\u00fcltig. Falls Sie kein Zur\u00fccksetzen angefordert haben, k\u00f6nnen Sie diese E-Mail ignorieren.")
)

# === INVITE ===
invite = email_shell(
    "Sie wurden eingeladen, BelegPilot beizutreten. Nehmen Sie die Einladung an.",
    heading("Einladung zu BelegPilot")
    + para("Sie wurden eingeladen, BelegPilot beizutreten \u2014 die KI-gest\u00fctzte Belegverarbeitung f\u00fcr Treuhand. Klicken Sie unten, um die Einladung anzunehmen.")
    + cta_button("Einladung annehmen", "{{ .ConfirmationURL }}")
    + small("Falls Sie diese Einladung nicht erwartet haben, k\u00f6nnen Sie diese E-Mail ignorieren.")
)

# Build the update payload
payload = {
    "mailer_templates_confirmation_content": confirmation,
    "mailer_templates_magic_link_content": magic_link,
    "mailer_templates_recovery_content": recovery,
    "mailer_templates_invite_content": invite,
    "mailer_subjects_confirmation": "{{ .Token }} ist Ihr BelegPilot-Best\u00e4tigungscode",
    "mailer_subjects_magic_link": "{{ .Token }} ist Ihr BelegPilot-Anmeldecode",
    "mailer_subjects_recovery": "Passwort zur\u00fccksetzen \u2014 BelegPilot",
    "mailer_subjects_invite": "Einladung zu BelegPilot",
}

data = json.dumps(payload).encode("utf-8")
req = urllib.request.Request(
    f"https://api.supabase.com/v1/projects/{PROJECT_REF}/config/auth",
    data=data,
    method="PATCH",
    headers={
        "Authorization": f"Bearer {SB_TOKEN}",
        "Content-Type": "application/json",
    },
)

try:
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read())
    print("SUCCESS - all 4 email templates pushed!")
    print(f"  Confirmation: {result.get('mailer_subjects_confirmation', 'N/A')}")
    print(f"  Magic link:   {result.get('mailer_subjects_magic_link', 'N/A')}")
    print(f"  Recovery:     {result.get('mailer_subjects_recovery', 'N/A')}")
    print(f"  Invite:       {result.get('mailer_subjects_invite', 'N/A')}")
except urllib.error.HTTPError as e:
    print(f"ERROR {e.code}: {e.read().decode()}")
