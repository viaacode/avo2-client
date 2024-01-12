import { expect, Page } from '@playwright/test';

export async function logoutOnderwijsAvo(page: Page, asTeacher = true): Promise<void> {
	// Open user dropdown from navbar
	await page
		.locator('div.u-mq-switch-main-nav-authentication > ul > li > div.c-dropdown__trigger')
		.click();

	// Logout
	if (asTeacher) {
		await page
			.locator(
				'div.u-mq-switch-main-nav-authentication > ul > li > div.c-dropdown__content-open > div > div:nth-child(5)'
			)
			.click();
	} else {
		await page
			.locator(
				'div.u-mq-switch-main-nav-authentication > ul > li > div.c-dropdown__content-open > div > div:nth-child(3)'
			)
			.click();
	}
	// T26 beheer fails here, why
	await page.waitForTimeout(2000);
	await page.waitForLoadState('networkidle');

	// Check navbar exists, logged out
	await expect(page.getByRole('link', { name: 'Mijn werkruimte' })).not.toBeVisible();
	await expect(page.getByText('Inloggen', { exact: true })).toBeVisible();
}
