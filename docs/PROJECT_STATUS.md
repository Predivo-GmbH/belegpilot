# BelegPilot — Project Status

**Last updated:** 2026-03-26
**Live URL:** https://belegpilot.predivo.ch
**Repository:** https://github.com/Arivioo/belegpilot
**Supabase project:** `lybpfwzpoiutuqggbixg` (account: `supabse@belegpilot.predivo.ch`)

## What is BelegPilot?

AI-powered document processing SaaS for Swiss Treuhand (accounting) firms. Upload invoices/receipts, extract data via Claude AI + ZUGFeRD XML, auto-suggest Swiss account codes, and export to ERP systems (Bexio, Abacus, Sage 50, Banana Accounting, CSV).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 4 |
| UI | shadcn/ui + Radix UI + Lucide icons |
| State | TanStack Query 5 (server state) + React state (local) |
| Backend | Supabase (PostgreSQL 17 + Auth + Storage + Edge Functions) |
| AI | Claude Sonnet 4.5 vision API (document extraction) |
| Payments | Stripe (checkout + webhooks) |
| Deploy | GitHub Actions → FTP → Metanet hosting |
| Testing | Playwright (e2e) + Vitest (unit) |

## Routes

### Public
| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Marketing page with value props |
| `/auth` | Auth | Login + 3-step OTP signup + forgot password |
| `/auth/callback` | Callback | OAuth callback handler |
| `/pricing` | Pricing | Plan comparison (Starter/Professional/Enterprise) |

### Protected (require authentication)
| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Dashboard | Stats cards (total/processed/review/exported) + recent docs |
| `/documents` | Documents | Searchable document list with status filters |
| `/documents/:id` | DocumentReview | Document detail: file preview, extracted data, edit fields |
| `/upload` | Upload | Drag-and-drop file upload with progress tracking |
| `/clients` | Clients | Mandant CRUD (create/edit/delete) with ERP format selection |
| `/export` | Export | ERP export with 5 format tabs, date filters |
| `/settings` | Settings | 5 tabs: Firmenprofil, Team, ERP-Exportformate, Abrechnung, Sicherheit |

## Database Schema

6 core tables (all with RLS):

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `organizations` | Multi-tenant firms | name, plan, stripe_customer_id, documents_this_month |
| `profiles` | Users (linked to auth.users) | organization_id, full_name, role (owner/member/viewer) |
| `clients` | Mandanten (SME clients) | organization_id, name, contact_email, erp_target |
| `documents` | Uploaded invoices/receipts | file_path, status, extracted_data (JSONB), confidence_scores, amount, supplier_name, account_number |
| `exports` | ERP export batches | erp_target, document_ids[], file_path, status |
| `vendor_patterns` | Learned categorization | organization_id, vendor_name → account suggestions |

### Migrations
1. `20260312_initial_schema.sql` — Core schema + RLS policies + trigger (`on_auth_user_created`)
2. `20260318_processing_helpers.sql` — `increment_org_usage()` function
3. `20260326_storage_policies.sql` — Storage bucket `documents` RLS (org-scoped)

### Storage Buckets
| Bucket | Access | Limits |
|--------|--------|--------|
| `documents` | Private (RLS) | 20 MB, PDF/JPEG/PNG/WEBP/TIFF |
| `exports` | Private | Generated ERP export files |

## Supabase Edge Functions

| Function | Purpose | Trigger |
|----------|---------|---------|
| `process-document` | AI extraction pipeline (Claude vision + ZUGFeRD + account suggestion) | Called after upload |
| `export-erp` | Generate ERP exports (CSV/Bexio/Abacus/Sage/Banana) | Export page |
| `create-checkout` | Stripe checkout session for plan upgrades | Settings > Abrechnung |
| `stripe-webhook` | Handle Stripe subscription events | Stripe webhook |
| `send-welcome` | Welcome email on signup | Auth trigger |
| `send-usage-alert` | Monthly usage threshold alerts | Cron/manual |
| `delete-account` | Full account + data cascade deletion | Settings > Sicherheit |

### Shared Utilities (`_shared/`)
- `auth.ts` — Request authentication + admin client
- `cors.ts` — CORS headers
- `email.ts` — Email delivery
- `swiss-accounts.ts` — Swiss accounting standards + VAT lookup
- `zugferd.ts` — ZUGFeRD/Factur-X XML parsing
- `formatters/` — ERP format generators (csv, bexio, abacus, sage, banana)

