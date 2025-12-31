import { expect, type Page } from '@playwright/test';

export async function loginOnderwijsAvo(
  page: Page,
  url: string = process.env.TEST_CLIENT_ENDPOINT as string,
  username: string,
  password: string,
  asTeacher = true,
): Promise<void> {
  // Go to the avo homepage and wait for results to load
  await page.goto(url);

  // Check navbar exists, not logged in
  await expect(
    page.getByRole('link', { name: 'Projecten', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Inloggen', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Mijn werkruimte' }),
  ).not.toBeVisible();

  // Click log in button
  await page.getByText('Inloggen', { exact: true }).click();

  if (asTeacher) {
    await page.click('div[data-id="lesgever"]');
  } else {
    await page.click('div[data-id="leerling"]');
  }

  // Check auth modal opens up
  if (asTeacher) {
    await expect(
      page.getByRole('heading', { name: 'Log in als lesgever met:' }),
    ).toBeVisible();
  } else {
    await expect(
      page.getByRole('heading', { name: 'Log in als leerling met:' }),
    ).toBeVisible();
  }

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
  await expect(
    page.getByRole('link', { name: 'Mijn werkruimte' }),
  ).toBeVisible();
  await expect(page.getByText('Inloggen', { exact: true })).not.toBeVisible();
}
