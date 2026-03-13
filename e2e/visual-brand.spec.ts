import { test, expect, type Page } from '@playwright/test'

async function unlockGate(page: Page) {
  await page.goto('/')
  const gateInput = page.getByPlaceholder('Passwort')
  if (await gateInput.isVisible({ timeout: 1000 }).catch(() => false)) {
    await gateInput.fill('belegpilot2026')
    await page.getByRole('button', { name: 'Weiter' }).click()
  }
}

test.describe('Visual & Brand Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await unlockGate(page)
  })

  test('landing page uses sage-mint background (#F0F7F5)', async ({ page }) => {
    const bg = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor
    })
    // #F0F7F5 = rgb(240, 247, 245)
    expect(bg).toBe('rgb(240, 247, 245)')
  })

  test('landing page uses Plus Jakarta Sans font', async ({ page }) => {
    const fontFamily = await page.evaluate(() => {
      return getComputedStyle(document.body).fontFamily
    })
    expect(fontFamily).toContain('Plus Jakarta Sans')
  })

  test('primary buttons use teal color (#0E7C6B)', async ({ page }) => {
    const button = page.getByRole('link', { name: '14 Tage kostenlos testen' }).first()
    const bg = await button.evaluate((el) => getComputedStyle(el).backgroundColor)
    // #0E7C6B = rgb(14, 124, 107)
    expect(bg).toBe('rgb(14, 124, 107)')
  })

  test('cards use borders not shadows', async ({ page }) => {
    // Find a feature card by its heading content
    const featureCard = page.getByRole('heading', { name: 'KI-Belegextraktion' }).locator('..')
    await expect(featureCard).toBeVisible()

    const boxShadow = await featureCard.evaluate((el) => getComputedStyle(el).boxShadow)
    expect(boxShadow).toBe('none')

    const borderStyle = await featureCard.evaluate((el) => getComputedStyle(el).borderStyle)
    expect(borderStyle).toBe('solid')
  })

  test('pricing page uses JetBrains Mono for prices', async ({ page }) => {
    await page.goto('/pricing')
    const priceElement = page.locator('.font-mono').first()
    const fontFamily = await priceElement.evaluate((el) => getComputedStyle(el).fontFamily)
    expect(fontFamily).toContain('JetBrains Mono')
  })

  test('no flat white page background on landing', async ({ page }) => {
    const bg = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor
    })
    // Must NOT be pure white
    expect(bg).not.toBe('rgb(255, 255, 255)')
  })
})
