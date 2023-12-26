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

test('T28: Fragment detail - Voeg toe aan nieuwe opdracht', async ({ page, context }) => {
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

	// Click add to assignment button
	await page.getByRole('button', { name: 'Voeg toe aan opdracht' }).click();
	await page.waitForTimeout(1000);
	await page.getByRole('button', { name: 'Nieuwe opdracht' }).click();

	// Check cut fragment modal opens
	await expect(page.getByRole('heading', { name: 'Knip fragment' })).toBeVisible();

	// Confirm
	await page.getByRole('button', { name: 'Toepassen' }).click();

	// Check assignment page is opened
	await expect(page.getByRole('heading', { name: 'Over deze opdracht' })).toBeVisible();

	// Open options of the newly created assignment
	await page.click("button[aria-label='Meer opties']");

	// Click 'Verwijderen'
	await page
		.locator(
			'#root > div > div.c-sticky-bar__wrapper > div > div.c-header.o-container-vertical.o-container-vertical--bg-alt > div > div:nth-child(2) > div.c-toolbar__right > div > div > div.c-dropdown__content-open > div > div:nth-child(2)'
		)
		.click();

	// Confirm remove modal
	await page.getByRole('button', { name: 'Verwijder' }).click();

	// Check toast message was succesful
	await expect(
		page.locator('div > div.Toastify__toast-body > div > div > div.c-alert__message')
	).toContainText('De opdracht werd verwijderd.');

	await page.waitForTimeout(2000);

	// // Wait for close to save the videos
	// await context.close();
});
