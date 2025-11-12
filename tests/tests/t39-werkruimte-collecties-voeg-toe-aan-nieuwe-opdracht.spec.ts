import { expect, test } from '@playwright/test'

import { createCollection } from '../helpers/create-collection.js'
import { goToPageAndAcceptCookies } from '../helpers/go-to-page-and-accept-cookies.js'
import { loginOnderwijsAvo } from '../helpers/login-onderwijs-avo.js'

/**
 * New: https://docs.google.com/spreadsheets/d/1IvhK0v0HSntCwTcXiFseHargwwWwpoCkDMjmMehaDMA/edit#gid=0
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test('T39: Werkruimte - collecties: Voeg toe aan nieuwe opdracht', async ({
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

  await page.getByRole('button', { name: 'Voeg toe aan opdracht' }).click()

  // Choose Nieuwe opdracht
  await page
    .locator(
      'div.c-sticky-bar__wrapper > div > div > div.c-header.o-container-vertical.o-container-vertical--bg-alt > div > div:nth-child(2) > div.c-toolbar__right > div > div > div.c-dropdown__content-open > div > div:nth-child(1)',
    )
    .click()

  // Check modal opens
  await expect(
    page.getByRole('heading', { name: 'Voeg toe aan nieuwe opdracht' }),
  ).toBeVisible()

  // Check the checkbox
  await page
    .locator(
      'div.c-content.c-modal-context.c-modal-context--visible > div > div.scrollbar-container.c-modal__body.ps > div.o-flex > div.c-toggle > input[type=checkbox]',
    )
    .check()

  // Confirm modal
  await page.getByRole('button', { name: 'Voeg toe', exact: true }).click()

  // Check assignment page is opened
  await expect(
    page.getByRole('heading', { name: 'Over deze opdracht' }),
  ).toBeVisible()

  // Check assignment title == collection title
  await expect(
    page.locator(
      'div.c-sticky-bar__wrapper > div > div.c-header.o-container-vertical.o-container-vertical--bg-alt > div > div:nth-child(2) > div.c-toolbar__left > div > h2',
    ),
  ).toContainText(collectionTitle)

  // Check fragment added
  await expect(page.locator('h2.c-collection-fragment-title')).toContainText(
    'dag van de',
  )

  await page.waitForTimeout(2000)

  // CLEANUP
  // REMOVE ASSIGNMENT
  // Open options of the newly created assignment
  await page.click("button[aria-label='Meer opties']")

  // Click 'Verwijderen'
  await page
    .locator(
      '#root > div > div.c-sticky-bar__wrapper > div > div.c-header.o-container-vertical.o-container-vertical--bg-alt > div > div:nth-child(2) > div.c-toolbar__right > div > div > div.c-dropdown__content-open > div > div:nth-child(2)',
    )
    .click()

  // Confirm remove modal
  await page.getByRole('button', { name: 'Verwijder' }).click()

  // Check toast message was succesful
  await expect(
    page.locator(
      'div > div.Toastify__toast-body > div > div > div.c-alert__message',
    ),
  ).toContainText('De opdracht werd verwijderd.')

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
