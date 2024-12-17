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

// Error loading detail page
test.skip('T12: Zoeken - zoeken op keyword', async ({ page }) => {
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

	// Fill in keyword
	await page.fill('#query', 'vrt');

	// Wait for items to load
	await page.waitForTimeout(2000);

	// Click search button
	await page.getByRole('button', { name: 'Zoeken' }).click();

	// Wait for items to load
	await page.waitForTimeout(2000);

	// Click first item
	await page.locator('.c-thumbnail-meta--img-is-loaded').first().click();

	// Check title and body contains test
	await expect(page.locator('h2.c-item-detail__header')).toContainText('VRT');
	// await expect(page.locator('.c-content').first()).toContainText('vrt'); // TODO: avoid element not on page

	// // Wait for close to save the videos
	// await context.close();
});
