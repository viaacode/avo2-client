import { expect, test } from '@playwright/test';

import { goToPageAndAcceptCookies } from '../helpers/go-to-page-and-accept-cookies';
import { loginOnderwijsAvo } from '../helpers/login-onderwijs-avo';

test('T64: Onderwijsniveau kiezen voor secundair onderwijs', async ({
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
    process.env.TEST_LESGEVER_SECUNDAIR_GEBRUIKER_USER as string,
    process.env.TEST_LESGEVER_SECUNDAIR_GEBRUIKER_PASS as string,
  );

  await page.waitForTimeout(2000);

  await page.goto(`${process.env.TEST_CLIENT_ENDPOINT}opdrachten/maak`);

  await page.waitForTimeout(2000);

  const modal = page
    .locator('.c-select-education-level--create .c-modal')
    .first();

  expect(await modal.isVisible()).toEqual(false);

  // // Wait for close to save the videos
  // await context.close();
});
