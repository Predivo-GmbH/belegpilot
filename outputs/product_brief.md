# Product Brief: BelegPilot

**Date:** 11 March 2026
**Phase:** 2 — Product Definition & Offer Design
**Status:** DEFINED

---

## 1. App Name

**BelegPilot**

---

## 2. One-Line Description

**The Swiss AI document co-pilot that turns shoeboxes of receipts into ERP-ready bookings — for any accounting software.**

---

## 3. Target Persona

**Name:** Sandra Meier (composite)
**Title:** Owner / Senior Accountant at a Swiss Treuhand (fiduciary) firm
**Firm size:** 2–8 employees, managing 50–200 SME clients
**Location:** German-speaking Switzerland (Zurich, Bern, Aargau, St. Gallen)
**Age:** 38–55
**Association:** May or may not be a TREUHAND|SUISSE / EXPERTsuisse member (58% are unaffiliated)

### Daily Reality
- Spends **40% of her time** on manual document entry — scanning, typing, cross-referencing
- Clients send documents in every format: email attachments, WhatsApp photos, physical envelopes, USB sticks, and the dreaded year-end shoebox
- Uses **2–3 different ERP/accounting systems** across her client base (e.g., Bexio for some, Banana for others, Sage for legacy clients)
- Struggles with the **QR-bill v2.3 transition** — every invoice now requires manual validation of structured address fields
- Cannot use American cloud tools due to **Swiss data residency concerns** (post-privatim ruling, Nov 2025)
- Has looked at Accounto (too expensive, requires full migration), DeepO (Abacus-only), Kontera (now Bexio-only)
- **Wants:** A tool that works with her existing setup, not another platform to migrate to

### Buying Behavior
- Owner is the decision maker — no procurement committee
- Trusts peer recommendations from other Treuhand firms
- Will try a free pilot if it solves an immediate pain (QR-bill compliance)
- Pays monthly, expects Swiss-quality support in German
- Budget: CHF 50–150/month for a tool that saves 10+ hours/week

---

## 4. Core Problem Solved

> *"We spend 40% of our time on manual document entry. Our clients send us shoeboxes of receipts at year-end. The QR-bill transition is costing us time on every single invoice. And we cannot use American AI tools — our clients' financial data cannot leave Switzerland."*

**In short:** Swiss Treuhand firms waste thousands of hours per year manually entering, categorizing, and validating financial documents — and no existing tool works across all their clients' accounting systems.

---

## 5. MVP Features (Exactly 3)

### Feature 1: Smart Document Upload & AI Extraction

**What it does:** Upload invoices, receipts, and bank statements (PDF, image, or photo). BelegPilot extracts all structured data using a hybrid pipeline:
- **QR codes** → decoded directly via `@zxing/library` (free, instant, 100% accurate)
- **ZUGFeRD/Factur-X XML** → parsed directly (free, instant)
- **Visual content** → Claude Sonnet vision API extracts supplier, amounts, dates, IBAN, VAT number, line items

**Key details:**
- Supports single-page invoices, multi-page statements, thermal receipts, and phone photos
- Extracts Swiss-specific fields: IBAN (CH format), VAT number (CHE-xxx.xxx.xxx), QR-bill v2.3 structured addresses
- Cross-references QR code data against invoice text for anomaly detection
- Confidence scoring per field (HIGH/MEDIUM/LOW) — low-confidence fields flagged for human review
- Vendor learning: repeated vendors get auto-matched to previous categorization
- **Cost:** ~CHF 0.02 per document (80% gross margin at CHF 99/month for 1,000 docs)

**Why it matters:** Eliminates the manual typing that consumes 40% of a Treuhand firm's working hours. QR-bill v2.3 compliance is handled automatically, removing the Sept 2026 deadline pressure.

### Feature 2: Auto-Categorization to Swiss Kontenrahmen KMU + Client Assignment

**What it does:** AI automatically assigns each extracted document to the correct account in the Swiss Kontenrahmen KMU (300+ standard account categories) and links it to the correct client.

**Key details:**
- Full Swiss Kontenrahmen KMU built in (standard chart of accounts for Swiss SMEs)
- AI suggests account assignment based on document content, vendor history, and client context
- Multi-client workspace: each Treuhand firm manages all their SME clients in one dashboard
- Per-client account mapping: Client A uses Konto 4000 for materials, Client B uses 4010 — BelegPilot learns both
- Swiss VAT (MWST) rate detection: 8.1% standard, 2.6% reduced, 3.8% accommodation
- Bulk review workflow: review and approve 50 documents in minutes, not hours
- Supports DE, FR, IT document languages — extracts correctly regardless of invoice language

