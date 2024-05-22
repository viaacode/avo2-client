import { expect, type Locator, test } from '@playwright/test';

import { goToPageAndAcceptCookies } from '../helpers/go-to-page-and-accept-cookies';
import { loginOnderwijsAvo } from '../helpers/login-onderwijs-avo';

/**
 * New: https://docs.google.com/spreadsheets/d/1IvhK0v0HSntCwTcXiFseHargwwWwpoCkDMjmMehaDMA/edit#gid=0
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test('T01: Inloggen basisgebruiker', async ({ page }) => {
	await goToPageAndAcceptCookies(
		page,
		process.env.TEST_CLIENT_ENDPOINT as string,
		process.env.TEST_CLIENT_TITLE as string
	);

	await loginOnderwijsAvo(
		page,
		process.env.TEST_CLIENT_ENDPOINT as string,
		process.env.TEST_LEERLING_LAGER_GEBRUIKER_USER as string,
		process.env.TEST_LEERLING_LAGER_GEBRUIKER_PASS as string
	);

	await page.waitForLoadState('networkidle');
	await page.goto(`${process.env.TEST_CLIENT_ENDPOINT}accepteer-voorwaarden`);
	await page.waitForLoadState('networkidle');

	const heading = page.locator('.o-app .o-container .c-heading').first();
	const intro = page.locator('.o-app .o-container .c-rich-text-block').nth(0);
	const video = page.locator('.o-app .o-container .c-video-player').first();
	const outro = page.locator('.o-app .o-container .c-rich-text-block').nth(0);
	const button = page.locator('.o-app .u-spacer-bottom-l .c-button').first();

	await scrollToAndCheckVisible(heading);
	await scrollToAndCheckVisible(intro);
	await scrollToAndCheckVisible(video);
	await scrollToAndCheckVisible(outro);
	await scrollToAndCheckVisible(button);

	// // Wait for close to save the videos
	// await context.close();
});

async function scrollToAndCheckVisible(locator: Locator) {
	await locator.scrollIntoViewIfNeeded();
	expect(await locator.isVisible()).toEqual(true);
}
