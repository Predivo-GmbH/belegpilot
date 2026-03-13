# BelegPilot Design Brief

## Product
- **Name:** BelegPilot
- **Description:** AI-powered document processing tool that turns receipts and invoices into ERP-ready bookings for Swiss Treuhand firms.
- **Audience:** Swiss Treuhand (fiduciary) firm owners and senior accountants managing 50–200 SME clients, aged 38–55, German-speaking Switzerland primary.
- **Goal:** Eliminate 40% of manual document entry time by automating extraction, categorization (Swiss Kontenrahmen KMU), and multi-ERP export.

## Reference Analysis

### Stripe (Primary Influence — Data Patterns & Structure)
- **Split-view document editing:** Form on left, live preview on right with tabs — maps directly to BelegPilot's document review workflow
- **Single accent color strategy:** One purple used for all interactive elements (buttons, links, active states). Builds instant recognition
- **Dashboard card grid:** White cards with key metrics, sparkline charts, status breakdowns, "View more" links
- **Extreme whitespace discipline:** Generous space prevents cognitive overload for dense financial data
- **Subtle borders, no shadows:** Cards and inputs defined by 1px light gray borders, not drop shadows. Flat, clean, modern
- **Typography-driven hierarchy:** Size and color create structure — not decorative elements. Muted section labels, dark titles, small gray helpers
- **Stepper wizards:** Numbered vertical stepper for multi-step flows — ideal for onboarding and document upload
- **Searchable categorized dropdowns:** Search + smart groupings for long lists (accounts, clients, ERP targets)
- **Muted status indicators:** Small colored text labels and tiny dots rather than large badges. Calm but informative

### Kraken (Secondary Influence — Surface & Spacing)
- **Tinted page backgrounds:** Not pure white — a distinctly tinted neutral that immediately differentiates from generic SaaS. Creates natural card elevation without shadows
- **Generous whitespace in task-focused flows:** Auth, onboarding, and settings pages are very spacious. Reduces cognitive load on single-task screens
- **Pill badges for status and categorization:** Small rounded pills for filters, document types, processing status
- **Sidebar navigation with icon + label:** Collapsible sidebar preserves screen real estate while providing clear navigation
- **Minimal table styling:** No cell borders, just row separators. Icons in first column for visual identification. Clean and scannable
- **Toast notifications:** Unobtrusive top-right confirmations for "document processed", "export complete" feedback
- **Progressive disclosure:** Complex flows broken into simple steps. One action per screen for onboarding

### Fey (Tertiary Influence — Data Density & Financial Patterns)
- **Color as semantic signal, not decoration:** Green/red reserved strictly for financial values and status. No decorative color use
- **Command palette / keyboard-first:** Spotlight-style search modal for quick document lookup, client switching, navigation
- **Dense data tables with subtle row differentiation:** Information-rich tables that never overwhelm — restrained borders, right-aligned numbers, muted headers
- **Two-column dashboard layout:** Overview/detail split translates to document queue + extracted data side-by-side
- **Calm authority mood:** Financial tools can be serious and modern simultaneously. Precise without being cold
- **Floating contextual UI:** Bottom bars and overlay panels provide secondary info without leaving current view

### Logo References (Airwallex, Navattic, Rox, Vimeo, WRITER)
- **Bold weight and confident presence:** All references use heavy, substantial forms. Signals authority and reliability
- **Negative space as core design device:** Cuts, channels, and voids within solid forms define the identity
- **Abstract or letterform-based marks:** No literal icons (no documents, no receipts). Stylized letterforms or geometric abstractions
- **Monochromatic primary versions:** Most work in pure black/white first, single accent color for digital contexts
- **Geometric construction with human touches:** The sweet spot is "engineered but not cold"
- **High scalability:** Clean enough to work as favicon, app icon, and watermark at small sizes

## Brand Direction

- **Accent color:** `#0E7C6B` (Deep Teal-Green)
  - Hover: `#0A6355`
  - Light: `#E6F5F2` (sage-mint tint for backgrounds)
  - Surface: `#F0F7F5` (page background)
