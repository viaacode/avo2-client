import { expect, type Page, test } from '@playwright/test';

import { cleanupTestdata } from '../helpers/cleanup';
import { goToPageAndAcceptCookies } from '../helpers/go-to-page-and-accept-cookies';
import { loginOnderwijsAvo } from '../helpers/login-onderwijs-avo';
import { logoutOnderwijsAvo } from '../helpers/logout-onderwijs-avo'; /**
 * This test requires `PROXY_E2E=true`
 * https://github.com/viaacode/avo2-proxy/commit/ae4e79f3b1c4826f5c81ba570b15d904990d43b7
 * https://github.com/viaacode/avo2-proxy/commit/9b9b740fea4b66478d850da4de8a1d74da8d845e
 */

/**
 * This test requires `PROXY_E2E=true`
 * https://github.com/viaacode/avo2-proxy/commit/ae4e79f3b1c4826f5c81ba570b15d904990d43b7
 * https://github.com/viaacode/avo2-proxy/commit/9b9b740fea4b66478d850da4de8a1d74da8d845e
 */

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    console.error(`Did not run as expected`);
    await cleanupTestdata(page);
  }
});

test('T65: opdracht delen van lesgever lager naar lesgever secundair', async ({
  page,
}) => {
  await shareAssignmentAndAccept(
    page,
    {
      user: process.env.TEST_LESGEVER_LAGER_GEBRUIKER_USER as string,
      pass: process.env.TEST_LESGEVER_LAGER_GEBRUIKER_PASS as string,
    },
    {
      user: process.env.TEST_LESGEVER_SECUNDAIR_GEBRUIKER_USER as string,
      pass: process.env.TEST_LESGEVER_SECUNDAIR_GEBRUIKER_PASS as string,
    },
    false,
  );
});

test('T65: opdracht delen van lesgever secundair naar lesgever lager', async ({
  page,
}) => {
  await shareAssignmentAndAccept(
    page,
    {
      user: process.env.TEST_LESGEVER_SECUNDAIR_GEBRUIKER_USER as string,
      pass: process.env.TEST_LESGEVER_SECUNDAIR_GEBRUIKER_PASS as string,
    },
    {
      user: process.env.TEST_LESGEVER_LAGER_GEBRUIKER_USER as string,
      pass: process.env.TEST_LESGEVER_LAGER_GEBRUIKER_PASS as string,
    },
    false,
  );
});

test('T65: opdracht delen van lesgever lager naar lesgever beide', async ({
  page,
}) => {
  await shareAssignmentAndAccept(
    page,
    {
      user: process.env.TEST_LESGEVER_LAGER_GEBRUIKER_USER as string,
      pass: process.env.TEST_LESGEVER_LAGER_GEBRUIKER_PASS as string,
    },
    {
      user: process.env.TEST_LESGEVER_BEIDE_GEBRUIKER_USER as string,
      pass: process.env.TEST_LESGEVER_BEIDE_GEBRUIKER_PASS as string,
    },
    true,
  );
});

test('T65: opdracht delen van lesgever secundair naar lesgever beide', async ({
  page,
}) => {
  await shareAssignmentAndAccept(
    page,
    {
      user: process.env.TEST_LESGEVER_SECUNDAIR_GEBRUIKER_USER as string,
      pass: process.env.TEST_LESGEVER_SECUNDAIR_GEBRUIKER_PASS as string,
    },
    {
      user: process.env.TEST_LESGEVER_BEIDE_GEBRUIKER_USER as string,
      pass: process.env.TEST_LESGEVER_BEIDE_GEBRUIKER_PASS as string,
    },
    true,
  );
});

