/**
 * Dashboard feature coverage tests (DASH-002 through DASH-005)
 *
 * Uses page.route() to mock Supabase API responses so tests
 * run without a real database connection.
 */

import { test, expect, type Page } from '@playwright/test'

const SUPABASE_URL = 'https://lybpfwzpoiutuqggbixg.supabase.co'

const MOCK_SESSION = {
  access_token: 'mock-access-token',
  token_type: 'bearer',
  expires_in: 3600,
  refresh_token: 'mock-refresh-token',
  user: {
    id: 'user-001',
    email: 'test@belegpilot.ch',
    app_metadata: {},
    user_metadata: { full_name: 'Hans Muster', org_name: 'Muster Treuhand AG' },
    aud: 'authenticated',
    role: 'authenticated',
  },
}

const MOCK_PROFILE = {
  id: 'profile-001',
  user_id: 'user-001',
  full_name: 'Hans Muster',
  email: 'test@belegpilot.ch',
  role: 'owner',
  organization_id: 'org-001',
  organizations: {
    id: 'org-001',
    name: 'Muster Treuhand AG',
    plan: 'professional',
    documents_this_month: 42,
  },
}

const MOCK_STATS = {
  totalDocuments: 156,
  processedDocuments: 148,
  reviewDocuments: 5,
  totalAmount: 245890,
}

const MOCK_RECENT_DOCS = [
  {
    id: 'doc-001',
    file_name: 'Rechnung_Swisscom_2026.pdf',
    status: 'verified',
    amount: 189.50,
    document_date: '2026-05-28',
    clients: { name: 'Swisscom AG' },
  },
  {
    id: 'doc-002',
    file_name: 'Miete_Mai_2026.pdf',
    status: 'review',
    amount: 3500.00,
    document_date: '2026-05-15',
    clients: { name: 'Immobilien Zürich' },
  },
  {
    id: 'doc-003',
    file_name: 'Büromaterial_Lyreco.png',
    status: 'exported',
    amount: 78.30,
    document_date: '2026-05-10',
    clients: { name: 'Lyreco' },
  },
]

async function setupAuthenticatedDashboard(page: Page) {
  // Bypass password gate
  await page.goto('/')
  await page.evaluate(() => {
    sessionStorage.setItem('belegpilot-unlocked', 'true')
  })

  // Mock Supabase auth session
  await page.route(`${SUPABASE_URL}/auth/v1/token*`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_SESSION),
    })
  )

  await page.route(`${SUPABASE_URL}/auth/v1/user`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_SESSION.user),
    })
  )

  // Mock profile query
  await page.route(`${SUPABASE_URL}/rest/v1/profiles*`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([MOCK_PROFILE]),
    })
  )

  // Inject auth session into localStorage so the app thinks user is logged in
  await page.evaluate(
    ({ session }) => {
      const storageKey = `sb-lybpfwzpoiutuqggbixg-auth-token`
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          currentSession: {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_in: session.expires_in,
            token_type: session.token_type,
            user: session.user,
          },
          expiresAt: Math.floor(Date.now() / 1000) + 3600,
        })
      )
    },
    { session: MOCK_SESSION }
  )
}

test.describe('Dashboard — Metric Cards (DASH-002)', () => {
  test('renders 4 metric cards with correct labels and values', async ({ page }) => {
    await setupAuthenticatedDashboard(page)

    // Mock dashboard stats RPC
    await page.route(`${SUPABASE_URL}/rest/v1/rpc/get_dashboard_stats*`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_STATS),
      })
    )

    // Mock documents queries (for stats fallback via count)
    await page.route(`${SUPABASE_URL}/rest/v1/documents*`, (route) => {
      const url = route.request().url()
      if (url.includes('select=count')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: { 'content-range': '0-155/156' },
          body: JSON.stringify([{ count: 156 }]),
        })
      }
      // Recent documents query
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_RECENT_DOCS),
      })
    })

    await page.goto('/dashboard')
    await page.waitForTimeout(1500)

    // Verify all 4 metric card labels
    await expect(page.getByText('BELEGE GESAMT')).toBeVisible()
    await expect(page.getByText('VERARBEITET')).toBeVisible()
    await expect(page.getByText('ZUR PRÜFUNG')).toBeVisible()
    await expect(page.getByText('EXPORTIERT (CHF)')).toBeVisible()

    // Verify subtitle text exists
    await expect(page.getByText('Alle Dokumente')).toBeVisible()
    await expect(page.getByText('Warten auf Verifizierung')).toBeVisible()
  })
})

test.describe('Dashboard — Recent Documents Table (DASH-003)', () => {
  test('renders recent documents table with 5 columns and clickable rows', async ({ page }) => {
    await setupAuthenticatedDashboard(page)

    await page.route(`${SUPABASE_URL}/rest/v1/documents*`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_RECENT_DOCS),
      })
    )

    await page.goto('/dashboard')
    await page.waitForTimeout(1500)

    // Verify table header
    await expect(page.getByText('Letzte Dokumente')).toBeVisible()

    // Verify 5 column headers
    await expect(page.getByText('DOKUMENT').first()).toBeVisible()
    await expect(page.getByText('MANDANT').first()).toBeVisible()
    await expect(page.getByText('STATUS').first()).toBeVisible()
    await expect(page.getByText('BETRAG').first()).toBeVisible()
    await expect(page.getByText('DATUM').first()).toBeVisible()

    // Verify document names appear
    await expect(page.getByText('Rechnung_Swisscom_2026.pdf')).toBeVisible()
    await expect(page.getByText('Miete_Mai_2026.pdf')).toBeVisible()

    // Verify "Alle anzeigen" link
    const allLink = page.getByText('Alle anzeigen')
    await expect(allLink).toBeVisible()
    await expect(allLink).toHaveAttribute('href', '/documents')

    // Verify document rows are clickable links
    const docLink = page.getByRole('link', { name: /Rechnung_Swisscom/ })
    await expect(docLink).toBeVisible()
    await expect(docLink).toHaveAttribute('href', '/documents/doc-001')
  })
})

test.describe('Dashboard — Personalized Greeting (DASH-004)', () => {
  test('displays greeting with user first name', async ({ page }) => {
    await setupAuthenticatedDashboard(page)

    await page.route(`${SUPABASE_URL}/rest/v1/documents*`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_RECENT_DOCS),
      })
    )

    await page.goto('/dashboard')
    await page.waitForTimeout(1500)

    // The subtitle shows "Willkommen bei BelegPilot, Hans"
    await expect(page.getByText(/Willkommen bei BelegPilot, Hans/)).toBeVisible()
  })
})

test.describe('Dashboard — Empty State (DASH-005)', () => {
  test('shows empty state message when no documents', async ({ page }) => {
    await setupAuthenticatedDashboard(page)

    // Return empty documents array
    await page.route(`${SUPABASE_URL}/rest/v1/documents*`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    )

    await page.goto('/dashboard')
    await page.waitForTimeout(1500)

    // Verify empty state text
    await expect(
      page.getByText('Noch keine Dokumente vorhanden. Laden Sie Ihren ersten Beleg hoch.')
    ).toBeVisible()
  })
})