## Document Processing Pipeline

```
User uploads file
  → Supabase Storage (documents bucket, org-scoped folder)
  → DB record created (status: 'processing')
  → process-document edge function called
    → Download file from Storage
    → Extract ZUGFeRD/Factur-X XML (if PDF)
    → Claude Sonnet vision API extraction (all file types)
    → Cross-reference ZUGFeRD vs AI results
    → Suggest account codes via vendor_patterns
    → Store extracted_data + confidence_scores
    → Update document status to 'review'
  → User reviews/corrects extracted data
  → Mark as 'verified'
  → Export to ERP format
```

## Auth Flow

1. **Signup**: Email → 6-digit OTP verification → Complete profile (full name + org name)
2. **Login**: Email + password
3. **Forgot password**: Email → reset link → new password
4. **DB trigger**: `on_auth_user_created` auto-creates organization + profile
5. **Profile completion**: Updates org name + full name in DB tables (not just auth metadata)

## Frontend Architecture

```
src/
├── components/
│   ├── ui/           # shadcn/ui primitives (Button, Card, Input, etc.)
│   ├── layout/       # AppLayout (sidebar + header + content)
│   ├── shared/       # PasswordGate, ThemeToggle
│   ├── auth/         # Login, Signup, ForgotPassword
│   ├── dashboard/    # MetricCards, DocumentTable
│   ├── documents/    # Upload, Review, List
│   ├── clients/      # ClientList, ClientDetail
│   ├── export/       # ExportConfig, ExportHistory
│   └── settings/     # FirmProfile, Team, ERP, Billing, Security
├── hooks/
│   ├── useAuth.ts           # Auth state + signOut
│   ├── useProfile.ts        # User profile + org data
│   ├── useDashboardStats.ts # Dashboard aggregations
│   ├── useDocuments.ts      # Document listing + filters
│   └── usePageTitle.ts      # Dynamic page titles
├── lib/
│   ├── supabase.ts    # Typed Supabase client
│   ├── utils.ts       # cn() + helpers
│   └── constants.ts   # Plan limits, ERP targets
├── pages/             # Route pages (lazy-loaded)
├── types/             # TypeScript types (database.ts)
└── test/              # Test setup (vitest)
```

## Testing

### Unit Tests (Vitest)
```bash
npm run test        # Run once
npm run test:watch  # Watch mode
```

### E2E Tests (Playwright)
```bash
npm run test:e2e    # Run all
npm run test:e2e:ui # Interactive UI mode
```

| Test File | Tests | What it covers |
|-----------|-------|---------------|
| `e2e/landing.spec.ts` | Landing page | Hero, CTAs, navigation |
| `e2e/auth.spec.ts` | Auth flows | Login form, signup form, password gate |
| `e2e/password-gate.spec.ts` | Gate protection | Blocks access without code |
| `e2e/pricing.spec.ts` | Pricing page | Plan cards, feature comparison |
| `e2e/navigation.spec.ts` | Routing | Links, redirects, 404 |
| `e2e/visual-brand.spec.ts` | Visual regression | Colors, fonts, spacing |
| `e2e/screenshots.spec.ts` | Screenshot capture | All 5 public pages |
| `e2e/authenticated-flow.spec.ts` | Auth'd pages (8 tests) | Dashboard, documents, upload, upload file, clients, export, settings, create client |

**Test user:** `e2e-test3@belegpilot-test.ch` / `E2eTestPass2026` (pre-confirmed)

## CI/CD Workflows

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `deploy.yml` | Push to master | Lint → Test → Build → 3-step FTP deploy to Metanet |
| `keep-alive.yml` | Daily 08:00 UTC | GraphQL ping to prevent Supabase project pausing |
| `code-review.yml` | PR opened | Claude Sonnet reviews code (architecture, security, types) |

### Deploy Steps (Zero-Downtime)
1. Upload hashed assets (JS/CSS) → `belegpilot.predivo.ch/assets/`
2. Upload root files (HTML, .htaccess) → `belegpilot.predivo.ch/`
3. Clean stale assets from `/assets/`

### GitHub Secrets Required
| Secret | Purpose |
|--------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `VITE_PASSWORD_GATE` | Password gate code |
| `FTP_HOST` | Metanet FTP server |
| `FTP_USER` | Metanet FTP username |
| `FTP_PASS` | Metanet FTP password |
| `SUPABASE_URL` | For keep-alive workflow |
| `SUPABASE_ANON_KEY` | For keep-alive workflow |
| `ANTHROPIC_API_KEY` | For code-review workflow |

