# BelegPilot

AI-powered document processing for Swiss Treuhand firms. Extracts, categorizes, and exports financial documents to any ERP system.

## Tech Stack

- **Frontend:** React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 4 + shadcn/ui + TanStack Query 5
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions in Deno)
- **AI:** Claude Sonnet API (vision extraction)
- **Payments:** Stripe
- **Deploy:** GitHub Actions → FTP → Metanet

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Type-check + build
npm run lint      # ESLint
npm run test      # Vitest
```

## Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui primitives
│   ├── layout/       # AppLayout, Sidebar
│   ├── shared/       # PasswordGate, ThemeToggle
│   ├── auth/         # Login, Signup
│   ├── dashboard/    # MetricCards, DocumentTable
│   ├── documents/    # Upload, Review, List
│   ├── clients/      # ClientList, ClientDetail
│   ├── export/       # ExportConfig, ExportHistory
│   └── settings/     # FirmProfile, Team, ERP, Billing, Security
├── hooks/            # Custom React hooks
├── lib/              # supabase.ts, utils.ts, constants.ts
├── pages/            # Route pages (lazy-loaded)
├── types/            # TypeScript type definitions
└── test/             # Test setup
supabase/
├── migrations/       # SQL migrations
└── functions/        # Deno Edge Functions
```

## Brand Guidelines

- **Canonical tokens:** `docs/design-tokens.json` (single source of truth)
- **Brand skill:** `.claude/skills/brand-guidelines/SKILL.md` (auto-enforced)
- **Design file:** `design-v1.pen` (approved mockups)
- **Accent:** `#0E7C6B` (Deep Teal-Green)
- **Font:** Plus Jakarta Sans (UI) + JetBrains Mono (financial data)
- **Theme:** Light only — no dark mode
- **Cards use borders, NOT shadows** (Stripe pattern)
- **Page bg:** `#F0F7F5` (sage-mint tint), never flat white

## Verification Loop

Before reporting completion of any task:
1. `npm run build` must succeed
2. `npm run lint` must pass
3. `npm run test` must pass
4. For UI changes: start dev server and verify visually

## Rules

- Never hardcode colors, fonts, or spacing — use Tailwind classes from design tokens
- All text is German (DE) by default — i18n from the start
- Every new function/hook/component must have at least one test
- Supabase Edge Functions use `_shared/cors.ts` for CORS
- Password gate: `belegpilot2026` (sessionStorage key: `belegpilot-unlocked`)
- Financial amounts: JetBrains Mono, right-aligned, tabular numerals
- Table headers: uppercase, 12px, #697386, 0.5px letter-spacing
