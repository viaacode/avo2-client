import { expect, test } from '@playwright/test';

import { goToPageAndAcceptCookies } from '../helpers/go-to-page-and-accept-cookies';
import { loginOnderwijsAvo } from '../helpers/login-onderwijs-avo';

test('T62: Onderwijsniveau kiezen voor beide onderwijsniveaus', async ({
  page,
}) => {
  await goToPageAndAcceptCookies(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_CLIENT_TITLE as string,
  );

  await loginOnderwijsAvo(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_LESGEVER_BEIDE_GEBRUIKER_USER as string,
    process.env.TEST_LESGEVER_BEIDE_GEBRUIKER_PASS as string,
  );

  await page.waitForTimeout(2000);

  await page.goto(`${process.env.TEST_CLIENT_ENDPOINT}opdrachten/maak`);

  await page.waitForTimeout(2000);

  const modal = page
    .locator('.c-select-education-level--create .c-modal')
    .first();

  expect(await modal.isVisible()).toEqual(true);

  // // Wait for close to save the videos
  // await context.close();
});
