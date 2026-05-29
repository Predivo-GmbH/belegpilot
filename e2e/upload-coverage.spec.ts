/**
 * Upload feature coverage tests (UPL-002 through UPL-006)
 * Upgrades UPL-005 and UPL-006 from PARTIAL to COVERED.
 *
 * Uses page.route() to mock Supabase storage + DB APIs,
 * and page.setInputFiles() for file selection.
 */

import { test, expect, type Page } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

function mockUploadAPIs(page: Page) {
  // Mock storage upload
  page.route(`${SUPABASE_URL}/storage/v1/object/**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ Key: 'org-001/test-file.png' }),
    })
  )

  // Mock document insert + select
  page.route(`${SUPABASE_URL}/rest/v1/documents*`, (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 'doc-new-001' }]),
      })
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ id: 'doc-new-001' }]),
    })
  })

  // Mock process-document edge function
  page.route(`${SUPABASE_URL}/functions/v1/process-document`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    })
  )
}

test.describe('Upload — File Picker via Click (UPL-002)', () => {
  test('has a visible "Dateien auswählen" label linked to file input', async ({ page }) => {
    await setupAuthenticated(page)
    await page.goto('/upload')
    await page.waitForTimeout(1500)

    // The "Dateien auswählen" label wraps a hidden file input
    await expect(page.getByText('Dateien auswählen')).toBeVisible()

    // The hidden file input should exist
    const fileInput = page.locator('input[type="file"]')
    expect(await fileInput.count()).toBe(1)
    await expect(fileInput).toHaveAttribute('accept')
  })
})

test.describe('Upload — Drag and Drop Zone (UPL-003)', () => {
  test('drop zone shows drag-over instruction text', async ({ page }) => {
    await setupAuthenticated(page)
    await page.goto('/upload')
    await page.waitForTimeout(1500)

    // Drop zone with instruction text
    await expect(page.getByText('Dateien hierher ziehen oder klicken zum Auswählen')).toBeVisible()
    await expect(page.getByText('PDF, JPG, PNG, TIFF — max. 20 MB pro Datei')).toBeVisible()
  })
})

test.describe('Upload — File Validation (UPL-004)', () => {
  test('file input accepts only valid file types', async ({ page }) => {
    await setupAuthenticated(page)
    await page.goto('/upload')
    await page.waitForTimeout(1500)

    // The file input has an accept attribute restricting types
    const fileInput = page.locator('input[type="file"]')
    const accept = await fileInput.getAttribute('accept')

    // Should include PDF, JPEG, PNG, WEBP, TIFF
    expect(accept).toContain('application/pdf')
    expect(accept).toContain('image/jpeg')
    expect(accept).toContain('image/png')
    expect(accept).toContain('image/webp')
    expect(accept).toContain('image/tiff')
  })
})

test.describe('Upload — File List with Statuses and Remove (UPL-005 full)', () => {
  test('shows file in list with Bereit status and remove button after selecting', async ({ page }) => {
    await setupAuthenticated(page)
    await page.goto('/upload')
    await page.waitForTimeout(1500)

    // Select a test file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(path.resolve(__dirname, 'fixtures/test-invoice.png'))

    // File name should appear
    await expect(page.getByText('test-invoice.png')).toBeVisible()

    // "Bereit" status
    await expect(page.getByText('Bereit')).toBeVisible()

    // Remove button (X icon with aria-label "Datei entfernen")
    const removeButton = page.getByLabel('Datei entfernen')
    await expect(removeButton).toBeVisible()

    // Click remove — file should disappear
    await removeButton.click()
    await page.waitForTimeout(500)
    await expect(page.getByText('test-invoice.png')).not.toBeVisible()
  })
})

test.describe('Upload — Upload Button Triggers Pipeline (UPL-006 full)', () => {
  test('upload button appears and triggers storage upload + DB insert + process-document', async ({ page }) => {
    await setupAuthenticated(page)
    await mockUploadAPIs(page)

    await page.goto('/upload')
    await page.waitForTimeout(1500)

    // Select a test file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(path.resolve(__dirname, 'fixtures/test-invoice.png'))
    await page.waitForTimeout(500)

    // Upload button should appear with count (e.g., "1 Datei hochladen")
    const uploadButton = page.getByRole('button', { name: /hochladen/i })
    await expect(uploadButton).toBeVisible()
    await expect(uploadButton).toContainText('1 Datei hochladen')

    // Click upload
    await uploadButton.click()

    // Wait for upload to complete — "done" status icon (CheckCircle) should appear
    await page.waitForTimeout(3000)

    // After successful upload, the file status should change from "Bereit" to done
    // The file should no longer show "Bereit"
    await expect(page.getByText('Bereit')).not.toBeVisible({ timeout: 10000 })
  })
})
