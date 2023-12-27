import { expect, Page } from '@playwright/test';

export async function logoutOnderwijsAvo(page: Page): Promise<void> {
	// Open user dropdown from navbar
	await page
		.locator('div.u-mq-switch-main-nav-authentication > ul > li > div.c-dropdown__trigger')
		.click();

	// Logout
	await page
		.locator(
			'div.u-mq-switch-main-nav-authentication > ul > li > div.c-dropdown__content-open > div > div:nth-child(5)'
		)
		.click();

	// Check navbar exists, logged out
	await expect(page.getByRole('link', { name: 'Mijn werkruimte' })).not.toBeVisible();
	await expect(page.getByText('Inloggen', { exact: true })).toBeVisible();
}
