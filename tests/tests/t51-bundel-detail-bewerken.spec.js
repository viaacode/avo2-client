'use strict'
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1]
          return t[1]
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this
        }),
      g
    )
    function verb(n) {
      return function (v) {
        return step([n, v])
      }
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.')
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                    ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t
          if (((y = 0), t)) op = [op[0] & 2, t.value]
          switch (op[0]) {
            case 0:
            case 1:
              t = op
              break
            case 4:
              _.label++
              return { value: op[1], done: false }
            case 5:
              _.label++
              y = op[1]
              op = [0]
              continue
            case 7:
              op = _.ops.pop()
              _.trys.pop()
              continue
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0
                continue
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1]
                break
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1]
                t = op
                break
              }
              if (t && _.label < t[2]) {
                _.label = t[2]
                _.ops.push(op)
                break
              }
              if (t[2]) _.ops.pop()
              _.trys.pop()
              continue
          }
          op = body.call(thisArg, _)
        } catch (e) {
          op = [6, e]
          y = 0
        } finally {
          f = t = 0
        }
      if (op[0] & 5) throw op[1]
      return { value: op[0] ? op[1] : void 0, done: true }
    }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var test_1 = require('@playwright/test')
var cleanup_1 = require('../helpers/cleanup')
var create_collection_1 = require('../helpers/create-collection')
var go_to_page_and_accept_cookies_1 = require('../helpers/go-to-page-and-accept-cookies')
var login_onderwijs_avo_1 = require('../helpers/login-onderwijs-avo')
/**
 * New: https://docs.google.com/spreadsheets/d/1IvhK0v0HSntCwTcXiFseHargwwWwpoCkDMjmMehaDMA/edit#gid=0
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */
test_1.test.afterEach(function (_a, testInfo_1) {
  return __awaiter(void 0, [_a, testInfo_1], void 0, function (_b, testInfo) {
    var page = _b.page
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          if (!(testInfo.status !== testInfo.expectedStatus))
            return [3 /*break*/, 2]
          console.error('Did not run as expected')
          return [4 /*yield*/, (0, cleanup_1.cleanupTestdata)(page)]
        case 1:
          _c.sent()
          _c.label = 2
        case 2:
          return [2 /*return*/]
      }
    })
  })
})
;(0, test_1.test)('T51: Bundel bewerken', function (_a) {
  return __awaiter(void 0, [_a], void 0, function (_b) {
    var collectionTitle,
      collectionTitleInOverview,
      date,
      bundleTitle,
      date2,
      collectionTitle2,
      collectionTitleInOverview2,
      bundleTitleInOverview,
      title1,
      title2,
      title1AfterChangeOrder,
      title2AfterChangeOrder
    var page = _b.page
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          return [
            4 /*yield*/,
            (0, go_to_page_and_accept_cookies_1.goToPageAndAcceptCookies)(
              page,
              process.env.TEST_CLIENT_ENDPOINT,
              process.env.TEST_CLIENT_TITLE,
            ),
          ]
        case 1:
          _c.sent()
          // Login as Educatieve auteur
          return [
            4 /*yield*/,
            (0, login_onderwijs_avo_1.loginOnderwijsAvo)(
              page,
              process.env.TEST_CLIENT_ENDPOINT,
              process.env.TEST_EDUCATIEVE_AUTEUR_USER,
              process.env.TEST_EDUCATIEVE_AUTEUR_PASS,
            ),
          ]
        case 2:
          // Login as Educatieve auteur
          _c.sent()
          return [4 /*yield*/, (0, create_collection_1.createCollection)(page)]
        case 3:
          collectionTitle = _c.sent()
          // Go to werkruimte
          return [
            4 /*yield*/,
            page.getByRole('link', { name: 'Mijn werkruimte' }).click(),
          ]
        case 4:
          // Go to werkruimte
          _c.sent()
          collectionTitleInOverview = collectionTitle.slice(0, 57) + '...'
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.getByRole('link', { name: collectionTitleInOverview }),
            ).toBeVisible(),
          ]
        case 5:
          _c.sent()
          // Click on the above link
          return [
            4 /*yield*/,
            page.getByRole('link', { name: collectionTitleInOverview }).click(),
          ]
        case 6:
          // Click on the above link
          _c.sent()
          // Open options of the newly created collection
          return [4 /*yield*/, page.click("button[aria-label='Meer opties']")]
        case 7:
          // Open options of the newly created collection
          _c.sent()
          // Add collection to bundle
          return [
            4 /*yield*/,
            page
              .locator(
                'div.c-toolbar__right > div > div > div.c-dropdown__content-open > div > div:nth-child(1)',
              )
              .click(),
          ]
        case 8:
          // Add collection to bundle
          _c.sent()
          // Check add to bundle modal opened
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.getByRole('heading', {
                name: 'Voeg collectie toe aan bundel',
              }),
            ).toBeVisible(),
          ]
        case 9:
          // Check add to bundle modal opened
          _c.sent()
          // Check new bundle option
          return [
            4 /*yield*/,
            page
              .locator(
                'div.c-modal__body > div > div > div > div > div > div:nth-child(2) > div.c-radio > label > input[type=radio]',
              )
              .check(),
          ]
        case 10:
          // Check new bundle option
          _c.sent()
          date = new Date()
          bundleTitle = 'Aangemaakt door automatische test ' + date
          return [
            4 /*yield*/,
            page.fill("input[placeHolder='Titel van de bundel']", bundleTitle),
          ]
        case 11:
          _c.sent()
          // Wait for previous toast to disappear
          return [4 /*yield*/, page.waitForTimeout(4000)]
        case 12:
          // Wait for previous toast to disappear
          _c.sent()
          // Save
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Toepassen' }).click(),
          ]
        case 13:
          // Save
          _c.sent()
          // Check toast message was succesful
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.locator(
                'div > div.Toastify__toast-body > div > div > div.c-alert__message',
              ),
            ).toContainText('De collectie is toegevoegd aan de bundel.'),
          ]
        case 14:
          // Check toast message was succesful
          _c.sent()
          // Click search button
          return [
            4 /*yield*/,
            page.getByRole('link', { name: 'Zoeken', exact: true }).click(),
          ]
        case 15:
          // Click search button
          _c.sent()
          // Check Search page opens
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.getByRole('heading', { name: 'Zoekresultaten' }),
            ).toBeVisible(),
          ]
        case 16:
          // Check Search page opens
          _c.sent()
          // Select video checkbox and search
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Type' }).click(),
          ]
        case 17:
          // Select video checkbox and search
          _c.sent()
          return [4 /*yield*/, page.locator('#video').check()]
        case 18:
          _c.sent()
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Toepassen' }).click(),
          ]
        case 19:
          _c.sent()
          // Wait for items to load
          return [4 /*yield*/, page.waitForTimeout(2000)]
        case 20:
          // Wait for items to load
          _c.sent()
          // Click second item
          return [
            4 /*yield*/,
            page.getByRole('link', { name: 'KLAAR: phishing' }).click(),
          ]
        case 21:
          // Click second item
          _c.sent()
          // Add a second video to the same collection
          return [
            4 /*yield*/,
            page.click("button[aria-label='Knip of voeg toe aan collectie']"),
          ]
        case 22:
          // Add a second video to the same collection
          _c.sent()
          // Check modal opens
          return [4 /*yield*/, page.waitForTimeout(1000)]
        case 23:
          // Check modal opens
          _c.sent()
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.getByRole('heading', {
                name: 'Voeg dit fragment toe aan een',
              }),
            ).toContainText('Voeg dit fragment toe aan een collectie'),
          ]
        case 24:
          _c.sent()
          // Select new collection radiobutton
          return [
            4 /*yield*/,
            page.getByLabel('Voeg toe aan een nieuwe').setChecked(true),
          ]
        case 25:
          // Select new collection radiobutton
          _c.sent()
          date2 = new Date()
          collectionTitle2 = 'Aangemaakt door automatische test ' + date2
          return [
            4 /*yield*/,
            page.fill("input[placeHolder='Collectietitel']", collectionTitle2),
          ]
        case 26:
          _c.sent()
          return [4 /*yield*/, page.waitForTimeout(3000)]
        case 27:
          _c.sent()
          // Save
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Toepassen' }).click(),
          ]
        case 28:
          // Save
          _c.sent()
          // Check toast message was succesful
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.locator(
                'div > div.Toastify__toast-body > div > div > div.c-alert__message',
              ),
            ).toContainText(
              'Het fragment is toegevoegd aan de collectie in je Werkruimte.',
            ),
          ]
        case 29:
          // Check toast message was succesful
          _c.sent()
          // Go to werkruimte
          return [
            4 /*yield*/,
            page.getByRole('link', { name: 'Mijn werkruimte' }).click(),
          ]
        case 30:
          // Go to werkruimte
          _c.sent()
          collectionTitleInOverview2 = collectionTitle2.slice(0, 57) + '...'
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page
                .getByRole('link', { name: collectionTitleInOverview2 })
                .first(),
            ).toBeVisible(),
          ]
        case 31:
          _c.sent()
          // Click on the above link
          return [
            4 /*yield*/,
            page
              .getByRole('link', { name: collectionTitleInOverview2 })
              .first()
              .click(),
          ]
        case 32:
          // Click on the above link
          _c.sent()
          // Open options of the newly created collection
          return [4 /*yield*/, page.click("button[aria-label='Meer opties']")]
        case 33:
          // Open options of the newly created collection
          _c.sent()
          // Add collection to bundle
          return [
            4 /*yield*/,
            page
              .locator(
                'div.c-toolbar__right > div > div > div.c-dropdown__content-open > div > div:nth-child(1)',
              )
              .click(),
          ]
        case 34:
          // Add collection to bundle
          _c.sent()
          // Check add to bundle modal opened
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.getByRole('heading', {
                name: 'Voeg collectie toe aan bundel',
              }),
            ).toBeVisible(),
          ]
        case 35:
          // Check add to bundle modal opened
          _c.sent()
          // Open dropdown existing bundles (id is wrongly named)
          return [4 /*yield*/, page.click('#existingCollection')]
        case 36:
          // Open dropdown existing bundles (id is wrongly named)
          _c.sent()
          // Select existing bundle created earlier in the test
          return [
            4 /*yield*/,
            page.getByText(bundleTitle, { exact: true }).click(),
          ]
        case 37:
          // Select existing bundle created earlier in the test
          _c.sent()
          // Wait for previous toast to disappear
          return [4 /*yield*/, page.waitForTimeout(4000)]
        case 38:
          // Wait for previous toast to disappear
          _c.sent()
          // Save
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Toepassen' }).click(),
          ]
        case 39:
          // Save
          _c.sent()
          // Check toast message was succesful
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.getByText('De collectie is toegevoegd aan de bundel.'),
            ).toBeVisible(),
          ]
        case 40:
          // Check toast message was succesful
          _c.sent()
          // Go to werkruimte
          return [
            4 /*yield*/,
            page.getByRole('link', { name: 'Mijn werkruimte' }).click(),
          ]
        case 41:
          // Go to werkruimte
          _c.sent()
          // Go to bundles tab
          return [4 /*yield*/, page.click('div[data-id="bundels"]')]
        case 42:
          // Go to bundles tab
          _c.sent()
          return [4 /*yield*/, page.waitForLoadState('networkidle')]
        case 43:
          _c.sent()
          bundleTitleInOverview = bundleTitle.slice(0, 57) + '...'
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.getByRole('link', { name: bundleTitleInOverview }),
            ).toBeVisible(),
          ]
        case 44:
          _c.sent()
          return [4 /*yield*/, page.waitForTimeout(2000)]
        case 45:
          _c.sent()
          // Click on the above link
          return [
            4 /*yield*/,
            page.getByRole('link', { name: bundleTitleInOverview }).click(),
          ]
        case 46:
          // Click on the above link
          _c.sent()
          // Check bundle page is opened
          // await page.waitForTimeout(2000);
          // await page.screenshot({ path: 'screenshot.png', fullPage: true });
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.getByRole('heading', { name: 'Over deze bundel' }),
            ).toBeVisible(),
          ]
        case 47:
          // Check bundle page is opened
          // await page.waitForTimeout(2000);
          // await page.screenshot({ path: 'screenshot.png', fullPage: true });
          _c.sent()
          return [
            4 /*yield*/,
            page
              .locator(
                'div.m-bundle-detail > div > div:nth-child(2) > div > div > div > div:nth-child(1) > a > div > div.c-media-card-content > h4',
              )
              .textContent(),
          ]
        case 48:
          title1 = _c.sent()
          return [
            4 /*yield*/,
            page
              .locator(
                'div.m-bundle-detail > div > div:nth-child(2) > div > div > div > div:nth-child(2) > a > div > div.c-media-card-content > h4',
              )
              .textContent(),
          ]
        case 49:
          title2 = _c.sent()
          // Edit bundle
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Bewerken', exact: true }).click(),
          ]
        case 50:
          // Edit bundle
          _c.sent()
          return [4 /*yield*/, page.waitForLoadState('networkidle')]
        case 51:
          _c.sent()
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.locator('button[aria-label="Verplaats naar boven"]'),
            ).toBeVisible(),
          ]
        case 52:
          _c.sent()
          // Move second item up
          return [
            4 /*yield*/,
            page.locator('button[aria-label="Verplaats naar boven"]').click(),
          ]
        case 53:
          // Move second item up
          _c.sent()
          // Check if banner appeared
          return [
            4 /*yield*/,
            (0, test_1.expect)(page.locator('div.c-sticky-bar')).toContainText(
              'Wijzigingen opslaan?',
            ),
          ]
        case 54:
          // Check if banner appeared
          _c.sent()
          // Save changes
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Opslaan' }).click(),
          ]
        case 55:
          // Save changes
          _c.sent()
          return [4 /*yield*/, page.waitForLoadState('networkidle')]
        case 56:
          _c.sent()
          // Check toast message was succesful
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.getByText('De bundel werd opgeslagen.'),
            ).toBeVisible(),
          ]
        case 57:
          // Check toast message was succesful
          _c.sent()
          // Close edit mode
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Sluiten' }).click(),
          ]
        case 58:
          // Close edit mode
          _c.sent()
          return [4 /*yield*/, page.waitForLoadState('networkidle')]
        case 59:
          _c.sent()
          return [
            4 /*yield*/,
            page
              .locator(
                'div.m-bundle-detail > div > div:nth-child(2) > div > div > div > div:nth-child(1) > a > div > div.c-media-card-content > h4',
              )
              .textContent(),
          ]
        case 60:
          title1AfterChangeOrder = _c.sent()
          return [
            4 /*yield*/,
            page
              .locator(
                'div.m-bundle-detail > div > div:nth-child(2) > div > div > div > div:nth-child(2) > a > div > div.c-media-card-content > h4',
              )
              .textContent(),
          ]
        case 61:
          title2AfterChangeOrder = _c.sent()
          ;(0, test_1.expect)(
            title1 !== title1AfterChangeOrder &&
              title2 !== title2AfterChangeOrder,
          ).toBeTruthy()
          // CLEANUP
          // REMOVE BUNDLE
          // Open options of the newly created bundle
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Meer opties' }).click(),
          ]
        case 62:
          // CLEANUP
          // REMOVE BUNDLE
          // Open options of the newly created bundle
          _c.sent()
          // Click 'Verwijderen'
          return [
            4 /*yield*/,
            page
              .locator('div.c-dropdown__content-open > div > div:nth-child(2)')
              .click(),
          ]
        case 63:
          // Click 'Verwijderen'
          _c.sent()
          // Confirm remove modal
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Verwijder' }).click(),
          ]
        case 64:
          // Confirm remove modal
          _c.sent()
          // Check toast message was succesful
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.getByText(
                'De bundel werd succesvol verwijderd. Collecties bleven ongewijzigd.',
              ),
            ).toBeVisible(),
          ]
        case 65:
          // Check toast message was succesful
          _c.sent()
          //REMOVE COLLECTIONS
          // Open options of the newly created collection2
          return [
            4 /*yield*/,
            page
              .locator(
                'tr:nth-child(1) > td:nth-child(6) > div > div.c-dropdown__trigger > button',
              )
              .click(),
          ]
        case 66:
          //REMOVE COLLECTIONS
          // Open options of the newly created collection2
          _c.sent()
          // Click 'Verwijderen'
          return [
            4 /*yield*/,
            page
              .locator(
                'tr:nth-child(1) > td:nth-child(6) > div > div.c-dropdown__content-open > div > div:nth-child(3)',
              )
              .click(),
          ]
        case 67:
          // Click 'Verwijderen'
          _c.sent()
          // Confirm remove modal
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Verwijder' }).click(),
          ]
        case 68:
          // Confirm remove modal
          _c.sent()
          // Check new collection is removed
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.getByRole('link', { name: collectionTitleInOverview2 }),
            ).not.toBeVisible(),
          ]
        case 69:
          // Check new collection is removed
          _c.sent()
          // Open options of the newly created collection
          return [
            4 /*yield*/,
            page
              .locator(
                'tr:nth-child(1) > td:nth-child(6) > div > div.c-dropdown__trigger > button',
              )
              .click(),
          ]
        case 70:
          // Open options of the newly created collection
          _c.sent()
          // Click 'Verwijderen'
          return [
            4 /*yield*/,
            page
              .locator(
                'tr:nth-child(1) > td:nth-child(6) > div > div.c-dropdown__content-open > div > div:nth-child(3)',
              )
              .click(),
          ]
        case 71:
          // Click 'Verwijderen'
          _c.sent()
          // Confirm remove modal
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Verwijder' }).click(),
          ]
        case 72:
          // Confirm remove modal
          _c.sent()
          // Check new collection is removed
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.getByRole('link', { name: collectionTitleInOverview }),
            ).not.toBeVisible(),
          ]
        case 73:
          // Check new collection is removed
          _c.sent()
          return [2 /*return*/]
      }
    })
  })
})