**Why it matters:** Categorization is where Treuhand staff spend the most cognitive effort. AI handles the routine 80%, humans review the edge cases. The Kontenrahmen KMU integration is Swiss-specific — no international competitor has this.

### Feature 3: Multi-ERP Export (Bexio, Abacus, Sage, Banana)

**What it does:** Export processed and categorized documents to any major Swiss accounting software, in the format each system expects.

**Key details:**
- **Bexio:** CSV import format + future API integration (Bexio REST API)
- **Abacus:** AbaConnect XML format
- **Sage:** Sage 50 CSV import format
- **Banana:** Banana Accounting CSV/TXT import format
- **Generic:** Standard CSV export for any other system
- One-click export: select documents → choose target ERP → download ready-to-import file
- Export includes: date, amount, VAT, account number, contra account, description, reference
- Export history: track what was exported when, prevent duplicates

**Why it matters:** This is the #1 differentiator. Every competitor is locked to one ERP ecosystem. 79% of Swiss Treuhand firms do NOT use Bexio. A firm using Banana for Client A and Abacus for Client B can use one tool for both. No migration required — BelegPilot fits into existing workflows.

---

## 6. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React 19 + TypeScript + Vite 7 + Tailwind CSS | Roger's proven stack (Predivo, SignalForge, ReplyFlow). Fast iteration, excellent DX. |
| **Backend** | Python 3.12 + FastAPI | Roger's proven stack (SignalForge). Async-native, excellent for AI pipeline orchestration. |
| **Database** | Supabase (PostgreSQL) | Roger's proven stack. Auth, Storage, Row Level Security, Edge Functions all included. Swiss data stays in EU region (closest available). |
| **AI** | Claude Sonnet API (vision) | 97% accuracy on text PDFs. CHF 0.02/doc cost. Structured JSON output. Multilingual (DE/FR/IT). Roger has existing Anthropic API key. |
| **QR Decode** | @zxing/library | Client-side QR code reading. Free, fast, proven. No AI cost for QR-bill data. |
| **File Storage** | Supabase Storage | Integrated with auth (RLS on buckets). Handles PDF/image uploads. |
| **Auth** | Supabase Auth | OTP + password login. Roger has implemented this 3 times (LaunchReady, ReplyFlow, future). |
| **Deploy** | GitHub Actions → Metanet (frontend) + Railway (backend) | Proven CI/CD pipeline. Metanet = Swiss hosting for frontend. Railway = scalable backend with EU region. |

