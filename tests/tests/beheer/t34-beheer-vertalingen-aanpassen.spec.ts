import { expect, test } from '@playwright/test'

import { goToAdminPage } from '../../helpers/go-to-admin'

/**
 * New: https://docs.google.com/spreadsheets/d/1sy6q3Q6Hl3LhvXY4JeCblhh4-REj8gyzAzyYwQVZZxc/edit#gid=95954947
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test('T34: Beheer - Vertalingen aanpassen', async ({ page }) => {
  await goToAdminPage(page)

  // Click on translations tab
  await page.getByRole('link', { name: 'Vertalingen' }).click()
  await expect(
    page.getByRole('heading', { name: 'Vertalingen', exact: true }),
  ).toBeVisible()
  await page.waitForTimeout(2000)

  // Check that translations are shown in a table
  const rows = await page.locator('tbody > tr').count()
  expect(rows).toBeGreaterThan(1)
  await page.waitForTimeout(1000)

  // Search translation
  await page.locator('input[type="search"]').fill('database is mislukt')
  await page.waitForTimeout(2000)

  // Check that 1 translation is shown in table
  const rowsAfterSearch = await page.locator('tbody > tr').count()
  expect(rowsAfterSearch).toEqual(1)
  await page.waitForTimeout(1000)

  // Check translation
  await expect(
    page.getByText(
      'Registratie is mislukt, het aanmaken van de gebruiker in de database is mislukt',
      { exact: true },
    ),
  ).toBeVisible()

  // Select translation
  await page.locator('tbody > tr > td:nth-child(2)').click()
  await page.waitForTimeout(1000)

  // Check modal opens
  await expect(
    page.getByRole('heading', { name: 'Vertaling aanpassen' }),
  ).toBeVisible()

  // Edit translation
  await page
    .locator('div.DraftEditor-editorContainer > div[contenteditable="true"]')
    .fill(
      'Registratie is mislukt, het aanmaken van de gebruiker in de database is mislukt. test',
    )
  await page.waitForTimeout(1000)

  // Confirm
  await page.getByRole('button', { name: 'Bewaar wijzigingen' }).click()
  await page.waitForTimeout(2000)

  // Check toast message was succesful
  await expect(
    page
      .getByRole('alert')
      .locator('div')
      .filter({ hasText: 'GeluktDe vertaling is' })
      .first(),
  ).toBeVisible()

  // Check translation
  await expect(
    page.getByText(
      'Registratie is mislukt, het aanmaken van de gebruiker in de database is mislukt',
      { exact: true },
    ),
  ).not.toBeVisible()
  await expect(
    page.getByText(
      'Registratie is mislukt, het aanmaken van de gebruiker in de database is mislukt. test',
      { exact: true },
    ),
  ).toBeVisible()

  // CLEANUP
  // Edit translation back to original
  // Select translation
  await page.locator('tbody > tr > td:nth-child(2)').click()
  await page.waitForTimeout(1000)

  // Check modal opens
  await expect(
    page.getByRole('heading', { name: 'Vertaling aanpassen' }),
  ).toBeVisible()

  // Edit translation
  await page
    .locator('div.DraftEditor-editorContainer > div[contenteditable="true"]')
    .fill(
      'Registratie is mislukt, het aanmaken van de gebruiker in de database is mislukt',
    )
  await page.waitForTimeout(1000)

  // Confirm
  await page.getByRole('button', { name: 'Bewaar wijzigingen' }).click()
  await page.waitForTimeout(2000)

  // Check toast message was succesful
  await expect(
    page
      .getByRole('alert')
      .locator('div')
      .filter({ hasText: 'GeluktDe vertaling is' })
      .first(),
  ).toBeVisible()

  // Check translation
  await expect(
    page.getByText(
      'Registratie is mislukt, het aanmaken van de gebruiker in de database is mislukt',
      { exact: true },
    ),
  ).toBeVisible()
  await expect(
    page.getByText(
      'Registratie is mislukt, het aanmaken van de gebruiker in de database is mislukt. test',
      { exact: true },
    ),
  ).not.toBeVisible()
})
