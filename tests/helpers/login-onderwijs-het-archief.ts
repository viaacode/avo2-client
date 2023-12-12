import { Page } from '@playwright/test';

declare const document: any;

export async function loginOnderwijsHetArchief(
	page: Page,
	url: string = process.env.TEST_CLIENT_ENDPOINT as string,
	username: string,
	password: string
): Promise<void> {
	// Go to the avo homepage and wait for results to load
	await page.goto(url);
	await page.getByText('Inloggen', { exact: true }).click();
	await page.getByRole('button', { name: 'E-mailadres' }).click();

	// Fill in credentials
	await page.fill('#emailId', username);
	await page.fill('#passwordId', password);

	// Click the login button
	await page.click('button[type="submit"]');

	await page.waitForTimeout(5000);
}
