import { expect, Page } from '@playwright/test';

declare const document: any;

export async function goToPageAndAcceptCookies(
	page: Page,
	url: string = process.env.TEST_CLIENT_ENDPOINT as string,
	title = 'Audiovisuele beeldbank | Het Archief voor Onderwijs',
	whichCookies: 'all' | 'selection' = 'all'
): Promise<void> {
	// Go to the avo homepage and wait for results to load
	await page.goto(url);

	// Check page title is the home page
	await page.waitForFunction((title: string) => document.title === title, title, {
		timeout: 20000,
	});

	// Check navbar exists
	await expect(page.getByRole('link', { name: 'Projecten', exact: true })).toBeVisible();

	// Check cookiebot opens
	if (
		await page
			.getByRole('heading', { name: 'Deze website maakt gebruik van cookies' })
			.isVisible()
	) {
		await expect(
			page.getByRole('heading', { name: 'Deze website maakt gebruik van cookies' })
		).toBeVisible();

		// Accept all cookies
		await page.getByRole('link', { name: 'Alle cookies toestaan' }).click();
	}

	// Check if cookiebot disappeared
	await expect(
		page.getByRole('heading', { name: 'Deze website maakt gebruik van cookies' })
	).not.toBeVisible();
}