## Environment Variables

### Local Development (`.env.local`)
```
VITE_SUPABASE_URL=https://lybpfwzpoiutuqggbixg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_PASSWORD_GATE=belegpilot2026
```

### Supabase Edge Function Secrets
| Secret | Used by |
|--------|---------|
| `ANTHROPIC_API_KEY` | `process-document` (Claude API) |
| `STRIPE_SECRET_KEY` | `create-checkout`, `stripe-webhook` |
| `STRIPE_WEBHOOK_SECRET` | `stripe-webhook` |
| `RESEND_API_KEY` | `send-welcome`, `send-usage-alert` |
| `SUPABASE_SERVICE_ROLE_KEY` | All functions (admin operations) |

## Plans & Pricing

| Plan | Price | Documents/mo | Features |
|------|-------|-------------|----------|
| Starter | CHF 49/mo | 100 | 1 user, basic extraction, CSV export |
| Professional | CHF 149/mo | 500 | 5 users, all ERP formats, vendor learning |
| Enterprise | Custom | Unlimited | Unlimited users, API access, dedicated support |

## Current Status (2026-03-26)

### What Works
- Full auth flow (signup with OTP, login, forgot password, profile completion)
- Password gate protection
- Dashboard with real-time stats from Supabase
- Document upload → Storage → DB record → processing trigger
- Storage RLS policies (org-scoped file access, 4 policies: INSERT/SELECT/UPDATE/DELETE)
- Documents list with search + status filters
- Document review page with file preview + extracted data editing
- Client CRUD (create, edit, delete) with search
- Export page with 5 ERP format tabs
- Settings with company profile editing
- Stripe checkout integration (code complete, needs Stripe keys to activate)
- Zero-downtime deploy via GitHub Actions FTP
- Daily Supabase keep-alive (GraphQL ping)
- 13 e2e tests passing (5 public + 8 authenticated)
- AI document processing via Claude Sonnet vision API (edge function deployed)

### Verified Infrastructure (2026-03-26)
- **Auth config:** Site URL `https://belegpilot.predivo.ch`, OTP 6 digits / 600s expiry, autoconfirm enabled, German email subjects
- **Redirect URLs:** `https://belegpilot.predivo.ch/**`, `http://localhost:5173/**`
- **Edge function secrets set:** `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- **GitHub Actions secrets set:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_PASSWORD_GATE`, `FTP_HOST`, `FTP_USER`, `FTP_PASS`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`
- **DB pooler:** `aws-1-eu-central-1.pooler.supabase.com:5432` (NOT aws-0)

### What's Still Missing (for future sessions)
1. **Stripe integration (not yet configured):**
   - `STRIPE_SECRET_KEY` — needs Stripe account setup + key generation
   - `STRIPE_WEBHOOK_SECRET` — needs webhook endpoint configured in Stripe dashboard
   - `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PROFESSIONAL`, `STRIPE_PRICE_ENTERPRISE` — needs Stripe products/prices created
   - These must be set as both Supabase edge function secrets AND (for webhook) configured in Stripe dashboard
2. **Team management:** UI exists but invite functionality is not wired up (no invite email sending, no role assignment logic)
3. **Settings tabs:** ERP-Exportformate and Sicherheit tabs are placeholder UI only
4. **Email templates:** Welcome + usage alert edge functions are deployed and `RESEND_API_KEY` is set, but email templates need real sender domain verification in Resend
5. **No own domain** — uses `belegpilot.predivo.ch` subdomain (sufficient for now)

### Known Limitations (by design)
- `process-document` edge function CORS only allows `belegpilot.predivo.ch` (not localhost) — local dev cannot trigger AI processing
- No dark mode (brand decision — light only)

### Infrastructure
- **Supabase:** Free tier, project `lybpfwzpoiutuqggbixg` (account: `supabse@belegpilot.predivo.ch`)
- **Hosting:** Metanet (FTP deploy to `belegpilot.predivo.ch`)
- **Domain:** `belegpilot.predivo.ch` (subdomain of predivo.ch)
- **GitHub:** `Arivioo/belegpilot` (private repo)
- **Commits:** 27 on `master`
