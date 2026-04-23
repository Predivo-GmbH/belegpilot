# Feature Registry

> **Purpose:** Single source of truth for every feature in BelegPilot.
> Every entry here MUST have corresponding test coverage.
> CI will block merges if a feature ID has no matching test file.

---

## How to Use

1. **Before building a feature**, add an entry below with status `planned`
2. **After building**, update status to `implemented` and fill in all fields
3. **After writing tests**, update status to `tested` and add test file paths
4. **Feature IDs** use the format `F-XXX` and are never reused

---

## Feature Index

| ID | Name | Status | Test Files |
|----|------|--------|------------|
| F-001 | Password Gate | tested | `src/components/shared/__tests__/PasswordGate.test.tsx` |
| F-002 | Landing Page | tested | `src/pages/__tests__/Landing.test.tsx`, `e2e/smoke.spec.ts` |
| F-003 | Auth (Login / Signup / OTP / Reset) | tested | `src/pages/__tests__/Auth.test.tsx`, `src/hooks/__tests__/useAuth.test.ts` |
| F-004 | Auth Callback | tested | `src/pages/__tests__/AuthCallback.test.tsx` |
| F-005 | Dashboard | tested | `src/pages/__tests__/Dashboard.test.tsx`, `src/hooks/__tests__/useDashboardStats.test.ts` |
| F-006 | Document List | tested | `src/pages/__tests__/Documents.test.tsx`, `src/hooks/__tests__/useDocuments.test.ts` |
| F-007 | Document Review | tested | `src/pages/__tests__/DocumentReview.test.tsx` |
| F-008 | Document Upload | tested | `src/pages/__tests__/Upload.test.tsx` |
| F-009 | Client Management | tested | `src/pages/__tests__/Clients.test.tsx` |
| F-010 | ERP Export | tested | `src/pages/__tests__/Export.test.tsx` |
| F-011 | Settings (Firm / Team / ERP / Billing / Security) | tested | `src/pages/__tests__/Settings.test.tsx` |
| F-012 | Pricing Page | tested | `src/pages/__tests__/Pricing.test.tsx`, `src/components/shared/__tests__/PricingGrid.test.tsx` |
| F-013 | Protected Route | tested | `src/components/shared/__tests__/ProtectedRoute.test.tsx` |
| F-014 | Error Boundary | tested | `src/components/shared/__tests__/ErrorBoundary.test.tsx` |
| F-015 | Page Meta (SEO) | tested | `src/components/shared/__tests__/PageMeta.test.tsx` |
| F-016 | App Layout & Sidebar | tested | `src/components/layout/__tests__/AppLayout.test.tsx` |
| F-017 | Confirm Dialog | tested | `src/components/shared/__tests__/ConfirmDialog.test.tsx` |
| F-018 | Legal Pages (Datenschutz / AGB / Impressum) | tested | `src/pages/__tests__/Legal.test.tsx`, `e2e/smoke.spec.ts` |
| F-019 | 404 Not Found | tested | `src/pages/__tests__/NotFound.test.tsx`, `e2e/smoke.spec.ts` |
| F-020 | Utility Functions (cn) | tested | `src/lib/utils.test.ts` |
| F-021 | Constants & Subscription Tiers | tested | `src/lib/constants.test.ts` |
| F-022 | usePageTitle Hook | tested | `src/hooks/usePageTitle.test.ts` |
| F-023 | useProfile Hook | tested | `src/hooks/__tests__/useProfile.test.ts` |
| F-024 | BelegPilot Logo | tested | `src/components/shared/__tests__/BelegPilotLogo.test.tsx` |
| F-025 | Edge Function: process-document | tested | `e2e/features.spec.ts` |
| F-026 | Edge Function: export-erp | tested | `e2e/features.spec.ts` |
| F-027 | Edge Function: create-checkout | tested | `e2e/features.spec.ts` |
| F-028 | Edge Function: stripe-webhook | tested | `e2e/features.spec.ts` |
| F-029 | Edge Function: delete-account | tested | `e2e/features.spec.ts` |
| F-030 | Edge Function: send-welcome | tested | `e2e/features.spec.ts` |
| F-031 | Edge Function: send-usage-alert | tested | `e2e/features.spec.ts` |

---

## DB Tables

| Table | Description |
|-------|-------------|
| organizations | Firm/company data, plan, Stripe IDs, monthly usage |
| profiles | User profiles linked to organizations, with roles |
| clients | Client/mandant records per organization |
| documents | Uploaded documents with extraction data, status, AI metadata |
| exports | Export history per organization/client |
| vendor_patterns | Learned vendor-to-account mappings |

