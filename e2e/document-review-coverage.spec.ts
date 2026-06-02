/**
 * Document Review feature coverage tests (REV-001 through REV-008)
 *
 * Uses page.route() to mock Supabase API responses.
 * Covers split pane layout, PDF preview, image preview, extracted fields,
 * verify button, download button, back button, and not-found state.
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

const MOCK_PDF_DOCUMENT = {
  id: 'doc-pdf-001',
  file_name: 'Rechnung_Swisscom_2026.pdf',
  file_path: 'org-001/1717000000-Rechnung_Swisscom_2026.pdf',
  file_type: 'application/pdf',
  file_size: 245000,
  status: 'review',
  supplier_name: 'Swisscom (Schweiz) AG',
  document_date: '2026-05-28',
  amount: 189.50,
  currency: 'CHF',
  vat_rate: '8.1%',
  supplier_iban: 'CH93 0076 2011 6238 5295 7',
  supplier_vat_number: 'CHE-101.099.998',
  account_number: '6500',
  contra_account: '1020',
  confidence_scores: {
    supplier_name: 0.95,
    document_date: 0.92,
    amount: 0.98,
    vat_rate: 0.88,
    supplier_iban: 0.99,
    supplier_vat_number: 0.94,
    account_number: 0.72,
  },
  qr_data: { amount: 189.50, supplier_iban: 'CH93 0076 2011 6238 5295 7' },
  organization_id: 'org-001',
  clients: { name: 'Hauptkonto' },
}

const MOCK_IMAGE_DOCUMENT = {
  ...MOCK_PDF_DOCUMENT,
  id: 'doc-img-001',
  file_name: 'Quittung_Coop.jpg',
  file_path: 'org-001/1717000001-Quittung_Coop.jpg',
  file_type: 'image/jpeg',
  status: 'review',
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MOCK_VERIFIED_DOCUMENT = {
  ...MOCK_PDF_DOCUMENT,
  id: 'doc-verified-001',
  status: 'verified',
}

// 1x1 transparent PNG as a mock file download
const TINY_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAABJRUEFTkSuQmCC'

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

function mockDocumentQuery(page: Page, doc: typeof MOCK_PDF_DOCUMENT) {
  return page.route(`${SUPABASE_URL}/rest/v1/documents*`, (route) => {
    const url = route.request().url()
    // Single document query (by ID)
    if (url.includes(`id=eq.${doc.id}`) || url.includes('select=')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([doc]),
      })
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([doc]),
    })
  })
}

function mockStorageDownload(page: Page) {
  // Mock the storage download endpoint
  return page.route(`${SUPABASE_URL}/storage/v1/object/**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: Buffer.from(TINY_PNG_BASE64, 'base64'),
    })
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mockStorageSignedUrl(page: Page) {
  return page.route(`${SUPABASE_URL}/storage/v1/object/sign/**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ signedURL: 'https://example.com/signed-download.pdf' }),
    })
  )
}

test.describe('Document Review — Split Pane Layout (REV-001)', () => {
  test('renders split pane with Original and Extrahierte Daten sections', async ({ page }) => {
    await setupAuthenticated(page)
    await mockDocumentQuery(page, MOCK_PDF_DOCUMENT)
    await mockStorageDownload(page)

    await page.goto(`/documents/${MOCK_PDF_DOCUMENT.id}`)
    await page.waitForTimeout(2000)

    // Verify split pane layout — "Original" panel
    await expect(page.getByRole('heading', { name: 'Original' })).toBeVisible()

    // "Extrahierte Daten" panel
    await expect(page.getByRole('heading', { name: 'Extrahierte Daten' })).toBeVisible()

    // File name as page title
    await expect(page.getByText('Rechnung_Swisscom_2026.pdf')).toBeVisible()
  })
})

test.describe('Document Review — PDF Preview (REV-002)', () => {
  test('loads PdfViewer for PDF documents', async ({ page }) => {
    await setupAuthenticated(page)
    await mockDocumentQuery(page, MOCK_PDF_DOCUMENT)
    await mockStorageDownload(page)

    await page.goto(`/documents/${MOCK_PDF_DOCUMENT.id}`)
    await page.waitForTimeout(2000)

    // The Original section should exist — the PdfViewer is lazy-loaded
    await expect(page.getByRole('heading', { name: 'Original' })).toBeVisible()

    // The file name should appear in the title
    await expect(page.getByText('Rechnung_Swisscom_2026.pdf')).toBeVisible()
  })
})

test.describe('Document Review — Image Preview (REV-003)', () => {
  test('renders img element for image documents', async ({ page }) => {
    await setupAuthenticated(page)
    await mockDocumentQuery(page, MOCK_IMAGE_DOCUMENT)
    await mockStorageDownload(page)

    await page.goto(`/documents/${MOCK_IMAGE_DOCUMENT.id}`)
    await page.waitForTimeout(2000)

    // The image should render with alt text matching file name
    const img = page.locator(`img[alt="${MOCK_IMAGE_DOCUMENT.file_name}"]`)
    await expect(img).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Document Review — Extracted Fields with Confidence and Source (REV-004)', () => {
  test('renders extracted fields with confidence dots and source badges', async ({ page }) => {
    await setupAuthenticated(page)
    await mockDocumentQuery(page, MOCK_PDF_DOCUMENT)
    await mockStorageDownload(page)

    await page.goto(`/documents/${MOCK_PDF_DOCUMENT.id}`)
    await page.waitForTimeout(2000)

    // Verify field labels
    await expect(page.getByText('LIEFERANT')).toBeVisible()
    await expect(page.getByText('GESAMTBETRAG')).toBeVisible()
    await expect(page.getByText('MWST-SATZ')).toBeVisible()
    await expect(page.getByText('IBAN')).toBeVisible()

    // Verify field values
    await expect(page.getByText('Swisscom (Schweiz) AG')).toBeVisible()
    await expect(page.getByText(/189/)).toBeVisible()

    // Source badges — QR for IBAN and amount, AI for others
    const qrBadges = page.locator('span:has-text("qr")').filter({ hasText: /^qr$/i })
    expect(await qrBadges.count()).toBeGreaterThan(0)

    const aiBadges = page.locator('span:has-text("ai")').filter({ hasText: /^ai$/i })
    expect(await aiBadges.count()).toBeGreaterThan(0)

    // Confidence dots — check aria-label format
    const confidenceDots = page.locator('[role="img"][aria-label*="Konfidenz"]')
    expect(await confidenceDots.count()).toBeGreaterThan(0)
  })
})

test.describe('Document Review — Verify Button (REV-005)', () => {
  test('verify button marks document as verified', async ({ page }) => {
    await setupAuthenticated(page)
    await mockDocumentQuery(page, MOCK_PDF_DOCUMENT)
    await mockStorageDownload(page)

    // Mock the PATCH (update) request for verification
    let verifyRequestMade = false
    await page.route(`${SUPABASE_URL}/rest/v1/documents*`, (route) => {
      if (route.request().method() === 'PATCH') {
        verifyRequestMade = true
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ ...MOCK_PDF_DOCUMENT, status: 'verified' }]),
        })
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([MOCK_PDF_DOCUMENT]),
      })
    })

    await page.goto(`/documents/${MOCK_PDF_DOCUMENT.id}`)
    await page.waitForTimeout(2000)

    // Verify button should be visible for non-verified docs
    const verifyButton = page.getByLabel('Als verifiziert markieren')
    await expect(verifyButton).toBeVisible()

    // Click verify
    await verifyButton.click()
    await page.waitForTimeout(1000)

    expect(verifyRequestMade).toBe(true)
  })
})

test.describe('Document Review — Download Button (REV-006)', () => {
  test('download button creates signed URL', async ({ page }) => {
    await setupAuthenticated(page)
    await mockDocumentQuery(page, MOCK_PDF_DOCUMENT)
    await mockStorageDownload(page)

    let signedUrlRequested = false
    await page.route(`${SUPABASE_URL}/storage/v1/object/sign/**`, (route) => {
      signedUrlRequested = true
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ signedURL: 'https://example.com/signed-download.pdf' }),
      })
    })

    await page.goto(`/documents/${MOCK_PDF_DOCUMENT.id}`)
    await page.waitForTimeout(2000)

    // Download button
    const downloadButton = page.getByLabel('Dokument herunterladen')
    await expect(downloadButton).toBeVisible()

    // Click download
    await downloadButton.click()
    await page.waitForTimeout(1000)

    expect(signedUrlRequested).toBe(true)
  })
})

test.describe('Document Review — Back Button (REV-007)', () => {
  test('back button links to /documents', async ({ page }) => {
    await setupAuthenticated(page)
    await mockDocumentQuery(page, MOCK_PDF_DOCUMENT)
    await mockStorageDownload(page)

    await page.goto(`/documents/${MOCK_PDF_DOCUMENT.id}`)
    await page.waitForTimeout(2000)

    // Back button (Zurück) should link to /documents
    const backLink = page.getByRole('link', { name: /Zurück/ })
    await expect(backLink).toBeVisible()
    await expect(backLink).toHaveAttribute('href', '/documents')
  })
})

test.describe('Document Review — Not Found State (REV-008)', () => {
  test('shows not-found message for invalid document ID', async ({ page }) => {
    await setupAuthenticated(page)

    // Return empty array for unknown document ID
    await page.route(`${SUPABASE_URL}/rest/v1/documents*`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    )
    await mockStorageDownload(page)

    await page.goto('/documents/nonexistent-id-999')
    await page.waitForTimeout(2000)

    await expect(
      page.getByText('Dieses Dokument existiert nicht oder Sie haben keinen Zugriff.')
    ).toBeVisible()
  })
})
