import { test, type Page } from '@playwright/test'

async function unlockGate(page: Page) {
  await page.goto('/')
  const gateInput = page.getByPlaceholder('Passwort')
  if (await gateInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await gateInput.fill('predivo2026')
    await page.getByRole('button', { name: 'Weiter' }).click()
    await page.waitForTimeout(500)
  }
}

const publicPages = [
  { name: '01-landing', path: '/' },
  { name: '02-pricing', path: '/pricing' },
  { name: '03-auth-login', path: '/auth' },
  { name: '04-auth-signup', path: '/auth?mode=signup' },
  { name: '05-auth-forgot', path: '/auth?mode=forgot' },
]

for (const p of publicPages) {
  test(`screenshot ${p.name}`, async ({ page }) => {
    await unlockGate(page)
    await page.goto(p.path)
    await page.waitForTimeout(500)
    await page.screenshot({ path: `test-results/screenshots/${p.name}.png`, fullPage: true })
  })
}
