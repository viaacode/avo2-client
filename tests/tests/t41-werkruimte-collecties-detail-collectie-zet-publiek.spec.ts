import { expect, test } from '@playwright/test';

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

test('T41: Werkruimte - collecties: Detail collectie zet publiek', async ({
  page,
}) => {
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

  const collectionTitle = await createCollection(page);

  // Go to werkruimte
  await page.getByRole('link', { name: 'Mijn werkruimte' }).click();

  // Check new collection is shown
  // Slicing because title is cut off at 60 characters,
  // and last 3 characters are swapped with periods
  const collectionTitleInOverview = collectionTitle.slice(0, 57) + '...';

  await expect(
    page.getByRole('link', { name: collectionTitleInOverview }),
  ).toBeVisible();

  // Click on the above link
  await page.getByRole('link', { name: collectionTitleInOverview }).click();

  // Click public button
  await page.click("button[aria-label='Maak deze collectie publiek']");

  // Check modal opens
  await expect(
    page.getByRole('heading', { name: 'Maak deze collectie publiek' }),
  ).toBeVisible();

  // Check public radio button
  await page
    .locator(
      'div.c-modal-context.c-modal-context--visible > div > div.scrollbar-container.c-modal__body.ps > div.o-form-group > div > div.c-radio-group > div:nth-child(2) > label > input[type=radio]',
    )
    .check();

  await page.waitForTimeout(1000);

  // Confirm public modal
  await page.getByRole('button', { name: 'Opslaan' }).click();

  // Check errors are shown
  await expect(
    page.locator(
      'div.o-form-group.o-form-group--error > div > div:nth-child(3)',
    ),
  ).toContainText('De collectie heeft geen beschrijving.');
  await expect(
    page.locator(
      'div.o-form-group.o-form-group--error > div > div:nth-child(4)',
    ),
  ).toContainText('De collectie heeft geen onderwijsniveau(s).');
  await expect(
    page.locator(
      'div.o-form-group.o-form-group--error > div > div:nth-child(5)',
    ),
  ).toContainText('De collectie heeft geen thema(s).');
  await expect(
    page.locator(
      'div.o-form-group.o-form-group--error > div > div:nth-child(6)',
    ),
  ).toContainText('De collectie heeft geen vak(ken).');

  // Cancel public modal
  await page.getByRole('button', { name: 'Annuleren' }).click();

  // Edit collection
  await page.getByRole('button', { name: 'Bewerken', exact: true }).click();

  // Click on publication details tab
  await page.click(
    'div.c-collection-or-bundle-edit > div.c-navbar.c-navbar--bordered-bottom.c-navbar--auto.c-navbar--bg-alt > div > nav > div:nth-child(2)',
  );

  // Check if Onderwijs input is visible
  await expect(page.locator('#educationId')).toBeVisible();
  // Check if Thema's input is visible
  await expect(page.locator('#themeId')).toBeVisible();
  // Check if Vakken input is visible
  await expect(page.locator('#subjectId')).toBeVisible();
  // Check if Korte beschrijving input is visible
  await expect(page.locator('#shortDescriptionId')).toBeVisible();
  // Check if 'Persoonlijke notities' input is visible
  await expect(page.locator('#personalRemarkId')).toBeVisible();

  // Open Onderwijs dropdown
  await page.click('#educationId');

  // Select option
  await page.getByText('Deeltijds kunstonderwijs', { exact: true }).click();

  // Open Onderwijs dropdown
  await page.click('#educationId');

  // Select option
  await page.getByText('Hoger onderwijs', { exact: true }).click();

  // Open Thema's dropdown
  await page.click('#themeId');

  // Select subdropdown
  await page.getByText('MAATSCHAPPIJ EN WELZIJN').click();

  // Select option
  await page.getByText('armoede en welvaart', { exact: true }).click();

  // Open Thema's dropdown
  await page.click('#themeId');

  // Select subdropdown
  await page.getByText('GESCHIEDENIS').click();

  // Select option
  await page.getByText('erfgoed', { exact: true }).click();

  // Open Vakken dropdown
  await page.click('#subjectId');

  // Select option
  await page.getByText('Aardrijkskunde', { exact: true }).click();

  // Open Vakken dropdown
  await page.click('#subjectId');

  // Select option
  await page.getByText('Toegepaste informatica', { exact: true }).click();

  // Fill in korte beschrijving
  await page.fill(
    '#shortDescriptionId',
    'Dit is een korte beschrijving tekst.',
  );

  // Fill in Persoonlijke notities
  await page.fill(
    '#personalRemarkId',
    'Dit is een persoonlijke notitie tekst.',
  );

  // Check if banner appeared
  await expect(page.locator('div.c-sticky-bar')).toContainText(
    'Wijzigingen opslaan?',
  );

  // Save changes
  await page.getByRole('button', { name: 'Opslaan' }).click();

  await page.waitForTimeout(3000);

  // Click public button
  await page.click("button[aria-label='Maak deze collectie publiek']");

  // Check modal opens
  await expect(
    page.getByRole('heading', { name: 'Maak deze collectie publiek' }),
  ).toBeVisible();

  // Check public radio button
  await page
    .locator(
      'div.c-modal-context.c-modal-context--visible > div > div.scrollbar-container.c-modal__body.ps > div.o-form-group > div > div.c-radio-group > div:nth-child(2) > label > input[type=radio]',
    )
    .check();

  await page.waitForTimeout(1000);

  // Confirm public modal
  await page.getByRole('button', { name: 'Opslaan' }).click();

  await page.waitForTimeout(3000);

  // Check toast message was succesful
  await expect(page.getByText('De collectie staat nu publiek.')).toBeVisible();

  // Go to werkruimte
  await page.getByRole('link', { name: 'Mijn werkruimte' }).click();

  // Check if Collection is public
  await expect(
    page.locator("tr:nth-child(1) > td:nth-child(5) > div[title='Publiek']"),
  ).toBeVisible();
  await expect(
    page.locator(
      "tr:nth-child(1) > td:nth-child(5) > div[title='Niet publiek']",
    ),
  ).not.toBeVisible();

  // CLEANUP
  //REMOVE COLLECTION
  // // Go to werkruimte
  // await page.getByRole('link', { name: 'Mijn werkruimte' }).click();

  // Open options of the newly created collection
  await page
    .locator(
      'tr:nth-child(1) > td:nth-child(6) > div > div.c-dropdown__trigger > button',
    )
    .click();

  // Click 'Verwijderen'
  await page
    .locator(
      'tr:nth-child(1) > td:nth-child(6) > div > div.c-dropdown__content-open > div > div:nth-child(3)',
    )
    .click();

  // Confirm remove modal
  await page.getByRole('button', { name: 'Verwijder' }).click();

  // Check new collection is removed
  await expect(
    page.getByRole('link', { name: collectionTitleInOverview }),
  ).not.toBeVisible();
  // // Wait for close to save the videos
  // await context.close();
});