**Build estimate:** 4–6 weeks to MVP (based on Roger's velocity: SignalForge = 250 commits in comparable timeframe).

---

## 7. Scope Guard — What BelegPilot is NOT

BelegPilot is a **document processing tool**, not accounting software.

| BelegPilot IS | BelegPilot is NOT |
|---|---|
| A document intake & extraction tool | An ERP or accounting system |
| An AI categorization assistant | A replacement for Bexio, Abacus, Sage, or Banana |
| A multi-ERP export bridge | A bookkeeping platform |
| A QR-bill v2.3 compliance tool | A tax filing solution |
| A time-saver for Treuhand firms | A tool for end-client (SME) self-service |
| A standalone SaaS | A plugin inside another platform |

**Explicit non-goals for MVP:**
- No payment processing or invoicing
- No tax return preparation or filing
- No payroll processing
- No direct bank account connections (feeds)
- No client-facing portal (Treuhand firm is the only user)
- No mobile app (responsive web only)
- No real-time collaboration / multi-user editing
- No custom chart of accounts (Kontenrahmen KMU only in MVP)

---

## 8. Key Differentiators vs Competition

### vs DeepO (Abacus ecosystem)
- **BelegPilot is ERP-agnostic.** DeepO only works with Abacus (14% market share). BelegPilot works with any ERP — including the 36% of firms using "Other" software.
- **BelegPilot uses LLM vision** for contextual understanding and anomaly detection. DeepO uses proprietary ML with no contextual reasoning.

### vs Kontera / Bexio AI
- **BelegPilot works with ANY accounting software.** Kontera was acquired by Bexio and is now Bexio-only (21% market share). The other 79% of firms are left out.
- **BelegPilot is standalone** — no need to switch ERP or commit to the Bexio ecosystem.

### vs Accounto
- **BelegPilot is a tool, not a platform.** Accounto costs CHF 200/month and requires full migration to their closed system. BelegPilot at CHF 49–99/month fits into existing workflows with zero migration.
- **BelegPilot exports to any ERP.** Accounto is a walled garden.

### vs Dext (Receipt Bank)
- **BelegPilot is Swiss-native.** Dext doesn't support Swiss QR-bills, Swiss VAT rates (8.1%/2.6%/3.8%), German/French/Italian document extraction, or Swiss chart of accounts. Dext data is hosted in the UK/EU, not Switzerland.
- **BelegPilot costs less.** Dext charges ~$239/month for 10 clients. BelegPilot Professional covers 50 clients for CHF 99/month.

### vs KLARA
- **BelegPilot has AI extraction.** KLARA offers basic OCR only — no contextual understanding, no anomaly detection, no learning from vendor patterns.

### Summary Differentiator Matrix

| Capability | DeepO | Kontera | Accounto | Dext | KLARA | **BelegPilot** |
|---|---|---|---|---|---|---|
| ERP-agnostic | No | No | No | N/A | No | **Yes** |
| LLM-powered | No | Partial | No | No | No | **Yes** |
| Swiss QR-bill v2.3 | Likely | Yes | Unclear | No | No | **Yes** |
| DE/FR/IT extraction | Yes | Yes | DE only | EN only | DE only | **Yes** |
| Standalone tool | Partial | No | No | Yes | Yes | **Yes** |
| Swiss data residency | Yes | Yes | Yes | No | Yes | **Yes** |
| Price (CHF/month) | 9+ | 42-119 | 200 | ~239 | Free (basic) | **49-99** |

---

## 9. Language Support

| Language | Scope | Priority |
|---|---|---|
| **German (DE)** | Full UI + document extraction + support | Primary — 65% of Swiss Treuhand firms |
| **French (FR)** | Full UI + document extraction | Secondary — 23% of firms (Geneva, Vaud, Neuchâtel) |
| **Italian (IT)** | Document extraction + basic UI | Tertiary — 8% of firms (Ticino) |
| **English (EN)** | Admin/dev interface, API docs | Internal only |

**Implementation:** i18n via `src/lib/i18n.ts` pattern (proven in Predivo). Claude Sonnet handles multilingual extraction natively — no per-language model needed.

---

## 10. Data Residency & Compliance

| Requirement | Approach |
|---|---|
| **nDSG (New Swiss Data Protection Act)** | Compliant. Privacy policy, data processing transparency, deletion rights. |
| **Data storage** | Supabase EU region (closest to Switzerland). Frontend on Metanet (Swiss hosting). |
| **AI processing** | Claude API — Anthropic's enterprise data handling: no training on customer data, data deleted after processing. |
| **Document retention** | Configurable per client. Default: 10 years (Swiss legal requirement for business records). |
| **Access control** | Row Level Security (RLS) on all tables. Each Treuhand firm sees only their own data. |
| **Future** | Monitor Anthropic EU endpoint availability. Evaluate Swiss-hosted LLM options if demand requires. |

**Marketing position:** "Your clients' data stays in Switzerland. We use Swiss hosting and enterprise-grade AI that never trains on your documents."

---

## 11. Pricing (Confirmed)

| Tier | Price/month | Documents | Clients | Target |
|---|---|---|---|---|
| **Starter** | CHF 49 | 200/month | 10 | Solo practitioners, 1-2 person firms |
| **Professional** | CHF 99 | 1,000/month | 50 | Small firms, 3-10 employees |
| **Enterprise** | CHF 249 | Unlimited | Unlimited + API access | Larger firms, 10+ employees |

**Unit economics:** At CHF 99/month with 1,000 docs, AI cost is ~CHF 20 → **80% gross margin**.
**Break-even:** ~15 firms at Professional tier covers all hosting + API costs.

---

## 12. Success Metrics (First 6 Months)

| Metric | Target |
|---|---|
| Pilot signups (free) | 10 firms by Month 3 |
| Paying customers | 15 firms by Month 6 |
| MRR | CHF 1,275 by Month 6 |
| Document accuracy | >95% on text PDFs, >90% on scanned |
| Time saved per firm | >10 hours/week |
| Churn rate | <5% monthly |

---

## Appendix: Go-to-Market Timeline

| Month | Milestone |
|---|---|
| 1-2 | MVP build (4-6 weeks) |
| 3 | 3-5 free pilot firms (German-speaking, 2-8 employees) |
| 4 | First paying customers, iterate on feedback |
| 5 | Content marketing launch (QR-bill v2.3 guide) |
| 6 | 15 paying firms, TREUHAND|SUISSE event sponsorship |
| 7-8 | French-speaking expansion, Bexio API integration |
| 9-10 | treuhand-suche.ch listing, referral program |
| 12 | 50 paying firms, CHF 4,950 MRR |

---

**Next step: Phase 2 — Offer Design (landing page, pricing page, onboarding flow)**
