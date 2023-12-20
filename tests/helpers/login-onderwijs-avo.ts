import { expect, Page } from '@playwright/test';

declare const document: any;

export async function loginOnderwijsAvo(
	page: Page,
	url: string = process.env.TEST_CLIENT_ENDPOINT as string,
	username: string,
	password: string
): Promise<void> {
	// Go to the avo homepage and wait for results to load
	await page.goto(url);

	// Check navbar exists, not logged in
	await expect(page.getByRole('link', { name: 'Projecten' })).toBeVisible();
	await expect(page.getByText('Inloggen', { exact: true })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Mijn werkruimte' })).not.toBeVisible();

	// Click log in button
	await page.getByText('Inloggen', { exact: true }).click();

	// Check auth modal opens up
	await expect(page.getByRole('heading', { name: 'Log in als lesgever met:' })).toBeVisible();

	// Click email button
	await page.getByRole('button', { name: 'E-mailadres' }).click();

	// Check login page is opened
	await expect(page.getByRole('heading', { name: 'Inloggen' })).toBeVisible();

	// Fill in credentials
	await page.fill('#emailId', username);
	await page.fill('#passwordId', password);

	// Click the login button
	await page.click('button[type="submit"]');

	// Check navbar exists, logged in
	await expect(page.getByRole('link', { name: 'Mijn werkruimte' })).toBeVisible();
	await expect(page.getByText('Inloggen', { exact: true })).not.toBeVisible();
}
