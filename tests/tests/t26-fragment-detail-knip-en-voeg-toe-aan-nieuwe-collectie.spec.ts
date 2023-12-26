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

test('T26: Fragment detail - Knip en voeg toe aan nieuwe collectie', async ({ page, context }) => {
	await goToPageAndAcceptCookies(
		page,
		process.env.TEST_CLIENT_ENDPOINT as string,
		process.env.TEST_CLIENT_TITLE as string
	);

	await loginOnderwijsAvo(
		page,
		process.env.TEST_CLIENT_ENDPOINT as string,
		process.env.TEST_BASIS_GEBRUIKER_USER as string,
		process.env.TEST_BASIS_GEBRUIKER_PASS as string
	);

	// Click search button
	await page.getByRole('link', { name: 'Zoeken', exact: true }).click();

	// Check Search page opens
	await expect(page.getByRole('heading', { name: 'Zoekresultaten' })).toBeVisible();

	// Select video checkbox and search
	await page.getByRole('button', { name: 'Type' }).click();
	await page.locator('#video').check();
	await page.getByRole('button', { name: 'Toepassen' }).click();

	// Wait for items to load
	await page.waitForTimeout(2000);

	// Click first item
	await page.locator('h2.c-search-result__title > a').first().click();

	// Check title contains test
	await expect(page.locator('h2.c-item-detail__header')).toContainText('dag van de');

	// Click cut and add to collection button
	await page.click("button[aria-label='Knip of voeg toe aan collectie']");

	// Check modal opens
	await page.waitForTimeout(1000);
	await expect(
		page.getByRole('heading', { name: 'Voeg dit fragment toe aan een' })
	).toContainText('Voeg dit fragment toe aan een collectie');

	// Select new collection radiobutton
	await page.getByLabel('Voeg toe aan een nieuwe').setChecked(true);

	// Enter new collection title
	const date = new Date();
	const collectionTitle = 'Aangemaakt door automatische test ' + date;
	await page.fill("input[placeHolder='Collectietitel']", collectionTitle);

	// Save
	await page.getByRole('button', { name: 'Toepassen' }).click();

	// Wait for saving
	await page.waitForTimeout(1000);

	// Check toast message was succesful
	await expect(
		page.locator('div > div.Toastify__toast-body > div > div > div.c-alert__message')
	).toContainText('Het fragment is toegevoegd aan de collectie in je Werkruimte.');

	// Go to werkruimte
	await page.getByRole('link', { name: 'Mijn werkruimte' }).click();

	// Check new collection is shown
	// Slicing because title is cut off at 60 characters,
	// and last 3 characters are swapped with periods
	const collectionTitleInOverview = collectionTitle.slice(0, 57) + '...';

	await expect(page.getByRole('link', { name: collectionTitleInOverview })).toBeVisible();

	// Open options of the newly created collection
	await page
		.locator('tr:nth-child(1) > td:nth-child(6) > div > div.c-dropdown__trigger > button')
		.click();

	// Click 'Verwijderen'
	await page
		.locator(
			'tr:nth-child(1) > td:nth-child(6) > div > div.c-dropdown__content-open > div > div:nth-child(3)'
		)
		.click();

	// Confirm remove modal
	await page.getByRole('button', { name: 'Verwijder' }).click();

	// Check new collection is removed
	await expect(page.getByRole('link', { name: collectionTitleInOverview })).not.toBeVisible();

	await page.waitForTimeout(2000);

	// // Wait for close to save the videos
	// await context.close();
});
