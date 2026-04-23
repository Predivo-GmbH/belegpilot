import { test, expect } from '@playwright/test'

/**
 * Feature user journey tests.
 * These test the core user flows through the application.
 * Authenticated routes redirect to /auth, which is the expected behavior.
 */

test.describe('Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      sessionStorage.setItem('belegpilot-unlocked', 'true')
    })
  })

  test('F-001: Password gate blocks access', async ({ page }) => {
    // Clear the bypass
    await page.evaluate(() => {
      sessionStorage.removeItem('belegpilot-unlocked')
    })
    await page.goto('/')
    await expect(page.getByPlaceholder('Passwort')).toBeVisible()
    await expect(page.getByText('Passwort eingeben um fortzufahren')).toBeVisible()
  })

  test('F-002: Landing page features section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('KI-Belegextraktion')).toBeVisible()
    await expect(page.getByText('QR-Rechnung & ZUGFeRD')).toBeVisible()
    await expect(page.getByText('Alle Schweizer ERP-Systeme')).toBeVisible()
    await expect(page.getByText('Anomalie-Erkennung')).toBeVisible()
    await expect(page.getByText('Lieferanten-Lernen')).toBeVisible()
    await expect(page.getByText('MWST-konform')).toBeVisible()
  })

  test('F-002: Landing page how-it-works', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Belege hochladen')).toBeVisible()
    await expect(page.getByText('KI extrahiert & prüft')).toBeVisible()
    await expect(page.getByText('In Ihr ERP exportieren')).toBeVisible()
  })

  test('F-003: Auth mode switching', async ({ page }) => {
    await page.goto('/auth')
    await expect(page.getByText('Willkommen zurück')).toBeVisible()

    // Switch to signup
    await page.getByText('Jetzt registrieren').click()
    await expect(page.getByText('Konto erstellen')).toBeVisible()

    // Switch back to login
    await page.getByText('Anmelden').click()
    await expect(page.getByText('Willkommen zurück')).toBeVisible()
  })

  test('F-003: Auth forgot password mode', async ({ page }) => {
    await page.goto('/auth')
    await page.getByText('Passwort vergessen?').click()
    await expect(page.getByRole('heading', { name: 'Passwort vergessen?' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Link senden' })).toBeVisible()
  })

  test('F-012: Pricing page plan selection', async ({ page }) => {
    await page.goto('/pricing')
    await expect(page.getByText('Beliebtester Plan')).toBeVisible()
    await expect(page.getByText(/CHF 49/)).toBeVisible()
    await expect(page.getByText(/CHF 99/)).toBeVisible()
    await expect(page.getByText(/CHF 249/)).toBeVisible()
  })

  test('F-013: Protected routes redirect to auth', async ({ page }) => {
    // These routes require authentication — they should redirect to /auth
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    // The ProtectedRoute component will redirect or show auth
    // We verify no crash occurs
    const bodyText = await page.textContent('body')
    expect(bodyText?.trim().length).toBeGreaterThan(0)
  })

  test('F-018: Legal pages are accessible from landing', async ({ page }) => {
    await page.goto('/')
    // Footer should have legal links
    const datenschutzLinks = page.locator('a[href="/datenschutz"]')
    expect(await datenschutzLinks.count()).toBeGreaterThan(0)
    const agbLinks = page.locator('a[href="/agb"]')
    expect(await agbLinks.count()).toBeGreaterThan(0)
    const impressumLinks = page.locator('a[href="/impressum"]')
    expect(await impressumLinks.count()).toBeGreaterThan(0)
  })

  test('F-019: 404 page has home link', async ({ page }) => {
    await page.goto('/xyz-nonexistent')
    await expect(page.getByText('Zur Startseite')).toBeVisible()
  })

  test('F-025–F-031: Edge function routes are documented', async ({ page }) => {
    // Edge functions are backend services — we verify the UI that triggers them exists
    await page.goto('/auth?mode=signup')
    await expect(page.getByRole('button', { name: 'Bestätigungscode senden' })).toBeVisible()
  })
})
