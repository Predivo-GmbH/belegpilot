import { test, expect, type Page } from '@playwright/test'

async function unlockGate(page: Page) {
  await page.goto('/')
  // If gate is showing, unlock it
  const gateInput = page.getByPlaceholder('Passwort')
  if (await gateInput.isVisible({ timeout: 1000 }).catch(() => false)) {
    await gateInput.fill('belegpilot2026')
    await page.getByRole('button', { name: 'Weiter' }).click()
  }
}

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await unlockGate(page)
  })

  test('renders hero section with headline and CTAs', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Aus Schuhkartons voller Belege/ })).toBeVisible()
    await expect(page.getByText('BelegPilot erkennt Rechnungen per KI')).toBeVisible()
    await expect(page.getByRole('link', { name: '14 Tage kostenlos testen' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Demo ansehen' })).toBeVisible()
  })

  test('renders trust bar with metrics', async ({ page }) => {
    await expect(page.getByText('50+')).toBeVisible()
    await expect(page.getByText('Treuhandbüros', { exact: true })).toBeVisible()
    await expect(page.getByText('99.2%')).toBeVisible()
    await expect(page.getByText('Swiss Made')).toBeVisible()
  })

  test('renders all 6 feature cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'KI-Belegextraktion' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'QR-Rechnung & ZUGFeRD' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Alle Schweizer ERP-Systeme' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Anomalie-Erkennung' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Lieferanten-Lernen' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'MWST-konform' })).toBeVisible()
  })

  test('renders how-it-works section with 3 steps', async ({ page }) => {
    await expect(page.getByText('In drei Schritten zum Buchungssatz')).toBeVisible()
    await expect(page.getByText('Belege hochladen')).toBeVisible()
    await expect(page.getByText('KI extrahiert & prüft')).toBeVisible()
    await expect(page.getByText('In Ihr ERP exportieren')).toBeVisible()
  })

  test('renders pricing section with 3 tiers', async ({ page }) => {
    await expect(page.getByText('Einfache, transparente Preise').first()).toBeVisible()
    await expect(page.getByText('CHF 49').first()).toBeVisible()
    await expect(page.getByText('CHF 99').first()).toBeVisible()
    await expect(page.getByText('CHF 249').first()).toBeVisible()
    await expect(page.getByText('Beliebtester Plan').first()).toBeVisible()
  })

  test('renders footer with links', async ({ page }) => {
    await expect(page.getByText('© 2026 BelegPilot')).toBeVisible()
    await expect(page.getByText('Datenschutz')).toBeVisible()
    await expect(page.getByText('AGB')).toBeVisible()
  })

  test('navbar links navigate correctly', async ({ page }) => {
    await page.getByRole('link', { name: 'Preise' }).first().click()
    await expect(page).toHaveURL('/pricing')

    await page.goBack()
    await page.getByRole('link', { name: 'Anmelden' }).click()
    await expect(page).toHaveURL('/auth')
  })
})
