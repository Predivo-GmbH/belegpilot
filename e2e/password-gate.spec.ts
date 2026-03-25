import { test, expect } from '@playwright/test'

test.describe('Password Gate', () => {
  test.beforeEach(async ({ context }) => {
    // Clear session storage to ensure gate is active
    await context.clearCookies()
  })

  test('shows password gate on first visit', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'BelegPilot' })).toBeVisible()
    await expect(page.getByPlaceholder('Passwort')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Weiter' })).toBeVisible()
  })

  test('shows error on wrong password', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('Passwort').fill('wrong')
    await page.getByRole('button', { name: 'Weiter' }).click()
    await expect(page.getByText('Falsches Passwort')).toBeVisible()
  })

  test('unlocks with correct password', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('Passwort').fill('predivo2026')
    await page.getByRole('button', { name: 'Weiter' }).click()
    // Should show the landing page content
    await expect(page.getByText('Aus Schuhkartons voller Belege')).toBeVisible()
  })
})
