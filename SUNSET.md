# BelegPilot — SUNSET (2026-07-02)

**Status:** Decommissioned. This is an archived project, not an active one.

## Why
BelegPilot's functionality (AI receipt/document processing for Swiss bookkeeping) was integrated into **Predivo BackOffice** (`C:\Business\Internal Projects\BackOffice`, https://backoffice.predivo.ch). The standalone product was never publicly launched (password gate active) and is no longer needed. Decision by Roger, 2026-07-02.

Integration plan reference: `C:\Business\Internal Projects\BackOffice\belegpilot-integration-plan.md`

## What was deleted
- Subdomain + web space `belegpilot.predivo.ch` (Metanet/Plesk)
- Supabase project `lybpfwzpoiutuqggbixg` (account `supabse@belegpilot.predivo.ch` — note the typo in the account email)
- All monitoring: production-monitor (commit `5a9306b`), health-monitor baseline, keep-alive pings
- predivo.ch marketing surface: product page, 3 comparison pages, 1 blog post (predivo commit `bc1823f`) — URLs return 404 intentionally, no redirects
- BackOffice references: `list-project-users` edge function, API-management inventory (migration 069)
- codebase-memory index entry

## What was archived (before deletion)
- `docs\db-final-schema-2026-07-02.sql` — full schema dump
- `docs\db-final-data-2026-07-02.sql` — full data dump (4.5 MB)
- `docs\db-final-auth-storage-data-2026-07-02.sql` — auth users + storage metadata
- `docs\storage-final-2026-07-02\` — ALL 10 storage objects (receipts/exports), count verified against `storage.objects`
- `C:\Business\Archive\BelegPilot-git-history-2026-07-02.bundle` — complete git history (verified)
- `C:\Business\Archive\BelegPilot-final-2026-07-02.zip` — full project folder incl. `.git` (verified, no node_modules)

## GitHub
Repo `Arivioo/belegpilot` is **archived** (read-only), not deleted.

## Credentials
DB password, service-role key, CLI token: see memory `reference_supabase_accounts.md` and `docs\Credentials.txt`. All invalid once the Supabase project is deleted.
