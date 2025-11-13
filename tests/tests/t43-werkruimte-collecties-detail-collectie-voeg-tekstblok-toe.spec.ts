import { expect, test } from '@playwright/test'

import { createCollection } from '../helpers/create-collection';
import { goToPageAndAcceptCookies } from '../helpers/go-to-page-and-accept-cookies';
import { loginOnderwijsAvo } from '../helpers/login-onderwijs-avo';

/**
 * New: https://docs.google.com/spreadsheets/d/1IvhK0v0HSntCwTcXiFseHargwwWwpoCkDMjmMehaDMA/edit#gid=0
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test('T43: Werkruimte - collecties: Detail collectie voeg tekstblok toe', async ({
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

  // Add a second video to the same collection
  await page.click("button[aria-label='Knip of voeg toe aan collectie']")

  // Check modal opens
  await page.waitForTimeout(1000)
  await expect(
    page.getByRole('heading', { name: 'Voeg dit fragment toe aan een' }),
  ).toContainText('Voeg dit fragment toe aan een collectie')

  // Open dropdown existing collections
  await page.click('#existingCollection')

  // Select existing collection created earlier in the test
  await page.getByText(collectionTitle).click()

  // Save
  await page.getByRole('button', { name: 'Toepassen' }).click()

  // Check toast message was succesful
  await expect(
    page.locator(
      'div > div.Toastify__toast-body > div > div > div.c-alert__message',
    ),
  ).toContainText(
    'Het fragment is toegevoegd aan de collectie in je Werkruimte.',
  )

  await page.waitForTimeout(1000)

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

  // Edit collection
  await page.getByRole('button', { name: 'Bewerken', exact: true }).click()

  await page.waitForTimeout(1000)

  // Click second Add block button
  await page
    .locator(
      'div.c-sticky-bar__wrapper > div > div > div:nth-child(3) > div > div:nth-child(2) > button',
    )
    .click()

  // Fill in title and description of text block
  await page.fill(
    'div.m-collection-or-bundle-edit-content.o-container-vertical > div > div:nth-child(4) > div.c-panel__body > div > div > div:nth-child(1) > div > input',
    'Automatische test titel tekst blok',
  )
  await page.fill(
    'div.DraftEditor-editorContainer > div[contenteditable="true"]',
    'Automatische test beschrijving tekst blok',
  )

  // Check if banner appeared
  await expect(page.locator('div.c-sticky-bar')).toContainText(
    'Wijzigingen opslaan?',
  )

  // Wait for toast
  await page.waitForTimeout(2000)

  // Save changes
  await page.getByRole('button', { name: 'Opslaan' }).click()

  // Wait for toast
  await page.waitForTimeout(2000)

  // Check toast message was succesful
  await expect(
    page.locator(
      'div > div.Toastify__toast-body > div > div > div.c-alert__message',
    ),
  ).toContainText('Collectie opgeslagen')

  // Close edit mode
  await page.getByRole('button', { name: 'Sluiten' }).click()

  // Check if text block is visible and as a second block
  await expect(
    page.locator('ul.c-collection-list > li:nth-child(2) > div > h3'),
  ).toContainText('Automatische test titel tekst blok')
  await expect(
    page.locator(
      'ul.c-collection-list > li:nth-child(2) > div > div > div > p',
    ),
  ).toContainText('Automatische test beschrijving tekst blok')
  await page.waitForTimeout(3000)

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
