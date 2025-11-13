import { expect, test } from '@playwright/test'

import { goToPageAndAcceptCookies } from '../helpers/go-to-page-and-accept-cookies';
import { goToVideoDetailPage } from '../helpers/go-to-video-detail-page';
import { loginOnderwijsAvo } from '../helpers/login-onderwijs-avo';

/**
 * New: https://docs.google.com/spreadsheets/d/1IvhK0v0HSntCwTcXiFseHargwwWwpoCkDMjmMehaDMA/edit#gid=0
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test('T27: Fragment detail - Knip fragment aan begin en eind en voeg toe aan nieuwe collectie', async ({
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

  // Go to video detail page
  await goToVideoDetailPage(page)

  // Click cut and add to collection button
  await page.click("button[aria-label='Knip of voeg toe aan collectie']")

  // Check modal opens
  await page.waitForTimeout(1000)
  await expect(
    page.getByRole('heading', { name: 'Voeg dit fragment toe aan een' }),
  ).toContainText('Voeg dit fragment toe aan een collectie')

  // Change start time 00:00:30
  await page.fill(
    'body > div.c-modal-context.c-modal-context--visible > div > div.scrollbar-container.c-modal__body.ps > div.c-modal__body-add-fragment > div > div > div:nth-child(2) > div.u-spacer-top-l.u-spacer-bottom-l.o-grid-col-bp2-7 > div > input:nth-child(1)',
    '00:00:30',
  )
  // Change end time 00:03:00
  await page.fill(
    'body > div.c-modal-context.c-modal-context--visible > div > div.scrollbar-container.c-modal__body.ps > div.c-modal__body-add-fragment > div > div > div:nth-child(2) > div.u-spacer-top-l.u-spacer-bottom-l.o-grid-col-bp2-7 > div > input:nth-child(3)',
    '00:03:00',
  )

  await page.waitForTimeout(3000)

  // Select new collection radiobutton
  await page.getByLabel('Voeg toe aan een nieuwe').setChecked(true)

  // Enter new collection title
  const date = new Date()
  const collectionTitle = 'Aangemaakt door automatische test ' + date
  await page.fill("input[placeHolder='Collectietitel']", collectionTitle)

  // Save
  await page.getByRole('button', { name: 'Toepassen' }).click()

  // Wait for saving
  await page.waitForTimeout(1000)

  // Check toast message was succesful
  await expect(
    page.locator(
      'div > div.Toastify__toast-body > div > div > div.c-alert__message',
    ),
  ).toContainText(
    'Het fragment is toegevoegd aan de collectie in je Werkruimte.',
  )

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

  // Check that div.c-cut-overlay contains text "00:00:30 - 00:03:00"
  await expect(page.locator('div.c-cut-overlay')).toContainText(
    '00:00:30 - 00:03:00',
  )

  // Open options of the newly created collection
  await page.click("button[aria-label='Meer opties']")

  // Click 'Verwijderen'
  await page
    .locator(
      '#root > div > div.c-sticky-bar__wrapper > div > div > div.c-header.o-container-vertical.o-container-vertical--bg-alt > div > div:nth-child(2) > div.c-toolbar__right > div > div > div.c-dropdown__content-open > div > div:nth-child(2)',
    )
    .click()

  // Confirm remove modal
  await page.getByRole('button', { name: 'Verwijder' }).click()

  // Check new collection is removed
  await expect(
    page.getByRole('link', { name: collectionTitleInOverview }),
  ).not.toBeVisible()

  await page.waitForTimeout(2000)

  // // Wait for close to save the videos
  // await context.close();
})
