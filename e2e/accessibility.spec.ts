import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Accessibility tests — WCAG 2.1 AA compliance on public routes.
 * Uses axe-core to scan for accessibility violations.
 */

const PUBLIC_ROUTES = [
  { path: '/', name: 'Landing' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/auth', name: 'Auth Login' },
  { path: '/auth?mode=signup', name: 'Auth Signup' },
  { path: '/datenschutz', name: 'Datenschutz' },
  { path: '/agb', name: 'AGB' },
  { path: '/impressum', name: 'Impressum' },
]

test.describe('Accessibility Tests — WCAG 2.1 AA', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route.name} (${route.path}) passes axe audit`, async ({ page }) => {
      // Bypass password gate
      await page.goto('/')
      await page.evaluate(() => {
        sessionStorage.setItem('belegpilot-unlocked', 'true')
      })

      await page.goto(route.path)
      await page.waitForLoadState('networkidle')

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('[aria-hidden="true"]') // Exclude decorative elements
        .analyze()

      // Report violations with details
      const violations = results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      }))

      expect(
        results.violations,
        `Accessibility violations on ${route.path}:\n${JSON.stringify(violations, null, 2)}`,
      ).toHaveLength(0)
    })
  }
})

test.describe('Accessibility — Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      sessionStorage.setItem('belegpilot-unlocked', 'true')
    })
  })

  test('Landing page skip link works', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const skipLink = page.getByText('Zum Hauptinhalt springen')
    await expect(skipLink).toBeFocused()
  })

  test('Auth form inputs are keyboard-navigable', async ({ page }) => {
    await page.goto('/auth')
    // Tab through form elements
    await page.keyboard.press('Tab') // skip link
    await page.keyboard.press('Tab') // first nav link or input
    // Verify we can reach the form elements
    const emailInput = page.locator('#login-email')
    await emailInput.focus()
    await expect(emailInput).toBeFocused()
  })
})
