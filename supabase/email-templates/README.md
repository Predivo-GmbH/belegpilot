# BelegPilot — Supabase Email Templates Setup

## 1. Set Redirect URLs

Go to **Supabase Dashboard → Authentication → URL Configuration**:

- **Site URL**: `https://belegpilot.predivo.ch`
- **Redirect URLs** (add all):
  - `https://belegpilot.predivo.ch/auth/callback`
  - `http://localhost:5173/auth/callback`

## 2. Apply Email Templates

Go to **Supabase Dashboard → Authentication → Email Templates**.

For each template type, paste the corresponding HTML file from this directory:

| Template Type       | File                    | Subject Line                                        |
|---------------------|-------------------------|-----------------------------------------------------|
| Confirm signup      | `confirm-signup.html`   | Bestätigen Sie Ihre E-Mail-Adresse — BelegPilot     |
| Reset password      | `reset-password.html`   | Passwort zurücksetzen — BelegPilot                   |
| Magic link          | `magic-link.html`       | Ihr Anmeldelink — BelegPilot                         |
| Invite user         | `invite-user.html`      | Einladung zu BelegPilot                              |

**Important**: Use `{{ .ConfirmationURL }}` as the link variable — this is Supabase's built-in template variable that auto-generates the correct callback URL.

## 3. SMTP Configuration (Optional)

For custom SMTP (instead of Supabase's built-in email), go to **Project Settings → Auth → SMTP Settings** and configure:

- SMTP Host
- SMTP Port (587 for TLS)
- SMTP User
- SMTP Password
- Sender email: `noreply@belegpilot.predivo.ch`
- Sender name: `BelegPilot`
