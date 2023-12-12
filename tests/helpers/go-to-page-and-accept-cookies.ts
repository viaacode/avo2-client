import { Page } from '@playwright/test';

declare const document: any;

export async function goToPageAndAcceptCookies(
	page: Page,
	url: string = process.env.TEST_CLIENT_ENDPOINT as string,
	title = 'Audiovisuele beeldbank voor leerkrachten | Het Archief voor Onderwijs',
	whichCookies: 'all' | 'selection' = 'all'
): Promise<void> {
	// Go to the avo homepage and wait for results to load
	await page.goto(url);

	// Check page title is the home page
	await page.waitForFunction((title: string) => document.title === title, title, {
		timeout: 10000,
	});

	// await page.waitForFunction(() => document.title === 'wacht effe', title, {
	// 	timeout: 500000,
	// });

	// Check if cookiebot opens
	// const cookiebotDialog = page.locator('#CybotCookiebotDialogBody');

	// if ((await cookiebotDialog.count()) > 0) {
	// 	if (whichCookies === 'selection') {
	// 		// Accept selected cookies
	// 		await page
	// 			.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection')
	// 			.click();
	// 	} else {
	// 		// Accept selected cookies
	// 		await page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll').click();
	// 	}
	// }

	// wait for animation
	await page.waitForTimeout(1000);
	await page.getByRole('link', { name: 'Alle cookies toestaan' }).click();
	// wait for animation
	await page.waitForTimeout(1000);
}
