import { expect, test } from '@playwright/test'

import { goToPageAndAcceptCookies } from '../helpers/go-to-page-and-accept-cookies';

/**
 * New: https://docs.google.com/spreadsheets/d/1IvhK0v0HSntCwTcXiFseHargwwWwpoCkDMjmMehaDMA/edit#gid=0
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test('T09: Nieuws - klikken op pills', async ({ page }) => {
  await goToPageAndAcceptCookies(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_CLIENT_TITLE as string,
  )

  // Click nieuws button
  await page.getByRole('link', { name: 'Nieuws', exact: true }).click()

  //
  // CHECK PLATFORMUPDATES PILL
  //
  const pillName = 'Platformupdates'

  // Check pill is visible
  await expect(
    page.locator('li.c-tag').filter({ hasText: pillName }),
  ).toBeVisible()
  // Check that pill is not active
  await expect(
    page.locator('li.c-tag__active').filter({ hasText: pillName }),
  ).not.toBeVisible()

  // Click on non-active pill
  await page.locator('li.c-tag').filter({ hasText: pillName }).click()
  // Check pill is active
  await expect(
    page.locator('li.c-tag__active').filter({ hasText: pillName }),
  ).toBeVisible()

  // wait for articles to be filtered
  await page.waitForTimeout(1000)

  // Check count all articles shown
  const count = await page.locator('a.c-content-page__label').count()
  await expect(page.locator('a.c-content-page__label')).toHaveCount(count)

  // Check count article labels with pillname
  // Should be the same
  await expect(
    page.locator('a.c-content-page__label').filter({ hasText: pillName }),
  ).toHaveCount(count)

  //
  // CHECK AANBOD GETIPT PILL
  //
  const pillName2 = 'Aanbod getipt'

  // Check pill is visible
  await expect(
    page.locator('li.c-tag').filter({ hasText: pillName2 }),
  ).toBeVisible()
  // Check that pill is not active
  await expect(
    page.locator('li.c-tag__active').filter({ hasText: pillName2 }),
  ).not.toBeVisible()

  // Click on non-active pill
  await page.locator('li.c-tag').filter({ hasText: pillName2 }).click()
  // Check pill is active
  await expect(
    page.locator('li.c-tag__active').filter({ hasText: pillName2 }),
  ).toBeVisible()

  // wait for articles to be filtered
  await page.waitForTimeout(1000)

  // Check count all articles shown
  const count2 = await page.locator('a.c-content-page__label').count()
  await expect(page.locator('a.c-content-page__label')).toHaveCount(count2)

  // Check count article labels with pillname2
  // Should be the same
  await expect(
    page.locator('a.c-content-page__label').filter({ hasText: pillName2 }),
  ).toHaveCount(count2)

  //
  // CHECK Workshops & events
  //
  const pillName3 = 'Workshops & events'

  // Check pill is visible
  await expect(
    page.locator('li.c-tag').filter({ hasText: pillName3 }),
  ).toBeVisible()
  // Check that pill is not active
  await expect(
    page.locator('li.c-tag__active').filter({ hasText: pillName3 }),
  ).not.toBeVisible()

  // Click on non-active pill
  await page.locator('li.c-tag').filter({ hasText: pillName3 }).click()
  // Check pill is active
  await expect(
    page.locator('li.c-tag__active').filter({ hasText: pillName3 }),
  ).toBeVisible()

  // wait for articles to be filtered
  await page.waitForTimeout(1000)

  // Check count all articles shown
  const count3 = await page.locator('a.c-content-page__label').count()
  await expect(page.locator('a.c-content-page__label')).toHaveCount(count3)

  // Check count article labels with pillname3
  // Should be the same
  await expect(
    page.locator('a.c-content-page__label').filter({ hasText: pillName3 }),
  ).toHaveCount(count3)

  // // Wait for close to save the videos
  // await context.close();
})
