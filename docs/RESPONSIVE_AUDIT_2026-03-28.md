# Mobile Responsive Audit — 2026-03-28

## Overview

Phase 1 code-level audit + Phase 2 Playwright visual verification of the BelegPilot frontend for mobile responsiveness issues.
Breakpoints tested: 375px (iPhone SE), 390px (iPhone 12), 430px (iPhone 14 Pro Max).

**Stack:** React 19 · Vite 7 · Tailwind CSS 4 · shadcn/ui · Radix UI

### Phase 2 — Playwright Visual Verification

Screenshots captured at 2x DPR with mobile emulation (touch, isMobile) for all public routes:
`/`, `/auth`, `/pricing`, `/datenschutz`, `/agb`, `/impressum`

**Result: 0 new issues found.** All pages render cleanly at all three breakpoints with no horizontal overflow, clipped content, or layout breakage. Screenshots saved to `docs/screenshots/phase2/`.

## Results Summary

| Severity | Count |
|----------|-------|
| Critical | 0     |
| High     | 8     |
| Medium   | 19    |
| Low      | 15    |
| **Total**| **42**|

All 42 findings were fixed.

---

## Systemic Patterns Identified

### 1. Missing Scroll Affordance (7 occurrences)
Horizontal-scroll tables and tab bars had no visual cue that more content existed off-screen.

**Fix:** Added `.scroll-fade` / `.scroll-fade-bg` CSS utilities in `index.css` using `::after` pseudo-element with a `linear-gradient` fade. Applied to all overflow-x containers.

### 2. Fixed Card Padding (6 occurrences)
Cards used fixed `p-5` or `p-6` padding that wasted space on small screens.

**Fix:** Changed to responsive `p-3 sm:p-5` or `p-4 sm:p-6`.

### 3. Excessive Section Padding (8 occurrences)
Landing page sections and legal pages used `py-16`–`py-20` which consumed too much vertical space on mobile.

**Fix:** Changed to responsive `py-8 sm:py-16`, `py-10 sm:py-16`, or `py-12 sm:py-20`.

### 4. Inline Links Missing Touch Targets (5 occurrences)
Footer navigation links and standalone action links were plain `<a>` or `<Link>` elements without minimum 44px touch targets.

**Fix:** Added `inline-flex min-h-[44px] items-center` to standalone tappable links.

---

## Files Changed

### New CSS (index.css)
- Added `.scroll-fade` and `.scroll-fade-bg` utility classes for horizontal scroll affordance gradients.

### Components

| File | Changes |
|------|---------|
| `components/layout/AppLayout.tsx` | Title `truncate`, subtitle `line-clamp-2`, action wrapper responsive width |
| `components/shared/PricingGrid.tsx` | Card padding `p-6` → `p-4 sm:p-6` |
| `components/shared/ConfirmDialog.tsx` | Inner div padding `p-6` → `p-4 sm:p-6`, button row `flex-wrap` |

### Pages

| File | Changes |
|------|---------|
| `pages/Landing.tsx` | Hero padding responsive, section padding responsive, feature card padding responsive, trust bar text size responsive, footer link gap increased |
| `pages/Dashboard.tsx` | Metric card padding responsive, "Alle anzeigen" link touch target, table scroll affordance, table row padding bump |
| `pages/Documents.tsx` | Filter bar scroll affordance + snap scrolling, table scroll affordance |
| `pages/DocumentReview.tsx` | Action buttons stacked on mobile (`flex-col`→`sm:flex-row`), preview pane height responsive |
| `pages/Settings.tsx` | Tab bar scroll affordance + snap scrolling, team table scroll affordance, ERP table scroll affordance, billing/usage card padding responsive |
| `pages/Clients.tsx` | ClientForm padding responsive, table scroll affordance, empty state padding responsive |
| `pages/Export.tsx` | Empty state padding responsive, table scroll affordance |
| `pages/Auth.tsx` | Register/Login buttons touch targets, left panel padding responsive |
| `pages/Pricing.tsx` | Section padding responsive |
| `pages/legal/AGB.tsx` | Page padding responsive, footer links touch targets, footer mailto touch target |
| `pages/legal/Datenschutz.tsx` | Page padding responsive, footer links touch targets, footer mailto touch target |
| `pages/legal/Impressum.tsx` | Page padding responsive, footer links touch targets |

### App-Level

| File | Changes |
|------|---------|
| `App.tsx` | Toaster `position="top-center"` (mobile-safe default) |

