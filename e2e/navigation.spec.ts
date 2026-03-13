import { test, expect, type Page } from '@playwright/test'

async function unlockGate(page: Page) {
  await page.goto('/')
  const gateInput = page.getByPlaceholder('Passwort')
  if (await gateInput.isVisible({ timeout: 1000 }).catch(() => false)) {
    await gateInput.fill('belegpilot2026')
    await page.getByRole('button', { name: 'Weiter' }).click()
  }
}

test.describe('Navigation & Routing', () => {
  test.beforeEach(async ({ page }) => {
    await unlockGate(page)
  })

  test('landing page loads at /', async ({ page }) => {
    await expect(page.getByText('Aus Schuhkartons voller Belege')).toBeVisible()
  })

  test('/pricing loads pricing page', async ({ page }) => {
    await page.goto('/pricing')
    await expect(page.getByText('Einfache, transparente Preise')).toBeVisible()
  })

  test('/auth loads auth page', async ({ page }) => {
    await page.goto('/auth')
    await expect(page.getByRole('heading', { name: 'Willkommen zurück' })).toBeVisible()
  })

  test('protected routes redirect to /auth when not logged in', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/auth')
  })

  test('protected route /documents redirects to /auth', async ({ page }) => {
    await page.goto('/documents')
    await expect(page).toHaveURL('/auth')
  })

  test('protected route /upload redirects to /auth', async ({ page }) => {
    await page.goto('/upload')
    await expect(page).toHaveURL('/auth')
  })

  test('protected route /settings redirects to /auth', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL('/auth')
  })

  test('protected route /clients redirects to /auth', async ({ page }) => {
    await page.goto('/clients')
    await expect(page).toHaveURL('/auth')
  })

  test('protected route /export redirects to /auth', async ({ page }) => {
    await page.goto('/export')
    await expect(page).toHaveURL('/auth')
  })

  test('404 page shows for unknown routes', async ({ page }) => {
    await page.goto('/unknown-page')
    await expect(page.getByText('404')).toBeVisible()
    await expect(page.getByText('Seite nicht gefunden')).toBeVisible()
  })

  test('404 page has link back to home', async ({ page }) => {
    await page.goto('/unknown-page')
    await page.getByRole('link', { name: 'Zur Startseite' }).click()
    await expect(page).toHaveURL('/')
  })
})
