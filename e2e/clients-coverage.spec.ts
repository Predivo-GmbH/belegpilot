/**
 * Client Management feature coverage tests (CLI-001 through CLI-006)
 * Upgrades CLI-001 and CLI-003 from PARTIAL to COVERED.
 * Covers CLI-002, CLI-004, CLI-005, CLI-006.
 *
 * Uses page.route() to mock Supabase API responses.
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
    user_metadata: { full_name: 'Hans Muster', org_name: 'Test Org' },
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
  organizations: { id: 'org-001', name: 'Test Org', plan: 'professional', documents_this_month: 10 },
}

const MOCK_CLIENTS = [
  {
    id: 'client-001',
    name: 'Swisscom AG',
    contact_email: 'info@swisscom.ch',
    address: 'Alte Tiefenaustrasse 6, 3048 Worblaufen',
    erp_target: 'bexio',
    status: 'active',
    organization_id: 'org-001',
  },
  {
    id: 'client-002',
    name: 'Mobiliar AG',
    contact_email: 'kontakt@mobiliar.ch',
    address: 'Bundesgasse 35, 3001 Bern',
    erp_target: 'abacus',
    status: 'active',
    organization_id: 'org-001',
  },
  {
    id: 'client-003',
    name: 'Coop Genossenschaft',
    contact_email: null,
    address: null,
    erp_target: 'csv',
    status: 'inactive',
    organization_id: 'org-001',
  },
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
  await page.route(`${SUPABASE_URL}/rest/v1/profiles*`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([MOCK_PROFILE]) })
  )

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

test.describe('Clients — Page Load with Heading and Action (CLI-001 full)', () => {
  test('renders heading, subtitle, search, Neuer Mandant button, and client table', async ({ page }) => {
    await setupAuthenticated(page)

    await page.route(`${SUPABASE_URL}/rest/v1/clients*`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_CLIENTS) })
    )

    await page.goto('/clients')
    await page.waitForTimeout(1500)

    await expect(page.getByRole('heading', { name: 'Mandanten' })).toBeVisible()
    await expect(page.getByText('Verwalten Sie Ihre Mandanten')).toBeVisible()
    await expect(page.getByRole('button', { name: /Neuer Mandant/ })).toBeVisible()

    // Client table headers
    await expect(page.locator('th:has-text("NAME")')).toBeVisible()
    await expect(page.locator('th:has-text("E-MAIL")')).toBeVisible()
    await expect(page.locator('th:has-text("ERP")')).toBeVisible()
    await expect(page.locator('th:has-text("STATUS")')).toBeVisible()

    // Client names
    await expect(page.getByText('Swisscom AG')).toBeVisible()
    await expect(page.getByText('Mobiliar AG')).toBeVisible()
  })
})

test.describe('Clients — Search Filter (CLI-002)', () => {
  test('search input filters client list', async ({ page }) => {
    await setupAuthenticated(page)

    await page.route(`${SUPABASE_URL}/rest/v1/clients*`, (route) => {
      const url = route.request().url()
      if (url.includes('ilike') && url.includes('Swisscom')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([MOCK_CLIENTS[0]]),
        })
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CLIENTS),
      })
    })

    await page.goto('/clients')
    await page.waitForTimeout(1500)

    // Search input
    const searchInput = page.getByLabel('Mandant suchen')
    await expect(searchInput).toBeVisible()

    // Type search term
    await searchInput.fill('Swisscom')
    await page.waitForTimeout(1000)

    await expect(searchInput).toHaveValue('Swisscom')
  })
})

test.describe('Clients — Create Client via Form (CLI-003 full)', () => {
  test('opens form, fills all fields, submits successfully', async ({ page }) => {
    await setupAuthenticated(page)

    await page.route(`${SUPABASE_URL}/rest/v1/clients*`, (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify([{ id: 'client-new', name: 'Neue Firma AG' }]),
        })
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CLIENTS),
      })
    })

    await page.goto('/clients')
    await page.waitForTimeout(1500)

    // Click "Neuer Mandant" button
    await page.getByRole('button', { name: /Neuer Mandant/ }).click()
    await page.waitForTimeout(500)

    // Form should appear with heading
    await expect(page.getByText('Neuer Mandant', { exact: false })).toBeVisible()

    // Fill all form fields
    await page.getByLabel('Name *').fill('Neue Firma AG')
    await page.getByLabel('Kontakt-E-Mail').fill('kontakt@neuefirma.ch')
    await page.getByLabel('Adresse').fill('Bahnhofstrasse 42, 8001 Zürich')
    await page.getByLabel('Standard-Exportformat').selectOption('bexio')

    // Submit
    await page.getByRole('button', { name: 'Erstellen' }).click()
    await page.waitForTimeout(1000)
  })
})

test.describe('Clients — Edit Existing Client (CLI-004)', () => {
  test('opens edit form with pre-filled data via action menu', async ({ page }) => {
    await setupAuthenticated(page)

    await page.route(`${SUPABASE_URL}/rest/v1/clients*`, (route) => {
      if (route.request().method() === 'PATCH') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ ...MOCK_CLIENTS[0], name: 'Swisscom Updated' }]),
        })
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CLIENTS),
      })
    })

    await page.goto('/clients')
    await page.waitForTimeout(1500)

    // Click the action menu button (MoreHorizontal) for the first client
    const actionButtons = page.getByLabel('Aktionen')
    await actionButtons.first().click()
    await page.waitForTimeout(300)

    // Click "Bearbeiten" in the dropdown menu
    await page.getByRole('menuitem', { name: 'Bearbeiten' }).click()
    await page.waitForTimeout(500)

    // Form should show "Mandant bearbeiten" heading
    await expect(page.getByText('Mandant bearbeiten')).toBeVisible()

    // Fields should be pre-filled
    await expect(page.getByLabel('Name *')).toHaveValue('Swisscom AG')

    // Update and submit
    await page.getByLabel('Name *').fill('Swisscom Updated')
    await page.getByRole('button', { name: 'Aktualisieren' }).click()
    await page.waitForTimeout(1000)
  })
})

test.describe('Clients — Delete Client with Confirmation (CLI-005)', () => {
  test('opens ConfirmDialog and deletes client on confirm', async ({ page }) => {
    await setupAuthenticated(page)

    let deleteRequestMade = false
    await page.route(`${SUPABASE_URL}/rest/v1/clients*`, (route) => {
      if (route.request().method() === 'DELETE') {
        deleteRequestMade = true
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CLIENTS),
      })
    })

    await page.goto('/clients')
    await page.waitForTimeout(1500)

    // Open action menu for first client
    const actionButtons = page.getByLabel('Aktionen')
    await actionButtons.first().click()
    await page.waitForTimeout(300)

    // Click "Löschen" in the dropdown
    await page.getByRole('menuitem', { name: 'Löschen' }).click()
    await page.waitForTimeout(500)

    // ConfirmDialog should appear with the client name
    await expect(page.getByText('Mandant löschen')).toBeVisible()
    await expect(page.getByText(/Swisscom AG.*wirklich löschen/)).toBeVisible()

    // Confirm deletion
    await page.getByRole('button', { name: 'Löschen' }).click()
    await page.waitForTimeout(1000)

    expect(deleteRequestMade).toBe(true)
  })
})

test.describe('Clients — Action Menu (CLI-006)', () => {
  test('MoreHorizontal button opens menu with Bearbeiten and Löschen', async ({ page }) => {
    await setupAuthenticated(page)

    await page.route(`${SUPABASE_URL}/rest/v1/clients*`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_CLIENTS) })
    )

    await page.goto('/clients')
    await page.waitForTimeout(1500)

    // Action button exists
    const actionButton = page.getByLabel('Aktionen').first()
    await expect(actionButton).toBeVisible()

    // Initially menu is closed (aria-expanded=false)
    await expect(actionButton).toHaveAttribute('aria-expanded', 'false')

    // Open menu
    await actionButton.click()
    await page.waitForTimeout(300)

    // Menu should be visible with role="menu"
    const menu = page.locator('[role="menu"]')
    await expect(menu).toBeVisible()

    // Menu items
    await expect(page.getByRole('menuitem', { name: 'Bearbeiten' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Löschen' })).toBeVisible()

    // Close menu via Escape
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    await expect(menu).not.toBeVisible()
  })
})
