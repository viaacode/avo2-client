import { expect, test } from '@playwright/test';

import { goToPageAndAcceptCookies } from '../helpers/go-to-page-and-accept-cookies';

/**
 * New: https://docs.google.com/spreadsheets/d/1IvhK0v0HSntCwTcXiFseHargwwWwpoCkDMjmMehaDMA/edit#gid=0
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test('T02: Nieuw account aanmaken', async ({ page, context }) => {
	await goToPageAndAcceptCookies(
		page,
		process.env.TEST_CLIENT_ENDPOINT as string,
		// INT
		//'Audiovisuele beeldbank voor leerkrachten | Het Archief voor Onderwijs'
		// QAS
		'Audiovisuele beeldbank | Het Archief voor Onderwijs'
	);

	// Click log in button
	await page.getByText('Account aanmaken', { exact: true }).click();

	// Check flyout opens
	await expect(page.getByRole('heading', { name: 'Ben je lesgever?' })).toBeVisible();

	// Click create free teacher account button
	await page.getByRole('button', { name: 'Maak je gratis account aan' }).click();

	// Check teacher login page opens
	await expect(
		page.getByRole('heading', { name: 'Geef hieronder je lerarenkaart- of stamboeknummer in.' })
	).toBeVisible();

	// Fill in credentials
	await page.fill('div.m-stamboek-input > input', '97436428856');

	// Check teachernumber is correct
	await expect(page.getByText('Het stamboeknummer is geldig.', { exact: true })).toBeVisible();

	// Click create account button
	await page.getByRole('button', { name: 'Account aanmaken' }).click();

	// Check form page opens
	await expect(page.getByRole('heading', { name: 'Maak je gratis account aan' })).toBeVisible();

	// Fill in credentials
	await page.fill('#person_email', 'mail');
	await page.fill('#person_first_name', 'firstName');
	await page.fill('#person_last_name', 'lastName');
	await page.fill('#password_field', 'pasw');
	await page.fill('#password_confirmation_field', 'pasw');

	await page.waitForTimeout(5000);

	// // Wait for close to save the videos
	// await context.close();
});