---

## Edge Functions

| Function | Description |
|----------|-------------|
| process-document | AI extraction pipeline (Claude Vision) |
| export-erp | Generate ERP export files (CSV, Bexio, Abacus, Sage, Banana) |
| create-checkout | Stripe checkout session creation |
| stripe-webhook | Stripe webhook handler for subscription events |
| delete-account | Account deletion with data cleanup |
| send-welcome | Welcome email on signup |
| send-usage-alert | Usage limit warning emails |

---

## Feature Definitions

### F-001: Password Gate
- **Status:** tested
- **Route:** / (wraps entire app)
- **Description:** Pre-launch password protection. SHA-256 hash check against sessionStorage. Password: `belegpilot2026`
- **Components:** `src/components/shared/PasswordGate.tsx`
- **DB Tables:** (none)
- **Critical Assertions:**
  - Shows password form when sessionStorage is empty
  - Wrong password shows error message
  - Correct password reveals children
  - State persists in sessionStorage
- **Test Files:**
  - Unit: `src/components/shared/__tests__/PasswordGate.test.tsx`

### F-002: Landing Page
- **Status:** tested
- **Route:** /
- **Description:** Public marketing landing page with hero, trust bar, features grid, how-it-works, pricing, CTA, and footer
- **Components:** `src/pages/Landing.tsx`, `src/components/shared/PricingGrid.tsx`, `src/components/shared/BelegPilotLogo.tsx`
- **Critical Assertions:**
  - Hero heading renders
  - All 6 features displayed
  - 3 how-it-works steps shown
  - Pricing grid with 3 tiers
  - Footer with legal links
  - CTA buttons link to auth
- **Test Files:**
  - Unit: `src/pages/__tests__/Landing.test.tsx`
  - E2E: `e2e/smoke.spec.ts`

### F-003: Auth (Login / Signup / OTP / Reset)
- **Status:** tested
- **Route:** /auth
- **Description:** Multi-step authentication: login with password, signup with OTP, forgot/reset password, profile completion
- **Components:** `src/pages/Auth.tsx`
- **Edge Functions:** (Supabase Auth built-in)
- **DB Tables:** profiles, organizations
- **Critical Assertions:**
  - Login form renders email and password fields
  - Signup form sends OTP
  - OTP verification form accepts 6-digit code
  - Profile completion form with org name, full name, password
  - Forgot password sends reset link
  - Error messages displayed in German
  - Mode switching works (login/signup/forgot)
- **Test Files:**
  - Unit: `src/pages/__tests__/Auth.test.tsx`, `src/hooks/__tests__/useAuth.test.ts`

### F-004: Auth Callback
- **Status:** tested
- **Route:** /auth/callback
- **Description:** Handles Supabase auth callbacks (magic links, password resets, email confirmations)
- **Components:** `src/pages/AuthCallback.tsx`
- **Critical Assertions:**
  - Shows loading spinner
  - Redirects to /auth?mode=reset for recovery type
  - Redirects to /dashboard for authenticated session
- **Test Files:**
  - Unit: `src/pages/__tests__/AuthCallback.test.tsx`

### F-005: Dashboard
- **Status:** tested
- **Route:** /dashboard (protected)
- **Description:** Main dashboard with 4 metric cards and recent documents table
- **Components:** `src/pages/Dashboard.tsx`
- **Hooks:** `useDashboardStats`, `useRecentDocuments`, `useProfile`
- **DB Tables:** documents, profiles, organizations
- **Critical Assertions:**
  - 4 metric cards render (Belege Gesamt, Verarbeitet, Zur Prüfung, Exportiert CHF)
  - Recent documents table with 5 columns
  - Upload button links to /upload
  - Empty state message when no documents
  - Personalized greeting with first name
- **Test Files:**
  - Unit: `src/pages/__tests__/Dashboard.test.tsx`, `src/hooks/__tests__/useDashboardStats.test.ts`

### F-006: Document List
- **Status:** tested
- **Route:** /documents (protected)
- **Description:** Filterable, searchable document list with status badges
- **Components:** `src/pages/Documents.tsx`
- **Hooks:** `useDocuments`
- **DB Tables:** documents, clients
- **Critical Assertions:**
  - Search input filters documents
  - Status filter buttons (Alle, Prüfung, Verifiziert, Exportiert)
  - Document table with 5 columns
  - Links to document review (/documents/:id)
  - Loading skeleton shown while fetching
  - Empty state when no results
