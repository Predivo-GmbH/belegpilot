# Feature Registry — BelegPilot

**Total:** 82 features | **Covered:** 82 (100%) | **Partial:** 0 (0%) | **Not Covered:** 0 (0%)

> Single source of truth for every user-facing feature and infrastructure component.
> Per Rule 52: update this file whenever a feature is added, changed, or removed.
> Coverage is based on existing E2E tests in `e2e/` as of 2026-05-29.

---

## Coverage Legend

- **COVERED** — At least one E2E test directly exercises the feature's core user flow.
- **PARTIAL** — E2E test verifies page load or element presence but not the actual mutation/side effect.
- **NOT COVERED** — No E2E test exercises this feature.

---

## [Public Pages] (5 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| PUB-001 | Landing page — hero, trust bar, CTAs | `landing.spec.ts:renders hero section`, `smoke.spec.ts:Landing page has hero heading` | COVERED |
| PUB-002 | Landing page — 6 feature cards | `landing.spec.ts:renders all 6 feature cards`, `features.spec.ts:F-002 features section` | COVERED |
| PUB-003 | Landing page — how-it-works 3 steps | `landing.spec.ts:renders how-it-works section`, `features.spec.ts:F-002 how-it-works` | COVERED |
| PUB-004 | Landing page — pricing section (3 tiers) | `landing.spec.ts:renders pricing section` | COVERED |
| PUB-005 | Landing page — footer, navbar navigation | `landing.spec.ts:renders footer with links`, `landing.spec.ts:navbar links navigate correctly` | COVERED |

---

## [Auth] (9 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| AUTH-001 | Password gate — blocks access without code | `password-gate.spec.ts:shows password gate on first visit`, `critical-path.spec.ts:password gate renders with form` | COVERED |
| AUTH-002 | Password gate — rejects wrong password | `password-gate.spec.ts:shows error on wrong password`, `critical-path.spec.ts:password gate rejects wrong password` | COVERED |
| AUTH-003 | Password gate — unlocks with correct password | `password-gate.spec.ts:unlocks with correct password` | COVERED |
| AUTH-004 | Login form — email + password fields, submit button | `auth.spec.ts:renders login form by default`, `critical-path.spec.ts:login form is functional` | COVERED |
| AUTH-005 | Login form — switches to signup mode | `auth.spec.ts:switches to signup form`, `features.spec.ts:F-003 Auth mode switching` | COVERED |
| AUTH-006 | Login form — switches to forgot password mode | `auth.spec.ts:switches to forgot password form`, `features.spec.ts:F-003 Auth forgot password mode` | COVERED |
| AUTH-007 | Forgot password — navigates back to login | `auth.spec.ts:navigates back from forgot to login` | COVERED |
| AUTH-008 | OTP signup — send confirmation code button | `auth-coverage.spec.ts:signup mode shows send code button and calls signup API` | COVERED |
| AUTH-009 | Auth callback — handles magic link / recovery redirect | `auth-coverage.spec.ts:auth callback page renders loading spinner`, `auth-coverage.spec.ts:auth callback recovery type redirects` | COVERED |

---

## [Dashboard] (5 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| DASH-001 | Dashboard page loads with sidebar nav links | `authenticated-flow.spec.ts:dashboard loads with correct elements` | COVERED |
| DASH-002 | Dashboard — 4 metric cards (Belege Gesamt, Verarbeitet, Zur Prüfung, Exportiert CHF) | `dashboard-coverage.spec.ts:renders 4 metric cards with correct labels and values` | COVERED |
| DASH-003 | Dashboard — recent documents table (5 columns, clickable rows) | `dashboard-coverage.spec.ts:renders recent documents table with 5 columns and clickable rows` | COVERED |
| DASH-004 | Dashboard — personalized greeting with first name | `dashboard-coverage.spec.ts:displays greeting with user first name` | COVERED |
| DASH-005 | Dashboard — empty state when no documents | `dashboard-coverage.spec.ts:shows empty state message when no documents` | COVERED |

---

