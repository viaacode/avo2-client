import { expect, test } from '@playwright/test';

import { goToPageAndAcceptCookies } from '../helpers/go-to-page-and-accept-cookies';
import { loginOnderwijsAvo } from '../helpers/login-onderwijs-avo';

/**
 * New: https://docs.google.com/spreadsheets/d/1IvhK0v0HSntCwTcXiFseHargwwWwpoCkDMjmMehaDMA/edit#gid=0
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test('T55: Opdracht - Tekstblok toevoegen', async ({ page }) => {
  await goToPageAndAcceptCookies(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_CLIENT_TITLE as string,
  );

  await loginOnderwijsAvo(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_LESGEVER_SECUNDAIR_GEBRUIKER_USER as string,
    process.env.TEST_LESGEVER_SECUNDAIR_GEBRUIKER_PASS as string,
  );

  // Click mijn werkruimte
  await page.getByRole('link', { name: 'Mijn werkruimte' }).click();

  // Go to assignments tab
  await page.click('div[data-id="opdrachten"]');

  // Create new assignment
  await page.getByRole('button', { name: 'Nieuwe opdracht' }).click();

  // Open input title
  await page
    .locator(
      'div.o-container-vertical.o-container-vertical--small > div > div > div.c-toolbar__left > div > div > h2 > div > div',
    )
    .click();

  // Enter title
  const date = new Date();
  const assignmentTitle = 'Aangemaakt door automatische test ' + date;
  await page.fill('input[placeholder="Geef een titel in"]', assignmentTitle);
  await page.click('div.c-content-input__submit');

  // Add block button
  await page
    .locator(
      'div.c-assignment-page.c-assignment-page--create.c-sticky-bar__wrapper > div:nth-child(1) > div.o-container > div > div > ul > div > button',
    )
    .click();

  // add text block
  await page.locator('ul.c-add-block__list > li:nth-child(4) > label').click();

  // Enter title
  await page.fill(
    'input[placeholder="Instructies of omschrijving"]',
    'Automatische test titel',
  );

  // Enter description
  await page.fill(
    'div.DraftEditor-editorContainer > div[contenteditable="true"]',
    'Automatische test beschrijving tekst blok',
  );

  await page.click('.c-color-select .react-select__control');

  await page.click(
    '.c-color-select .react-select__menu .react-select__option:nth-child(3)',
  );

  // Check if banner appeared
  await expect(page.locator('div.c-sticky-bar')).toContainText(
    'Wijzigingen opslaan?',
  );

  // Save changes
  await page.getByRole('button', { name: 'Opslaan' }).click();
  await page.waitForLoadState('networkidle');

  // Check toast message was succesful
  await expect(
    page.locator(
      'div > div.Toastify__toast-body > div > div > div.c-alert__message',
    ),
  ).toContainText(
    'De opdracht is succesvol aangemaakt, je vindt deze in je Werkruimte.',
  );

  // Click mijn werkruimte
  await page.getByRole('link', { name: 'Mijn werkruimte' }).click();

  // Go to assignments tab
  await page.click('div[data-id="opdrachten"]');
  await page.waitForLoadState('networkidle');

  // Check new assignment is shown
  // Slicing because title is cut off at 60 characters,
  // and last 3 characters are swapped with periods
  const assignmentTitleInOverview = assignmentTitle.slice(0, 57) + '...';

  await expect(
    page.getByRole('link', { name: assignmentTitleInOverview }),
  ).toBeVisible();

  // Click on the above link
  await page.getByRole('link', { name: assignmentTitleInOverview }).click();

  // Check title and description
  await expect(
    page.locator(
      'div.c-block-list__item > div > div > div > div.c-icon-bar__content > h2',
    ),
  ).toContainText('Automatische test titel');
  await expect(
    page.locator(
      'div.c-block-list__item > div > div > div > div.c-icon-bar__content > div > div > p',
    ),
  ).toContainText('Automatische test beschrijving tekst blok');
  await page.waitForTimeout(3000);
  await page.waitForTimeout(1000);

  // CLEANUP
  // Remove assignment
  // Click mijn werkruimte
  await page.getByRole('link', { name: 'Mijn werkruimte' }).click();

  // Go to assignments tab
  await page.click('div[data-id="opdrachten"]');

  // Open options of the newly created assignment
  // AssignmentDetail page:
  // await page.click("button[aria-label='Meer opties']");
  await page
    .locator(
      'tr:nth-child(1) > td:nth-child(9) > div.u-hide-lt-bp2 > div > div.c-dropdown__trigger > button',
    )
    .click();

  // Click 'Verwijderen'
  // AssignmentDetail page:
  // await page
  // 	.locator(
  // 		'div.c-sticky-bar__wrapper > div > div.c-header.o-container-vertical.o-container-vertical--bg-alt > div > div:nth-child(2) > div.c-toolbar__right > div > div > div.c-dropdown__content-open > div > div:nth-child(2)'
  // 	)
  // 	.click();
  await page
    .locator(
      'tr:nth-child(1) > td:nth-child(9) > div.u-hide-lt-bp2 > div > div.c-dropdown__content-open > div > div:nth-child(3)',
    )
    .click();

  // Confirm remove modal
  await page.getByRole('button', { name: 'Verwijder' }).click();

  await page.waitForTimeout(1000);

  // // Wait for close to save the videos
  // await context.close();
});
