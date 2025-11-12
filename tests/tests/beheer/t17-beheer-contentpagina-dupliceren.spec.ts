import { expect, test } from '@playwright/test'

import { goToAdminPage } from '../../helpers/go-to-admin'

/**
 * New: https://docs.google.com/spreadsheets/d/1sy6q3Q6Hl3LhvXY4JeCblhh4-REj8gyzAzyYwQVZZxc/edit#gid=95954947
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test('T17: Beheer - Contentpagina dupliceren', async ({ page }) => {
  await goToAdminPage(page)

  // Click on contentpages tab
  await page.getByRole('link', { name: "Contentpagina's" }).click()
  await expect(
    page.getByRole('heading', { name: 'Contentoverzicht', exact: true }),
  ).toBeVisible()

  await page.waitForTimeout(1000)

  // Click on add page
  await page.getByRole('button', { name: 'Pagina toevoegen' }).click()

  // Check we are on the create content page
  await expect(
    page.getByRole('heading', { name: 'Content toevoegen', exact: true }),
  ).toBeVisible()

  // Open publication details tab
  await page.getByText('Publicatiedetails').click()

  // Create new page title
  const date = new Date()
  const pageTitle = 'Automatische test ' + date
  const hyperlinkTitle = '/automatische-test'

  // Fill in title
  await page.getByRole('textbox').nth(1).fill(pageTitle)

  await page.waitForTimeout(1000)

  // Check hyperlink is shown
  await page
    .locator(
      'div.c-content-edit-form.o-form-group-layout > div > div:nth-child(7) > div > div > input',
    )
    .scrollIntoViewIfNeeded()

  const inputValue = await page
    .locator(
      'div.c-content-edit-form.o-form-group-layout > div > div:nth-child(7) > div > div > input',
    )
    .getAttribute('value')
  expect(inputValue).toContain(hyperlinkTitle)

  await page.waitForTimeout(1000)

  // Save page
  await page.getByRole('button', { name: 'Opslaan', exact: true }).click()

  // Check toast
  await expect(
    page.locator(
      'div > div.Toastify__toast-body > div > div > div.c-alert__message',
    ),
  ).toContainText('Het content-item is succesvol opgeslagen.')

  // Check page title
  await expect(page.locator('h2.c-admin__page-title')).toContainText(
    'Content: Automatische test',
  )

  // Check edit button is shown
  await expect(
    page.getByRole('button', { name: 'Bewerken', exact: true }),
  ).toBeVisible()

  await page.waitForTimeout(3000)

  // Go back
  await page.locator('div.c-admin__back > button').click()
  await page.waitForTimeout(1000)

  // Go back to overview
  await page.locator('div.c-admin__back > button').click()
  await expect(
    page.getByRole('heading', { name: 'Contentoverzicht', exact: true }),
  ).toBeVisible()

  // Check new page is in overview list
  // Slicing because title is cut off at 60 characters,
  // and last 3 characters are swapped with periods
  const pageTitleInOverview = pageTitle.slice(0, 57) + '...'
  await expect(
    page.getByRole('link', { name: pageTitleInOverview }),
  ).toBeVisible()
  await page.waitForTimeout(1000)

  // Open newly created page
  await page.getByRole('link', { name: pageTitleInOverview }).click()

  // Check page title
  await expect(page.locator('h2.c-admin__page-title')).toContainText(
    'Content: Automatische test',
  )

  // Click more options button
  await page.locator('button[aria-label="Meer opties"]').click()
  await page.waitForTimeout(1000)
  await page
    .locator('div.c-dropdown__content-open > div > div:nth-child(1)', {
      hasText: 'Dupliceer',
    })
    .click()

  await page.waitForTimeout(2000)

  // Check toast
  await expect(
    page.locator(
      'div > div.Toastify__toast-body > div > div > div.c-alert__message',
    ),
  ).toContainText('De contentpagina is gedupliceerd.')

  // Check page title starts with Kopie
  await expect(page.locator('h2.c-admin__page-title')).toContainText(
    'Content: Kopie 1: Automatische test',
  )

  // CLEANUP
  // Remove page (on the detail page the more options dropdown is not completely shown, and so does not work)
  // Open newly created page
  // await page.getByRole('link', { name: pageTitleInOverview }).click();

  // // Check page title
  // await expect(page.locator('h2.c-admin__page-title')).toContainText(
  // 	'Content: Automatische test'
  // );

  // await page.locator('button[aria-label="Meer opties"]').click();
  // await page.waitForTimeout(1000);
  // await page.locator('div.c-dropdown__content-open > div > div:nth-child(2)').click();
  // await page.getByText('Verwijderen', { exact: true }).click();

  // Go back
  await page.locator('div.c-admin__back > button').click()

  // Go back to overview
  await page.locator('div.c-admin__back > button').click()
  await page.waitForTimeout(1000)
  await expect(
    page.getByRole('heading', { name: 'Contentoverzicht', exact: true }),
  ).toBeVisible()

  // Remove copied page
  await page
    .locator(
      'table > tbody > tr:nth-child(1) > td:nth-child(9) > div > button[aria-label="Verwijder content"]',
    )
    .click()
  await page.waitForTimeout(1000)

  // Check modal opens
  await expect(
    page.getByRole('heading', {
      name: 'Ben je zeker dat je deze actie wil uitvoeren?',
    }),
  ).toBeVisible()

  // Confirm to remove page
  await page.getByRole('button', { name: 'Verwijder', exact: true }).click()
  await page.waitForTimeout(2000)

  // Check page is removed
  const copiedPageTitle = 'Kopie 1: ' + pageTitle
  const copiedPageTitleInOverview = copiedPageTitle.slice(0, 57) + '...'
  await expect(
    page.locator('div.Toastify__toast-body > div > div > div.c-alert__message'),
  ).toContainText('Het content-item is succesvol verwijderd.')
  await expect(
    page.getByRole('link', { name: copiedPageTitleInOverview }),
  ).not.toBeVisible()

  // Remove first page also
  await page
    .locator(
      'table > tbody > tr:nth-child(1) > td:nth-child(9) > div > button[aria-label="Verwijder content"]',
    )
    .click()

  // Check modal opens
  await expect(
    page.getByRole('heading', {
      name: 'Ben je zeker dat je deze actie wil uitvoeren?',
    }),
  ).toBeVisible()

  // Confirm to remove page
  await page.getByRole('button', { name: 'Verwijder', exact: true }).click()

  // Check page is removed
  await expect(
    page.locator(
      'div:nth-child(2) > .Toastify__toast-body > div > div > div.c-alert__message',
    ),
  ).toContainText('Het content-item is succesvol verwijderd.')
  await expect(
    page.getByRole('link', { name: pageTitleInOverview }),
  ).not.toBeVisible()

  await page.waitForTimeout(2000)
})
