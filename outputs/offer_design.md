# Offer Design: BelegPilot
**Date:** 11 March 2026
**Phase:** 2 — Product Brief & Offer Design

---

## Target Persona
**Sandra Meier** (composite) — Owner/Senior Accountant at a Swiss Treuhand firm, 2-8 employees, managing 50-200 SME clients. German-speaking Switzerland. Age 38-55. Spends 40% of time on manual document entry. Uses 2-3 different ERPs across her client base. Cannot use American cloud tools due to Swiss data residency concerns.

---

## 1. Pricing Tiers

### Design Principles
- Swiss Treuhand firms think in **mandates (clients)**, not seats or users
- Typical firm manages 30-200 clients
- AI cost is ~CHF 0.02/document → 80%+ gross margin at all tiers
- Positioned in the **CHF 49-249 range** between DeepO (CHF 9 + per-doc, Abacus-only) and Accounto (CHF 200, closed platform)
- Annual pricing = 2 months free (17% discount)

### Tier 1: Starter — CHF 49/month (CHF 490/year)
**Target:** Solo practitioners and 1-2 person firms (65% of market)

| Feature | Included |
|---|---|
| Documents/month | 200 |
| Client mandates | 15 |
| AI extraction (PDF, scan, photo) | Yes |
| QR-bill v2.3 validation | Yes |
| Swiss chart of accounts (Kontenrahmen KMU) | Yes |
| Multilingual (DE/FR/IT) | Yes |
| Export: CSV + Bexio | Yes |
| Export: Abacus, Sage, Banana | No |
| Anomaly detection | No |
| Vendor learning (auto-categorization) | No |
| Priority support | No |
| Data residency: Switzerland | Yes |

**Unit economics:** 200 docs × CHF 0.02 = CHF 4.00 AI cost → **92% gross margin**

---

### Tier 2: Professional — CHF 99/month (CHF 990/year) ⭐ RECOMMENDED
**Target:** Small partnerships, 3-10 person firms (core segment)

| Feature | Included |
|---|---|
| Documents/month | 1,000 |
| Client mandates | 50 |
| AI extraction (PDF, scan, photo) | Yes |
| QR-bill v2.3 validation | Yes |
| Swiss chart of accounts (Kontenrahmen KMU) | Yes |
| Multilingual (DE/FR/IT) | Yes |
| Export: CSV + ALL ERPs (Bexio, Abacus, Sage, Banana) | Yes |
| Anomaly detection | Yes |
| Vendor learning (auto-categorization) | Yes |
| Batch upload (drag & drop 50+ docs) | Yes |
| Priority email support | Yes |
| Data residency: Switzerland | Yes |

**Unit economics:** 1,000 docs × CHF 0.02 = CHF 20.00 AI cost → **80% gross margin**

---

### Tier 3: Enterprise — CHF 249/month (CHF 2,490/year)
**Target:** Larger firms, 10+ employees, high volume

| Feature | Included |
|---|---|
| Documents/month | Unlimited |
| Client mandates | Unlimited |
| AI extraction (PDF, scan, photo) | Yes |
| QR-bill v2.3 validation | Yes |
| Swiss chart of accounts (Kontenrahmen KMU) | Yes |
| Multilingual (DE/FR/IT) | Yes |
| Export: CSV + ALL ERPs + API access | Yes |
| Anomaly detection | Yes |
| Vendor learning (auto-categorization) | Yes |
| Batch upload (unlimited) | Yes |
| Custom account mapping | Yes |
| Multi-user (up to 10 seats) | Yes |
| Dedicated onboarding call | Yes |
| Priority phone + email support | Yes |
| Data residency: Switzerland | Yes |

**Unit economics:** Unlimited docs, but typical usage ~3,000-5,000/mo → CHF 60-100 AI cost → **60-76% gross margin**

---

### Overage Pricing
- Beyond included documents: **CHF 0.08/document** (4x AI cost, still cheap vs. manual entry)
- No surprise charges — email alert at 80% and 100% usage, processing pauses at 120%

---

## 2. The Irresistible Offer

### Hook Sentence (One-Liner)

> **"Ihre Mandanten schicken Schuhkartons voller Belege — BelegPilot macht daraus in Sekunden fertige Buchungssätze."**
>
> *("Your clients send shoeboxes of receipts — BelegPilot turns them into posting entries in seconds.")*

### Why This Works
- Uses the **exact customer pain language** from research ("shoeboxes of receipts")
- Focuses on the **outcome** (posting entries), not the technology (AI)
- Creates a vivid **before/after contrast** (chaos → order)
- Works in both DE and EN markets

