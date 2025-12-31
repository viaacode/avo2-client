import { expect, test } from '@playwright/test';

import { cleanupTestdata } from '../helpers/cleanup';
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

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    console.error(`Did not run as expected`);
    await cleanupTestdata(page);
  }
});

test('T51: Bundel bewerken', async ({ page }) => {
  await goToPageAndAcceptCookies(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_CLIENT_TITLE as string,
  );

  // Login as Educatieve auteur
  await loginOnderwijsAvo(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_EDUCATIEVE_AUTEUR_USER as string,
    process.env.TEST_EDUCATIEVE_AUTEUR_PASS as string,
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

  // Open options of the newly created collection
  await page.click("button[aria-label='Meer opties']");

  // Add collection to bundle
  await page
    .locator(
      'div.c-toolbar__right > div > div > div.c-dropdown__content-open > div > div:nth-child(1)',
    )
    .click();

  // Check add to bundle modal opened
  await expect(
    page.getByRole('heading', { name: 'Voeg collectie toe aan bundel' }),
  ).toBeVisible();

  // Check new bundle option
  await page
    .locator(
      'div.c-modal__body > div > div > div > div > div > div:nth-child(2) > div.c-radio > label > input[type=radio]',
    )
    .check();

  // Enter new bundle title
  const date = new Date();
  const bundleTitle = 'Aangemaakt door automatische test ' + date;
  await page.fill("input[placeHolder='Titel van de bundel']", bundleTitle);

  // Wait for previous toast to disappear
  await page.waitForTimeout(4000);

  // Save
  await page.getByRole('button', { name: 'Toepassen' }).click();

  // Check toast message was succesful
  await expect(
    page.locator(
      'div > div.Toastify__toast-body > div > div > div.c-alert__message',
    ),
  ).toContainText('De collectie is toegevoegd aan de bundel.');

  // Click search button
  await page.getByRole('link', { name: 'Zoeken', exact: true }).click();

  // Check Search page opens
  await expect(
    page.getByRole('heading', { name: 'Zoekresultaten' }),
  ).toBeVisible();

  // Select video checkbox and search
  await page.getByRole('button', { name: 'Type' }).click();
  await page.locator('#video').check();
  await page.getByRole('button', { name: 'Toepassen' }).click();

  // Wait for items to load
  await page.waitForTimeout(2000);

  // Click second item
  await page.getByRole('link', { name: 'KLAAR: phishing' }).click();

  // Add a second video to the same collection
  await page.click("button[aria-label='Knip of voeg toe aan collectie']");

  // Check modal opens
  await page.waitForTimeout(1000);
  await expect(
    page.getByRole('heading', { name: 'Voeg dit fragment toe aan een' }),
  ).toContainText('Voeg dit fragment toe aan een collectie');

  // Select new collection radiobutton
  await page.getByLabel('Voeg toe aan een nieuwe').setChecked(true);

  // Enter new collection title
  const date2 = new Date();
  const collectionTitle2 = 'Aangemaakt door automatische test ' + date2;
  await page.fill("input[placeHolder='Collectietitel']", collectionTitle2);

  await page.waitForTimeout(3000);

  // Save
  await page.getByRole('button', { name: 'Toepassen' }).click();

  // Check toast message was succesful
  await expect(
    page.locator(
      'div > div.Toastify__toast-body > div > div > div.c-alert__message',
    ),
  ).toContainText(
    'Het fragment is toegevoegd aan de collectie in je Werkruimte.',
  );

  // Go to werkruimte
  await page.getByRole('link', { name: 'Mijn werkruimte' }).click();

  // Check new collection is shown
  // Slicing because title is cut off at 60 characters,
  // and last 3 characters are swapped with periods
  const collectionTitleInOverview2 = collectionTitle2.slice(0, 57) + '...';

  await expect(
    page.getByRole('link', { name: collectionTitleInOverview2 }).first(),
  ).toBeVisible();

  // Click on the above link
  await page
    .getByRole('link', { name: collectionTitleInOverview2 })
    .first()
    .click();

  // Open options of the newly created collection
  await page.click("button[aria-label='Meer opties']");

  // Add collection to bundle
  await page
    .locator(
      'div.c-toolbar__right > div > div > div.c-dropdown__content-open > div > div:nth-child(1)',
    )
    .click();

  // Check add to bundle modal opened
  await expect(
    page.getByRole('heading', { name: 'Voeg collectie toe aan bundel' }),
  ).toBeVisible();

  // Open dropdown existing bundles (id is wrongly named)
  await page.click('#existingCollection');

  // Select existing bundle created earlier in the test
  await page.getByText(bundleTitle, { exact: true }).click();

  // Wait for previous toast to disappear
  await page.waitForTimeout(4000);

  // Save
  await page.getByRole('button', { name: 'Toepassen' }).click();

  // Check toast message was succesful
  await expect(
    page.getByText('De collectie is toegevoegd aan de bundel.'),
  ).toBeVisible();

  // Go to werkruimte
  await page.getByRole('link', { name: 'Mijn werkruimte' }).click();

  // Go to bundles tab
  await page.click('div[data-id="bundels"]');
  await page.waitForLoadState('networkidle');

  // Check new bundle is shown
  // Slicing because title is cut off at 60 characters,
  // and last 3 characters are swapped with periods
  const bundleTitleInOverview = bundleTitle.slice(0, 57) + '...';
  await expect(
    page.getByRole('link', { name: bundleTitleInOverview }),
  ).toBeVisible();

  await page.waitForTimeout(2000);
  // Click on the above link
  await page.getByRole('link', { name: bundleTitleInOverview }).click();

  // Check bundle page is opened
  // await page.waitForTimeout(2000);
  // await page.screenshot({ path: 'screenshot.png', fullPage: true });
  await expect(
    page.getByRole('heading', { name: 'Over deze bundel' }),
  ).toBeVisible();

  // Check order
  const title1 = await page
    .locator(
      'div.m-bundle-detail > div > div:nth-child(2) > div > div > div > div:nth-child(1) > a > div > div.c-media-card-content > h4',
    )
    .textContent();

  const title2 = await page
    .locator(
      'div.m-bundle-detail > div > div:nth-child(2) > div > div > div > div:nth-child(2) > a > div > div.c-media-card-content > h4',
    )
    .textContent();

  // Edit bundle
  await page.getByRole('button', { name: 'Bewerken', exact: true }).click();
  await page.waitForLoadState('networkidle');
  await expect(
    page.locator('button[aria-label="Verplaats naar boven"]'),
  ).toBeVisible();

  // Move second item up
  await page.locator('button[aria-label="Verplaats naar boven"]').click();

  // Check if banner appeared
  await expect(page.locator('div.c-sticky-bar')).toContainText(
    'Wijzigingen opslaan?',
  );

  // Save changes
  await page.getByRole('button', { name: 'Opslaan' }).click();
  await page.waitForLoadState('networkidle');

  // Check toast message was succesful
  await expect(page.getByText('De bundel werd opgeslagen.')).toBeVisible();

  // Close edit mode
  await page.getByRole('button', { name: 'Sluiten' }).click();
  await page.waitForLoadState('networkidle');

  // Check order
  const title1AfterChangeOrder = await page
    .locator(
      'div.m-bundle-detail > div > div:nth-child(2) > div > div > div > div:nth-child(1) > a > div > div.c-media-card-content > h4',
    )
    .textContent();

  const title2AfterChangeOrder = await page
    .locator(
      'div.m-bundle-detail > div > div:nth-child(2) > div > div > div > div:nth-child(2) > a > div > div.c-media-card-content > h4',
    )
    .textContent();

  expect(
    title1 !== title1AfterChangeOrder && title2 !== title2AfterChangeOrder,
  ).toBeTruthy();

  // CLEANUP
  // REMOVE BUNDLE
  // Open options of the newly created bundle
  await page.getByRole('button', { name: 'Meer opties' }).click();

  // Click 'Verwijderen'
  await page
    .locator('div.c-dropdown__content-open > div > div:nth-child(2)')
    .click();

  // Confirm remove modal
  await page.getByRole('button', { name: 'Verwijder' }).click();

  // Check toast message was succesful
  await expect(
    page.getByText(
      'De bundel werd succesvol verwijderd. Collecties bleven ongewijzigd.',
    ),
  ).toBeVisible();

  //REMOVE COLLECTIONS
  // Open options of the newly created collection2
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
    page.getByRole('link', { name: collectionTitleInOverview2 }),
  ).not.toBeVisible();

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
