import { expect, test } from '@playwright/test'

import { goToPageAndAcceptCookies } from '../helpers/go-to-page-and-accept-cookies'
import { goToVideoDetailPage } from '../helpers/go-to-video-detail-page'
import { loginOnderwijsAvo } from '../helpers/login-onderwijs-avo'
import { logoutOnderwijsAvo } from '../helpers/logout-onderwijs-avo'

/**
 * New: https://docs.google.com/spreadsheets/d/1IvhK0v0HSntCwTcXiFseHargwwWwpoCkDMjmMehaDMA/edit#gid=0
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test('T31: Fragment detail - Maak sneldeellink voor leerling met beschrijving', async ({
  page,
}) => {
  await goToPageAndAcceptCookies(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_CLIENT_TITLE as string,
  )

  // Login as Educatieve auteur
  await loginOnderwijsAvo(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_EDUCATIEVE_AUTEUR_USER as string,
    process.env.TEST_EDUCATIEVE_AUTEUR_PASS as string,
  )

  // Go to video detail page
  await goToVideoDetailPage(page)

  // Click Deel met leerlingen
  await page.click("button[aria-label='Deel dit met alle leerlingen.']")

  // Check modal opens
  await expect(
    page.getByRole('heading', { name: 'Deel met leerlingen' }),
  ).toBeVisible()

  // Click copy url button
  await page.getByRole('button', { name: 'Kopieer link' }).click()

  // Copy url because pasting from clipboard does not work with auto tests?
  const copyStudentUrl = await page
    .locator('div.m-quick-lane-modal__link > a')
    .textContent()

  // Close modal
  await page
    .locator(
      'div.m-quick-lane-modal.c-modal-context.c-modal-context--visible > div > div.c-modal__header.c-modal__header--bordered > div > div.c-toolbar__right > div > button',
    )
    .click()

  // Check modal closed
  await expect(
    page.getByRole('heading', { name: 'Deel dit fragment' }),
  ).not.toBeVisible()

  // Logout
  await logoutOnderwijsAvo(page)
  await page.waitForLoadState('networkidle')

  // Login as student
  await loginOnderwijsAvo(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_LEERLING_GEBRUIKER_USER as string,
    process.env.TEST_LEERLING_GEBRUIKER_PASS as string,
  )
  await page.waitForLoadState('networkidle')

  // Go to the copied link and wait for results to load
  // Pasting from clipboard does not work with auto tests?
  // const url = await navigator.clipboard.readText();
  // await page.goto(url);
  copyStudentUrl && (await page.goto(copyStudentUrl))
  await page.waitForLoadState('networkidle')

  // Check video detail page is shown
  await expect(
    page.getByRole('heading', { name: 'Journaal: dag van de Mantelzorg' }),
  ).toBeVisible()

  // // Wait for close to save the videos
  // await context.close();
})
