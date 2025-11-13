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

test('T56: Opdracht - Elk type toevoegen', async ({ page }) => {
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

  // Click add block button
  await page
    .locator(
      'div.c-assignment-page.c-assignment-page--create.c-sticky-bar__wrapper > div:nth-child(1) > div.o-container > div > div > ul > div > button',
    )
    .click()

  await expect(page.getByRole('heading', { name: 'Toevoegen' })).toBeVisible()

  // add text block
  await page.locator('ul.c-add-block__list > li:nth-child(4) > label').click()
  await expect(
    page.getByRole('heading', { name: 'Toevoegen' }),
  ).not.toBeVisible()

  // Enter title
  await page.fill(
    'input[placeholder="Instructies of omschrijving"]',
    'Automatische test titel',
  )

  // Enter description
  await page.fill(
    'div.DraftEditor-editorContainer > div[contenteditable="true"]',
    'Automatische test beschrijving tekst blok',
  )

  // Add another block under the textblock, Zoeken & bouwen
  await page
    .locator(
      'div.c-assignment-page.c-assignment-page--create.c-sticky-bar__wrapper > div:nth-child(1) > div.o-container > div > div > ul > div:nth-child(3) > button',
    )
    .click()
  await expect(page.getByRole('heading', { name: 'Toevoegen' })).toBeVisible()

  // Select Zoeken & bouwen block
  await page.locator(' ul.c-add-block__list > li:nth-child(3) > label').click()
  await expect(
    page.getByRole('heading', { name: 'Toevoegen' }),
  ).not.toBeVisible()

  // Fill in description
  await page.fill(
    'ul.c-list-sorter > li:nth-child(4) > div.c-list-sorter__item__content > div > div > div > div > div > div.bf-content > div > div.DraftEditor-editorContainer > div[contenteditable="true"]',
    'Automatische test beschrijving Zoeken en bouwen blok',
  )

  // Activate switch to add pupil collection
  await page.getByRole('checkbox').check()

  await page.waitForTimeout(3000)

  // Add another block above the textblock, Kijken & luisteren: collectie
  await page
    .locator(
      'div.c-assignment-page.c-assignment-page--create.c-sticky-bar__wrapper > div:nth-child(1) > div.o-container > div > div > ul > div:nth-child(3) > button',
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
  await page.getByRole('checkbox').nth(1).check()

  // Confirm
  await page.getByRole('button', { name: 'Voeg toe' }).click()

  await page.waitForTimeout(3000)

  // Add another block, second to last, Kijken & luisteren: fragment
  await page
    .locator(
      'div.c-assignment-page.c-assignment-page--create.c-sticky-bar__wrapper > div:nth-child(1) > div.o-container > div > div > ul > div:nth-child(1) > button',
    )
    .click()

  // Select Kijken & luisteren: fragment
  await page.locator(' ul.c-add-block__list > li:nth-child(1) > label').click()
  await expect(
    page.getByRole('heading', { name: 'Fragment toevoegen uit bladwijzers' }),
  ).toBeVisible()

  // Select fragment/favourite
  await page.click('tr > td:nth-child(2)')

  await page.waitForTimeout(1000)

  // Confirm 2x
  await page.getByRole('button', { name: 'Voeg toe' }).click()
  await expect(
    page.getByRole('heading', { name: 'Knip fragment (optioneel)' }),
  ).toBeVisible()
  await page.waitForTimeout(1000)
  await page.getByRole('button', { name: 'Voeg toe' }).click()

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
  await page.waitForLoadState('networkidle')

  // CHECKS
  // Check firt block is title and description
  await expect(
    page.locator(
      'div > div.c-block-list__item:nth-child(1) > div > div > div > div.c-icon-bar__content > h2',
    ),
  ).toContainText('Automatische test titel')
  await expect(
    page.locator(
      'div > div.c-block-list__item:nth-child(1) > div > div > div > div.c-icon-bar__content > div > div > p',
    ),
  ).toContainText('Automatische test beschrijving tekst blok')

  // Check second block is fragment
  await expect(
    page.locator(
      'div > div.c-block-list__item:nth-child(2) > div > div > div > div.c-icon-bar__content > div > a > h2',
    ),
  ).toContainText('VTM Nieuws: wat doet hitte met ons lichaam?')

  // Check third block is Zoeken en bouwen block
  await expect(
    page.locator(
      'div > div.c-block-list__item:nth-child(3) > div > div > div > div.c-icon-bar__content > div > div > h2',
    ),
  ).toContainText('Zoekoefening')
  await expect(
    page.locator(
      'div > div.c-block-list__item:nth-child(3) > div > div > div > div.c-icon-bar__content > div > div > div > div > p',
    ),
  ).toContainText('Automatische test beschrijving Zoeken en bouwen blok')

  // Check last block is fragment from collection
  await expect(
    page.locator(
      'div > div.c-block-list__item:nth-child(4) > div > div > div > div.c-icon-bar__content > div > a > h2',
    ),
  ).toContainText('Journaal: dag van de Mantelzorg')

  // CLEANUP
  // Remove assignment
  // Click mijn werkruimte
  await page.getByRole('link', { name: 'Mijn werkruimte' }).click()
  await page.waitForLoadState('networkidle')

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
  await page.waitForLoadState('networkidle')

  //REMOVE COLLECTION
  // Go to werkruimte
  await page.getByRole('link', { name: 'Mijn werkruimte' }).click()
  await page.waitForLoadState('networkidle')

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
  await page.waitForLoadState('networkidle')

  // Check new collection is removed
  await expect(
    page.getByRole('link', { name: collectionTitleInOverview }),
  ).not.toBeVisible()

  // // Wait for close to save the videos
  // await context.close();
})
