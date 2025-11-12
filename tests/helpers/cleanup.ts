import { expect, type Page } from '@playwright/test'

import { loginOnderwijsAvo } from './login-onderwijs-avo'
import { logoutOnderwijsAvo } from './logout-onderwijs-avo'

async function removeCollectionsByE2ETest(page: Page): Promise<void> {
  // Recurring function
  // as long as there are collections with 'Aangemaakt door ...' it needs to be removed
  await page.waitForTimeout(2000)
  // Go to admin page
  await page.getByRole('link', { name: 'Beheer' }).click()
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  // Click on collection tab
  await page.getByRole('link', { name: 'Collectiebeheer' }).click()
  await page.waitForLoadState('networkidle')
  await expect(
    page.getByRole('heading', { name: 'Collecties', exact: true }),
  ).toBeVisible()

  await page.waitForTimeout(2000)

  if (
    await page
      .locator('tbody > tr:nth-child(1) > td:nth-child(2) > a', {
        hasText: 'Aangemaakt door automatische test',
      })
      .isVisible()
  ) {
    // Open the collection
    await page
      .locator('tbody > tr:nth-child(1) > td:nth-child(2) > a', {
        hasText: 'Aangemaakt door automatische test',
      })
      .click()

    // Click more options
    await page.locator('button[aria-label="Meer opties"]').click()

    // Click remove
    await page.getByText('Verwijderen', { exact: true }).click()

    // Check remove modal opens
    await expect(
      page.getByRole('heading', {
        name: 'Verwijder deze collectie',
        exact: true,
      }),
    ).toBeVisible()

    // Confirm remove modal
    await page.getByRole('button', { name: 'Verwijder' }).click()

    // Check for collections again
    await removeCollectionsByE2ETest(page)
  } else {
    return
  }
}

async function removeBundlesByE2ETest(page: Page): Promise<void> {
  // Recurring function
  // as long as there are collections with 'Aangemaakt door ...' it needs to be removed
  await page.waitForTimeout(2000)
  // Go to admin page
  await page.getByRole('link', { name: 'Beheer', exact: true }).click()
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  // Click on collection tab
  await page.getByRole('link', { name: 'Bundelbeheer' }).click()
  await page.waitForLoadState('networkidle')
  await expect(
    page.getByRole('heading', { name: 'Collecties', exact: true }),
  ).toBeVisible()

  await page.waitForTimeout(2000)

  if (
    await page
      .locator('tbody > tr:nth-child(1) > td:nth-child(2) > a', {
        hasText: 'Aangemaakt door automatische test',
      })
      .isVisible()
  ) {
    // Edit bundle
    await page
      .locator(
        'tbody > tr:nth-child(1) > td:nth-child(14) > div > a > button[aria-label="Bewerk de bundel"]',
      )
      .click()

    // Open options of the newly created bundle
    await page.getByRole('button', { name: 'Meer opties' }).click()

    // Click 'Verwijderen'
    await page
      .locator('div.c-dropdown__content-open > div > div:nth-child(2)')
      .click()

    // Confirm remove modal
    await page.getByRole('button', { name: 'Verwijder' }).click()

    // Check for bundles again
    await removeBundlesByE2ETest(page)
  } else {
    return
  }
}

export async function cleanupTestdata(page: Page): Promise<void> {
  await page.goto(process.env.TEST_CLIENT_ENDPOINT as string)

  // Logout first
  await logoutOnderwijsAvo(page)

  // Login as admin
  await loginOnderwijsAvo(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_ADMIN_USER as string,
    process.env.TEST_ADMIN_PASS as string,
  )

  console.info('CLEANING UP TESTDATA')

  await removeCollectionsByE2ETest(page)
  await removeBundlesByE2ETest(page)
}