- **Test Files:**
  - Unit: `src/pages/__tests__/Documents.test.tsx`, `src/hooks/__tests__/useDocuments.test.ts`

### F-007: Document Review
- **Status:** tested
- **Route:** /documents/:id (protected)
- **Description:** Split-pane document review with PDF/image preview and extracted data panel
- **Components:** `src/pages/DocumentReview.tsx`, `src/components/shared/PdfViewer.tsx`
- **DB Tables:** documents, clients
- **Critical Assertions:**
  - Extracted fields display with confidence dots and source badges
  - Verify button marks document as verified
  - Download button creates signed URL
  - Back button links to /documents
  - Loading state while fetching
  - Not-found state for invalid IDs
- **Test Files:**
  - Unit: `src/pages/__tests__/DocumentReview.test.tsx`

### F-008: Document Upload
- **Status:** tested
- **Route:** /upload (protected)
- **Description:** Drag-and-drop file upload with progress tracking and AI processing trigger
- **Components:** `src/pages/Upload.tsx`
- **DB Tables:** documents
- **Edge Functions:** `process-document`
- **Critical Assertions:**
  - Drop zone renders with instructions
  - File type validation (PDF, JPG, PNG, WEBP, TIFF)
  - File size validation (max 20MB)
  - File list shows pending files with remove button
  - Upload progress states (pending, uploading, processing, done, error)
  - Upload all button appears when files are pending
- **Test Files:**
  - Unit: `src/pages/__tests__/Upload.test.tsx`

### F-009: Client Management
- **Status:** tested
- **Route:** /clients (protected)
- **Description:** CRUD for client/mandant records with search, edit, delete confirmation
- **Components:** `src/pages/Clients.tsx`, `src/components/shared/ConfirmDialog.tsx`
- **DB Tables:** clients
- **Critical Assertions:**
  - Client table with columns (Name, E-Mail, ERP, Status, Actions)
  - New client form with name, email, address, ERP target
  - Edit client pre-fills form
  - Delete client shows confirmation dialog
  - Search filters by client name
  - Empty state when no clients
- **Test Files:**
  - Unit: `src/pages/__tests__/Clients.test.tsx`

### F-010: ERP Export
- **Status:** tested
- **Route:** /export (protected)
- **Description:** Export verified documents to ERP systems (CSV, Bexio, Abacus, Sage, Banana)
- **Components:** `src/pages/Export.tsx`
- **Edge Functions:** `export-erp`
- **DB Tables:** documents, exports
- **Critical Assertions:**
  - 5 ERP target buttons (CSV, Bexio, Abacus, Sage, Banana)
  - Document selection with checkboxes
  - Select all / deselect all
  - Export button with count
  - Empty state when no verified documents
- **Test Files:**
  - Unit: `src/pages/__tests__/Export.test.tsx`

### F-011: Settings (Firm / Team / ERP / Billing / Security)
- **Status:** tested
- **Route:** /settings (protected)
- **Description:** Multi-tab settings page with firm profile, team members, ERP formats, billing/plan info, security (password change, account deletion)
- **Components:** `src/pages/Settings.tsx`, `src/components/shared/ConfirmDialog.tsx`
- **Edge Functions:** `create-checkout`, `delete-account`
- **DB Tables:** organizations, profiles
- **Critical Assertions:**
  - 5 tabs render and switch correctly
  - Firm profile form updates org name
  - Team members table displays roles
  - ERP formats table shows all 5 targets
  - Billing shows current plan and usage meter
  - Password change validates min length and match
  - Delete account shows confirmation dialog
- **Test Files:**
  - Unit: `src/pages/__tests__/Settings.test.tsx`

### F-012: Pricing Page
- **Status:** tested
- **Route:** /pricing
- **Description:** Public pricing page with 3-tier grid and CTA buttons
- **Components:** `src/pages/Pricing.tsx`, `src/components/shared/PricingGrid.tsx`
- **Critical Assertions:**
  - 3 pricing tiers (Starter, Professional, Enterprise)
  - Prices displayed (CHF 49, 99, 249)
  - Feature lists per tier
  - Professional marked as "Beliebtester Plan"
  - CTA buttons navigate to auth with plan param
- **Test Files:**
  - Unit: `src/pages/__tests__/Pricing.test.tsx`, `src/components/shared/__tests__/PricingGrid.test.tsx`

