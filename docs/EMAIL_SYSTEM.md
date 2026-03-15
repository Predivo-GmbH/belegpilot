# BelegPilot Email System

## Overview

BelegPilot uses a dual email system:

1. **Supabase Auth emails** — OTP codes, password reset, magic links (pushed via Management API)
2. **Custom SMTP emails** — Transactional emails sent from Edge Functions via `denomailer`

All emails are in **German** and use the BelegPilot brand layout (logo + `#0E7C6B` accent, `#1A1D23` header).

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Supabase Auth                       │
│  (confirmation, magic_link, recovery, invite)        │
│  Templates pushed via Management API                 │
│  Subject format: "{{ .Token }} ist Ihr BelegPilot-…" │
│  OTP: 6 digits, 10 min expiry                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│             Edge Functions + SMTP                    │
│  _shared/email.ts → denomailer → mail.predivo.ch    │
│  From: noreply@belegpilot.predivo.ch                │
│                                                      │
│  Templates:                                          │
│  1. welcomeEmail        → send-welcome function      │
│  2. trialEndingEmail    → stripe-webhook (trial_end) │
│  3. paymentFailedEmail  → stripe-webhook (inv.fail)  │
│  4. planChangedEmail    → stripe-webhook (sub.update) │
│  5. accountDeletedEmail → delete-account function    │
│  6. usageAlertEmail     → send-usage-alert function  │
└─────────────────────────────────────────────────────┘
```

---

## Email Templates

### 1. Welcome (`welcomeEmail`)
- **Trigger**: After profile completion (OTP verify → set password + name)
- **Sent by**: `send-welcome` edge function
- **Content**: 30-day trial active, 3-step getting started, CTA → Dashboard

### 2. Trial Ending (`trialEndingEmail`)
- **Trigger**: Stripe `customer.subscription.trial_will_end` event (3 days before)
- **Sent by**: `stripe-webhook` edge function
- **Content**: Days remaining, pricing info (CHF 29/mo), CTA → Pricing

### 3. Payment Failed (`paymentFailedEmail`)
- **Trigger**: Stripe `invoice.payment_failed` event
- **Sent by**: `stripe-webhook` edge function
- **Content**: Payment issue notice, update payment method CTA → Settings

### 4. Plan Changed (`planChangedEmail`)
- **Trigger**: Stripe `customer.subscription.updated` event (when plan metadata changes)
- **Sent by**: `stripe-webhook` edge function
- **Content**: Upgrade/downgrade confirmation with plan name, CTA → Settings

### 5. Account Deleted (`accountDeletedEmail`)
- **Trigger**: User requests account deletion via Settings
- **Sent by**: `delete-account` edge function
- **Content**: Deletion confirmation (nDSG compliance), re-signup option

### 6. Usage Alert (`usageAlertEmail`)
- **Trigger**: Document upload hits 80% or 100% of monthly quota
- **Sent by**: `send-usage-alert` edge function
- **Content**: Usage stats (processed/limit), visual table, CTA → Pricing or Dashboard

---

## Edge Functions

### `send-welcome`
- **Method**: POST (authenticated)
- **Auth**: JWT required
- **Action**: Fetches user info → sends welcome email

### `stripe-webhook`
- **Method**: POST (Stripe signature)
- **Events handled**:
  - `checkout.session.completed` → activate subscription
  - `customer.subscription.updated` → update plan + send planChanged email
  - `customer.subscription.deleted` → downgrade to starter
  - `customer.subscription.trial_will_end` → send trialEnding email
  - `invoice.payment_failed` → send paymentFailed email
- **Helper**: `getOrgAdminByCustomerId()` — looks up org → owner profile → auth user

### `delete-account`
- **Method**: POST (authenticated)
- **Auth**: JWT required, must be org owner
- **Deletion order** (FK-safe):
  1. `exports`
  2. `documents`
  3. `clients`
  4. `vendor_patterns`
  5. `profiles`
  6. `organizations`
  7. Send confirmation email (best-effort)
  8. Delete auth user via admin API

### `send-usage-alert`
- **Method**: POST
- **Body** (optional): `{ "org_id": "uuid" }`
- **Action**: Checks `documents_this_month` vs plan quota, sends alert at 80%/100%
- **Plan quotas**: starter=50, professional=500, enterprise=5000
- **Usage**: Call after document upload or via cron job

---

## SMTP Configuration

| Setting | Value |
|---------|-------|
| Host | `mail.predivo.ch` |
| Port | 465 (TLS) |
| Username | Set via `SMTP_USER` env var |
| Password | Set via `SMTP_PASS` env var |
| From | `BelegPilot <noreply@belegpilot.predivo.ch>` |

---

## Supabase Auth Email Config

| Setting | Value |
|---------|-------|
| OTP length | 6 digits |
| OTP expiry | 600 seconds (10 min) |
| Confirmation subject | `{{ .Token }} ist Ihr BelegPilot-Bestätigungscode` |
| Magic link subject | `{{ .Token }} ist Ihr BelegPilot-Anmeldecode` |
| Recovery subject | `Passwort zurücksetzen — BelegPilot` |
| Invite subject | `Einladung zu BelegPilot` |

Templates are pushed programmatically via `scripts/push-email-templates.py` — never edit manually in Supabase dashboard.

---

## Files Changed (2026-03-15)

| File | Change |
|------|--------|
| `supabase/functions/_shared/email.ts` | Removed 3 dead-code templates (confirmationEmail, passwordResetEmail, magicLinkEmail). Added 5 new templates: trialEndingEmail, paymentFailedEmail, planChangedEmail, accountDeletedEmail, usageAlertEmail |
| `supabase/functions/stripe-webhook/index.ts` | Added email imports, `getOrgAdminByCustomerId()` helper, `PLAN_TIERS` constant. Wired emails into `subscription.updated`, `invoice.payment_failed`. Added new `customer.subscription.trial_will_end` handler |
| `supabase/functions/delete-account/index.ts` | **New**. Deletes all user data in FK order, sends confirmation email, deletes auth user |
| `supabase/functions/send-usage-alert/index.ts` | **New**. Checks document quotas per org, sends alerts at 80%/100% thresholds |
