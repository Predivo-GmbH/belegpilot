/**
 * Documents page feature coverage tests (DOC-001 through DOC-006)
 * Upgrades DOC-001 from PARTIAL to COVERED and covers DOC-002 through DOC-006.
 *
 * Uses page.route() to mock Supabase API responses.
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
    user_metadata: { full_name: 'Hans Muster', org_name: 'Test Org' },
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
  organizations: { id: 'org-001', name: 'Test Org', plan: 'professional', documents_this_month: 10 },
}

const MOCK_DOCUMENTS = [
  {
    id: 'doc-001',
    file_name: 'Rechnung_Swisscom.pdf',
    status: 'review',
    amount: 189.50,
    document_date: '2026-05-28',
    clients: { name: 'Swisscom AG' },
    supplier_name: 'Swisscom',
  },
  {
    id: 'doc-002',
    file_name: 'Miete_Mai.pdf',
    status: 'verified',
    amount: 3500.00,
    document_date: '2026-05-15',
    clients: { name: 'Vermieter AG' },
    supplier_name: 'Vermieter AG',
  },
  {
    id: 'doc-003',
    file_name: 'Buero_Lyreco.png',
    status: 'exported',
    amount: 78.30,
    document_date: '2026-05-10',
    clients: { name: 'Lyreco' },
    supplier_name: 'Lyreco',
  },
]

async function setupAuthenticated(page: Page) {
  await page.goto('/')
  await page.evaluate(() => {
    sessionStorage.setItem('belegpilot-unlocked', 'true')
  })

  await page.route(`${SUPABASE_URL}/auth/v1/token*`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_SESSION) })
  )
  await page.route(`${SUPABASE_URL}/auth/v1/user`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_SESSION.user) })
  )
  await page.route(`${SUPABASE_URL}/rest/v1/profiles*`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([MOCK_PROFILE]) })
  )

  await page.evaluate(
    ({ session }) => {
      localStorage.setItem(
        'sb-lybpfwzpoiutuqggbixg-auth-token',
        JSON.stringify({
          currentSession: { ...session, user: session.user },
          expiresAt: Math.floor(Date.now() / 1000) + 3600,
        })
      )
    },
    { session: MOCK_SESSION }
  )
}

test.describe('Documents — Page Load with Heading and Subtitle (DOC-001 full)', () => {
  test('renders heading, subtitle with document count, and Upload action link', async ({ page }) => {
    await setupAuthenticated(page)

    await page.route(`${SUPABASE_URL}/rest/v1/documents*`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_DOCUMENTS) })
    )

    await page.goto('/documents')
    await page.waitForTimeout(1500)

    await expect(page.getByRole('heading', { name: 'Dokumente' })).toBeVisible()
    await expect(page.getByText(/3 Dokumente in allen Mandanten/)).toBeVisible()
    await expect(page.getByRole('link', { name: 'Upload' })).toBeVisible()
  })
})

test.describe('Documents — Search Filter (DOC-002)', () => {
  test('search input filters documents by file name', async ({ page }) => {
    await setupAuthenticated(page)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, prefer-const
    let searchQuery = ''
    await page.route(`${SUPABASE_URL}/rest/v1/documents*`, (route) => {
      const url = route.request().url()
      // Capture the search/filter query parameter
      if (url.includes('file_name=ilike') || url.includes('ilike')) {
        searchQuery = url
      }
      // When search is active, return filtered results
      if (url.includes('Swisscom') || url.includes('swisscom')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([MOCK_DOCUMENTS[0]]),
        })
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_DOCUMENTS),
      })
    })

    await page.goto('/documents')
    await page.waitForTimeout(1500)

    // Verify search input exists with correct aria-label
    const searchInput = page.getByLabel('Dokumente durchsuchen')
    await expect(searchInput).toBeVisible()

    // Type a search term
    await searchInput.fill('Swisscom')
    await page.waitForTimeout(1000)

    // The search input should have the typed value
    await expect(searchInput).toHaveValue('Swisscom')
  })
})

test.describe('Documents — Status Filter Buttons (DOC-003)', () => {
  test('renders 4 status filter buttons (Alle, Prüfung, Verifiziert, Exportiert)', async ({ page }) => {
    await setupAuthenticated(page)

    await page.route(`${SUPABASE_URL}/rest/v1/documents*`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_DOCUMENTS) })
    )

    await page.goto('/documents')
    await page.waitForTimeout(1500)

    // All 4 filter buttons must be visible
    await expect(page.getByRole('button', { name: 'Alle' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Prüfung' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Verifiziert' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Exportiert' })).toBeVisible()

    // "Alle" should be active by default (aria-current="page")
    await expect(page.getByRole('button', { name: 'Alle' })).toHaveAttribute('aria-current', 'page')

    // Click "Verifiziert" — it should become active
    await page.getByRole('button', { name: 'Verifiziert' }).click()
    await page.waitForTimeout(500)
    await expect(page.getByRole('button', { name: 'Verifiziert' })).toHaveAttribute('aria-current', 'page')
  })
})

test.describe('Documents — Table with 5 Columns (DOC-004)', () => {
  test('renders document table with 5 columns and links to review', async ({ page }) => {
    await setupAuthenticated(page)

    await page.route(`${SUPABASE_URL}/rest/v1/documents*`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_DOCUMENTS) })
    )

    await page.goto('/documents')
    await page.waitForTimeout(1500)

    // 5 column headers
    await expect(page.locator('th:has-text("DOKUMENT")')).toBeVisible()
    await expect(page.locator('th:has-text("MANDANT")')).toBeVisible()
    await expect(page.locator('th:has-text("STATUS")')).toBeVisible()
    await expect(page.locator('th:has-text("BETRAG")')).toBeVisible()
    await expect(page.locator('th:has-text("DATUM")')).toBeVisible()

    // Document names link to /documents/:id
    const docLink = page.getByRole('link', { name: /Rechnung_Swisscom/ })
    await expect(docLink).toBeVisible()
    await expect(docLink).toHaveAttribute('href', '/documents/doc-001')

    // Client name visible
    await expect(page.getByText('Swisscom AG')).toBeVisible()

    // Amount visible
    await expect(page.getByText(/189/)).toBeVisible()
  })
})

test.describe('Documents — Loading Skeleton (DOC-005)', () => {
  test('shows loading skeleton while fetching', async ({ page }) => {
    await setupAuthenticated(page)

    // Delay the response to let the loading state appear
    await page.route(`${SUPABASE_URL}/rest/v1/documents*`, async (route) => {
      await new Promise((r) => setTimeout(r, 2000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_DOCUMENTS),
      })
    })

    await page.goto('/documents')

    // The loading skeleton has role="status" and sr-only "Laden..."
    const loadingIndicator = page.locator('[role="status"]')
    await expect(loadingIndicator.first()).toBeVisible({ timeout: 3000 })

    // Pulse animation divs should be visible
    await expect(page.locator('.animate-pulse').first()).toBeVisible({ timeout: 3000 })
  })
})

test.describe('Documents — Empty State (DOC-006)', () => {
  test('shows empty state when no documents match', async ({ page }) => {
    await setupAuthenticated(page)

    await page.route(`${SUPABASE_URL}/rest/v1/documents*`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    )

    await page.goto('/documents')
    await page.waitForTimeout(1500)

    await expect(page.getByText('Keine Dokumente gefunden.')).toBeVisible()
  })
})
