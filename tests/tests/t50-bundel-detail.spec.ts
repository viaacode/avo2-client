import { expect, test } from '@playwright/test'

import { goToPageAndAcceptCookies } from '../helpers/go-to-page-and-accept-cookies'
import { loginOnderwijsAvo } from '../helpers/login-onderwijs-avo'

/**
 * New: https://docs.google.com/spreadsheets/d/1IvhK0v0HSntCwTcXiFseHargwwWwpoCkDMjmMehaDMA/edit#gid=0
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test('T50: Bundel detailpagina bezoeken', async ({ page }) => {
  await goToPageAndAcceptCookies(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_CLIENT_TITLE as string,
  )

  await loginOnderwijsAvo(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_BASIS_GEBRUIKER_USER as string,
    process.env.TEST_BASIS_GEBRUIKER_PASS as string,
  )

  // Click search button
  await page.getByRole('link', { name: 'Zoeken', exact: true }).click()

  // Check Search page opens
  await expect(
    page.getByRole('heading', { name: 'Zoekresultaten' }),
  ).toBeVisible()

  // Select video checkbox and search
  await page.getByRole('button', { name: 'Type' }).click()
  await page.locator('#bundel').check()
  await page.getByRole('button', { name: 'Toepassen' }).click()

  // Wait for items to load
  await page.waitForTimeout(2000)

  // Click first item
  await page.locator('h2.c-search-result__title > a').first().click()

  // Check bundle page is opened
  await expect(
    page.getByRole('heading', { name: 'Over deze bundel' }),
  ).toBeVisible()

  await page.waitForTimeout(2000)

  // // Wait for close to save the videos
  // await context.close();
})
