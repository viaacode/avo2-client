import { expect, Page } from '@playwright/test'

import { goToVideoDetailPage } from './go-to-video-detail-page.js'

export async function createCollection(page: Page): Promise<string> {
  // Go to video detail page
  await goToVideoDetailPage(page)

  // Click cut and add to collection button
  await page.click("button[aria-label='Knip of voeg toe aan collectie']")

  // Check modal opens
  await page.waitForTimeout(1000)
  await expect(
    page.getByRole('heading', { name: 'Voeg dit fragment toe aan een' }),
  ).toContainText('Voeg dit fragment toe aan een collectie')

  // Select new collection radiobutton
  await page.getByLabel('Voeg toe aan een nieuwe').setChecked(true)

  // Enter new collection title
  const date = new Date()
  const collectionTitle = 'Aangemaakt door automatische test ' + date
  await page.fill("input[placeHolder='Collectietitel']", collectionTitle)

  // Save
  await page.getByRole('button', { name: 'Toepassen' }).click()

  // Wait for saving
  await page.waitForTimeout(1000)

  // Check toast message was succesful
  await expect(
    page.locator(
      'div > div.Toastify__toast-body > div > div > div.c-alert__message',
    ),
  ).toContainText(
    'Het fragment is toegevoegd aan de collectie in je Werkruimte.',
  )

  return collectionTitle
}
