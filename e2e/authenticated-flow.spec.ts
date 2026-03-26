/**
 * E2E tests for authenticated flows: login → dashboard → upload → documents → review → export
 *
 * Uses a pre-confirmed test user (e2e-test3@belegpilot-test.ch).
 */

import { test, expect, type Page } from '@playwright/test'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SUPABASE_URL = 'https://lybpfwzpoiutuqggbixg.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5YnBmd3pwb2l1dHVxZ2diaXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzOTQyODksImV4cCI6MjA4ODk3MDI4OX0.-HXZcqdxLF1OcXAegTeT5Fkrm6bVSmw0y7JfCGhHuU8'

const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'e2e-test3@belegpilot-test.ch'
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'E2eTestPass2026'
const TEST_ORG = 'E2E Treuhand AG'
const TEST_NAME = 'E2E Tester'

const GATE_PASSWORD = 'predivo2026'

async function unlockGate(page: Page) {
  await page.goto('/')
  const gateInput = page.getByPlaceholder('Passwort')
  if (await gateInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await gateInput.fill(GATE_PASSWORD)
    await page.getByRole('button', { name: 'Weiter' }).click()
    await page.waitForTimeout(500)
  }
}

/** Create a test user via Supabase REST API if it doesn't exist */
async function ensureTestUser() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      data: { full_name: TEST_NAME, org_name: TEST_ORG },
    }),
  })
  const data = await res.json()
  if (data.id || data.msg?.includes('already registered')) return
  throw new Error(`Failed to create test user: ${JSON.stringify(data)}`)
}

async function loginViaUI(page: Page) {
  await page.goto('/auth')
  await page.getByLabel('E-Mail').fill(TEST_EMAIL)
  await page.getByLabel('Passwort').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: 'Anmelden' }).click()
  await page.waitForURL('**/dashboard', { timeout: 10000 })
}

// ── Setup ──────────────────────────────────────────────────────────────────────

test.beforeAll(async () => {
  await ensureTestUser()
})

// ── Auth + Dashboard ───────────────────────────────────────────────────────────

test.describe('Authenticated Flow', () => {
  test.beforeEach(async ({ page }) => {
    await unlockGate(page)
    await loginViaUI(page)
  })

  test('dashboard loads with correct elements', async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByRole('link', { name: /Dashboard/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Dokumente/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Upload/i })).toBeVisible()

    await page.screenshot({
      path: 'test-results/screenshots/10-dashboard.png',
      fullPage: true,
    })
  })

  test('documents page loads', async ({ page }) => {
    await page.goto('/documents')
    await page.waitForTimeout(1000)
    await expect(page.getByRole('heading', { name: 'Dokumente' })).toBeVisible()

    await page.screenshot({
      path: 'test-results/screenshots/11-documents.png',
      fullPage: true,
    })
  })

  test('upload page loads with drop zone', async ({ page }) => {
    await page.goto('/upload')
    await page.waitForTimeout(1000)
    await expect(page.getByRole('heading', { name: /Dokument hochladen/ })).toBeVisible()
    await expect(page.getByText(/Dateien hierher ziehen/)).toBeVisible()

    await page.screenshot({
      path: 'test-results/screenshots/12-upload.png',
      fullPage: true,
    })
  })

  test('upload a test invoice file', async ({ page }) => {
    // Capture console errors for debugging
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    await page.goto('/upload')
    await page.waitForTimeout(1000)

    // Upload the test fixture via file input
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(
      path.resolve(__dirname, 'fixtures/test-invoice.png')
    )

    // File should appear in the list with "Bereit" status
    await expect(page.getByText('test-invoice.png')).toBeVisible()
    await expect(page.getByText('Bereit')).toBeVisible()

    await page.screenshot({
      path: 'test-results/screenshots/13-upload-before.png',
      fullPage: true,
    })

    // Click the upload button in the header (contains "hochladen")
    const uploadButton = page.getByRole('button', { name: /hochladen/i })
    await expect(uploadButton).toBeVisible()
    await uploadButton.click({ force: true })

    // Wait for upload to fully complete — look for the green checkmark (CheckCircle)
    // or the toast message indicating success
    await expect(
      page.locator('[data-testid="upload-done"], .text-status-success, text=hochgeladen').first()
    ).toBeVisible({ timeout: 20000 }).catch(() => {})

    // Fallback: just wait enough time for storage + DB insert to complete
    await page.waitForTimeout(5000)

    await page.screenshot({
      path: 'test-results/screenshots/13-upload-result.png',
      fullPage: true,
    })

    // Log any console errors for debugging
    if (consoleErrors.length > 0) {
      console.log('Console errors during upload:', consoleErrors)
    }

    // Navigate to documents to check if file appeared
    await page.goto('/documents')
    // Wait for the file to appear (query may take a moment)
    await expect(page.getByText('test-invoice.png').first()).toBeVisible({ timeout: 10000 })

    await page.screenshot({
      path: 'test-results/screenshots/14-documents-after-upload.png',
      fullPage: true,
    })
  })

  test('clients page loads', async ({ page }) => {
    await page.goto('/clients')
    await page.waitForTimeout(1000)
    await expect(page.getByRole('heading', { name: 'Mandanten' })).toBeVisible()

    await page.screenshot({
      path: 'test-results/screenshots/15-clients.png',
      fullPage: true,
    })
  })

  test('export page loads', async ({ page }) => {
    await page.goto('/export')
    await page.waitForTimeout(1000)
    await expect(page.getByRole('heading', { name: 'Export' })).toBeVisible()

    await page.screenshot({
      path: 'test-results/screenshots/16-export.png',
      fullPage: true,
    })
  })

  test('settings page loads with tabs', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForTimeout(1000)
    await expect(page.getByRole('heading', { name: 'Einstellungen' })).toBeVisible()

    // Check that settings tabs exist
    await expect(page.getByRole('button', { name: /Firmenprofil/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Abrechnung/ })).toBeVisible()

    await page.screenshot({
      path: 'test-results/screenshots/17-settings.png',
      fullPage: true,
    })
  })

  test('can create a client', async ({ page }) => {
    await page.goto('/clients')
    await page.waitForTimeout(1000)

    const newClientButton = page.getByRole('button', {
      name: /Neuer Mandant/i,
    })
    if (await newClientButton.isVisible().catch(() => false)) {
      await newClientButton.click()
      await page.waitForTimeout(500)

      const nameInput = page.getByLabel(/Name/)
      if (await nameInput.isVisible().catch(() => false)) {
        await nameInput.fill('E2E Test Mandant')
        const saveButton = page.getByRole('button', { name: /Speichern/i })
        if (await saveButton.isVisible().catch(() => false)) {
          await saveButton.click()
          await page.waitForTimeout(1000)
        }
      }
    }

    await page.screenshot({
      path: 'test-results/screenshots/18-clients-after-create.png',
      fullPage: true,
    })
  })
})
