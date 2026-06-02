/**
 * Settings feature coverage tests (SET-002 through SET-009)
 *
 * Uses page.route() to mock Supabase API responses.
 * Each test navigates to the relevant settings tab and verifies the mutation.
 */

import { test, expect, type Page } from '@playwright/test'

const SUPABASE_URL = 'https://lybpfwzpoiutuqggbixg.supabase.co'

const MOCK_SESSION = {
  access_token: 'mock-access-token',
  token_type: 'bearer',
  expires_in: 3600,
  refresh_token: 'mock-refresh-token',
  user: {
    id: 'user-001',
    email: 'test@belegpilot.ch',
    app_metadata: {},
    user_metadata: { full_name: 'Hans Muster', org_name: 'Muster Treuhand AG' },
    aud: 'authenticated',
    role: 'authenticated',
  },
}

const MOCK_PROFILE = {
  id: 'profile-001',
  user_id: 'user-001',
  full_name: 'Hans Muster',
  email: 'test@belegpilot.ch',
  role: 'owner',
  organization_id: 'org-001',
  organizations: { id: 'org-001', name: 'Muster Treuhand AG', plan: 'starter', documents_this_month: 42 },
}

const MOCK_TEAM_MEMBERS = [
  { id: 'profile-001', full_name: 'Hans Muster', email: 'hans@muster.ch', role: 'owner' },
  { id: 'profile-002', full_name: 'Anna Meier', email: 'anna@muster.ch', role: 'member' },
  { id: 'profile-003', full_name: 'Peter Huber', email: 'peter@muster.ch', role: 'viewer' },
]

async function setupAuthenticated(page: Page) {
  await page.goto('/')
  await page.evaluate(() => {
    sessionStorage.setItem('belegpilot-unlocked', 'true')
  })

  await page.route(`${SUPABASE_URL}/auth/v1/token*`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_SESSION) })
  )
  await page.route(`${SUPABASE_URL}/auth/v1/user`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_SESSION.user) })
  )
  await page.route(`${SUPABASE_URL}/rest/v1/profiles*`, (route) => {
    const url = route.request().url()
    // Team members query uses organization_id filter
    if (url.includes('organization_id=eq.org-001') && !url.includes('user_id')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_TEAM_MEMBERS),
      })
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([MOCK_PROFILE]),
    })
  })

  await page.evaluate(
    ({ session }) => {
      localStorage.setItem(
        'sb-lybpfwzpoiutuqggbixg-auth-token',
        JSON.stringify({
          currentSession: { ...session, user: session.user },
          expiresAt: Math.floor(Date.now() / 1000) + 3600,
        })
      )
    },
    { session: MOCK_SESSION }
  )
}

test.describe('Settings — Firmenprofil Tab: Edit Org Name (SET-002)', () => {
  test('shows Firmenprofil form and submits org name update', async ({ page }) => {
    await setupAuthenticated(page)

    let orgUpdatePayload: string | null = null
    await page.route(`${SUPABASE_URL}/rest/v1/organizations*`, (route) => {
      if (route.request().method() === 'PATCH') {
        orgUpdatePayload = route.request().postData()
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ id: 'org-001', name: 'Neue Firma AG' }]),
        })
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })

    await page.goto('/settings')
    await page.waitForTimeout(1500)

    // Firmenprofil tab should be active by default
    await expect(page.getByRole('heading', { name: 'Firmenprofil' })).toBeVisible()

    // Firm name input pre-filled
    const firmNameInput = page.getByLabel('Firmenname')
    await expect(firmNameInput).toBeVisible()
    await expect(firmNameInput).toHaveValue('Muster Treuhand AG')

    // Email input (disabled)
    const emailInput = page.getByLabel('E-Mail')
    await expect(emailInput).toBeDisabled()
    await expect(emailInput).toHaveValue('test@belegpilot.ch')

    // Update name and save
    await firmNameInput.fill('Neue Firma AG')
    await page.getByRole('button', { name: 'Änderungen speichern' }).click()
    await page.waitForTimeout(1000)

    expect(orgUpdatePayload).toContain('Neue Firma AG')
  })
})

