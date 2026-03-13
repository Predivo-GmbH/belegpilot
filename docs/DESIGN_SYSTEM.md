# BelegPilot Design System

> **Canonical source:** `docs/design-tokens.json` — when this document and the token file conflict, the token file wins.
>
> **Last audit:** 2026-03-12

---

## 1. Color System

### Brand Accent — Deep Teal-Green

| Token | Value | Use |
|-------|-------|-----|
| `accent-default` | `#0E7C6B` | Primary buttons, links, active nav, focus rings |
| `accent-hover` | `#0A6355` | Button/link hover states |
| `accent-active` | `#085247` | Button pressed state |
| `accent-light` | `#E6F5F2` | Active nav background, selected row tint |
| `accent-muted` | `#B8DDD6` | Progress bars, subtle indicators |
| `accent-on` | `#FFFFFF` | Text on accent backgrounds |

### Surfaces

| Token | Value | Use |
|-------|-------|-----|
| `surface-page` | `#F0F7F5` | Page background (sage-mint tint) |
| `surface-default` | `#FFFFFF` | Cards, modals, sidebar, inputs |
| `surface-raised` | `#FFFFFF` | Elevated elements (same as default — elevation via border) |
| `surface-sunken` | `#F5F7F6` | Inset content areas |
| `surface-overlay` | `rgba(0,0,0,0.5)` | Modal/dialog backdrop |

### Ink (Text Colors)

| Token | Value | Use |
|-------|-------|-----|
| `ink-default` | `#1A1D23` | Primary body text, headings |
| `ink-secondary` | `#4A5060` | Descriptions, secondary content |
| `ink-muted` | `#697386` | Captions, table headers, placeholders |
| `ink-disabled` | `#A3ABBA` | Disabled text and icons |
| `ink-link` | `#0E7C6B` | Inline links (matches accent) |

### Edges (Borders & Dividers)

| Token | Value | Use |
|-------|-------|-----|
| `edge-default` | `#E3E8EE` | Card borders, table row dividers, sidebar border |
| `edge-strong` | `#D3D8DF` | Input field borders |
| `edge-focus` | `#0E7C6B` | Focus ring color |

### Status Colors

| Status | Foreground | Background | Use |
|--------|-----------|------------|-----|
| Success | `#16A34A` | `#F0FDF4` | Verified documents, successful exports |
| Warning | `#D97706` | `#FFFBEB` | Low confidence fields, pending review |
| Error | `#DF1B41` | `#FEF2F2` | Failed extraction, validation errors |
| Info | `#2563EB` | `#EFF6FF` | Informational banners |

### Confidence Indicators

Used on extracted document fields to show AI confidence level:
- **High confidence:** `#16A34A` green dot — auto-accepted
- **Medium confidence:** `#D97706` amber dot — needs human review
- **Low confidence:** `#DF1B41` red dot — requires manual entry

---

## 2. Typography

### Font Families
- **Primary:** Plus Jakarta Sans — all UI text (headings, body, labels, navigation)
- **Mono:** JetBrains Mono — financial amounts, account numbers, IBANs, VAT numbers, document data

### Type Scale

| Token | Size | Line Height | Weight | Letter Spacing | Use |
|-------|------|-------------|--------|---------------|-----|
| `display` | 32px | 40px | 700 | -0.01em | Hero metrics on dashboard |
| `h1` | 24px | 32px | 600 | -0.01em | Page titles |
| `h2` | 20px | 28px | 600 | normal | Section headings |
| `h3` | 16px | 24px | 600 | normal | Card titles, modal titles |
| `body` | 14px | 20px | 400 | normal | Default text everywhere |
| `small` | 13px | 18px | 400 | normal | Helper text, descriptions |
| `caption` | 12px | 16px | 500 | 0.5px | Table headers (uppercase) |
| `micro` | 11px | 14px | 500 | 0.05em | Sidebar section labels (uppercase) |

### Typography Rules
1. Body text is always 14px — hierarchy through weight and color, not size changes
2. Table headers: always uppercase, 12px, medium weight, `#697386`, 0.5px letter-spacing
3. Sidebar section labels: always uppercase, 11px, muted gray
4. Financial amounts: always JetBrains Mono, right-aligned
5. Max 3 font sizes visible on any single screen section
6. Bold (700) reserved for display numbers only — use semibold (600) for headings

---

## 3. Spacing & Grid

### Base Unit: 4px

