import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear())
})

test('app shell renders with navigation to every section', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('MockOps')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Servers', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Mappings' })).toBeVisible()
})

test('mappings page prompts to add a server when none is configured', async ({ page }) => {
  await page.goto('/mappings')
  await expect(page.getByText('No active server')).toBeVisible()
  await page.getByRole('link', { name: 'Go to Servers' }).click()
  await expect(page).toHaveURL(/\/servers$/)
  await expect(page.getByRole('heading', { name: 'WireMock Servers' })).toBeVisible()
  await expect(page.getByText('No servers configured')).toBeVisible()
})