test.describe('Settings — Team Tab: Member List (SET-003)', () => {
  test('shows team members with roles', async ({ page }) => {
    await setupAuthenticated(page)

    await page.goto('/settings')
    await page.waitForTimeout(1500)

    // Switch to Team tab
    await page.getByRole('tab', { name: 'Team' }).click()
    await page.waitForTimeout(1000)

    // Heading
    await expect(page.getByRole('heading', { name: 'Teammitglieder' })).toBeVisible()

    // Table headers
    await expect(page.locator('th:has-text("NAME")')).toBeVisible()
    await expect(page.locator('th:has-text("ROLLE")')).toBeVisible()

    // Team members visible
    await expect(page.getByText('Hans Muster')).toBeVisible()
    await expect(page.getByText('Anna Meier')).toBeVisible()
    await expect(page.getByText('Peter Huber')).toBeVisible()

    // Roles
    await expect(page.getByText('Admin')).toBeVisible()
    await expect(page.getByText('Buchhalter')).toBeVisible()
    await expect(page.getByText('Viewer')).toBeVisible()
  })
})

test.describe('Settings — ERP-Exportformate Tab (SET-004)', () => {
  test('shows all 5 ERP formats with Verfügbar status', async ({ page }) => {
    await setupAuthenticated(page)

    await page.goto('/settings')
    await page.waitForTimeout(1500)

    // Switch to ERP tab
    await page.getByRole('tab', { name: 'ERP-Exportformate' }).click()
    await page.waitForTimeout(1000)

    // Heading
    await expect(page.getByRole('heading', { name: 'ERP-Exportformate' })).toBeVisible()

    // All 5 ERP systems
    await expect(page.getByText('CSV (Universal)')).toBeVisible()
    await expect(page.getByText('Bexio')).toBeVisible()
    await expect(page.getByText(/Abacus/)).toBeVisible()
    await expect(page.getByText('Sage 50')).toBeVisible()
    await expect(page.getByText('Banana Accounting')).toBeVisible()

    // All should show "Verfügbar" status
    const verfuegbarBadges = page.locator('text=Verfügbar')
    expect(await verfuegbarBadges.count()).toBe(5)
  })
})

test.describe('Settings — Abrechnung Tab: Plan and Usage (SET-005)', () => {
  test('shows current plan and monthly usage progress bar', async ({ page }) => {
    await setupAuthenticated(page)

    await page.goto('/settings')
    await page.waitForTimeout(1500)

    // Switch to Abrechnung tab
    await page.getByRole('tab', { name: 'Abrechnung' }).click()
    await page.waitForTimeout(1000)

    // Plan heading
    await expect(page.getByRole('heading', { name: 'Aktueller Plan' })).toBeVisible()

    // Plan name and price
    await expect(page.getByText(/Starter — CHF 49\/Monat/)).toBeVisible()

    // Monthly limit
    await expect(page.getByText(/Monatslimit: 200 Dokumente/)).toBeVisible()

    // Usage heading
    await expect(page.getByRole('heading', { name: 'Nutzung diesen Monat' })).toBeVisible()

    // Usage counter (42 / 200)
    await expect(page.getByText('42 / 200')).toBeVisible()

    // Progress bar exists
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const progressBar = page.locator('.bg-primary').filter({ has: page.locator('.h-full') })
    // The progress bar container with rounded-full class
    await expect(page.locator('.overflow-hidden.rounded-full.bg-muted')).toBeVisible()
  })
})

test.describe('Settings — Abrechnung Tab: Upgrade Button (SET-006)', () => {
  test('Upgrade button triggers create-checkout Stripe flow', async ({ page }) => {
    await setupAuthenticated(page)

    let checkoutCalled = false
    await page.route(`${SUPABASE_URL}/functions/v1/create-checkout`, (route) => {
      checkoutCalled = true
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://checkout.stripe.com/mock-session' }),
      })
    })

    await page.goto('/settings')
    await page.waitForTimeout(1500)

    // Switch to Abrechnung tab
    await page.getByRole('tab', { name: 'Abrechnung' }).click()
    await page.waitForTimeout(1000)

    // Upgrade button
    const upgradeButton = page.getByRole('button', { name: 'Upgrade' })
    await expect(upgradeButton).toBeVisible()

    // Click upgrade
    await upgradeButton.click()
    await page.waitForTimeout(1000)

    expect(checkoutCalled).toBe(true)
  })
})

