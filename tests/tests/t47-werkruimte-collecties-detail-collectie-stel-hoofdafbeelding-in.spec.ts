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

test('T47: Werkruimte - collecties: Detail collectie stel hoofdafbeelding in', async ({
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

  // Click search button
  await page.getByRole('link', { name: 'Zoeken', exact: true }).click()

  // Check Search page opens
  await expect(
    page.getByRole('heading', { name: 'Zoekresultaten' }),
  ).toBeVisible()

  // Select video checkbox and search
  await page.getByRole('button', { name: 'Type' }).click()
  await page.locator('#video').check()
  await page.getByRole('button', { name: 'Toepassen' }).click()

  // Wait for items to load
  await page.waitForLoadState('networkidle')

  // Click second item
  await expect(
    page.getByRole('link', { name: 'KLAAR: phishing' }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'KLAAR: phishing' }).click()

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

  // *UNDER CONSTRUCTION*
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

  // Click on publication details tab
  await page.click(
    'div.c-collection-or-bundle-edit > div.c-navbar.c-navbar--bordered-bottom.c-navbar--auto.c-navbar--bg-alt > div > nav > div:nth-child(2)',
  )

  // Check if Onderwijs input is visible
  await expect(page.locator('#educationId')).toBeVisible()
  // Check if Thema's input is visible
  await expect(page.locator('#themeId')).toBeVisible()
  // Check if Vakken input is visible
  await expect(page.locator('#subjectId')).toBeVisible()
  // Check if Korte beschrijving input is visible
  await expect(page.locator('#shortDescriptionId')).toBeVisible()
  // Check if 'Persoonlijke notities' input is visible
  await expect(page.locator('#personalRemarkId')).toBeVisible()

  // Click on Stel een hoofdafbeelding in
  await page
    .getByRole('button', { name: 'Stel een hoofdafbeelding in', exact: true })
    .click()

  // Select second still image
  await page.locator('div.c-image-grid-selectable > div:nth-child(2)').click()

  // Get the background url to check later
  const stillImageStyle = await page
    .locator('div.c-image-grid-selectable > div:nth-child(2)')
    .getAttribute('style')

  // Check second still image is selected
  await expect(
    page.locator(
      'div.c-image-grid-selectable > div:nth-child(2).c-image-grid__item-selected',
    ),
  ).toBeVisible()

  // Save
  await page.getByRole('button', { name: 'Opslaan', exact: true }).click()

  // Check if banner appeared
  await expect(page.locator('div.c-sticky-bar')).toContainText(
    'Wijzigingen opslaan?',
  )

  // Wait for toast
  await page.waitForTimeout(4000)

  // Save changes
  await page.getByRole('button', { name: 'Opslaan' }).click()

  await page.waitForTimeout(3000)

  // Check toast message was succesful
  await expect(
    page.locator(
      'div > div.Toastify__toast-body > div > div > div.c-alert__message',
    ),
  ).toContainText('Collectie opgeslagen')

  await page.getByRole('link', { name: 'Mijn werkruimte' }).click()

  // Get image from first row first column
  const stillImageStyleWerkruimte = await page
    .locator(
      'tr:nth-child(1) > td:nth-child(1) > a > div > div.c-thumbnail-image',
    )
    .first()
    .getAttribute('style')

  // Check if same thumbnail image is used in overview as was selected
  const containsBackgroundUrl =
    stillImageStyle &&
    stillImageStyleWerkruimte &&
    stillImageStyle.includes(stillImageStyleWerkruimte)

  expect(containsBackgroundUrl).toBeTruthy()

  // CLEANUP
  //REMOVE COLLECTION
  // // Go to werkruimte
  // await page.getByRole('link', { name: 'Mijn werkruimte' }).click();

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