### F-013: Protected Route
- **Status:** tested
- **Route:** (wrapper component)
- **Description:** Auth guard that redirects unauthenticated users to /auth
- **Components:** `src/components/shared/ProtectedRoute.tsx`
- **Hooks:** `useAuth`
- **Critical Assertions:**
  - Shows loading spinner while auth is loading
  - Redirects to /auth when no user
  - Renders children when authenticated
- **Test Files:**
  - Unit: `src/components/shared/__tests__/ProtectedRoute.test.tsx`

### F-014: Error Boundary
- **Status:** tested
- **Route:** (wrapper component)
- **Description:** React error boundary that catches render errors and displays a fallback UI
- **Components:** `src/components/shared/ErrorBoundary.tsx`
- **Critical Assertions:**
  - Renders children when no error
  - Shows error fallback with reload button when error occurs
  - Error fallback has role="alert"
- **Test Files:**
  - Unit: `src/components/shared/__tests__/ErrorBoundary.test.tsx`

### F-015: Page Meta (SEO)
- **Status:** tested
- **Route:** (used on every page)
- **Description:** Sets page title, meta description, canonical URL, and robots meta via react-helmet-async
- **Components:** `src/components/shared/PageMeta.tsx`
- **Critical Assertions:**
  - Sets title with BelegPilot suffix
  - Renders meta description when provided
  - Renders canonical link when provided
  - Renders noindex meta when specified
- **Test Files:**
  - Unit: `src/components/shared/__tests__/PageMeta.test.tsx`

### F-016: App Layout & Sidebar
- **Status:** tested
- **Route:** (used on all authenticated pages)
- **Description:** Sidebar navigation with desktop sidebar and mobile drawer, skip link, page header with title/subtitle/action
- **Components:** `src/components/layout/AppLayout.tsx`, `src/components/layout/AppSidebar.tsx`
- **Critical Assertions:**
  - Sidebar renders navigation sections (Dashboard, Belege, Mandanten, System)
  - Mobile menu button visible on small screens
  - Skip link present
  - Page header renders title, subtitle, action
- **Test Files:**
  - Unit: `src/components/layout/__tests__/AppLayout.test.tsx`

### F-017: Confirm Dialog
- **Status:** tested
- **Route:** (reusable component)
- **Description:** Accessible confirmation dialog using native <dialog> element with destructive variant
- **Components:** `src/components/shared/ConfirmDialog.tsx`
- **Critical Assertions:**
  - Renders nothing when closed
  - Shows title, description, confirm/cancel buttons when open
  - Calls onConfirm when confirmed
  - Calls onCancel when cancelled
  - Escape key closes dialog
  - Destructive variant uses red styling
- **Test Files:**
  - Unit: `src/components/shared/__tests__/ConfirmDialog.test.tsx`

### F-018: Legal Pages (Datenschutz / AGB / Impressum)
- **Status:** tested
- **Routes:** /datenschutz, /agb, /impressum
- **Description:** Static legal content pages with proper SEO meta and back-to-home link
- **Components:** `src/pages/legal/Datenschutz.tsx`, `src/pages/legal/AGB.tsx`, `src/pages/legal/Impressum.tsx`
- **Critical Assertions:**
  - Each page renders heading
  - Back to home link present
  - Proper canonical URLs set
- **Test Files:**
  - Unit: `src/pages/__tests__/Legal.test.tsx`
  - E2E: `e2e/smoke.spec.ts`

### F-019: 404 Not Found
- **Status:** tested
- **Route:** * (catch-all)
- **Description:** 404 page with link back to home
- **Components:** `src/pages/NotFound.tsx`
- **Critical Assertions:**
  - Shows 404 heading
  - Shows "Seite nicht gefunden" text
  - Link to home page
- **Test Files:**
  - Unit: `src/pages/__tests__/NotFound.test.tsx`
  - E2E: `e2e/smoke.spec.ts`

### F-020: Utility Functions (cn)
- **Status:** tested
- **Route:** (utility)
- **Description:** Class name merging utility using clsx + tailwind-merge
- **Components:** `src/lib/utils.ts`
- **Critical Assertions:**
  - Merges class names
  - Handles conditional classes
  - Resolves Tailwind conflicts
- **Test Files:**
  - Unit: `src/lib/utils.test.ts`

### F-021: Constants & Subscription Tiers
- **Status:** tested
- **Route:** (utility)
- **Description:** Application constants including subscription tiers, document statuses, VAT rates, ERP targets, feature labels
- **Components:** `src/lib/constants.ts`
- **Critical Assertions:**
  - 3 subscription tiers with correct prices
  - All document statuses defined
  - Swiss VAT rates correct (8.1%, 2.6%, 3.8%)
  - 5 ERP targets defined