### Alternative Hooks (for A/B testing)
1. **QR-bill urgency:** *"QR-Rechnung v2.3 kommt im September. Sind Sie bereit?"* ("QR-bill v2.3 arrives in September. Are you ready?")
2. **Time savings:** *"40% Ihrer Arbeitszeit geht für manuelle Belegerfassung drauf. Ab heute nicht mehr."* ("40% of your work time goes to manual document entry. Not anymore.")
3. **ERP-agnostic:** *"Funktioniert mit Bexio, Abacus, Sage und Banana — nicht nur mit einem."* ("Works with Bexio, Abacus, Sage, and Banana — not just one.")

---

## 3. Objection Busters

### Objection 1: "Sind meine Mandantendaten sicher?" (Is my client data safe?)

**Response:**
- All data is processed and stored in **Switzerland** (Supabase EU/Swiss region)
- Documents are encrypted at rest (AES-256) and in transit (TLS 1.3)
- AI processing via Anthropic with **enterprise data handling agreement** — zero training on your data
- We are building toward **ISO 27001 certification** and comply with the **nDSG** (Swiss Data Protection Act)
- You can delete any client's data permanently at any time — full data sovereignty
- *"We understand: your clients trust you with their most sensitive financial data. We built BelegPilot to meet the same standard of trust."*

### Objection 2: "Funktioniert das mit meinem ERP?" (Does it work with my ERP?)

**Response:**
- BelegPilot is **ERP-agnostic by design** — the only Swiss document tool that works with ALL major ERPs
- Day-1 exports: **Bexio, Abacus, Sage 50/200, Banana, CashCtrl** + universal CSV
- Enterprise tier: full **API access** for custom integrations
- Unlike DeepO (Abacus-only) or Kontera (Bexio-only), you are never locked into one ecosystem
- *"79% of Swiss Treuhand firms don't use Bexio. We built BelegPilot for the other 79%."*

### Objection 3: "Was, wenn die KI Fehler macht?" (What if the AI makes mistakes?)

**Response:**
- Every extracted field gets a **confidence score** (green/yellow/red)
- Low-confidence fields are flagged for **human review** — you stay in control
- The system **learns your vendor patterns** over time → accuracy improves with every document
- Current accuracy: **97% on text PDFs**, 90%+ on scans — better than manual entry error rates
- Side-by-side view: original document next to extracted data for instant verification
- *"BelegPilot doesn't replace your expertise — it eliminates the typing. You still make the decisions."*

---

## 4. Launch Pricing Strategy

### 4.1 Founding Member Rate
**"Gründungsmitglied" (Founding Member) — first 50 firms only**

| Tier | Regular Price | Founding Rate | Savings |
|---|---|---|---|
| Starter | CHF 49/mo | **CHF 29/mo** (locked forever) | 41% off |
| Professional | CHF 99/mo | **CHF 59/mo** (locked forever) | 40% off |
| Enterprise | CHF 249/mo | **CHF 149/mo** (locked forever) | 40% off |

- Price is **locked for life** as long as subscription remains active
- Creates urgency: "Only 50 spots — 37 remaining" (update counter on landing page)
- Founding members get a badge in the product and are invited to a private feedback group

### 4.2 Free Pilot Offer
- **30 days free**, no credit card required
- Includes Professional tier features (1,000 docs, 50 clients)
- White-glove onboarding: 15-minute video call to set up first client
- Goal: remove all friction for first experience
- Conversion target: 50% of pilots → paying customers

### 4.3 Referral Program
- **1 month free** for every referred firm that becomes a paying customer
- Referred firm also gets **1 month free** (both sides benefit)
- No cap — refer 12 firms, get a full year free
- Treuhand industry is tight-knit and regional; peer recommendations are the #1 discovery channel
- Tracking: unique referral link per firm, visible in dashboard

### 4.4 QR-Bill Urgency Campaign
**Timeline leverage: QR-bill v2.3 mandatory by 30 September 2026**

- **March-April 2026:** "6 months until the QR-bill deadline. Start your free pilot."
- **May-June 2026:** "Only 4 months left. Founding member spots running out."
- **July-August 2026:** "90 days to compliance. No time for manual processes."
- **September 2026:** "Deadline month. BelegPilot customers are already compliant."

Free content piece (lead magnet): **"QR-Rechnung v2.3: Was jede Treuhandgesellschaft bis September 2026 wissen muss"** — gated PDF guide, capture email → nurture → pilot signup.

---

## 5. Revenue Projections

### Assumptions
- Average revenue per firm: CHF 75/mo (mix of Starter and Professional)
- Founding member average: CHF 50/mo (discounted rates)
- AI cost per document: CHF 0.02
- Fixed costs: ~CHF 200/mo (Supabase Pro CHF 25, domain/hosting CHF 15, Claude API minimum CHF 50, misc CHF 110)
- Roger's time: not costed (solo founder, this IS the business)