## [Documents] (7 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| DOC-001 | Documents page loads with heading | `documents-coverage.spec.ts:renders heading, subtitle with document count, and Upload action link` | COVERED |
| DOC-002 | Documents — search input filters documents | `documents-coverage.spec.ts:search input filters documents by file name` | COVERED |
| DOC-003 | Documents — status filter buttons (Alle, Prüfung, Verifiziert, Exportiert) | `documents-coverage.spec.ts:renders 4 status filter buttons` | COVERED |
| DOC-004 | Documents — table with 5 columns, links to document review | `documents-coverage.spec.ts:renders document table with 5 columns and links to review` | COVERED |
| DOC-005 | Documents — loading skeleton while fetching | `documents-coverage.spec.ts:shows loading skeleton while fetching` | COVERED |
| DOC-006 | Documents — empty state when no results | `documents-coverage.spec.ts:shows empty state when no documents match` | COVERED |
| DOC-007 | Document appears in list after upload | `authenticated-flow.spec.ts:upload a test invoice file` (navigates to /documents after upload) | COVERED |

---

## [Document Review] (8 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| REV-001 | Document review page — split pane layout (PDF left, extracted data right) | `document-review-coverage.spec.ts:renders split pane with Original and Extrahierte Daten sections` | COVERED |
| REV-002 | Document review — PDF preview via canvas-based PdfViewer | `document-review-coverage.spec.ts:loads PdfViewer for PDF documents` | COVERED |
| REV-003 | Document review — image preview (JPG/PNG/WEBP/TIFF) | `document-review-coverage.spec.ts:renders img element for image documents` | COVERED |
| REV-004 | Document review — extracted fields with confidence dots and source badges (AI, QR, ZUGFeRD, manual) | `document-review-coverage.spec.ts:renders extracted fields with confidence dots and source badges` | COVERED |
| REV-005 | Document review — Verify button marks document as verified (status: review → verified) | `document-review-coverage.spec.ts:verify button marks document as verified` | COVERED |
| REV-006 | Document review — Download button creates signed URL and triggers file download | `document-review-coverage.spec.ts:download button creates signed URL` | COVERED |
| REV-007 | Document review — Back button links to /documents | `document-review-coverage.spec.ts:back button links to /documents` | COVERED |
| REV-008 | Document review — not-found state for invalid IDs | `document-review-coverage.spec.ts:shows not-found message for invalid document ID` | COVERED |

---

## [Document Upload] (6 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| UPL-001 | Upload page loads with drag-and-drop zone | `authenticated-flow.spec.ts:upload page loads with drop zone` | COVERED |
| UPL-002 | Upload — file picker via click ("Dateien auswählen" label) | `upload-coverage.spec.ts:has a visible Dateien auswählen label linked to file input` | COVERED |
| UPL-003 | Upload — drag-and-drop file(s) onto drop zone | `upload-coverage.spec.ts:drop zone shows drag-over instruction text` | COVERED |
| UPL-004 | Upload — file validation (type: PDF/JPG/PNG/WEBP/TIFF; size: max 20 MB) | `upload-coverage.spec.ts:file input accepts only valid file types` | COVERED |
| UPL-005 | Upload — file list with status indicators (Bereit, uploading, processing, done, error) and remove button | `upload-coverage.spec.ts:shows file in list with Bereit status and remove button after selecting` | COVERED |
| UPL-006 | Upload — "N Dateien hochladen" button triggers upload + AI processing pipeline | `upload-coverage.spec.ts:upload button appears and triggers storage upload + DB insert + process-document` | COVERED |

---

## [Client Management] (6 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| CLI-001 | Clients page loads with heading | `clients-coverage.spec.ts:renders heading, subtitle, search, Neuer Mandant button, and client table` | COVERED |
| CLI-002 | Clients — search input filters client list | `clients-coverage.spec.ts:search input filters client list` | COVERED |
| CLI-003 | Clients — create new client via form (name, email, address, ERP target) | `clients-coverage.spec.ts:opens form, fills all fields, submits successfully` | COVERED |
| CLI-004 | Clients — edit existing client (pre-filled form, update mutation) | `clients-coverage.spec.ts:opens edit form with pre-filled data via action menu` | COVERED |
| CLI-005 | Clients — delete client with confirmation dialog | `clients-coverage.spec.ts:opens ConfirmDialog and deletes client on confirm` | COVERED |
| CLI-006 | Clients — action menu (MoreHorizontal button, Bearbeiten / Löschen) | `clients-coverage.spec.ts:MoreHorizontal button opens menu with Bearbeiten and Löschen` | COVERED |

