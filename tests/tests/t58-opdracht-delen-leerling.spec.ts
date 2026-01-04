import { expect, test } from '@playwright/test';

import { cleanupTestdata } from '../helpers/cleanup';
import { goToPageAndAcceptCookies } from '../helpers/go-to-page-and-accept-cookies';
import { loginOnderwijsAvo } from '../helpers/login-onderwijs-avo';
import { logoutOnderwijsAvo } from '../helpers/logout-onderwijs-avo';

/**
 * New: https://docs.google.com/spreadsheets/d/1IvhK0v0HSntCwTcXiFseHargwwWwpoCkDMjmMehaDMA/edit#gid=0
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    console.error(`Did not run as expected`);
    await cleanupTestdata(page);
  }
});

test('T58: Opdracht - Delen met leerling', async ({ page }) => {
  await goToPageAndAcceptCookies(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_CLIENT_TITLE as string,
  );

  await loginOnderwijsAvo(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_BASIS_GEBRUIKER_USER as string,
    process.env.TEST_BASIS_GEBRUIKER_PASS as string,
  );

  // Click mijn werkruimte
  await page.getByRole('link', { name: 'Mijn werkruimte' }).click();

  // Go to assignments tab
  await page.click('div[data-id="opdrachten"]');

  // Create new assignment
  await page.getByRole('button', { name: 'Nieuwe opdracht' }).click();

  // Check if banner appeared
  await expect(page.locator('div.c-sticky-bar')).toContainText(
    'Wijzigingen opslaan?',
  );

  await page.waitForTimeout(1000);

  // Save changes
  await page.getByRole('button', { name: 'Opslaan' }).click();

  // Edit assignment
  await page.getByRole('button', { name: 'Bewerken' }).click();

  // Open input title
  await page
    .locator(
      'div.o-container-vertical.o-container-vertical--small > div > div > div.c-toolbar__left > div > div > h2 > div > div',
    )
    .nth(1)
    .click();

  // Enter title
  const date = new Date();
  const assignmentTitle = 'Aangemaakt door automatische test ' + date;
  await page
    .locator('input[placeholder="Geef een titel in"]')
    .nth(1)
    .fill(assignmentTitle);
  await page.click('div.c-content-input__submit');

  await page.waitForTimeout(1000);

  // Click on share button
  await page
    .locator(
      'div.c-toolbar__right > div > div.u-hide-lt-bp2 > div > div.c-share-dropdown.c-dropdown.c-dropdown__trigger > button',
    )
    .nth(1)
    .click();

  // Check url not shareable
  await expect(
    page
      .getByRole('heading', { name: 'Link nog niet deelbaar' })
      .getByRole('strong'),
  ).toBeVisible();

  await page.waitForTimeout(1000);

  // Click outside share modal
  await page.click(
    'div.c-assignment-page.c-assignment-page--edit.c-sticky-bar__wrapper',
  );

  // Add block button
  await page
    .locator(
      'div.c-assignment-page.c-assignment-page--edit.c-sticky-bar__wrapper > div > div.o-container > div > div > ul > div > button',
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

  await page.waitForTimeout(1000);

  // Check if banner appeared
  await expect(page.locator('div.c-sticky-bar')).toContainText(
    'Wijzigingen opslaan?',
  );

  // Save changes
  await page.getByRole('button', { name: 'Opslaan' }).click();

  // Check toast message was succesful
  await expect(
    page.locator(
      'div > div.Toastify__toast-body > div > div > div.c-alert__message',
    ),
  ).toContainText('De opdracht is succesvol aangepast.');

  await page.waitForTimeout(1000);

  // Go to settings tab
  await page.locator('div[data-id="details"]').nth(1).click();
  await expect(page.getByLabel('Klassen')).toBeVisible();

  // Click on edit klassen
  await page.locator('button[aria-label="Beheer je klassen"]').click();

  // Check modal opens
  await expect(
    page.getByRole('heading', { name: 'Beheer je klassen' }),
  ).toBeVisible();
  await page.waitForTimeout(2000);

  // Check klassen count
  const klassenCount = await page
    .locator(
      'body > div.m-manage-assignment-labels.c-modal-context.c-modal-context--visible > div > div.scrollbar-container.c-modal__body.ps > table > tbody > tr',
    )
    .count();

  // Click on Add klas
  await page.getByRole('button', { name: 'Voeg een klas toe' }).click();

  // Check klassen count after adding one
  const klassenCountAfter = await page
    .locator(
      'body > div.m-manage-assignment-labels.c-modal-context.c-modal-context--visible > div > div.scrollbar-container.c-modal__body.ps > table > tbody > tr',
    )
    .count();
  expect(klassenCountAfter).toBeGreaterThan(klassenCount);

  // Give a name to the new klas
  await page
    .locator(
      'body > div.m-manage-assignment-labels.c-modal-context.c-modal-context--visible > div > div.scrollbar-container.c-modal__body.ps > table > tbody > tr',
    )
    .last()
    .getByRole('textbox')
    .fill('0Automated test klas');

  await page.waitForTimeout(3000);

  // Save changes
  await page.getByRole('button', { name: 'Opslaan' }).click();
  // Check toast message was succesful
  await expect(
    page.locator(
      'div > div.Toastify__toast-body > div > div > div.c-alert__message',
    ),
  ).toContainText('Je aanpassingen aan klassen zijn opgeslagen.');

  // Click on Klassen dropdown
  await page
    .locator(
      'div.o-grid-col-bp3-7 > div:nth-child(1) > div > div > div:nth-child(1) > div',
    )
    .click();
  await page.waitForTimeout(1000);

  // Choose the newly created klas
  await page.getByText('0Automated test klas', { exact: true }).first().click();

  // Focus on deadline input
  await page.locator('input[placeholder="dd/mm/yyyy"]').nth(1).focus();
  await page.waitForTimeout(1000);
  await page.click('button[aria-label="Next Month"]');
  await page.waitForTimeout(1000);
  await page.locator('div.react-datepicker__week > div').first().click();
  await page.waitForTimeout(2000);

  // Check if banner appeared
  await expect(page.locator('div.c-sticky-bar')).toContainText(
    'Wijzigingen opslaan?',
  );

  // Save changes
  await page.getByRole('button', { name: 'Opslaan' }).click();

  // Check toast message was succesful
  await expect(
    page.locator(
      'div > div.Toastify__toast-body > div > div > div.c-alert__message',
    ),
  ).toContainText('De opdracht is succesvol aangepast.');

  // Click on share button
  await page
    .locator(
      'div.c-toolbar__right > div > div.u-hide-lt-bp2 > div > div.c-share-dropdown.c-dropdown.c-dropdown__trigger > button',
    )
    .nth(1)
    .click();

  // Get url
  const shareUrl = await page
    .locator('div.c-share-with-pupil > div > input')
    .first()
    .getAttribute('value');

  await page.waitForTimeout(1000);

  // Logout
  await logoutOnderwijsAvo(page);

  await expect(page.getByText('Inloggen', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Mijn werkruimte' }),
  ).not.toBeVisible();

  // Login as student
  await loginOnderwijsAvo(
    page,
    process.env.CLIENT_ENDPOINT as string,
    process.env.TEST_LEERLING_GEBRUIKER_USER as string,
    process.env.TEST_LEERLING_GEBRUIKER_PASS as string,
    false,
  );

  // Go to shared url
  await page.goto(shareUrl as string);

  // Assignment is opened
  await expect(
    page.getByRole('heading', { name: assignmentTitle }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Bewerken' }),
  ).not.toBeVisible();

  // CLEANUP
  // Remove klas
  // Logout
  // Open user dropdown from navbar
  await logoutOnderwijsAvo(page, false);
  await page.waitForTimeout(1000);

  // Login as first user
  await loginOnderwijsAvo(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_BASIS_GEBRUIKER_USER as string,
    process.env.TEST_BASIS_GEBRUIKER_PASS as string,
  );

  // Click mijn werkruimte
  await page.getByRole('link', { name: 'Mijn werkruimte' }).click();

  // Go to assignments tab
  await page.click('div[data-id="opdrachten"]');

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

  // Edit assignment
  await page.getByRole('button', { name: 'Bewerken' }).click();

  // Go to settings tab
  await page.locator('div[data-id="details"]').nth(1).click();
  await expect(page.getByLabel('Klassen')).toBeVisible();

  // Click on edit klassen
  await page.locator('button[aria-label="Beheer je klassen"]').click();

  // Check modal opens
  await expect(
    page.getByRole('heading', { name: 'Beheer je klassen' }),
  ).toBeVisible();
  await page.waitForTimeout(2000);

  await page
    .locator('button[aria-label="Verwijder dit label"]')
    .first()
    .click();
  await page.waitForTimeout(2000);

  // Save changes
  await page.getByRole('button', { name: 'Opslaan' }).click();

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
