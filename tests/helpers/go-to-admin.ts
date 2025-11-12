import { expect, Page } from '@playwright/test'

import { goToPageAndAcceptCookies } from './go-to-page-and-accept-cookies'
import { loginOnderwijsAvo } from './login-onderwijs-avo'

export async function goToAdminPage(page: Page): Promise<void> {
  await goToPageAndAcceptCookies(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_CLIENT_TITLE as string,
  )

  // Check admin tab is not shown
  await expect(page.getByRole('link', { name: 'Beheer' })).not.toBeVisible()

  // Login as admin
  await loginOnderwijsAvo(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_ADMIN_USER as string,
    process.env.TEST_ADMIN_PASS as string,
  )

  // Check admin tab exists, logged in
  await expect(page.getByRole('link', { name: 'Beheer' })).toBeVisible()

  // Go to admin page
  await page.getByRole('link', { name: 'Beheer' }).click()
  await page.waitForTimeout(1000)
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  await page.waitForTimeout(1000)
}