- **Font:** Plus Jakarta Sans (primary UI) + JetBrains Mono (document data, amounts, account numbers)
- **Theme:** Light only
- **Tone:** Precise, trustworthy, and quietly confident — like a senior Swiss accountant who never makes mistakes.
- **Reference summary:** Combines Stripe's structured data hierarchy, split-pane editing, and border-first philosophy with Kraken's tinted surface backgrounds and generous spacing, filtered through Fey's data density mastery and financial UX sensibility. The result is a clean, light interface that handles dense financial data without feeling clinical or overwhelming. Sage-tinted backgrounds replace pure white, creating a warm, distinctly Swiss identity that signals reliability and precision.

### Why Deep Teal-Green
1. **Finance-native:** Green = money, accounting, trust. No explanation needed for Sandra.
2. **Distinct:** Clearly different from competitor palettes and generic SaaS blue.
3. **Light theme friendly:** Creates beautiful sage/mint tinted backgrounds that feel calm and professional.
4. **Data-safe:** Works alongside green (success) and red (error) semantic colors without confusion — the accent is teal-leaning, not pure green.
5. **Swiss association:** Evokes precision, quality, alpine reliability. Swiss banks historically lean green/teal.

## Design Principles

### From Stripe (Primary — Data Patterns)
- **Border-first, not shadow-first.** Cards and containers use subtle borders (`#E3E8EE`), not drop shadows. Keeps things flat and professional.
- **Uppercase micro-labels.** Table headers, section labels use small uppercase text (12px, medium weight, letter-spaced). Creates structured, professional hierarchy.
- **Consistent 14px body.** Nearly everything reads at 14px. Hierarchy through weight and color, not wild size jumps.
- **Contextual actions.** Bulk actions appear when rows are selected. Item actions appear on hover. Reduces permanent clutter.
- **Split-pane editing.** Edit form on left, live preview on right — ideal for document review workflows.
- **Mark optional, not required.** Instead of asterisks on required fields, tag optional fields with "Optional" label.
- **Stepper wizards.** Multi-step flows use numbered vertical steppers with completion checkmarks.
- **Searchable dropdowns.** Long lists get search + smart category groupings ("Most popular" first).

### From Kraken (Secondary — Surface & Spacing)
- **Tinted page backgrounds.** Not flat white — use subtle sage-mint tint (`#F0F7F5`) for page backgrounds, white (`#FFFFFF`) for cards. Creates natural layering without shadows.
- **Generous whitespace in consumer flows.** Auth, onboarding, and settings get breathing room. Data views can be denser.
- **Progressive disclosure.** Complex flows broken into simple steps. One action per screen for onboarding.
- **Status through color.** Green = success/verified, red = error/needs attention, amber = warning/low confidence. Minimal text, maximum meaning.
- **Pill badges.** Small rounded pills for filters, document types, and processing status indicators.

### From Fey (Tertiary — Data Density)
- **Data density without clutter.** High information density achieved through careful typography hierarchy, not visual noise.
- **Color restraint.** The UI is mostly neutral grays with color reserved for data meaning and the brand accent.
- **Command palette pattern.** Quick document search, client switching, navigation via keyboard-first search overlay.
- **Semantic color only.** Green/red/amber reserved for financial data and status. Never decorative.

### Anti-Slop Rules (enforced at design AND code time)
- No generic Inter/Roboto used lazily — Plus Jakarta Sans is intentional and distinctive
- No purple anywhere — that is not this brand's territory
- No predictable symmetric card grids with uniform spacing
- No cookie-cutter hero sections (this is an app, not a marketing site)
- No shadows on cards — use borders like Stripe
- No colored pill buttons for primary CTAs — use the accent color with subtle rounded corners (6–8px), not full pill shapes
- No zebra-striped tables — use subtle row dividers like Stripe
- Every page must have ONE distinctive element (the document preview pane, the confidence meter, the extraction highlight overlay)
- Typography must create clear hierarchy through weight and color, not just size changes
- Tinted backgrounds must create atmosphere — not flat white everywhere
- No decorative color — color serves meaning (status, emphasis, brand accent)
- No heavy sidebar with large icons — keep navigation lean like Stripe