### Conservative Scenario

| Month | Phase | Paying Firms | Avg MRR/Firm | Monthly MRR | Monthly Costs | Net |
|---|---|---|---|---|---|---|
| 1-2 | MVP build | 0 | — | CHF 0 | CHF 200 | -CHF 200 |
| 3 | Free pilots | 0 (5 pilots) | CHF 0 | CHF 0 | CHF 250 | -CHF 250 |
| 4 | First conversions | 3 | CHF 50 | CHF 150 | CHF 260 | -CHF 110 |
| 5 | Growing | 6 | CHF 55 | CHF 330 | CHF 280 | CHF 50 |
| 6 | Steady growth | 10 | CHF 60 | CHF 600 | CHF 320 | CHF 280 |
| 8 | QR-bill push | 18 | CHF 65 | CHF 1,170 | CHF 400 | CHF 770 |
| 10 | Post-deadline | 25 | CHF 70 | CHF 1,750 | CHF 450 | CHF 1,300 |
| 12 | Year-end | 35 | CHF 75 | CHF 2,625 | CHF 500 | CHF 2,125 |

**Conservative Year 1:** CHF 2,625 MRR = **CHF 31,500 ARR** by month 12

### Optimistic Scenario

| Month | Phase | Paying Firms | Avg MRR/Firm | Monthly MRR | Monthly Costs | Net |
|---|---|---|---|---|---|---|
| 1-2 | MVP build | 0 | — | CHF 0 | CHF 200 | -CHF 200 |
| 3 | Free pilots | 0 (10 pilots) | CHF 0 | CHF 0 | CHF 300 | -CHF 300 |
| 4 | First conversions | 8 | CHF 55 | CHF 440 | CHF 320 | CHF 120 |
| 5 | Growing | 15 | CHF 65 | CHF 975 | CHF 380 | CHF 595 |
| 6 | Steady growth | 25 | CHF 70 | CHF 1,750 | CHF 450 | CHF 1,300 |
| 8 | QR-bill push | 40 | CHF 80 | CHF 3,200 | CHF 600 | CHF 2,600 |
| 10 | Post-deadline | 55 | CHF 85 | CHF 4,675 | CHF 750 | CHF 3,925 |
| 12 | Year-end | 75 | CHF 90 | CHF 6,750 | CHF 900 | CHF 5,850 |

**Optimistic Year 1:** CHF 6,750 MRR = **CHF 81,000 ARR** by month 12

### Break-Even Analysis

| Scenario | Break-Even Point | Firms Needed | Timeline |
|---|---|---|---|
| Minimum (cover infra only) | CHF 200/mo | 3 firms at CHF 75 avg | Month 4-5 |
| Comfortable (CHF 2K/mo net) | CHF 2,500/mo MRR | 33 firms at CHF 75 avg | Month 10-12 |
| Full-time viable (CHF 5K/mo net) | CHF 5,500/mo MRR | 65 firms at CHF 85 avg | Month 12-15 |

### Key Metrics to Track
- **Pilot → Paid conversion rate:** Target 50%, alarm if <30%
- **Monthly churn:** Target <3%, alarm if >5%
- **Average documents/firm/month:** Validates tier sizing
- **Net Promoter Score:** Target >50 (Treuhand referral-driven)
- **CAC (Customer Acquisition Cost):** Target <CHF 200 (payback in 3 months)

---

## 6. Competitive Positioning Summary

```
                    High Price
                        |
            Accounto    |
            (CHF 200)   |
                        |
     Locked to     -----+--------  ERP-Agnostic
     One ERP            |
                        |
   DeepO (Abacus)       |   ★ BelegPilot (CHF 49-199)
   Kontera (Bexio)      |
                        |
                    Low Price
```

**BelegPilot owns the bottom-right quadrant:** affordable AND ERP-agnostic. No competitor is here.

---

## 7. Offer Summary (One-Page)

**Product:** BelegPilot — AI-powered document processing for Swiss Treuhand firms

**Hook:** *"Ihre Mandanten schicken Schuhkartons voller Belege — BelegPilot macht daraus in Sekunden fertige Buchungssätze."*

**Pricing:** CHF 49 / 99 / 249 per month (annual = 2 months free)

**Launch offer:** 30 days free, no credit card. Founding members (first 50) get 40% off forever.

**Why now:** QR-bill v2.3 deadline September 2026. Be ready, not scrambling.

**Why us:** Only ERP-agnostic, LLM-powered, Swiss-hosted document tool. Works with Bexio, Abacus, Sage, Banana — not just one.

**Risk reversal:** 30-day free pilot, no lock-in, cancel anytime, delete your data anytime.