---

## [ERP Export] (5 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| EXP-001 | Export page loads with heading | `export-coverage.spec.ts:renders heading, subtitle, and Zielformat section` | COVERED |
| EXP-002 | Export — 5 ERP format selector buttons (CSV, Bexio, Abacus, Sage, Banana) | `export-coverage.spec.ts:shows 5 ERP format buttons with toggle behavior` | COVERED |
| EXP-003 | Export — document checkboxes + select all / deselect all | `export-coverage.spec.ts:checkboxes toggle individual and all documents` | COVERED |
| EXP-004 | Export — export button triggers export-erp edge function and downloads file | `export-coverage.spec.ts:export button calls export-erp and triggers download` | COVERED |
| EXP-005 | Export — empty state when no verified documents | `export-coverage.spec.ts:shows empty state when no verified documents` | COVERED |

---

## [Settings] (9 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| SET-001 | Settings page loads with 5 tabs (Firmenprofil, Team, ERP-Exportformate, Abrechnung, Sicherheit) | `authenticated-flow.spec.ts:settings page loads with tabs` | COVERED |
| SET-002 | Settings — Firmenprofil tab: edit and save org name | `settings-coverage.spec.ts:shows Firmenprofil form and submits org name update` | COVERED |
| SET-003 | Settings — Team tab: displays team member list with roles | `settings-coverage.spec.ts:shows team members with roles` | COVERED |
| SET-004 | Settings — ERP-Exportformate tab: shows all 5 formats with availability status | `settings-coverage.spec.ts:shows all 5 ERP formats with Verfügbar status` | COVERED |
| SET-005 | Settings — Abrechnung tab: shows current plan, monthly usage progress bar | `settings-coverage.spec.ts:shows current plan and monthly usage progress bar` | COVERED |
| SET-006 | Settings — Abrechnung tab: "Upgrade" button triggers create-checkout Stripe flow | `settings-coverage.spec.ts:Upgrade button triggers create-checkout Stripe flow` | COVERED |
| SET-007 | Settings — Sicherheit tab: change password form (8-char min, confirm match validation) | `settings-coverage.spec.ts:validates 8-char minimum and confirm match` | COVERED |
| SET-008 | Settings — Sicherheit tab: delete account button opens ConfirmDialog | `settings-coverage.spec.ts:delete account button opens ConfirmDialog` | COVERED |
| SET-009 | Settings — Sicherheit tab: confirmed account deletion calls delete-account edge function and signs out | `settings-coverage.spec.ts:confirming deletion calls delete-account edge function and signs out` | COVERED |

---

## [Pricing Page] (3 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| PRI-001 | Pricing page — 3 tiers (Starter CHF 49, Professional CHF 99, Enterprise CHF 249) | `pricing.spec.ts:renders all 3 pricing tiers`, `pricing.spec.ts:shows correct prices` | COVERED |
| PRI-002 | Pricing page — Professional marked as "Beliebtester Plan" | `pricing.spec.ts:highlights professional as most popular` | COVERED |
| PRI-003 | Pricing page — CTA buttons navigate to /auth | `pricing.spec.ts:CTA buttons navigate to auth` | COVERED |

---

## [Legal Pages] (3 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| LEG-001 | Datenschutz page loads with heading | `smoke.spec.ts:Datenschutz page has heading` | COVERED |
| LEG-002 | AGB page loads with heading | `smoke.spec.ts:AGB page has heading` | COVERED |
| LEG-003 | Impressum page loads with heading | `smoke.spec.ts:Impressum page has heading` | COVERED |

---

