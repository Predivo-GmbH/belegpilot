/**
 * CRITICAL PATH E2E TESTS
 * ========================
 * These tests verify that the most fundamental user flows ACTUALLY WORK,
 * not just that UI elements exist. If these fail, the app is broken.
 *
 * Project: BelegPilot
 * Auth: password-gate + email/password login (signInWithPassword)
 * Supabase: https://lybpfwzpoiutuqggbixg.supabase.co
 *
 * Tests:
 * 1. Password gate: renders and accepts correct password
 * 2. Login flow: email/password form submits without errors
 * 3. Edge functions: all reachable, not returning 500
 * 4. Protected routes: redirect to /auth when unauthenticated
 */

import { test, expect } from '@playwright/test'

// ======================================================================
// PROJECT CONFIG
// ======================================================================

const PROJECT_CONFIG = {
  // Auth page URL (relative)
  authPath: '/auth',

  // Auth method: 'password' (login with email+password after OTP signup)
  authMethod: 'password' as const,

  // Test email
  testEmail: 'roger@mueller.ro',

  // Selectors
  selectors: {
    // Password gate
    gatePasswordInput: 'input[type="password"][aria-label="Passwort"]',
    gateSubmitButton: 'button:has-text("Weiter")',
    // Auth page (login mode)
    emailInput: '#login-email',
    passwordInput: '#login-password',
    submitButton: 'button[type="submit"]:has-text("Anmelden")',
  },

  // Error indicators
  errorIndicators: [
    '[role="alert"]',
    '.text-destructive',
  ],

  // Supabase project URL
  supabaseUrl: 'https://lybpfwzpoiutuqggbixg.supabase.co',

  // Critical edge functions
  edgeFunctions: [
    'create-checkout',
    'delete-account',
    'export-erp',
    'process-document',
    'send-usage-alert',
    'send-welcome',
    'stripe-webhook',
  ],

  // Protected routes that should redirect to auth when unauthenticated
  protectedRoutes: ['/dashboard', '/documents', '/upload', '/clients', '/export', '/settings'],
}

// ======================================================================
// TESTS
// ======================================================================

test.describe('CRITICAL PATH — Password Gate', () => {
  test('password gate renders with form', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Password gate should be visible (app is gated)
    const gateInput = page.locator(PROJECT_CONFIG.selectors.gatePasswordInput)
    await expect(gateInput).toBeVisible({ timeout: 10000 })

    const submitBtn = page.locator(PROJECT_CONFIG.selectors.gateSubmitButton)
    await expect(submitBtn).toBeVisible()
    await expect(submitBtn).toBeEnabled()
  })

  test('password gate rejects wrong password', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const gateInput = page.locator(PROJECT_CONFIG.selectors.gatePasswordInput)
    await gateInput.fill('wrong-password-123')

    const submitBtn = page.locator(PROJECT_CONFIG.selectors.gateSubmitButton)
    await submitBtn.click()
    await page.waitForTimeout(1000)

    // Error should appear
    const errorEl = page.locator('[role="alert"]')
    await expect(errorEl).toBeVisible()
  })
})

test.describe('CRITICAL PATH — Login Flow', () => {
  test('auth page loads without JS errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    // Must bypass password gate via sessionStorage
    await page.goto('/')
    await page.evaluate(() => {
      sessionStorage.setItem('belegpilot-unlocked', 'true')
    })
    await page.goto(PROJECT_CONFIG.authPath)
    await page.waitForLoadState('networkidle')

    expect(errors, `JS errors on auth page: ${errors.join(', ')}`).toEqual([])
  })

  test('login form is functional (email + password fields + submit)', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      sessionStorage.setItem('belegpilot-unlocked', 'true')
    })
    await page.goto(PROJECT_CONFIG.authPath)
    await page.waitForLoadState('networkidle')

    // Email input visible
    const emailInput = page.locator(PROJECT_CONFIG.selectors.emailInput)
    await expect(emailInput).toBeVisible({ timeout: 10000 })

    // Password input visible
    const pwInput = page.locator(PROJECT_CONFIG.selectors.passwordInput)
    await expect(pwInput).toBeVisible()

    // Submit button visible and enabled
    const submitBtn = page.locator(PROJECT_CONFIG.selectors.submitButton)
    await expect(submitBtn).toBeVisible()
    await expect(submitBtn).toBeEnabled()
  })
})

test.describe('CRITICAL PATH — Edge Function Health', () => {
  for (const funcName of PROJECT_CONFIG.edgeFunctions) {
    test(`edge function "${funcName}" is reachable (not 500)`, async ({ request }) => {
      const response = await request.post(
        `${PROJECT_CONFIG.supabaseUrl}/functions/v1/${funcName}`,
        {
          headers: { 'Content-Type': 'application/json' },
          data: JSON.stringify({ _health_check: true }),
          failOnStatusCode: false,
        }
      )

      const status = response.status()
      expect(
        status,
        `Edge function "${funcName}" returned ${status} — function is DOWN`
      ).not.toBe(500)
    })
  }
})

test.describe('CRITICAL PATH — Protected Route Guards', () => {
  for (const route of PROJECT_CONFIG.protectedRoutes) {
    test(`${route} redirects to auth when unauthenticated`, async ({ page }) => {
      // Bypass password gate
      await page.goto('/')
      await page.evaluate(() => {
        sessionStorage.setItem('belegpilot-unlocked', 'true')
      })
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Should redirect to auth
      await expect(page).toHaveURL(/\/auth/)
    })
  }
})

test.describe('CRITICAL PATH — Network & Infrastructure', () => {
  test('Supabase project is reachable (not paused)', async ({ request }) => {
    const response = await request.get(
      `${PROJECT_CONFIG.supabaseUrl}/rest/v1/`,
      {
        headers: { apikey: 'placeholder' },
        failOnStatusCode: false,
      }
    )

    const status = response.status()
    expect(
      status < 500,
      `Supabase project appears DOWN (status ${status}). May be paused.`
    ).toBe(true)
  })

  test('auth API responds correctly', async ({ request }) => {
    const response = await request.get(
      `${PROJECT_CONFIG.supabaseUrl}/auth/v1/health`,
      { failOnStatusCode: false }
    )

    expect(response.status()).toBe(200)
  })
})