### Quality Markers (what good looks like)
- Deep teal-green accent with sage-tinted surfaces — distinctive, financial, Swiss
- Type scale with clear weight/color hierarchy (semibold headings, regular body, muted captions)
- Intentional whitespace — generous in auth/settings, compact in document tables
- Cards that earn their existence — document cards show extraction results, not decorative wrappers
- Tables with uppercase micro-labels, right-aligned amounts, compact rows, contextual actions
- Split-pane document review — original document left, extracted data right
- Confidence indicators per extracted field (green/amber/red dots, not verbose text)
- Command palette for power users (Ctrl+K / Cmd+K)
- Animations that serve a purpose: extraction progress, field validation, document upload feedback
- Toast notifications for async operations (document processed, export ready)

## Pages/Screens

### Authentication & Onboarding
- [ ] Login (email + password, single centered card on sage-tinted background)
- [ ] Signup (email → password → firm details, progressive multi-step with stepper)
- [ ] Forgot Password / Reset
- [ ] Email Verification

### Core Application
- [ ] Dashboard / Home (overview metrics: documents processed today, pending review, recent activity, quick upload)
- [ ] Document Upload (drag-and-drop zone + file browser, batch upload support, upload progress)
- [ ] Document Review / Detail (split-pane: original PDF/image left, extracted data right with confidence scores, edit fields inline)
- [ ] Document List (Stripe-style table: checkbox, document name, client, status badge, amount, date, actions. Filters: client, status, date range, document type)
- [ ] Client Management (list of SME clients with document counts, account mapping per client)
- [ ] Client Detail (client info, assigned Kontenrahmen mappings, document history, ERP export settings)
- [ ] Export (select documents → choose target ERP format → preview → download. Export history table)

### Settings & Account
- [ ] Settings — Firm Profile (firm name, address, contact)
- [ ] Settings — Team (future: user management, not MVP but reserve the page)
- [ ] Settings — ERP Connections (configure default export formats per client)
- [ ] Settings — Billing / Subscription (plan display, usage meter: documents used/limit)
- [ ] Settings — Account Security (password change, 2FA future)

### Legal
- [ ] Privacy Policy (nDSG/FADP + GDPR compliant)
- [ ] Terms of Service (Swiss law)
- [ ] Impressum

## Technical Constraints
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 7
- **UI Library:** shadcn/ui (customized to BelegPilot design tokens)
- **CSS:** Tailwind CSS 4
- **Animation:** Framer Motion (entrance animations, upload progress, extraction feedback)
- **Responsive:** Desktop-first (primary use case is desktop accountant workstation), responsive down to tablet. No mobile app.
- **Accessibility:** WCAG 2.1 AA minimum. High contrast ratios critical — financial data must be readable.
- **Backend:** Python 3.12 + FastAPI
- **Database:** Supabase (PostgreSQL) with RLS
- **Auth:** Supabase Auth (OTP + password)
- **File Storage:** Supabase Storage (PDF/image uploads)
- **AI:** Claude Sonnet API (vision) for document extraction
- **i18n:** DE (primary) + FR (secondary) + IT (tertiary) via `src/lib/i18n.ts` pattern
- **Deploy:** GitHub Actions → Metanet (frontend) + Railway (backend)

## Component Specifications

### Sidebar (from Stripe)
- Fixed left sidebar, ~220px wide
- White background with subtle right border `#E3E8EE`
- Sections grouped with uppercase 11px section labels in muted gray
- Nav items: 14px, regular weight, icon (16px) + label, 8px gap
- Active: accent color text + light accent tint background
- Collapsible to ~64px (icons only) on smaller screens