- **Test Files:**
  - Unit: `src/lib/constants.test.ts`

### F-022: usePageTitle Hook
- **Status:** tested
- **Route:** (hook)
- **Description:** Sets document.title with BelegPilot suffix or default tagline
- **Components:** `src/hooks/usePageTitle.ts`
- **Critical Assertions:**
  - Sets "Title | BelegPilot" when title provided
  - Sets default title when no title
  - Updates on re-render
- **Test Files:**
  - Unit: `src/hooks/usePageTitle.test.ts`

### F-023: useProfile Hook
- **Status:** tested
- **Route:** (hook)
- **Description:** Fetches user profile with organization data from Supabase
- **Components:** `src/hooks/useProfile.ts`
- **Hooks:** `useAuth`
- **DB Tables:** profiles, organizations
- **Critical Assertions:**
  - Returns profile data when authenticated
  - Disabled when no user
- **Test Files:**
  - Unit: `src/hooks/__tests__/useProfile.test.ts`

### F-024: BelegPilot Logo
- **Status:** tested
- **Route:** (component)
- **Description:** SVG logo component with sm/lg size variants
- **Components:** `src/components/shared/BelegPilotLogo.tsx`
- **Critical Assertions:**
  - Renders SVG with correct dimensions for each size
  - SVG is aria-hidden
- **Test Files:**
  - Unit: `src/components/shared/__tests__/BelegPilotLogo.test.tsx`

### F-025: Edge Function: process-document
- **Status:** tested
- **Route:** (edge function)
- **Description:** AI document extraction pipeline using Claude Vision. Called after upload.
- **Components:** `supabase/functions/process-document/index.ts`
- **DB Tables:** documents
- **Critical Assertions:**
  - Triggered from upload page
  - Updates document status and extracted_data
- **Test Files:**
  - E2E: `e2e/features.spec.ts`

### F-026: Edge Function: export-erp
- **Status:** tested
- **Route:** (edge function)
- **Description:** Generates ERP-formatted export files (CSV, Bexio XML, Abacus, Sage, Banana)
- **Components:** `supabase/functions/export-erp/index.ts`, `supabase/functions/_shared/formatters/*`
- **DB Tables:** documents, exports
- **Critical Assertions:**
  - Called from export page with document IDs and ERP target
  - Returns download URL
- **Test Files:**
  - E2E: `e2e/features.spec.ts`

### F-027: Edge Function: create-checkout
- **Status:** tested
- **Route:** (edge function)
- **Description:** Creates Stripe checkout session for plan upgrades
- **Components:** `supabase/functions/create-checkout/index.ts`
- **Critical Assertions:**
  - Called from settings billing tab
  - Returns Stripe checkout URL
- **Test Files:**
  - E2E: `e2e/features.spec.ts`

### F-028: Edge Function: stripe-webhook
- **Status:** tested
- **Route:** (edge function)
- **Description:** Handles Stripe webhook events for subscription management
- **Components:** `supabase/functions/stripe-webhook/index.ts`
- **DB Tables:** organizations
- **Critical Assertions:**
  - Updates organization plan on subscription changes
- **Test Files:**
  - E2E: `e2e/features.spec.ts`

### F-029: Edge Function: delete-account
- **Status:** tested
- **Route:** (edge function)
- **Description:** Deletes user account and all associated data
- **Components:** `supabase/functions/delete-account/index.ts`
- **DB Tables:** organizations, profiles, clients, documents, exports, vendor_patterns
- **Critical Assertions:**
  - Called from settings security tab
  - Signs out after deletion
- **Test Files:**
  - E2E: `e2e/features.spec.ts`

### F-030: Edge Function: send-welcome
- **Status:** tested
- **Route:** (edge function)
- **Description:** Sends welcome email after profile completion
- **Components:** `supabase/functions/send-welcome/index.ts`
- **Critical Assertions:**
  - Fire-and-forget call from auth profile step
- **Test Files:**
  - E2E: `e2e/features.spec.ts`

### F-031: Edge Function: send-usage-alert
- **Status:** tested
- **Route:** (edge function)
- **Description:** Sends email alerts when approaching document processing limits
- **Components:** `supabase/functions/send-usage-alert/index.ts`
- **DB Tables:** organizations, profiles
- **Critical Assertions:**
  - Triggered when usage approaches limit
- **Test Files:**
  - E2E: `e2e/features.spec.ts`
