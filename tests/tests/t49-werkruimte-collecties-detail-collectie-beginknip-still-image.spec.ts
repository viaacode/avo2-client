import { expect, test } from '@playwright/test'

import { createCollection } from '../helpers/create-collection'
import { goToPageAndAcceptCookies } from '../helpers/go-to-page-and-accept-cookies'
import { loginOnderwijsAvo } from '../helpers/login-onderwijs-avo'

/**
 * New: https://docs.google.com/spreadsheets/d/1IvhK0v0HSntCwTcXiFseHargwwWwpoCkDMjmMehaDMA/edit#gid=0
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test('T49: Werkruimte - collecties: Detail collectie beginknip stillimage', async ({
  page,
}) => {
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

  const collectionTitle = await createCollection(page)

  // Go to werkruimte
  await page.getByRole('link', { name: 'Mijn werkruimte' }).click()

  // Check new collection is shown
  // Slicing because title is cut off at 60 characters,
  // and last 3 characters are swapped with periods
  const collectionTitleInOverview = collectionTitle.slice(0, 57) + '...'

  await expect(
    page.getByRole('link', { name: collectionTitleInOverview }),
  ).toBeVisible()

  // Click on the above link
  await page.getByRole('link', { name: collectionTitleInOverview }).click()

  // Get thumbnail from detail page
  const stillImageStyle = await page
    .locator(
      'ul.c-collection-list > li:nth-child(1) > div > div > div > div > div.c-video-player__thumbnail',
    )
    .getAttribute('style')

  // Edit collection
  await page.getByRole('button', { name: 'Bewerken', exact: true }).click()

  // Cut fragment
  await page.getByRole('button', { name: 'Knippen', exact: true }).click()

  // Check cut fragment modal opens
  await expect(
    page.getByRole('heading', { name: 'Knip fragment' }),
  ).toBeVisible()

  // Change start time 00:00:30
  await page.fill(
    'div.c-time-crop-controls.u-spacer-top-l.u-spacer-bottom-l > input:nth-child(1)',
    '00:00:30',
  )

  // Confirm
  await page.getByRole('button', { name: 'Toepassen' }).click()

  await page.waitForTimeout(3000)

  // Check if banner appeared
  await expect(page.locator('div.c-sticky-bar')).toContainText(
    'Wijzigingen opslaan?',
  )

  // Save changes
  await page.getByRole('button', { name: 'Opslaan' }).click()

  await page.waitForTimeout(3000)

  // Close edit mode
  await page.getByRole('button', { name: 'Sluiten' }).click()

  // Get thumbnail from detail page
  const stillImageStyleAfterCut = await page
    .locator(
      'ul.c-collection-list > li:nth-child(1) > div > div > div > div > div.c-video-player__thumbnail',
    )
    .getAttribute('style')

  // Check if same thumbnail image is used in overview as was selected
  const containsBackgroundUrl = stillImageStyle === stillImageStyleAfterCut
  expect(containsBackgroundUrl).toBeFalsy()

  // CLEANUP
  //REMOVE COLLECTION
  // Go to werkruimte
  await page.getByRole('link', { name: 'Mijn werkruimte' }).click()

  // Open options of the newly created collection
  await page
    .locator(
      'tr:nth-child(1) > td:nth-child(6) > div > div.c-dropdown__trigger > button',
    )
    .click()

  // Click 'Verwijderen'
  await page
    .locator(
      'tr:nth-child(1) > td:nth-child(6) > div > div.c-dropdown__content-open > div > div:nth-child(3)',
    )
    .click()

  // Confirm remove modal
  await page.getByRole('button', { name: 'Verwijder' }).click()

  // Check new collection is removed
  await expect(
    page.getByRole('link', { name: collectionTitleInOverview }),
  ).not.toBeVisible()
  // // Wait for close to save the videos
  // await context.close();
})
