import { expect, Page } from '@playwright/test'

export async function goToVideoDetailPage(page: Page): Promise<void> {
  // Click search button
  await page.getByRole('link', { name: 'Zoeken', exact: true }).click()

  // Check Search page opens
  await expect(
    page.getByRole('heading', { name: 'Zoekresultaten' }),
  ).toBeVisible()

  // Select video checkbox and search
  await page.getByRole('button', { name: 'Type' }).click()
  await page.locator('#video').check()
  await page.getByRole('button', { name: 'Toepassen' }).click()

  // Search
  await page.getByRole('button', { name: 'Zoeken', exact: true }).click()

  // Wait for items to load
  await page.waitForTimeout(2000)
  await page.waitForLoadState('networkidle')

  // Click first item
  await page.locator('h2.c-search-result__title > a').first().click()

  // Check title contains test
  await expect(page.locator('h2.c-item-detail__header')).toContainText(
    'dag van de',
  )
}