| Scale | Value | Common Use |
|-------|-------|------------|
| 1 | 4px | Icon-to-text gap inside buttons |
| 2 | 8px | Inline element spacing, icon-label gap |
| 3 | 12px | Compact component internal padding |
| 4 | 16px | Standard component padding, card gap |
| 5 | 20px | Card padding (standard) |
| 6 | 24px | Section gaps, grid gutter |
| 8 | 32px | Large section gaps |
| 10 | 40px | Page section separation |
| 12 | 48px | Major layout gaps |
| 16 | 64px | Page top/bottom padding |

### Grid
- **Columns:** 12
- **Gutter:** 24px
- **Margin:** 24px
- **Content max-width:** 1200px

### Breakpoints
| Name | Width | Layout |
|------|-------|--------|
| Mobile | 375px | Single column, bottom nav |
| Tablet | 768px | Collapsed sidebar, responsive grid |
| Desktop | 1280px | Full sidebar + content (primary) |
| Wide | 1440px | Full sidebar + wider content |

---

## 4. Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `none` | 0px | Dividers, table cells |
| `sm` | 4px | Small badges, compact elements |
| `md` | 6px | Buttons, inputs, dropdown items |
| `lg` | 8px | Cards, modals, toast notifications |
| `xl` | 12px | Large overlays, feature cards |
| `full` | 9999px | Badges, pills, avatar circles |

---

## 5. Elevation & Shadows

**BelegPilot uses border-first design.** Shadows are the exception, not the rule.

| Level | Treatment | Use |
|-------|-----------|-----|
| 0 (default) | `1px solid #E3E8EE` border | Cards, sidebar, inputs |
| 1 (subtle) | `0 1px 2px rgba(0,0,0,0.05)` | Dropdowns, popovers |
| 2 (medium) | `0 4px 6px rgba(0,0,0,0.07)` | Modals, command palette |
| 3 (high) | `0 10px 15px rgba(0,0,0,0.1)` | Floating action panels |
| Focus | `0 0 0 3px rgba(14,124,107,0.15)` | Focus rings (with accent border) |

**Rule:** If it's a card, use a border. If it's floating above content (modal, dropdown, tooltip), use a shadow.

---

## 6. Iconography

- **Family:** Lucide (consistent line-icon set)
- **Default size:** 16px (md)
- **Stroke width:** 1.5px
- **Sizes:** 14px (sm), 16px (md), 20px (lg), 24px (xl)
- **Color:** Inherits from parent text color. Never colored independently except status icons.
- **Usage:** Navigation items (16px), table action buttons (16px), metric card icons (20px), empty state illustrations (24px)

---

## 7. Animation & Motion

### Duration Scale
| Token | Duration | Use |
|-------|----------|-----|
| `fast` | 100ms | Hover states, color transitions |
| `normal` | 200ms | Button press, tab switch, toggle |
| `slow` | 300ms | Panel slide, accordion expand |
| `entrance` | 400ms | Page transitions, modal entry |

### Easing
| Token | Curve | Use |
|-------|-------|-----|
| `default` | `cubic-bezier(0.4, 0, 0.2, 1)` | General transitions |
| `entrance` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering view |
| `exit` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving view |
| `bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Success feedback, playful moments |

### Motion Patterns
- **Page enter:** Fade in + subtle slide up (entrance, 400ms)
- **Modal:** Fade in backdrop + scale up content (entrance, 300ms)
- **Toast:** Slide in from right (entrance, 300ms), slide out right (exit, 200ms)
- **Extraction progress:** Animated progress bar with pulse on completion
- **Confidence dots:** Fade in sequentially as fields are extracted
- **Document upload:** Progress ring with percentage
- **Reduce motion:** Respect `prefers-reduced-motion` — disable all transforms, keep only opacity

---

## 8. Component Reference

### Buttons
| Variant | Background | Text | Border | Radius | Height |
|---------|-----------|------|--------|--------|--------|
| Primary | `#0E7C6B` | white | none | 6px | 36px |
| Secondary | white | `#1A1D23` | `#E3E8EE` | 6px | 36px |
| Ghost | transparent | `#0E7C6B` | none | 6px | 36px |
| Destructive | `#DF1B41` | white | none | 6px | 36px |

- Font: 14px, weight 500
- Padding: 16px horizontal
- Icon + text gap: 8px
- Loading: spinner replaces icon, text dims to 50% opacity
- Disabled: 50% opacity, no pointer events

