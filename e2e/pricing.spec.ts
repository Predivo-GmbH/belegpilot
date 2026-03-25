import { test, expect, type Page } from '@playwright/test'

async function unlockGate(page: Page) {
  await page.goto('/')
  const gateInput = page.getByPlaceholder('Passwort')
  if (await gateInput.isVisible({ timeout: 1000 }).catch(() => false)) {
    await gateInput.fill('predivo2026')
    await page.getByRole('button', { name: 'Weiter' }).click()
  }
}

test.describe('Pricing Page', () => {
  test.beforeEach(async ({ page }) => {
    await unlockGate(page)
    await page.goto('/pricing')
  })

  test('renders all 3 pricing tiers', async ({ page }) => {
    await expect(page.getByText('Starter')).toBeVisible()
    await expect(page.getByText('Professional')).toBeVisible()
    await expect(page.getByText('Enterprise')).toBeVisible()
  })

  test('shows correct prices', async ({ page }) => {
    await expect(page.getByText('CHF 49')).toBeVisible()
    await expect(page.getByText('CHF 99')).toBeVisible()
    await expect(page.getByText('CHF 249')).toBeVisible()
  })

  test('highlights professional as most popular', async ({ page }) => {
    await expect(page.getByText('Beliebtester Plan')).toBeVisible()
  })

  test('CTA buttons navigate to auth', async ({ page }) => {
    await page.getByRole('button', { name: 'Jetzt starten' }).first().click()
    await expect(page).toHaveURL(/\/auth/)
  })
})
