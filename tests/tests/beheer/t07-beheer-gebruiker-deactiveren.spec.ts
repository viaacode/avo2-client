import { expect, test } from '@playwright/test';

import { goToAdminPage } from '../../helpers/go-to-admin';
import { logoutOnderwijsAvo } from '../../helpers/logout-onderwijs-avo';

/**
 * New: https://docs.google.com/spreadsheets/d/1IvhK0v0HSntCwTcXiFseHargwwWwpoCkDMjmMehaDMA/edit#gid=0
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test('T07: Beheer - Gebruiker deactiveren', async ({ page }) => {
	await goToAdminPage(page);

	// Search user
	await page
		.locator('input[placeholder="Zoek op naam, e-mail, organisatie, groep, stamboeknummer"]')
		.fill('accounts+educatieveauteur');
	await page.waitForTimeout(1000);
	await page.getByRole('button', { name: 'Zoeken' }).click();

	await page.waitForTimeout(1000);

	// Click on a user
	await page.getByRole('link', { name: 'Educatieve Auteur Account' }).click();

	// Check we are on admin user detail page
	await expect(
		page.getByRole('heading', { name: 'Gebruiker - details', exact: true })
	).toBeVisible();

	// Check deactivate button is shown
	await expect(
		page.locator('button[aria-label="Ban deze gebruiker van Het Archief voor Onderwijs"]')
	).toBeVisible();

	// Click it
	await page
		.locator('button[aria-label="Ban deze gebruiker van Het Archief voor Onderwijs"]')
		.click();

	// Check confirm modal opens
	await expect(
		page.getByText('Weet je zeker dat je deze gebruiker wil deactiveren?')
	).toBeVisible();
	await page.waitForTimeout(1000);

	// Confirm
	await page.getByRole('button', { name: 'Deactiveren' }).click();
	await page.waitForTimeout(1000);

	// Check toast
	await expect(
		page.locator('div > div.Toastify__toast-body > div > div > div.c-alert__message')
	).toContainText('Gebruiker is geblokkeerd');

	// Check deactivate button is not shown
	await expect(
		page.locator('button[aria-label="Ban deze gebruiker van Het Archief voor Onderwijs"]')
	).not.toBeVisible();

	// Check activate button is shown
	await expect(
		page.locator(
			'button[aria-label="Geef deze gebruiker opnieuw toegang tot Het Archief voor Onderwijs."]'
		)
	).toBeVisible();

	await page.waitForTimeout(2000);

	// Logout
	await page.goto(process.env.TEST_CLIENT_ENDPOINT as string);
	await logoutOnderwijsAvo(page);

	// Try logging in with deactivated user
	// Click log in button
	await page.getByText('Inloggen', { exact: true }).click();
	await page.click('div[data-id="lesgever"]');

	// Check auth modal opens up
	await expect(page.getByRole('heading', { name: 'Log in als lesgever met:' })).toBeVisible();

	// Click email button
	await page.getByRole('button', { name: 'E-mailadres' }).click();

	// Check login page is opened
	await expect(page.getByRole('heading', { name: 'Inloggen' })).toBeVisible();

	// Fill in credentials
	await page.fill('#emailId', process.env.TEST_EDUCATIEVE_AUTEUR_USER as string);
	await page.fill('#passwordId', process.env.TEST_EDUCATIEVE_AUTEUR_PASS as string);

	// Click the login button
	await page.click('button[type="submit"]');
	await page.waitForTimeout(2000);

	// Check you cannot access Avo
	await expect(
		page.getByText('Je account heeft geen toegang tot Het Archief voor Onderwijs.')
	).toBeVisible();
	await expect(page.getByText('Inloggen', { exact: true })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Mijn werkruimte' })).not.toBeVisible();

	await page.waitForTimeout(2000);
});
