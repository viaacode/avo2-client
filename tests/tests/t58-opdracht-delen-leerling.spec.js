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
var go_to_page_and_accept_cookies_1 = require('../helpers/go-to-page-and-accept-cookies')
var login_onderwijs_avo_1 = require('../helpers/login-onderwijs-avo')
var logout_onderwijs_avo_1 = require('../helpers/logout-onderwijs-avo')
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
;(0, test_1.test)('T58: Opdracht - Delen met leerling', function (_a) {
  return __awaiter(void 0, [_a], void 0, function (_b) {
    var date,
      assignmentTitle,
      klassenCount,
      klassenCountAfter,
      shareUrl,
      assignmentTitleInOverview
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
          return [
            4 /*yield*/,
            (0, login_onderwijs_avo_1.loginOnderwijsAvo)(
              page,
              process.env.TEST_CLIENT_ENDPOINT,
              process.env.TEST_BASIS_GEBRUIKER_USER,
              process.env.TEST_BASIS_GEBRUIKER_PASS,
            ),
          ]
        case 2:
          _c.sent()
          // Click mijn werkruimte
          return [
            4 /*yield*/,
            page.getByRole('link', { name: 'Mijn werkruimte' }).click(),
          ]
        case 3:
          // Click mijn werkruimte
          _c.sent()
          // Go to assignments tab
          return [4 /*yield*/, page.click('div[data-id="opdrachten"]')]
        case 4:
          // Go to assignments tab
          _c.sent()
          // Create new assignment
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Nieuwe opdracht' }).click(),
          ]
        case 5:
          // Create new assignment
          _c.sent()
          // Check if banner appeared
          return [
            4 /*yield*/,
            (0, test_1.expect)(page.locator('div.c-sticky-bar')).toContainText(
              'Wijzigingen opslaan?',
            ),
          ]
        case 6:
          // Check if banner appeared
          _c.sent()
          return [4 /*yield*/, page.waitForTimeout(1000)]
        case 7:
          _c.sent()
          // Save changes
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Opslaan' }).click(),
          ]
        case 8:
          // Save changes
          _c.sent()
          // Edit assignment
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Bewerken' }).click(),
          ]
        case 9:
          // Edit assignment
          _c.sent()
          // Open input title
          return [
            4 /*yield*/,
            page
              .locator(
                'div.o-container-vertical.o-container-vertical--small > div > div > div.c-toolbar__left > div > div > h2 > div > div',
              )
              .nth(1)
              .click(),
          ]
        case 10:
          // Open input title
          _c.sent()
          date = new Date()
          assignmentTitle = 'Aangemaakt door automatische test ' + date
          return [
            4 /*yield*/,
            page
              .locator('input[placeholder="Geef een titel in"]')
              .nth(1)
              .fill(assignmentTitle),
          ]
        case 11:
          _c.sent()
          return [4 /*yield*/, page.click('div.c-content-input__submit')]
        case 12:
          _c.sent()
          return [4 /*yield*/, page.waitForTimeout(1000)]
        case 13:
          _c.sent()
          // Click on share button
          return [
            4 /*yield*/,
            page
              .locator(
                'div.c-toolbar__right > div > div.u-hide-lt-bp2 > div > div.c-share-dropdown.c-dropdown.c-dropdown__trigger > button',
              )
              .nth(1)
              .click(),
          ]
        case 14:
          // Click on share button
          _c.sent()
          // Check url not shareable
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page
                .getByRole('heading', { name: 'Link nog niet deelbaar' })
                .getByRole('strong'),
            ).toBeVisible(),
          ]
        case 15:
          // Check url not shareable
          _c.sent()
          return [4 /*yield*/, page.waitForTimeout(1000)]
        case 16:
          _c.sent()
          // Click outside share modal
          return [
            4 /*yield*/,
            page.click(
              'div.c-assignment-page.c-assignment-page--edit.c-sticky-bar__wrapper',
            ),
          ]
        case 17:
          // Click outside share modal
          _c.sent()
          // Add block button
          return [
            4 /*yield*/,
            page
              .locator(
                'div.c-assignment-page.c-assignment-page--edit.c-sticky-bar__wrapper > div > div.o-container > div > div > ul > div > button',
              )
              .click(),
          ]
        case 18:
          // Add block button
          _c.sent()
          // add text block
          return [
            4 /*yield*/,
            page
              .locator('ul.c-add-block__list > li:nth-child(4) > label')
              .click(),
          ]
        case 19:
          // add text block
          _c.sent()
          // Enter title
          return [
            4 /*yield*/,
            page.fill(
              'input[placeholder="Instructies of omschrijving"]',
              'Automatische test titel',
            ),
          ]
        case 20:
          // Enter title
          _c.sent()
          // Enter description
          return [
            4 /*yield*/,
            page.fill(
              'div.DraftEditor-editorContainer > div[contenteditable="true"]',
              'Automatische test beschrijving tekst blok',
            ),
          ]
        case 21:
          // Enter description
          _c.sent()
          return [4 /*yield*/, page.waitForTimeout(1000)]
        case 22:
          _c.sent()
          // Check if banner appeared
          return [
            4 /*yield*/,
            (0, test_1.expect)(page.locator('div.c-sticky-bar')).toContainText(
              'Wijzigingen opslaan?',
            ),
          ]
        case 23:
          // Check if banner appeared
          _c.sent()
          // Save changes
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Opslaan' }).click(),
          ]
        case 24:
          // Save changes
          _c.sent()
          // Check toast message was succesful
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.locator(
                'div > div.Toastify__toast-body > div > div > div.c-alert__message',
              ),
            ).toContainText('De opdracht is succesvol aangepast.'),
          ]
        case 25:
          // Check toast message was succesful
          _c.sent()
          return [4 /*yield*/, page.waitForTimeout(1000)]
        case 26:
          _c.sent()
          // Go to settings tab
          return [
            4 /*yield*/,
            page.locator('div[data-id="details"]').nth(1).click(),
          ]
        case 27:
          // Go to settings tab
          _c.sent()
          return [
            4 /*yield*/,
            (0, test_1.expect)(page.getByLabel('Klassen')).toBeVisible(),
          ]
        case 28:
          _c.sent()
          // Click on edit klassen
          return [
            4 /*yield*/,
            page.locator('button[aria-label="Beheer je klassen"]').click(),
          ]
        case 29:
          // Click on edit klassen
          _c.sent()
          // Check modal opens
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.getByRole('heading', { name: 'Beheer je klassen' }),
            ).toBeVisible(),
          ]
        case 30:
          // Check modal opens
          _c.sent()
          return [4 /*yield*/, page.waitForTimeout(2000)]
        case 31:
          _c.sent()
          return [
            4 /*yield*/,
            page
              .locator(
                'body > div.m-manage-assignment-labels.c-modal-context.c-modal-context--visible > div > div.scrollbar-container.c-modal__body.ps > table > tbody > tr',
              )
              .count(),
          ]
        case 32:
          klassenCount = _c.sent()
          // Click on Add klas
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Voeg een klas toe' }).click(),
          ]
        case 33:
          // Click on Add klas
          _c.sent()
          return [
            4 /*yield*/,
            page
              .locator(
                'body > div.m-manage-assignment-labels.c-modal-context.c-modal-context--visible > div > div.scrollbar-container.c-modal__body.ps > table > tbody > tr',
              )
              .count(),
          ]
        case 34:
          klassenCountAfter = _c.sent()
          ;(0, test_1.expect)(klassenCountAfter).toBeGreaterThan(klassenCount)
          // Give a name to the new klas
          return [
            4 /*yield*/,
            page
              .locator(
                'body > div.m-manage-assignment-labels.c-modal-context.c-modal-context--visible > div > div.scrollbar-container.c-modal__body.ps > table > tbody > tr',
              )
              .last()
              .getByRole('textbox')
              .fill('0Automated test klas'),
          ]
        case 35:
          // Give a name to the new klas
          _c.sent()
          return [4 /*yield*/, page.waitForTimeout(3000)]
        case 36:
          _c.sent()
          // Save changes
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Opslaan' }).click(),
          ]
        case 37:
          // Save changes
          _c.sent()
          // Check toast message was succesful
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.locator(
                'div > div.Toastify__toast-body > div > div > div.c-alert__message',
              ),
            ).toContainText('Je aanpassingen aan klassen zijn opgeslagen.'),
          ]
        case 38:
          // Check toast message was succesful
          _c.sent()
          // Click on Klassen dropdown
          return [
            4 /*yield*/,
            page
              .locator(
                'div.o-grid-col-bp3-7 > div:nth-child(1) > div > div > div:nth-child(1) > div',
              )
              .click(),
          ]
        case 39:
          // Click on Klassen dropdown
          _c.sent()
          return [4 /*yield*/, page.waitForTimeout(1000)]
        case 40:
          _c.sent()
          // Choose the newly created klas
          return [
            4 /*yield*/,
            page
              .getByText('0Automated test klas', { exact: true })
              .first()
              .click(),
          ]
        case 41:
          // Choose the newly created klas
          _c.sent()
          // Focus on deadline input
          return [
            4 /*yield*/,
            page.locator('input[placeholder="dd/mm/yyyy"]').nth(1).focus(),
          ]
        case 42:
          // Focus on deadline input
          _c.sent()
          return [4 /*yield*/, page.waitForTimeout(1000)]
        case 43:
          _c.sent()
          return [4 /*yield*/, page.click('button[aria-label="Next Month"]')]
        case 44:
          _c.sent()
          return [4 /*yield*/, page.waitForTimeout(1000)]
        case 45:
          _c.sent()
          return [
            4 /*yield*/,
            page.locator('div.react-datepicker__week > div').first().click(),
          ]
        case 46:
          _c.sent()
          return [4 /*yield*/, page.waitForTimeout(2000)]
        case 47:
          _c.sent()
          // Check if banner appeared
          return [
            4 /*yield*/,
            (0, test_1.expect)(page.locator('div.c-sticky-bar')).toContainText(
              'Wijzigingen opslaan?',
            ),
          ]
        case 48:
          // Check if banner appeared
          _c.sent()
          // Save changes
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Opslaan' }).click(),
          ]
        case 49:
          // Save changes
          _c.sent()
          // Check toast message was succesful
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.locator(
                'div > div.Toastify__toast-body > div > div > div.c-alert__message',
              ),
            ).toContainText('De opdracht is succesvol aangepast.'),
          ]
        case 50:
          // Check toast message was succesful
          _c.sent()
          // Click on share button
          return [
            4 /*yield*/,
            page
              .locator(
                'div.c-toolbar__right > div > div.u-hide-lt-bp2 > div > div.c-share-dropdown.c-dropdown.c-dropdown__trigger > button',
              )
              .nth(1)
              .click(),
          ]
        case 51:
          // Click on share button
          _c.sent()
          return [
            4 /*yield*/,
            page
              .locator('div.c-share-with-pupil > div > input')
              .first()
              .getAttribute('value'),
          ]
        case 52:
          shareUrl = _c.sent()
          return [4 /*yield*/, page.waitForTimeout(1000)]
        case 53:
          _c.sent()
          // Logout
          return [
            4 /*yield*/,
            (0, logout_onderwijs_avo_1.logoutOnderwijsAvo)(page),
          ]
        case 54:
          // Logout
          _c.sent()
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.getByText('Inloggen', { exact: true }),
            ).toBeVisible(),
          ]
        case 55:
          _c.sent()
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.getByRole('link', { name: 'Mijn werkruimte' }),
            ).not.toBeVisible(),
          ]
        case 56:
          _c.sent()
          // Login as student
          return [
            4 /*yield*/,
            (0, login_onderwijs_avo_1.loginOnderwijsAvo)(
              page,
              process.env.CLIENT_ENDPOINT,
              process.env.TEST_LEERLING_GEBRUIKER_USER,
              process.env.TEST_LEERLING_GEBRUIKER_PASS,
              false,
            ),
          ]
        case 57:
          // Login as student
          _c.sent()
          // Go to shared url
          return [4 /*yield*/, page.goto(shareUrl)]
        case 58:
          // Go to shared url
          _c.sent()
          // Assignment is opened
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.getByRole('heading', { name: assignmentTitle }),
            ).toBeVisible(),
          ]
        case 59:
          // Assignment is opened
          _c.sent()
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.getByRole('button', { name: 'Bewerken' }),
            ).not.toBeVisible(),
          ]
        case 60:
          _c.sent()
          // CLEANUP
          // Remove klas
          // Logout
          // Open user dropdown from navbar
          return [
            4 /*yield*/,
            (0, logout_onderwijs_avo_1.logoutOnderwijsAvo)(page, false),
          ]
        case 61:
          // CLEANUP
          // Remove klas
          // Logout
          // Open user dropdown from navbar
          _c.sent()
          return [4 /*yield*/, page.waitForTimeout(1000)]
        case 62:
          _c.sent()
          // Login as first user
          return [
            4 /*yield*/,
            (0, login_onderwijs_avo_1.loginOnderwijsAvo)(
              page,
              process.env.TEST_CLIENT_ENDPOINT,
              process.env.TEST_BASIS_GEBRUIKER_USER,
              process.env.TEST_BASIS_GEBRUIKER_PASS,
            ),
          ]
        case 63:
          // Login as first user
          _c.sent()
          // Click mijn werkruimte
          return [
            4 /*yield*/,
            page.getByRole('link', { name: 'Mijn werkruimte' }).click(),
          ]
        case 64:
          // Click mijn werkruimte
          _c.sent()
          // Go to assignments tab
          return [4 /*yield*/, page.click('div[data-id="opdrachten"]')]
        case 65:
          // Go to assignments tab
          _c.sent()
          assignmentTitleInOverview = assignmentTitle.slice(0, 57) + '...'
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.getByRole('link', { name: assignmentTitleInOverview }),
            ).toBeVisible(),
          ]
        case 66:
          _c.sent()
          // Click on the above link
          return [
            4 /*yield*/,
            page.getByRole('link', { name: assignmentTitleInOverview }).click(),
          ]
        case 67:
          // Click on the above link
          _c.sent()
          // Check title and description
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.locator(
                'div.c-block-list__item > div > div > div > div.c-icon-bar__content > h2',
              ),
            ).toContainText('Automatische test titel'),
          ]
        case 68:
          // Check title and description
          _c.sent()
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.locator(
                'div.c-block-list__item > div > div > div > div.c-icon-bar__content > div > div > p',
              ),
            ).toContainText('Automatische test beschrijving tekst blok'),
          ]
        case 69:
          _c.sent()
          return [4 /*yield*/, page.waitForTimeout(3000)]
        case 70:
          _c.sent()
          return [4 /*yield*/, page.waitForTimeout(1000)]
        case 71:
          _c.sent()
          // Edit assignment
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Bewerken' }).click(),
          ]
        case 72:
          // Edit assignment
          _c.sent()
          // Go to settings tab
          return [
            4 /*yield*/,
            page.locator('div[data-id="details"]').nth(1).click(),
          ]
        case 73:
          // Go to settings tab
          _c.sent()
          return [
            4 /*yield*/,
            (0, test_1.expect)(page.getByLabel('Klassen')).toBeVisible(),
          ]
        case 74:
          _c.sent()
          // Click on edit klassen
          return [
            4 /*yield*/,
            page.locator('button[aria-label="Beheer je klassen"]').click(),
          ]
        case 75:
          // Click on edit klassen
          _c.sent()
          // Check modal opens
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.getByRole('heading', { name: 'Beheer je klassen' }),
            ).toBeVisible(),
          ]
        case 76:
          // Check modal opens
          _c.sent()
          return [4 /*yield*/, page.waitForTimeout(2000)]
        case 77:
          _c.sent()
          return [
            4 /*yield*/,
            page
              .locator('button[aria-label="Verwijder dit label"]')
              .first()
              .click(),
          ]
        case 78:
          _c.sent()
          return [4 /*yield*/, page.waitForTimeout(2000)]
        case 79:
          _c.sent()
          // Save changes
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Opslaan' }).click(),
          ]
        case 80:
          // Save changes
          _c.sent()
          // Remove assignment
          // Click mijn werkruimte
          return [
            4 /*yield*/,
            page.getByRole('link', { name: 'Mijn werkruimte' }).click(),
          ]
        case 81:
          // Remove assignment
          // Click mijn werkruimte
          _c.sent()
          // Go to assignments tab
          return [4 /*yield*/, page.click('div[data-id="opdrachten"]')]
        case 82:
          // Go to assignments tab
          _c.sent()
          // Open options of the newly created assignment
          // AssignmentDetail page:
          // await page.click("button[aria-label='Meer opties']");
          return [
            4 /*yield*/,
            page
              .locator(
                'tr:nth-child(1) > td:nth-child(9) > div.u-hide-lt-bp2 > div > div.c-dropdown__trigger > button',
              )
              .click(),
          ]
        case 83:
          // Open options of the newly created assignment
          // AssignmentDetail page:
          // await page.click("button[aria-label='Meer opties']");
          _c.sent()
          // Click 'Verwijderen'
          // AssignmentDetail page:
          // await page
          // 	.locator(
          // 		'div.c-sticky-bar__wrapper > div > div.c-header.o-container-vertical.o-container-vertical--bg-alt > div > div:nth-child(2) > div.c-toolbar__right > div > div > div.c-dropdown__content-open > div > div:nth-child(2)'
          // 	)
          // 	.click();
          return [
            4 /*yield*/,
            page
              .locator(
                'tr:nth-child(1) > td:nth-child(9) > div.u-hide-lt-bp2 > div > div.c-dropdown__content-open > div > div:nth-child(3)',
              )
              .click(),
          ]
        case 84:
          // Click 'Verwijderen'
          // AssignmentDetail page:
          // await page
          // 	.locator(
          // 		'div.c-sticky-bar__wrapper > div > div.c-header.o-container-vertical.o-container-vertical--bg-alt > div > div:nth-child(2) > div.c-toolbar__right > div > div > div.c-dropdown__content-open > div > div:nth-child(2)'
          // 	)
          // 	.click();
          _c.sent()
          // Confirm remove modal
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Verwijder' }).click(),
          ]
        case 85:
          // Confirm remove modal
          _c.sent()
          return [4 /*yield*/, page.waitForTimeout(1000)]
        case 86:
          _c.sent()
          return [2 /*return*/]
      }
    })
  })
})
