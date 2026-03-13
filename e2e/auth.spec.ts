import { test, expect, type Page } from '@playwright/test'

async function unlockGate(page: Page) {
  await page.goto('/')
  const gateInput = page.getByPlaceholder('Passwort')
  if (await gateInput.isVisible({ timeout: 1000 }).catch(() => false)) {
    await gateInput.fill('belegpilot2026')
    await page.getByRole('button', { name: 'Weiter' }).click()
  }
}

test.describe('Auth Page', () => {
  test.beforeEach(async ({ page }) => {
    await unlockGate(page)
    await page.goto('/auth')
  })

  test('renders login form by default', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Willkommen zurück' })).toBeVisible()
    await expect(page.getByLabel('E-Mail')).toBeVisible()
    await expect(page.getByLabel('Passwort')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Anmelden' })).toBeVisible()
  })

  test('switches to signup form', async ({ page }) => {
    await page.getByRole('button', { name: 'Jetzt registrieren' }).click()
    await expect(page.getByRole('heading', { name: 'Konto erstellen' })).toBeVisible()
    await expect(page.getByLabel('Firmenname')).toBeVisible()
    await expect(page.getByLabel('Vollständiger Name')).toBeVisible()
    await expect(page.getByLabel('E-Mail')).toBeVisible()
    await expect(page.getByLabel('Passwort')).toBeVisible()
  })

  test('switches to forgot password form', async ({ page }) => {
    await page.getByRole('button', { name: 'Passwort vergessen?' }).click()
    await expect(page.getByRole('heading', { name: 'Passwort vergessen?' })).toBeVisible()
    await expect(page.getByLabel('E-Mail')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Link senden' })).toBeVisible()
  })

  test('navigates back from forgot to login', async ({ page }) => {
    await page.getByRole('button', { name: 'Passwort vergessen?' }).click()
    await page.getByRole('button', { name: /Zurück zur Anmeldung/ }).click()
    await expect(page.getByRole('heading', { name: 'Willkommen zurück' })).toBeVisible()
  })

  test('renders brand panel on desktop', async ({ page }) => {
    // Brand panel is hidden on mobile, visible on lg
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/auth')
    await expect(page.getByText('Belege verarbeiten.')).toBeVisible()
  })

  test('login form validates required fields', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: 'Anmelden' })
    await submitButton.click()
    // Browser validation prevents submission — email field should be invalid
    const emailInput = page.getByLabel('E-Mail')
    await expect(emailInput).toHaveAttribute('required', '')
  })
})
