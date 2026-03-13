---
name: brand-guidelines
description: >
  BelegPilot brand guidelines and design system. Enforces brand tokens, typography,
  color palette, component patterns, and visual standards across all generated UI.
  Use when building or modifying any BelegPilot frontend component, page, or visual element.
---

# BelegPilot Brand Guidelines

> **Canonical token source:** `docs/design-tokens.json` — when this skill and the token file conflict, the token file wins.

## Colors

### Accent (Deep Teal-Green)
- `--accent-default: #0E7C6B` — primary buttons, links, active states
- `--accent-hover: #0A6355` — hover state
- `--accent-active: #085247` — pressed state
- `--accent-light: #E6F5F2` — tinted backgrounds, active nav highlight
- `--accent-muted: #B8DDD6` — subtle indicators
- `--accent-on: #FFFFFF` — text on accent backgrounds

### Surfaces
- `--surface-page: #F0F7F5` — page background (sage-mint tint, NOT flat white)
- `--surface-default: #FFFFFF` — cards, panels, sidebar
- `--surface-sunken: #F5F7F6` — inset areas, input backgrounds on forms

### Ink (Text)
- `--ink-default: #1A1D23` — primary text
- `--ink-secondary: #4A5060` — secondary text, descriptions
- `--ink-muted: #697386` — captions, table headers, placeholders
- `--ink-disabled: #A3ABBA` — disabled states

### Edges (Borders)
- `--edge-default: #E3E8EE` — card borders, dividers, table rows
- `--edge-strong: #D3D8DF` — input borders
- `--edge-focus: #0E7C6B` — focus rings

### Status
- Success: `#16A34A` / `#F0FDF4` (bg)
- Warning: `#D97706` / `#FFFBEB` (bg)
- Error: `#DF1B41` / `#FEF2F2` (bg)
- Info: `#2563EB` / `#EFF6FF` (bg)

### Confidence Indicators
- High: `#16A34A` (green dot)
- Medium: `#D97706` (amber dot)
- Low: `#DF1B41` (red dot)

## Typography

### Font Families
- **Primary:** Plus Jakarta Sans — all UI text
- **Mono:** JetBrains Mono — amounts, account numbers, document data, code

### Type Scale
| Token | Size | Weight | Use |
|-------|------|--------|-----|
| display | 32px/40px | 700 | Page hero numbers |
| h1 | 24px/32px | 600 | Page titles |
| h2 | 20px/28px | 600 | Section headings |
| h3 | 16px/24px | 600 | Card titles |
| body | 14px/20px | 400 | Default text |
| small | 13px/18px | 400 | Helper text |
| caption | 12px/16px | 500 | Table headers (uppercase, 0.5px letter-spacing) |
| micro | 11px/14px | 500 | Sidebar section labels (uppercase, 0.05em letter-spacing) |

### Rules
- Body text is ALWAYS 14px. Hierarchy through weight and color, not size jumps
- Table headers: uppercase, 12px, medium weight, `#697386`, 0.5px letter-spacing
- Sidebar section labels: uppercase, 11px, muted gray
- Financial amounts: JetBrains Mono, right-aligned, tabular numerals
- Never use Inter or Roboto — Plus Jakarta Sans is the brand font

## Components

### Buttons
- Primary: `#0E7C6B` bg, white text, 6px radius, 36px height, font-weight 500
- Secondary: white bg, `#E3E8EE` border, dark text, 6px radius
- Ghost: no border/bg, accent or gray text
- Destructive: `#DF1B41` bg, white text (rare)
- NO full pill shapes for primary CTAs — use 6px radius

### Cards
- White bg, 1px `#E3E8EE` border, 8px radius, 20px padding
- NO drop shadows — borders provide structure (Stripe pattern)
- Cards sit on `#F0F7F5` page background for natural elevation

### Data Tables
- Row height: 48px, 1px `#E3E8EE` dividers, no vertical borders
- Header: uppercase, 12px, `#697386`
- Amounts: right-aligned, JetBrains Mono
- Status: colored dot + text label
- Hover: light gray row background
- NO zebra striping — use subtle dividers

### Input Fields
- Height: 40px, 6px radius, `#D3D8DF` border
- Focus: `#0E7C6B` border ring + subtle tinted shadow
- Label above: 14px medium weight, 4px gap
- Mark optional fields, not required ones

### Sidebar
- 220px wide, white bg, `#E3E8EE` right border
- Grouped sections with uppercase 11px labels
- Nav items: 14px, icon (16px) + label, 8px gap
- Active: accent text + light accent tint bg
- Collapses to 64px (icons only)

### Toast Notifications
- Top-right positioned, 8px radius, auto-dismiss 5s
- Variants: success/error/warning/info with matching accent colors

## Anti-Slop Rules (ENFORCED)

These rules are non-negotiable. Violating them produces off-brand output.

1. **No purple anywhere** — not this brand's color territory
2. **No shadows on cards** — use `#E3E8EE` borders (Stripe pattern)
3. **No Inter/Roboto** — Plus Jakarta Sans only
4. **No zebra-striped tables** — subtle row dividers only
5. **No flat white page backgrounds** — always use `#F0F7F5` sage-mint tint
6. **No pill-shaped primary buttons** — 6px radius, not full pill
7. **No decorative color** — color serves meaning (status, emphasis, accent)
8. **No symmetric card grids** — break visual monotony with hierarchy
9. **No cookie-cutter hero sections** — this is a professional app
10. **Typography hierarchy via weight + color** — not wild size jumps

## Layout

- **Desktop-first** (1280px primary width)
- **Sidebar + main content** layout for all app pages
- **Split-pane** for document review (original left, extracted data right)
- **12-column grid**, 24px gutter, 24px margin
- **Breakpoints:** 375px (mobile), 768px (tablet), 1280px (desktop), 1440px (wide)

## Iconography
- **Family:** Lucide
- **Default size:** 16px
- **Stroke width:** 1.5px
- **Sizes:** 14px (sm), 16px (md), 20px (lg), 24px (xl)

## i18n
- German (DE): primary — all UI
- French (FR): secondary — all UI
- Italian (IT): tertiary — basic UI + extraction
- English (EN): internal only
