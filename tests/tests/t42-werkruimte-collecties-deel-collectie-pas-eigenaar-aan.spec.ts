import { expect, test } from '@playwright/test'

import { createCollection } from '../helpers/create-collection'
import { getCollectionInviteToken } from '../helpers/get-collection-invite-token'
import { goToPageAndAcceptCookies } from '../helpers/go-to-page-and-accept-cookies'
import { loginOnderwijsAvo } from '../helpers/login-onderwijs-avo'
import { logoutOnderwijsAvo } from '../helpers/logout-onderwijs-avo'

/**
 * New: https://docs.google.com/spreadsheets/d/1IvhK0v0HSntCwTcXiFseHargwwWwpoCkDMjmMehaDMA/edit#gid=0
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test('T42: Werkruimte - collecties: Deel collectie en pas eigenaar aan', async ({
  page,
}) => {
  const clientEndpoint = process.env.TEST_CLIENT_ENDPOINT as string
  const educatieveAuteur = process.env.TEST_EDUCATIEVE_AUTEUR_USER as string
  const educatieveAuteurPass = process.env.TEST_EDUCATIEVE_AUTEUR_PASS as string

  await goToPageAndAcceptCookies(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_CLIENT_TITLE as string,
  )

  await loginOnderwijsAvo(
    page,
    clientEndpoint,
    process.env.TEST_BASIS_GEBRUIKER_USER as string,
    process.env.TEST_BASIS_GEBRUIKER_PASS as string,
  )

  const collectionTitle = await createCollection(page)

  // Go to werkruimte
  await page.getByRole('link', { name: 'Mijn werkruimte' }).click()
  await page.waitForLoadState('networkidle')

  // Check new collection is shown
  // Slicing because title is cut off at 60 characters,
  // and last 3 characters are swapped with periods
  const collectionTitleInOverview = collectionTitle.slice(0, 57) + '...'

  await expect(
    page.getByRole('link', { name: collectionTitleInOverview }),
  ).toBeVisible()

  // Click on the above link
  await page.getByRole('link', { name: collectionTitleInOverview }).click()

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
  await page.waitForLoadState('networkidle')
  await page.getByText('Bewerker', { exact: true }).click()
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Voeg toe', exact: true }).click()
  await page.waitForLoadState('networkidle')

  // Check toast message was succesful
  await expect(
    page.getByText('Uitnodiging tot samenwerken is verstuurd'),
  ).toBeVisible()

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

  // Go to werkruimte as other user and check new collection
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
    process.env.TEST_BASIS_GEBRUIKER_USER as string,
    process.env.TEST_BASIS_GEBRUIKER_PASS as string,
  )

  // Go to werkruimte as other user and check new collection
  await page.getByRole('link', { name: 'Mijn werkruimte' }).click()
  await page.waitForLoadState('networkidle')
  await expect(
    page.getByRole('link', { name: collectionTitleInOverview }),
  ).toBeVisible()

  // Click on the above link
  await page.getByRole('link', { name: collectionTitleInOverview }).click()
  await page.waitForLoadState('networkidle')

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
  await expect(
    page.getByText('Eigenaarschap succesvol overgedragen'),
  ).toBeVisible()

  // CLEANUP
  //REMOVE COLLECTION
  // Go to werkruimte
  await page.getByRole('link', { name: 'Mijn werkruimte' }).click()
  await page.waitForLoadState('networkidle')

  // Open options of the newly created collection
  await page
    .locator(
      'tr:nth-child(1) > td:nth-child(6) > div > div.c-dropdown__trigger > button',
    )
    .click()

  // Click 'Verwijderen'
  await page
    .locator(
      'tr:nth-child(1) > td:nth-child(6) > div > div.c-dropdown__content-open > div > div:nth-child(3)',
    )
    .click()

  // Confirm remove modal
  await page.getByRole('button', { name: 'Verwijder' }).click()
  await page.waitForLoadState('networkidle')

  // Check new collection is removed
  await expect(
    page.getByRole('link', { name: collectionTitleInOverview }),
  ).not.toBeVisible()

  // Logout
  await logoutOnderwijsAvo(page)
  await page.waitForTimeout(1000)

  // Login as other user
  await loginOnderwijsAvo(
    page,
    clientEndpoint,
    educatieveAuteur,
    educatieveAuteurPass,
  )

  // Go to werkruimte
  await page.getByRole('link', { name: 'Mijn werkruimte' }).click()
  await page.waitForLoadState('networkidle')

  // Open options of the newly created collection
  await page
    .locator(
      'tr:nth-child(1) > td:nth-child(6) > div > div.c-dropdown__trigger > button',
    )
    .click()

  // Click 'Verwijderen'
  await page
    .locator(
      'tr:nth-child(1) > td:nth-child(6) > div > div.c-dropdown__content-open > div > div:nth-child(3)',
    )
    .click()
  await page.waitForLoadState('networkidle')

  // Confirm remove modal
  await page.getByRole('button', { name: 'Verwijder' }).click()
  await page.waitForLoadState('networkidle')

  // Check new collection is removed
  await expect(
    page.getByRole('link', { name: collectionTitleInOverview }),
  ).not.toBeVisible()
  // // Wait for close to save the videos
  // await context.close();
})