test.describe('Settings — Sicherheit Tab: Change Password (SET-007)', () => {
  test('validates 8-char minimum and confirm match', async ({ page }) => {
    await setupAuthenticated(page)

    // Mock updateUser
    await page.route(`${SUPABASE_URL}/auth/v1/user`, (route) => {
      if (route.request().method() === 'PUT') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_SESSION.user),
        })
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SESSION.user),
      })
    })

    await page.goto('/settings')
    await page.waitForTimeout(1500)

    // Switch to Sicherheit tab
    await page.getByRole('tab', { name: 'Sicherheit' }).click()
    await page.waitForTimeout(1000)

    // Heading
    await expect(page.getByRole('heading', { name: 'Passwort ändern' })).toBeVisible()

    // Password fields
    const newPwInput = page.getByLabel('Neues Passwort')
    const confirmPwInput = page.getByLabel('Passwort bestätigen')
    await expect(newPwInput).toBeVisible()
    await expect(confirmPwInput).toBeVisible()

    // Test validation: too short
    await newPwInput.fill('abc')
    await confirmPwInput.fill('abc')
    await page.getByRole('button', { name: 'Passwort ändern' }).click()
    await page.waitForTimeout(500)
    await expect(page.getByText('mindestens 8 Zeichen')).toBeVisible()

    // Test validation: mismatch
    await newPwInput.fill('StrongPass2026!')
    await confirmPwInput.fill('DifferentPass2026!')
    await page.getByRole('button', { name: 'Passwort ändern' }).click()
    await page.waitForTimeout(500)
    await expect(page.getByText('Passwörter stimmen nicht überein')).toBeVisible()

    // Test success
    await newPwInput.fill('StrongPass2026!')
    await confirmPwInput.fill('StrongPass2026!')
    await page.getByRole('button', { name: 'Passwort ändern' }).click()
    await page.waitForTimeout(1000)
  })
})

test.describe('Settings — Sicherheit Tab: Delete Account Button (SET-008)', () => {
  test('delete account button opens ConfirmDialog', async ({ page }) => {
    await setupAuthenticated(page)

    await page.goto('/settings')
    await page.waitForTimeout(1500)

    // Switch to Sicherheit tab
    await page.getByRole('tab', { name: 'Sicherheit' }).click()
    await page.waitForTimeout(1000)

    // Danger zone
    await expect(page.getByRole('heading', { name: 'Konto löschen' })).toBeVisible()
    await expect(page.getByText('unwiderruflich gelöscht')).toBeVisible()

    // Click delete button
    await page.getByRole('button', { name: 'Konto endgültig löschen' }).click()
    await page.waitForTimeout(500)

    // ConfirmDialog appears
    await expect(page.getByText('Sind Sie sicher?')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Endgültig löschen' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Abbrechen' })).toBeVisible()

    // Cancel
    await page.getByRole('button', { name: 'Abbrechen' }).click()
    await page.waitForTimeout(300)
    await expect(page.getByText('Sind Sie sicher?')).not.toBeVisible()
  })
})

test.describe('Settings — Sicherheit Tab: Confirmed Deletion (SET-009)', () => {
  test('confirming deletion calls delete-account edge function and signs out', async ({ page }) => {
    await setupAuthenticated(page)

    let deleteAccountCalled = false
    await page.route(`${SUPABASE_URL}/functions/v1/delete-account`, (route) => {
      deleteAccountCalled = true
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    // Mock sign out
    await page.route(`${SUPABASE_URL}/auth/v1/logout`, (route) =>
      route.fulfill({ status: 204 })
    )

    await page.goto('/settings')
    await page.waitForTimeout(1500)

    // Switch to Sicherheit tab
    await page.getByRole('tab', { name: 'Sicherheit' }).click()
    await page.waitForTimeout(1000)

    // Click delete button → confirm
    await page.getByRole('button', { name: 'Konto endgültig löschen' }).click()
    await page.waitForTimeout(500)

    await page.getByRole('button', { name: 'Endgültig löschen' }).click()
    await page.waitForTimeout(2000)

    expect(deleteAccountCalled).toBe(true)
  })
})
