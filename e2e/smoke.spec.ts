import { test, expect } from '@playwright/test'

/**
 * Smoke tests — verify all routes load without JS errors.
 * Password gate is bypassed by setting sessionStorage before navigation.
 */

const PUBLIC_ROUTES = [
  { path: '/', name: 'Landing' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/auth', name: 'Auth Login' },
  { path: '/auth?mode=signup', name: 'Auth Signup' },
  { path: '/auth?mode=forgot', name: 'Auth Forgot' },
  { path: '/datenschutz', name: 'Datenschutz' },
  { path: '/agb', name: 'AGB' },
  { path: '/impressum', name: 'Impressum' },
  { path: '/nonexistent-page', name: '404 Not Found' },
]

test.describe('Smoke Tests — Public Routes', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route.name} (${route.path}) loads without JS errors`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (err) => errors.push(err.message))

      // Bypass password gate
      await page.goto('/')
      await page.evaluate(() => {
        sessionStorage.setItem('belegpilot-unlocked', 'true')
      })

      await page.goto(route.path)
      await page.waitForLoadState('networkidle')

      // Verify no JS errors
      expect(errors, `JS errors on ${route.path}: ${errors.join(', ')}`).toHaveLength(0)

      // Verify page is not blank
      const body = await page.textContent('body')
      expect(body?.trim().length).toBeGreaterThan(0)
    })
  }
})

test.describe('Smoke Tests — Page Content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      sessionStorage.setItem('belegpilot-unlocked', 'true')
    })
  })

  test('Landing page has hero heading', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('Pricing page shows 3 tiers', async ({ page }) => {
    await page.goto('/pricing')
    await expect(page.getByText('Starter')).toBeVisible()
    await expect(page.getByText('Professional')).toBeVisible()
    await expect(page.getByText('Enterprise')).toBeVisible()
  })

  test('Auth page shows login form', async ({ page }) => {
    await page.goto('/auth')
    await expect(page.getByText('Willkommen zurück')).toBeVisible()
  })

  test('Datenschutz page has heading', async ({ page }) => {
    await page.goto('/datenschutz')
    await expect(page.getByRole('heading', { name: 'Datenschutzerklärung' })).toBeVisible()
  })

  test('AGB page has heading', async ({ page }) => {
    await page.goto('/agb')
    await expect(page.getByRole('heading', { name: /Allgemeine Geschäftsbedingungen/ })).toBeVisible()
  })

  test('Impressum page has heading', async ({ page }) => {
    await page.goto('/impressum')
    await expect(page.getByRole('heading', { name: 'Impressum' })).toBeVisible()
  })

  test('404 page shows error', async ({ page }) => {
    await page.goto('/does-not-exist')
    await expect(page.getByText('404')).toBeVisible()
  })
})