---

## Detailed Findings

### High Severity (H1–H8)

| # | Component | Issue | Fix |
|---|-----------|-------|-----|
| H1 | AppLayout | Page title overflows on narrow screens | Added `truncate` to `<h1>`, `line-clamp-2` to subtitle |
| H2 | AppLayout | Action buttons force horizontal scroll | Action wrapper `w-full sm:w-auto` |
| H3 | DocumentReview | Action buttons overflow horizontally | `flex-col gap-2 sm:flex-row` |
| H4 | DocumentReview | Preview pane too tall on mobile | Height `h-[min(400px,50vh)] lg:h-[min(600px,70vh)]` |
| H5 | Documents | Filter bar not scrollable, no affordance | `overflow-x-auto scroll-fade scroll-fade-bg` + snap |
| H6 | Settings | Tab bar overflow without scroll cue | `overflow-x-auto scroll-fade scroll-fade-bg` + snap |
| H7 | ConfirmDialog | Buttons overflow on narrow screens | Added `flex-wrap` to button container |
| H8 | App | Toast overlaps mobile nav | `position="top-center"` (globally, since sonner lacks `mobilePosition`) |

### Medium Severity (M1–M19)

| # | Component | Issue | Fix |
|---|-----------|-------|-----|
| M1 | Landing | Hero padding excessive on mobile | `pb-10 pt-12 sm:pb-16 sm:pt-20` |
| M2 | Landing | Feature section padding excessive | `py-12 sm:py-20` |
| M3 | Landing | Feature card padding wastes space | `p-3 sm:p-5` |
| M4 | Landing | How-it-works padding excessive | `py-12 sm:py-20` |
| M5 | Landing | Pricing section padding excessive | `py-12 sm:py-20` |
| M6 | Landing | CTA section padding excessive | `py-10 sm:py-16` |
| M7 | Dashboard | Metric card padding wastes space | `p-3 sm:p-5` |
| M8 | Dashboard | Table horizontal overflow no cue | `scroll-fade` on table wrapper |
| M9 | Documents | Table horizontal overflow no cue | `scroll-fade` on table wrapper |
| M10 | Settings | Team table no scroll cue | `scroll-fade` on table wrapper |
| M11 | Settings | ERP table no scroll cue | `scroll-fade` on table wrapper |
| M12 | Settings | Billing card padding wastes space | `p-4 sm:p-6` |
| M13 | Settings | Usage card padding wastes space | `p-4 sm:p-6` |
| M14 | Clients | Form padding wastes space | `p-4 sm:p-6` |
| M15 | Clients | Table no scroll cue | `scroll-fade` on table wrapper |
| M16 | Export | Table no scroll cue | `scroll-fade` on table wrapper |
| M17 | PricingGrid | Card padding wastes space | `p-4 sm:p-6` |
| M18 | Auth | Left panel padding excessive | `p-8 xl:p-12` |
| M19 | Pricing | Section padding excessive | `py-10 sm:py-16` |

### Low Severity (L1–L15)

| # | Component | Issue | Fix |
|---|-----------|-------|-----|
| L1 | Landing | Trust bar text too large on mobile | `text-xl sm:text-2xl` |
| L2 | Landing | Footer links too close together | `gap-4` instead of `gap-2` |
| L3 | Dashboard | "Alle anzeigen" link small touch target | `inline-flex min-h-[44px] items-center` |
| L4 | Dashboard | Table row touch area tight | `py-3.5` instead of `py-3` |
| L5 | Auth | Register button small touch target | `inline-flex min-h-[44px] items-center` |
| L6 | Auth | Login button small touch target | `inline-flex min-h-[44px] items-center` |
| L7 | Clients | Empty state excessive whitespace | `py-10 sm:py-16` |
| L8 | Export | Empty state excessive whitespace | `py-10 sm:py-16` |
| L9 | AGB | Page padding excessive | `py-8 sm:py-16` |
| L10 | Datenschutz | Page padding excessive | `py-8 sm:py-16` |
| L11 | Impressum | Page padding excessive | `py-8 sm:py-16` |
| L12 | AGB | Footer links small touch target | `inline-flex min-h-[44px] items-center` |
| L13 | Datenschutz | Footer links small touch target | `inline-flex min-h-[44px] items-center` |
| L14 | Impressum | Footer links small touch target | `inline-flex min-h-[44px] items-center` |
| L15 | AGB | Footer mailto small touch target | `inline-flex min-h-[44px] items-center` |
