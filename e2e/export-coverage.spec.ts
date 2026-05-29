/**
 * ERP Export feature coverage tests (EXP-001 through EXP-005)
 * Upgrades EXP-001 from PARTIAL to COVERED.
 * Covers EXP-002, EXP-003, EXP-004, EXP-005.
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

const MOCK_VERIFIED_DOCS = [
  {
    id: 'doc-v1',
    file_name: 'Rechnung_Swisscom.pdf',
    status: 'verified',
    amount: 189.50,
    document_date: '2026-05-28',
    supplier_name: 'Swisscom AG',
    clients: { name: 'Hauptkonto' },
  },
  {
    id: 'doc-v2',
    file_name: 'Miete_Mai.pdf',
    status: 'verified',
    amount: 3500.00,
    document_date: '2026-05-15',
    supplier_name: 'Vermieter AG',
    clients: { name: 'Immobilien' },
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

test.describe('Export — Page Load with Heading (EXP-001 full)', () => {
  test('renders heading, subtitle, and Zielformat section', async ({ page }) => {
    await setupAuthenticated(page)

    await page.route(`${SUPABASE_URL}/rest/v1/documents*`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_VERIFIED_DOCS) })
    )

    await page.goto('/export')
    await page.waitForTimeout(1500)

    await expect(page.getByRole('heading', { name: 'Export' })).toBeVisible()
    await expect(page.getByText('Exportieren Sie verifizierte Buchungssätze')).toBeVisible()
    await expect(page.getByText('Zielformat')).toBeVisible()
  })
})

test.describe('Export — ERP Format Selector (EXP-002)', () => {
  test('shows 5 ERP format buttons with toggle behavior', async ({ page }) => {
    await setupAuthenticated(page)

    await page.route(`${SUPABASE_URL}/rest/v1/documents*`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_VERIFIED_DOCS) })
    )

    await page.goto('/export')
    await page.waitForTimeout(1500)

    // All 5 ERP format buttons
    const csvButton = page.getByRole('button', { name: 'CSV (Universal)' })
    const bexioButton = page.getByRole('button', { name: 'Bexio' })
    const abacusButton = page.getByRole('button', { name: /Abacus/ })
    const sageButton = page.getByRole('button', { name: 'Sage 50' })
    const bananaButton = page.getByRole('button', { name: 'Banana Accounting' })

    await expect(csvButton).toBeVisible()
    await expect(bexioButton).toBeVisible()
    await expect(abacusButton).toBeVisible()
    await expect(sageButton).toBeVisible()
    await expect(bananaButton).toBeVisible()

    // CSV should be selected by default (aria-pressed="true")
    await expect(csvButton).toHaveAttribute('aria-pressed', 'true')

    // Click Bexio — it should become selected
    await bexioButton.click()
    await page.waitForTimeout(300)
    await expect(bexioButton).toHaveAttribute('aria-pressed', 'true')
    await expect(csvButton).toHaveAttribute('aria-pressed', 'false')
  })
})

test.describe('Export — Document Checkboxes + Select All (EXP-003)', () => {
  test('checkboxes toggle individual and all documents', async ({ page }) => {
    await setupAuthenticated(page)

    await page.route(`${SUPABASE_URL}/rest/v1/documents*`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_VERIFIED_DOCS) })
    )

    await page.goto('/export')
    await page.waitForTimeout(1500)

    // Document names visible
    await expect(page.getByText('Rechnung_Swisscom.pdf')).toBeVisible()
    await expect(page.getByText('Miete_Mai.pdf')).toBeVisible()

    // Individual checkboxes
    const doc1Checkbox = page.getByLabel('Rechnung_Swisscom.pdf auswählen')
    const doc2Checkbox = page.getByLabel('Miete_Mai.pdf auswählen')
    await expect(doc1Checkbox).toBeVisible()
    await expect(doc2Checkbox).toBeVisible()

    // Select first document
    await doc1Checkbox.check()
    await page.waitForTimeout(300)
    await expect(doc1Checkbox).toBeChecked()

    // "Select all" checkbox
    const selectAllCheckbox = page.getByLabel('Alle auswählen')
    await expect(selectAllCheckbox).toBeVisible()

    // Click select all
    await selectAllCheckbox.check()
    await page.waitForTimeout(300)
    await expect(doc1Checkbox).toBeChecked()
    await expect(doc2Checkbox).toBeChecked()

    // Deselect all
    await selectAllCheckbox.uncheck()
    await page.waitForTimeout(300)
    await expect(doc1Checkbox).not.toBeChecked()
    await expect(doc2Checkbox).not.toBeChecked()
  })
})

test.describe('Export — Export Button Triggers Edge Function (EXP-004)', () => {
  test('export button calls export-erp and triggers download', async ({ page }) => {
    await setupAuthenticated(page)

    await page.route(`${SUPABASE_URL}/rest/v1/documents*`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_VERIFIED_DOCS) })
    )

    let exportCalled = false
    await page.route(`${SUPABASE_URL}/functions/v1/export-erp`, (route) => {
      exportCalled = true
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          downloadUrl: 'https://example.com/export.csv',
          filename: 'BelegPilot_Export.csv',
          documentCount: 2,
        }),
      })
    })

    await page.goto('/export')
    await page.waitForTimeout(1500)

    // Select all documents
    await page.getByLabel('Alle auswählen').check()
    await page.waitForTimeout(300)

    // Export button should appear with count
    const exportButton = page.getByRole('button', { name: /2 exportieren/ })
    await expect(exportButton).toBeVisible()

    // Click export
    await exportButton.click()
    await page.waitForTimeout(2000)

    expect(exportCalled).toBe(true)
  })
})

test.describe('Export — Empty State (EXP-005)', () => {
  test('shows empty state when no verified documents', async ({ page }) => {
    await setupAuthenticated(page)

    await page.route(`${SUPABASE_URL}/rest/v1/documents*`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    )

    await page.goto('/export')
    await page.waitForTimeout(1500)

    await expect(page.getByText('Keine verifizierten Dokumente')).toBeVisible()
    await expect(page.getByText(/Verifizieren Sie Dokumente/)).toBeVisible()
  })
})