### Data Tables (from Stripe, critical for BelegPilot)
- Header: uppercase, 12px, medium weight, 0.5px letter-spacing, muted gray `#697386`
- Rows: 48px height, 1px solid `#E3E8EE` dividers, no vertical borders
- Row hover: light gray background
- Checkbox column for multi-select
- Status: small colored dot + text label (green "Verified", amber "Review", red "Error")
- Amounts: right-aligned, tabular numerals (JetBrains Mono)
- Actions: contextual on hover + bulk toolbar when rows selected
- Filters: pill-shaped chips above table, dropdown with checkboxes + "Apply"
- Pagination: "Previous" / "Next" text buttons, results count

### Document Review Pane (BelegPilot-specific, inspired by Stripe split-pane)
- Left panel (~50%): Original document viewer (PDF/image with zoom/pan)
- Right panel (~50%): Extracted data form with confidence indicators
- Each extracted field: label + value + confidence dot (green/amber/red)
- Low-confidence fields highlighted with amber background tint
- Inline editing: click value to edit, save on blur or Enter
- Field-level actions: "Accept", "Flag for review"
- Top bar: document name, client assignment dropdown, status badge, Save + Export buttons

### Cards (from Stripe + Kraken hybrid)
- Background: white `#FFFFFF`
- Border: 1px solid `#E3E8EE`
- Border-radius: 8px
- Shadow: none (border-first philosophy)
- Padding: 20–24px
- On sage-tinted page background, white cards provide natural elevation

### Buttons
- Primary: `#0E7C6B` background, white text, border-radius 6px, height 36px, font-weight 500
- Secondary: white background, 1px `#E3E8EE` border, dark text, border-radius 6px
- Ghost: no border, no background, accent or gray text
- Destructive: `#DF1B41` background, white text (rare)
- Full-width for auth CTAs, auto-width for inline actions

### Input Fields
- Height: 40px
- Border: 1px solid `#D3D8DF`, border-radius 6px
- Background: white
- Focus: accent color border ring `#0E7C6B` with subtle tinted shadow
- Label: 14px medium weight above input, 4px gap
- Helper text: 13px muted gray below input

### Command Palette (from Fey)
- Triggered by Ctrl+K / Cmd+K
- Centered modal overlay with search input at top
- Action list below with keyboard shortcut hints on right edge
- Sections: Recent Documents, Clients, Navigation, Actions
- Subtle backdrop blur behind modal

### Toast Notifications (from Kraken)
- Position: top-right
- Rounded card with icon + title + description
- Variants: success (green accent), error (red), info (blue), warning (amber)
- Auto-dismiss after 5 seconds
- Stack when multiple

## Language Support

| Language | Scope | Priority |
|---|---|---|
| **German (DE)** | Full UI + document extraction + support | Primary — 65% of Swiss Treuhand firms |
| **French (FR)** | Full UI + document extraction | Secondary — 23% of firms |
| **Italian (IT)** | Document extraction + basic UI | Tertiary — 8% of firms |
| **English (EN)** | Admin/dev interface, API docs | Internal only |

## Data Residency & Compliance

| Requirement | Approach |
|---|---|
| **nDSG (New Swiss Data Protection Act)** | Compliant. Privacy policy, data processing transparency, deletion rights. |
| **Data storage** | Supabase EU region (closest to Switzerland). Frontend on Metanet (Swiss hosting). |
| **AI processing** | Claude API — Anthropic's enterprise data handling: no training on customer data, data deleted after processing. |
| **Document retention** | Configurable per client. Default: 10 years (Swiss legal requirement for business records). |
| **Access control** | Row Level Security (RLS) on all tables. Each Treuhand firm sees only their own data. |

## Pricing Reference

| Tier | Price/month | Documents | Clients |
|---|---|---|---|
| **Starter** | CHF 49 | 200/month | 10 |
| **Professional** | CHF 99 | 1,000/month | 50 |
| **Enterprise** | CHF 249 | Unlimited | Unlimited + API |