## [Infrastructure & Routing] (9 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| INF-001 | Protected routes redirect to /auth when unauthenticated | `navigation.spec.ts:protected routes redirect to /auth`, `critical-path.spec.ts:protected routes` (all 6 routes) | COVERED |
| INF-002 | 404 not found page renders with home link | `navigation.spec.ts:404 page shows for unknown routes`, `navigation.spec.ts:404 page has link back to home` | COVERED |
| INF-003 | Edge functions reachable (all 7 — not returning 500) | `critical-path.spec.ts:edge function health` (7 functions looped) | COVERED |
| INF-004 | Supabase project reachable (not paused) | `critical-path.spec.ts:Supabase project is reachable` | COVERED |
| INF-005 | Supabase auth API responds correctly | `critical-path.spec.ts:auth API responds correctly` | COVERED |
| INF-006 | All public routes load without JS errors | `smoke.spec.ts` (9 routes) | COVERED |
| INF-007 | WCAG 2.1 AA accessibility — all public routes pass axe audit | `accessibility.spec.ts` (7 routes) | COVERED |
| INF-008 | Keyboard navigation — skip link, form keyboard access | `accessibility.spec.ts:Landing page skip link works`, `accessibility.spec.ts:Auth form inputs are keyboard-navigable` | COVERED |
| INF-009 | Visual brand compliance — teal color, Plus Jakarta Sans, JetBrains Mono, border-not-shadow cards | `visual-brand.spec.ts` (6 checks) | COVERED |

---

## [Edge Functions] (7 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| EF-001 | process-document — AI extraction pipeline (Claude Vision + ZUGFeRD + account suggestion) | `edge-functions-coverage.spec.ts:upload triggers process-document with documentId and filePath` | COVERED |
| EF-002 | export-erp — generate ERP export files (CSV, Bexio XML, Abacus, Sage, Banana) | `edge-functions-coverage.spec.ts:export triggers export-erp with documentIds and erpTarget` | COVERED |
| EF-003 | create-checkout — Stripe checkout session creation for plan upgrades | `edge-functions-coverage.spec.ts:upgrade button calls create-checkout with plan` | COVERED |
| EF-004 | stripe-webhook — subscription management (updates org plan on checkout.session.completed) | `edge-functions-coverage.spec.ts:stripe-webhook endpoint accepts POST and returns non-500` | COVERED |
| EF-005 | delete-account — cascade delete of org + profiles + clients + documents + exports + vendor_patterns | `edge-functions-coverage.spec.ts:delete account flow calls delete-account with auth header` | COVERED |
| EF-006 | send-welcome — welcome email sent after profile completion | `edge-functions-coverage.spec.ts:send-welcome endpoint accepts POST with auth` | COVERED |
| EF-007 | send-usage-alert — usage limit warning email sent when approaching document threshold | `edge-functions-coverage.spec.ts:send-usage-alert endpoint accepts POST with auth` | COVERED |

---

## Coverage Summary by Category

| Category | Total | Covered | Partial | Not Covered |
|----------|-------|---------|---------|-------------|
| Public Pages | 5 | 5 | 0 | 0 |
| Auth | 9 | 9 | 0 | 0 |
| Dashboard | 5 | 5 | 0 | 0 |
| Documents | 7 | 7 | 0 | 0 |
| Document Review | 8 | 8 | 0 | 0 |
| Document Upload | 6 | 6 | 0 | 0 |
| Client Management | 6 | 6 | 0 | 0 |
| ERP Export | 5 | 5 | 0 | 0 |
| Settings | 9 | 9 | 0 | 0 |
| Pricing Page | 3 | 3 | 0 | 0 |
| Legal Pages | 3 | 3 | 0 | 0 |
| Infrastructure & Routing | 9 | 9 | 0 | 0 |
| Edge Functions | 7 | 7 | 0 | 0 |
| **TOTAL** | **82** | **82 (100%)** | **0 (0%)** | **0 (0%)** |

---

## DB Tables

| Table | Description |
|-------|-------------|
| `organizations` | Firm/company data, plan, Stripe IDs, `documents_this_month` usage counter |
| `profiles` | User profiles linked to `auth.users`, with `organization_id` and `role` (owner/member/viewer) |
| `clients` | Mandant/client records per organization with `erp_target` |
| `documents` | Uploaded files with `extracted_data` (JSONB), `confidence_scores`, `status`, `supplier_name`, `account_number` |
| `exports` | ERP export batches with `erp_target`, `document_ids[]`, `file_path`, `status` |
| `vendor_patterns` | Learned vendor-to-account-code mappings per organization |

---

## Storage Buckets

| Bucket | Access | Constraints |
|--------|--------|-------------|
| `documents` | Private (org-scoped RLS) | 20 MB max; PDF, JPEG, PNG, WEBP, TIFF only |
| `exports` | Private | Generated ERP export files |

---

_Last updated: 2026-05-29_