### Input Fields
- Height: 40px
- Padding: 12px horizontal
- Border: `#D3D8DF`, radius 6px
- Focus: `#0E7C6B` border + `0 0 0 3px rgba(14,124,107,0.15)` shadow
- Error: `#DF1B41` border + error message below in error color
- Label: 14px medium weight above, 4px gap
- Helper: 13px `#697386` below, 4px gap
- Optional fields marked with "(Optional)" label suffix

### Cards
- Background: white
- Border: 1px solid `#E3E8EE`
- Radius: 8px
- Padding: 20px (default), 24px (spacious)
- NO shadows — border-first philosophy

### Data Tables
- Header: uppercase, 12px/500, `#697386`, 0.5px letter-spacing
- Row: 48px height, `#E3E8EE` bottom border
- Row hover: `#F8F9FA` background
- Selected row: `#E6F5F2` background
- Checkbox: 16px, accent color when checked
- Amounts: right-aligned, JetBrains Mono
- Status dot: 8px circle + 8px gap + text label
- Pagination: "Previous"/"Next" text buttons + "Showing 1–10 of 247"

### Sidebar Navigation
- Width: 220px (expanded), 64px (collapsed)
- Background: white
- Right border: `#E3E8EE`
- Section labels: uppercase, 11px, `#697386`, 0.05em letter-spacing, 24px top margin
- Nav items: 36px height, 12px horizontal padding, 14px text, 16px icon, 8px gap
- Active item: `#0E7C6B` text + `#E6F5F2` background
- Hover item: `#F8F9FA` background
- Logo: top of sidebar, 16px padding

### Badges / Status Pills
- Height: 22px
- Padding: 8px horizontal
- Radius: full (9999px)
- Font: 12px, weight 500
- Variants: accent, success, warning, error, neutral (gray)

### Toast Notifications
- Position: top-right, 24px from edges
- Width: max 360px
- Radius: 8px
- Padding: 16px
- Shadow: level 2
- Auto-dismiss: 5 seconds
- Stack: newest on top, 8px gap

### Command Palette
- Trigger: Ctrl+K / Cmd+K
- Overlay: centered, max 560px wide
- Search input at top: 48px height, no border radius top
- Results grouped: Recent, Clients, Navigation, Actions
- Each item: icon + label + optional description + keyboard shortcut hint
- Backdrop: `surface-overlay` with blur

### Document Review Pane
- Split: 50% original document / 50% extracted data
- Resizable divider between panels
- Left panel: PDF/image viewer with zoom, pan, page navigation
- Right panel: form fields with confidence dots
- Field layout: label (caption) + value (body) + confidence dot (8px)
- Low confidence: amber background tint on field row
- Inline edit: click to edit, save on blur/Enter
- Top bar: document name + client dropdown + status badge + Save/Export buttons

---

## 9. Page Patterns

### Authentication Pages
- Centered card (max 400px) on sage-tinted (`#F0F7F5`) background
- Logo centered above card
- Progressive multi-step with vertical stepper for signup
- Full-width primary buttons
- Generous whitespace (Kraken influence)

### Dashboard
- Sidebar + main content
- Metric cards row: 4 cards with icon, value (display size), label, trend indicator
- Recent documents table below
- Quick upload drop zone in top-right area

### Data List Pages (Documents, Clients)
- Filter bar above table: pill-shaped filter chips + search input
- Full-width Stripe-style table
- Bulk action toolbar appears when rows selected
- Pagination at bottom

### Detail Pages (Document Review, Client Detail)
- Split-pane layout for document review
- Tabbed content for client detail (Info, Documents, Account Mappings, Export Settings)
- Breadcrumb navigation at top

### Settings Pages
- Secondary sidebar or vertical tabs for settings sections
- Form fields in card groups
- Save/Cancel buttons anchored at bottom or top-right

---

## 10. Accessibility

- **WCAG 2.1 AA minimum** across all components
- **Contrast ratios:** All text meets 4.5:1 minimum (body), 3:1 (large text, UI elements)
- **Focus indicators:** Visible focus rings on all interactive elements (accent border + shadow)
- **Keyboard navigation:** Full keyboard support including command palette
- **Screen readers:** Proper ARIA labels, landmark roles, live regions for toasts
- **Reduced motion:** Respect `prefers-reduced-motion` media query
- **Touch targets:** Minimum 44px on mobile views