async function createAssignmentWithTitle(page: Page) {
  // Click mijn werkruimte
  await page.getByRole('link', { name: 'Mijn werkruimte' }).click();

  // Go to assignments tab
  await page.click('div[data-id="opdrachten"]');

  // Create new assignment
  await page.getByRole('button', { name: 'Nieuwe opdracht' }).click();

  // Check if banner appeared
  await expect(page.locator('div.c-sticky-bar')).toContainText(
    'Wijzigingen opslaan?',
  );

  await page.waitForTimeout(1000);

  // Save changes
  await page.getByRole('button', { name: 'Opslaan' }).click();

  // Edit assignment
  await page.getByRole('button', { name: 'Bewerken' }).click();

  // Open input title
  await page
    .locator(
      'div.o-container-vertical.o-container-vertical--small > div > div > div.c-toolbar__left > div > div > h2 > div > div',
    )
    .nth(1)
    .click();

  // Enter title
  const date = new Date();
  const assignmentTitle = 'Aangemaakt door automatische test ' + date;
  await page
    .locator('input[placeholder="Geef een titel in"]')
    .nth(1)
    .fill(assignmentTitle);
  await page.click('div.c-content-input__submit');

  await page.waitForTimeout(1000);

  // Save changes
  await page.getByRole('button', { name: 'Opslaan' }).click();

  return page.url();
}

async function goToShareWithColleagues(page: Page) {
  // Click "Delen"
  await page.click(
    'div.u-hide-lt-bp2 > div > div.o-container-vertical.o-container-vertical--small > div > div > div.c-toolbar__right > div > div.u-hide-lt-bp2 > div > div.c-share-dropdown.c-dropdown.c-dropdown__trigger > button',
  );

  // Click "Collega's"
  await page.click(
    '.c-share-dropdown + .c-dropdown__content-open .c-tab-item:first-child',
  );

  await page.waitForTimeout(1000);
}

async function shareAssignmentWith(page: Page, email: string, role = 1) {
  // enter contributor email
  await page
    .locator(
      '.c-share-dropdown + .c-dropdown__content-open .c-add-colleague input',
    )
    .nth(0)
    .fill(email);

  // open role selection
  await page.click(
    '.c-share-dropdown + .c-dropdown__content-open .c-add-colleague .c-dropdown__trigger',
  );

  await page.click(
    `.c-share-dropdown + .c-dropdown__content-open .c-add-colleague .c-dropdown__content-open .c-menu__item:nth-child(${role})`,
  );

  await page.waitForTimeout(1000);

  // submit add contributor
  await page.click(
    '.c-share-dropdown + .c-dropdown__content-open .c-add-colleague__button',
  );

  // confirm warning
  await page.click(
    '.c-modal-context--visible .c-button-toolbar .c-button--primary',
  );

  await page.waitForTimeout(5000);
}

async function acceptAssignmentInvitation(page: Page, assignmentId: string) {
  // Go to assignment page with token
  await page.goto(
    `${process.env.TEST_CLIENT_ENDPOINT}opdrachten/${assignmentId}?inviteToken=${assignmentId}`,
  );

  await page.waitForTimeout(1000);

  // click "Toevoegen"
  await page.click('.c-sticky-bar__cta ~ button:nth-child(3)');
}

async function shareAssignmentAndAccept(
  page: Page,
  from: { user: string; pass: string },
  to: { user: string; pass: string },
  shouldBeEditable?: boolean,
) {
  const url = process.env.TEST_CLIENT_ENDPOINT as string;
  const title = process.env.TEST_CLIENT_TITLE as string;

  await goToPageAndAcceptCookies(page, url, title);

  await loginOnderwijsAvo(page, url, from.user, from.pass);

  const assignmentUrl = await createAssignmentWithTitle(page);
  const assignmentId = assignmentUrl.match(/opdrachten\/(.*)\/bewerk/)?.[1];

  expect(assignmentId).toBeTruthy();

  await page.waitForTimeout(5000);

  await goToShareWithColleagues(page);
  await shareAssignmentWith(page, to.user);

  await logoutOnderwijsAvo(
    page,
    from.user ===
      (process.env.TEST_LESGEVER_SECUNDAIR_GEBRUIKER_USER as string),
  );

  await loginOnderwijsAvo(page, url, to.user, to.pass);

  await acceptAssignmentInvitation(page, assignmentId as string);

  // Check "Bewerken" button
  await expect(page.locator('.c-header .c-button--primary').nth(0)).toBeVisible(
    {
      visible: shouldBeEditable,
    },
  );
}
