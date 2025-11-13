import { expect, test } from '@playwright/test'

import { cleanupTestdata } from '../../helpers/cleanup';
import { createCollection } from '../../helpers/create-collection';
import { getCollectionInviteToken } from '../../helpers/get-collection-invite-token';
import { goToPageAndAcceptCookies } from '../../helpers/go-to-page-and-accept-cookies';
import { loginOnderwijsAvo } from '../../helpers/login-onderwijs-avo';
import { logoutOnderwijsAvo } from '../../helpers/logout-onderwijs-avo';

/**
 * New: https://docs.google.com/spreadsheets/d/1IvhK0v0HSntCwTcXiFseHargwwWwpoCkDMjmMehaDMA/edit#gid=0
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    console.error(`Did not run as expected`)
    await cleanupTestdata(page)
  }
})

test('T26: Beheer - collectiebeheer: Deel collectie', async ({ page }) => {
  const clientEndpoint = process.env.TEST_CLIENT_ENDPOINT as string
  const educatieveAuteur = process.env.TEST_EDUCATIEVE_AUTEUR_USER as string
  const educatieveAuteurPass = process.env.TEST_EDUCATIEVE_AUTEUR_PASS as string

  await goToPageAndAcceptCookies(
    page,
    clientEndpoint,
    process.env.TEST_CLIENT_TITLE as string,
  )

  await loginOnderwijsAvo(
    page,
    clientEndpoint,
    process.env.TEST_BASIS_GEBRUIKER_USER as string,
    process.env.TEST_BASIS_GEBRUIKER_PASS as string,
  )

  const collectionTitle = await createCollection(page)

  // Logout
  await page.goto(process.env.TEST_CLIENT_ENDPOINT as string)
  await logoutOnderwijsAvo(page)

  // Login as admin
  await loginOnderwijsAvo(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_ADMIN_USER as string,
    process.env.TEST_ADMIN_PASS as string,
  )
  // Go to admin page
  await page.getByRole('link', { name: 'Beheer' }).click()
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  // Click on collection tab
  await page.getByRole('link', { name: 'Collectiebeheer' }).click()
  await page.waitForLoadState('networkidle')
  await expect(
    page.getByRole('heading', { name: 'Collecties', exact: true }),
  ).toBeVisible()

  // Check new collection is shown
  // Slicing because title is cut off at 50 characters,
  // and last 3 characters are swapped with periods
  const collectionTitleInAdminOverview = collectionTitle.slice(0, 47) + '...'

  await expect(
    page.getByRole('link', { name: collectionTitleInAdminOverview }).first(),
  ).toBeVisible()

  // Open the collection

  await page.getByRole('link', { name: collectionTitleInAdminOverview }).click()
  await page.waitForLoadState('networkidle')

  // Check collection opens
  await expect(
    page.getByRole('heading', { name: 'Over deze collectie' }),
  ).toBeVisible()

  // Click share button
  await page.click(
    `button[aria-label="Deel de collectie met collega's (kijken of bewerken)"]`,
  )

  await page.fill('input[placeholder="E-mailadres"]', educatieveAuteur)

  await page.getByRole('button', { name: 'Rol' }).click()

  await page.getByText('Bewerker', { exact: true }).click()
  await page.waitForTimeout(3000)
  await page.getByRole('button', { name: 'Voeg toe', exact: true }).click()
  await page.waitForLoadState('networkidle')

  // Check toast message was succesful
  await expect(
    page.locator(
      'div > div.Toastify__toast-body > div > div > div.c-alert__message',
    ),
  ).toContainText('Uitnodiging tot samenwerken is verstuurd')

  // Check email is shown pending
  const emailPending = educatieveAuteur + ' (pending)'
  await expect(page.getByText(emailPending)).toBeVisible()

  const collectionId = page.url().split('/').reverse()[0]

  // Get inviteToken
  const emailInviteToken = await getCollectionInviteToken(
    collectionId,
    educatieveAuteur,
  )
  const acceptInviteUrl =
    clientEndpoint +
    `collecties/${collectionId}?inviteToken=${emailInviteToken}`

  // Logout
  await logoutOnderwijsAvo(page)
  await page.waitForLoadState('networkidle')

  // Login as other user
  await loginOnderwijsAvo(
    page,
    clientEndpoint,
    educatieveAuteur,
    educatieveAuteurPass,
  )

  // Go to invite url
  await page.goto(acceptInviteUrl)
  await expect(page.locator('strong.c-sticky-bar__cta')).toContainText(
    `Wil je de collectie ‘${collectionTitle}’ toevoegen aan je Werkruimte?`,
  )

  // Accept invite
  await page.getByRole('button', { name: 'Toevoegen', exact: true }).click()
  await page.waitForLoadState('networkidle')

  // Check new collection is shown
  // Slicing because title is cut off at 60 characters,
  // and last 3 characters are swapped with periods
  const collectionTitleInOverview = collectionTitle.slice(0, 57) + '...'

  // Go to werkruimte as other user and check new collection
  await page.getByRole('link', { name: 'Mijn werkruimte' }).focus()
  await page.getByRole('link', { name: 'Mijn werkruimte' }).click()
  await page.waitForLoadState('networkidle')

  await expect(
    page.getByRole('link', { name: collectionTitleInOverview }),
  ).toBeVisible()

  // Logout
  await logoutOnderwijsAvo(page)
  await page.waitForLoadState('networkidle')

  // Login as first user
  await loginOnderwijsAvo(
    page,
    clientEndpoint,
    process.env.TEST_ADMIN_USER as string,
    process.env.TEST_ADMIN_PASS as string,
  )

  // Go to admin page
  await page.getByRole('link', { name: 'Beheer' }).click()
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  // Click on collection tab
  await page.getByRole('link', { name: 'Collectiebeheer' }).click()
  await page.waitForLoadState('networkidle')
  await expect(
    page.getByRole('heading', { name: 'Collecties', exact: true }),
  ).toBeVisible()

  // Check that new collection is shown in a table
  await expect(page.locator('tbody > tr').first()).toContainText(
    'Aangemaakt door',
  )
  // Check new collection is shown
  await expect(
    page.getByRole('link', { name: collectionTitleInAdminOverview }),
  ).toBeVisible()

  // Open the collection
  await page.getByRole('link', { name: collectionTitleInAdminOverview }).click()

  // Check collection opens
  await expect(
    page.getByRole('heading', { name: 'Over deze collectie' }),
  ).toBeVisible()

  // Click share button
  await page.click(
    `button[aria-label="Deel de collectie met collega's (kijken of bewerken)"]`,
  )

  // Edit added user
  await page
    .locator(
      'ul.c-colleagues-info-list > li:nth-child(2) > div.c-colleague-info-row__action > button:nth-child(1)',
    )
    .click()

  // Check modal opened
  await expect(
    page.getByRole('heading', { name: 'Rol van gebruiker aanpassen' }),
  ).toBeVisible()

  // Open dropdown
  await page.click('div.c-rights-select')

  // Select give ownership
  await page.getByText('Eigenaarschap overdragen').click()

  // Confirm
  await page.getByRole('button', { name: 'Bevestigen' }).click()
  await page.waitForLoadState('networkidle')

  // Check toast message was succesful
  // await expect(page.getByText('Eigenaarschap succesvol overgedragen')).toBeVisible({
  // 	timeout: TIMEOUT_SECONDS,
  // });

  // CLEANUP
  //REMOVE COLLECTION
  await page.getByRole('link', { name: 'Beheer' }).click()
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  // Click on collection tab
  await page.getByRole('link', { name: 'Collectiebeheer' }).click()
  await page.waitForLoadState('networkidle')
  await expect(
    page.getByRole('heading', { name: 'Collecties', exact: true }),
  ).toBeVisible()

  // Check new collection is shown
  await expect(
    page.getByRole('link', { name: collectionTitleInAdminOverview }),
  ).toBeVisible()

  // Open the collection
  await page.getByRole('link', { name: collectionTitleInAdminOverview }).click()

  // Check collection opens
  await expect(
    page.getByRole('heading', { name: 'Over deze collectie' }),
  ).toBeVisible()

  // Click more options
  await page.locator('button[aria-label="Meer opties"]').click()

  // Click remove
  await page.getByText('Verwijderen', { exact: true }).click()
  await page.waitForLoadState('networkidle')

  // Check remove modal opens
  await expect(
    page.getByRole('heading', {
      name: 'Verwijder deze collectie',
      exact: true,
    }),
  ).toBeVisible()

  // Confirm remove modal
  await page.getByRole('button', { name: 'Verwijder' }).click()

  // Check toast
  await expect(
    page.getByText('De collectie werd succesvol verwijderd.'),
  ).toBeVisible()
})
