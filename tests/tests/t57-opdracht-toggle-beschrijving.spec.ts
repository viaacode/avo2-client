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

test('T57: Opdracht - Toggle beschrijving', async ({ page }) => {
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

  // Create collection
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

  // Go to assignments tab
  await page.click('div[data-id="opdrachten"]')

  // Create new assignment
  await page.getByRole('button', { name: 'Nieuwe opdracht' }).click()

  // Open input title
  await page
    .locator(
      'div.o-container-vertical.o-container-vertical--small > div > div > div.c-toolbar__left > div > div > h2 > div > div',
    )
    .click()

  // Enter title
  const date = new Date()
  const assignmentTitle = 'Aangemaakt door automatische test ' + date
  await page.fill('input[placeholder="Geef een titel in"]', assignmentTitle)
  await page.click('div.c-content-input__submit')

  // Add a block, Kijken & luisteren: collectie
  await page
    .locator(
      'div.c-assignment-page.c-assignment-page--create.c-sticky-bar__wrapper > div:nth-child(1) > div.o-container > div > div > ul > div > button',
    )
    .click()

  // Select Kijken & luisteren: collectie
  await page.locator(' ul.c-add-block__list > li:nth-child(2) > label').click()
  await expect(
    page.getByRole('heading', { name: 'Voeg collectie toe' }),
  ).toBeVisible()

  // Select newly created collection
  //await page.locator('tr:nth-child(1) > td:nth-child(2)').click();
  await expect(page.getByText(collectionTitleInOverview)).toBeVisible()
  await page.getByText(collectionTitleInOverview).click()

  // Activate switch to add fragments with description
  await page.getByRole('checkbox').check()

  // Confirm
  await page.getByRole('button', { name: 'Voeg toe' }).click()

  await page.waitForTimeout(3000)

  // Add another block at the bottom, Kijken & luisteren: fragment
  await page
    .locator(
      'div.c-assignment-page.c-assignment-page--create.c-sticky-bar__wrapper > div:nth-child(1) > div.o-container > div > div > ul > div:nth-child(5) > button',
    )
    .click()

  // Select Kijken & luisteren: fragment
  await page.locator(' ul.c-add-block__list > li:nth-child(1) > label').click()
  await expect(
    page.getByRole('heading', { name: 'Fragment toevoegen uit bladwijzers' }),
  ).toBeVisible()

  // Select 2nd fragment/favourite
  await page.click('tr:nth-child(2) > td:nth-child(2)')

  await page.waitForTimeout(1000)

  // Confirm 2x
  await page.getByRole('button', { name: 'Voeg toe' }).click()
  await expect(
    page.getByRole('heading', { name: 'Knip fragment (optioneel)' }),
  ).toBeVisible()
  await page.waitForTimeout(1000)
  await page.getByRole('button', { name: 'Voeg toe' }).click()

  // Select Original description for the first fragment
  await page
    .locator(
      'ul > li:nth-child(2) > div.c-list-sorter__item__content > div > div.c-customise-item-form__fields > div > div:nth-child(1) > div > div.c-assignment-block-description-buttons--default.c-button-group > button[title="Zoals bij origineel fragment"]',
    )
    .click()

  await page.waitForTimeout(1000)

  // Check description label is shown
  await expect(
    page.locator(
      'ul > li:nth-child(2) > div.c-list-sorter__item__content > div > div.c-customise-item-form__fields > div > div:nth-child(4) > label',
    ),
  ).toContainText('Beschrijving fragment')

  // Check description is disabled
  const isDescriptionEditable = await page
    .locator(
      'ul > li:nth-child(2) > div.c-list-sorter__item__content > div > div.c-customise-item-form__fields > div > div:nth-child(4) > div > div',
    )
    .getAttribute('class')
  expect(isDescriptionEditable).toContain('disabled')

  // Select Own description for the second fragment
  await page
    .locator(
      'ul > li:nth-child(4) > div.c-list-sorter__item__content > div > div.c-customise-item-form__fields > div > div:nth-child(1) > div > div.c-assignment-block-description-buttons--default.c-button-group > button[title="Zoals in collectie"]',
    )
    .click()

  await page.waitForTimeout(1000)

  // Check description label is shown
  await expect(
    page.locator(
      'ul > li:nth-child(4) > div.c-list-sorter__item__content > div > div.c-customise-item-form__fields > div > div:nth-child(4) > label',
    ),
  ).toContainText('Beschrijving fragment')

  // Check description is not disabled
  const isDescription2Editable = await page
    .locator(
      'ul > li:nth-child(4) > div.c-list-sorter__item__content > div > div.c-customise-item-form__fields > div > div:nth-child(4) > div > div',
    )
    .getAttribute('class')
  expect(isDescription2Editable).not.toContain('disabled')

  // Change title and description of second fragment
  await page.fill(
    'ul > li:nth-child(4) > div.c-list-sorter__item__content > div > div.c-customise-item-form__fields > div > div:nth-child(2) > div > input',
    'Automated test second fragment title',
  )
  await page.fill(
    'ul > li:nth-child(4) > div.c-list-sorter__item__content > div > div.c-customise-item-form__fields > div > div:nth-child(4) > div > div > div > div.bf-content > div > div > div',
    'Automated test second fragment description',
  )
  await page.waitForTimeout(1000)

  // Select No description for third fragment
  await page
    .locator(
      'ul > li:nth-child(6) > div.c-list-sorter__item__content > div > div.c-customise-item-form__fields > div > div:nth-child(1) > div > div.c-assignment-block-description-buttons--default.c-button-group > button:nth-child(3)',
    )
    .click()

  await page.waitForLoadState('networkidle')

  // Check description label is not shown
  await expect(
    page.locator(
      'ul > li:nth-child(6) > div.c-list-sorter__item__content > div > div.c-customise-item-form__fields > div > div:nth-child(4) > label',
    ),
  ).not.toBeVisible()

  // Check description is not shown
  await expect(
    page.locator(
      'ul > li:nth-child(6) > div.c-list-sorter__item__content > div > div.c-customise-item-form__fields > div > div:nth-child(4) > div > div',
    ),
  ).not.toBeVisible()

  // Check if banner appeared
  await expect(page.locator('div.c-sticky-bar')).toContainText(
    'Wijzigingen opslaan?',
  )

  // Save changes
  await page.getByRole('button', { name: 'Opslaan' }).click()

  // Check toast message was succesful
  await expect(
    page.locator(
      'div > div.Toastify__toast-body > div > div > div.c-alert__message',
    ),
  ).toContainText(
    'De opdracht is succesvol aangemaakt, je vindt deze in je Werkruimte.',
  )

  await page.waitForTimeout(1000)

  // Click mijn werkruimte
  await page.getByRole('link', { name: 'Mijn werkruimte' }).click()

  // Go to assignments tab
  await page.click('div[data-id="opdrachten"]')

  // Check new assignment is shown
  // Slicing because title is cut off at 60 characters,
  // and last 3 characters are swapped with periods
  const assignmentTitleInOverview = assignmentTitle.slice(0, 57) + '...'

  await expect(
    page.getByRole('link', { name: assignmentTitleInOverview }),
  ).toBeVisible()

  // Click on the above link
  await page.getByRole('link', { name: assignmentTitleInOverview }).click()

  // CHECKS
  // Check first block is fragment from collection
  await expect(
    page.locator(
      'div > div.c-block-list__item:nth-child(1) > div > div > div > div.c-icon-bar__content > div > a > h2',
    ),
  ).toContainText('Journaal: dag van de Mantelzorg')

  // Check second fragment has correct title and description
  await expect(
    page.locator(
      'div > div.c-block-list__item:nth-child(2) > div > div > div > div.c-icon-bar__content > div > a > h2',
    ),
  ).toContainText('Automated test second fragment title')
  await expect(
    page.locator(
      'div > div.c-block-list__item:nth-child(2) > div > div > div > div.c-icon-bar__content > div > div.c-collection-fragment-type-item__sidebar > div > div > div > div > p',
    ),
  ).toContainText('Automated test second fragment description')

  // Check third block is fragment
  await expect(
    page.locator(
      'div > div.c-block-list__item:nth-child(3) > div > div > div > div.c-icon-bar__content > div > a > h2',
    ),
  ).toContainText('Fietsstraten in centrum Gent')

  // Check third block has no description
  await expect(
    page.locator(
      'div > div.c-block-list__item:nth-child(3) > div > div > div > div.c-icon-bar__content > div > div.c-collection-fragment-type-item__sidebar > div > div > div > div > p',
    ),
  ).not.toBeVisible()

  // CLEANUP
  // Remove assignment
  // Click mijn werkruimte
  await page.getByRole('link', { name: 'Mijn werkruimte' }).click()

  // Go to assignments tab
  await page.click('div[data-id="opdrachten"]')

  // Open options of the newly created assignment
  // AssignmentDetail page:
  // await page.click("button[aria-label='Meer opties']");
  await page
    .locator(
      'tr:nth-child(1) > td:nth-child(9) > div.u-hide-lt-bp2 > div > div.c-dropdown__trigger > button',
    )
    .click()

  await page
    .locator(
      'tr:nth-child(1) > td:nth-child(9) > div.u-hide-lt-bp2 > div > div.c-dropdown__content-open > div > div:nth-child(3)',
    )
    .click()

  // Confirm remove modal
  await page.getByRole('button', { name: 'Verwijder' }).click()

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
