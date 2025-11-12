import { expect, test } from '@playwright/test'
import { v4 as uuid } from 'uuid'

import { goToPageAndAcceptCookies } from '../helpers/go-to-page-and-accept-cookies'

/**
 * New: https://docs.google.com/spreadsheets/d/1IvhK0v0HSntCwTcXiFseHargwwWwpoCkDMjmMehaDMA/edit#gid=0
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test.skip('T02: Nieuw account aanmaken', async ({ page }) => {
  const userId = uuid().replace(/-/g, '')
  const userEmail = `hetarchief2.0+atbasisgebruiker${userId}@meemoo.be`
  const userPassword = process.env.TEST_NEW_USER_PASSWORD as string
  const stamboekNummer = '97436428856'

  await goToPageAndAcceptCookies(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string, //TODO: use INT env so a dev version of captcha is used
    process.env.TEST_CLIENT_TITLE as string,
  )

  // Click log in button
  await page.getByText('Account aanmaken', { exact: true }).click()

  // Check flyout opens
  await expect(
    page.getByRole('heading', { name: 'Ben je lesgever?' }),
  ).toBeVisible()

  // Click create free teacher account button
  await page.getByRole('button', { name: 'Maak je gratis account aan' }).click()

  // Check teacher login page opens
  await expect(
    page.getByRole('heading', {
      name: 'Geef hieronder je lerarenkaart- of stamboeknummer in.',
    }),
  ).toBeVisible()

  // Fill in credentials
  await page.fill('div.m-stamboek-input > input', stamboekNummer)

  // Check teachernumber is correct
  await expect(
    page.getByText('Het stamboeknummer is geldig.', { exact: true }),
  ).toBeVisible()

  // Click create account button
  await page.getByRole('button', { name: 'Account aanmaken' }).click()

  // Check form page opens
  await expect(
    page.getByRole('heading', { name: 'Maak je gratis account aan' }),
  ).toBeVisible()

  // Fill in credentials
  await page.fill('#person_email', userEmail)
  await page.fill('#person_first_name', 'Automated')
  await page.fill('#person_last_name', 'Test')
  await page.fill('#password_field', userPassword)
  await page.fill('#password_confirmation_field', userPassword)

  await page.click('body')

  // Captcha
  const recapchaFrame = await page.frameLocator('iframe[title="reCAPTCHA"]')
  const recaptcha = recapchaFrame.locator('#recaptcha-anchor')
  await recaptcha.click()

  // Wait for recaptcha to show green checkmark
  const greenCheckmark = await recapchaFrame.locator(
    '.recaptcha-checkbox-checked',
  )
  await greenCheckmark.waitFor({
    timeout: 10000,
    state: 'visible',
  })

  // Accept the gdpr checkbox
  await page.locator('#person_confirm_gdpr').click()

  await page.waitForTimeout(2000)

  // // Wait for close to save the videos
  // await context.close();
})
