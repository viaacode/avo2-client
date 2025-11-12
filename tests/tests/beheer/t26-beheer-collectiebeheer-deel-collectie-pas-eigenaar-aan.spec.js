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
var cleanup_1 = require('../../helpers/cleanup')
var create_collection_1 = require('../../helpers/create-collection')
var get_collection_invite_token_1 = require('../../helpers/get-collection-invite-token')
var go_to_page_and_accept_cookies_1 = require('../../helpers/go-to-page-and-accept-cookies')
var login_onderwijs_avo_1 = require('../../helpers/login-onderwijs-avo')
var logout_onderwijs_avo_1 = require('../../helpers/logout-onderwijs-avo')
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
;(0, test_1.test)(
  'T26: Beheer - collectiebeheer: Deel collectie',
  function (_a) {
    return __awaiter(void 0, [_a], void 0, function (_b) {
      var clientEndpoint,
        educatieveAuteur,
        educatieveAuteurPass,
        collectionTitle,
        collectionTitleInAdminOverview,
        emailPending,
        collectionId,
        emailInviteToken,
        acceptInviteUrl,
        collectionTitleInOverview
      var page = _b.page
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            clientEndpoint = process.env.TEST_CLIENT_ENDPOINT
            educatieveAuteur = process.env.TEST_EDUCATIEVE_AUTEUR_USER
            educatieveAuteurPass = process.env.TEST_EDUCATIEVE_AUTEUR_PASS
            return [
              4 /*yield*/,
              (0, go_to_page_and_accept_cookies_1.goToPageAndAcceptCookies)(
                page,
                clientEndpoint,
                process.env.TEST_CLIENT_TITLE,
              ),
            ]
          case 1:
            _c.sent()
            return [
              4 /*yield*/,
              (0, login_onderwijs_avo_1.loginOnderwijsAvo)(
                page,
                clientEndpoint,
                process.env.TEST_BASIS_GEBRUIKER_USER,
                process.env.TEST_BASIS_GEBRUIKER_PASS,
              ),
            ]
          case 2:
            _c.sent()
            return [
              4 /*yield*/,
              (0, create_collection_1.createCollection)(page),
            ]
          case 3:
            collectionTitle = _c.sent()
            // Logout
            return [4 /*yield*/, page.goto(process.env.TEST_CLIENT_ENDPOINT)]
          case 4:
            // Logout
            _c.sent()
            return [
              4 /*yield*/,
              (0, logout_onderwijs_avo_1.logoutOnderwijsAvo)(page),
            ]
          case 5:
            _c.sent()
            // Login as admin
            return [
              4 /*yield*/,
              (0, login_onderwijs_avo_1.loginOnderwijsAvo)(
                page,
                process.env.TEST_CLIENT_ENDPOINT,
                process.env.TEST_ADMIN_USER,
                process.env.TEST_ADMIN_PASS,
              ),
            ]
          case 6:
            // Login as admin
            _c.sent()
            // Go to admin page
            return [
              4 /*yield*/,
              page.getByRole('link', { name: 'Beheer' }).click(),
            ]
          case 7:
            // Go to admin page
            _c.sent()
            return [4 /*yield*/, page.waitForLoadState('networkidle')]
          case 8:
            _c.sent()
            return [
              4 /*yield*/,
              (0, test_1.expect)(
                page.getByRole('heading', { name: 'Dashboard' }),
              ).toBeVisible(),
            ]
          case 9:
            _c.sent()
            // Click on collection tab
            return [
              4 /*yield*/,
              page.getByRole('link', { name: 'Collectiebeheer' }).click(),
            ]
          case 10:
            // Click on collection tab
            _c.sent()
            return [4 /*yield*/, page.waitForLoadState('networkidle')]
          case 11:
            _c.sent()
            return [
              4 /*yield*/,
              (0, test_1.expect)(
                page.getByRole('heading', { name: 'Collecties', exact: true }),
              ).toBeVisible(),
            ]
          case 12:
            _c.sent()
            collectionTitleInAdminOverview =
              collectionTitle.slice(0, 47) + '...'
            return [
              4 /*yield*/,
              (0, test_1.expect)(
                page
                  .getByRole('link', { name: collectionTitleInAdminOverview })
                  .first(),
              ).toBeVisible(),
            ]
          case 13:
            _c.sent()
            // Open the collection
            return [
              4 /*yield*/,
              page
                .getByRole('link', { name: collectionTitleInAdminOverview })
                .click(),
            ]
          case 14:
            // Open the collection
            _c.sent()
            return [4 /*yield*/, page.waitForLoadState('networkidle')]
          case 15:
            _c.sent()
            // Check collection opens
            return [
              4 /*yield*/,
              (0, test_1.expect)(
                page.getByRole('heading', { name: 'Over deze collectie' }),
              ).toBeVisible(),
            ]
          case 16:
            // Check collection opens
            _c.sent()
            // Click share button
            return [
              4 /*yield*/,
              page.click(
                'button[aria-label="Deel de collectie met collega\'s (kijken of bewerken)"]',
              ),
            ]
          case 17:
            // Click share button
            _c.sent()
            return [
              4 /*yield*/,
              page.fill('input[placeholder="E-mailadres"]', educatieveAuteur),
            ]
          case 18:
            _c.sent()
            return [
              4 /*yield*/,
              page.getByRole('button', { name: 'Rol' }).click(),
            ]
          case 19:
            _c.sent()
            return [
              4 /*yield*/,
              page.getByText('Bewerker', { exact: true }).click(),
            ]
          case 20:
            _c.sent()
            return [4 /*yield*/, page.waitForTimeout(3000)]
          case 21:
            _c.sent()
            return [
              4 /*yield*/,
              page
                .getByRole('button', { name: 'Voeg toe', exact: true })
                .click(),
            ]
          case 22:
            _c.sent()
            return [4 /*yield*/, page.waitForLoadState('networkidle')]
          case 23:
            _c.sent()
            // Check toast message was succesful
            return [
              4 /*yield*/,
              (0, test_1.expect)(
                page.locator(
                  'div > div.Toastify__toast-body > div > div > div.c-alert__message',
                ),
              ).toContainText('Uitnodiging tot samenwerken is verstuurd'),
            ]
          case 24:
            // Check toast message was succesful
            _c.sent()
            emailPending = educatieveAuteur + ' (pending)'
            return [
              4 /*yield*/,
              (0, test_1.expect)(page.getByText(emailPending)).toBeVisible(),
            ]
          case 25:
            _c.sent()
            collectionId = page.url().split('/').reverse()[0]
            return [
              4 /*yield*/,
              (0, get_collection_invite_token_1.getCollectionInviteToken)(
                collectionId,
                educatieveAuteur,
              ),
            ]
          case 26:
            emailInviteToken = _c.sent()
            acceptInviteUrl =
              clientEndpoint +
              'collecties/'
                .concat(collectionId, '?inviteToken=')
                .concat(emailInviteToken)
            // Logout
            return [
              4 /*yield*/,
              (0, logout_onderwijs_avo_1.logoutOnderwijsAvo)(page),
            ]
          case 27:
            // Logout
            _c.sent()
            return [4 /*yield*/, page.waitForLoadState('networkidle')]
          case 28:
            _c.sent()
            // Login as other user
            return [
              4 /*yield*/,
              (0, login_onderwijs_avo_1.loginOnderwijsAvo)(
                page,
                clientEndpoint,
                educatieveAuteur,
                educatieveAuteurPass,
              ),
            ]
          case 29:
            // Login as other user
            _c.sent()
            // Go to invite url
            return [4 /*yield*/, page.goto(acceptInviteUrl)]
          case 30:
            // Go to invite url
            _c.sent()
            return [
              4 /*yield*/,
              (0, test_1.expect)(
                page.locator('strong.c-sticky-bar__cta'),
              ).toContainText(
                'Wil je de collectie \u2018'.concat(
                  collectionTitle,
                  '\u2019 toevoegen aan je Werkruimte?',
                ),
              ),
            ]
          case 31:
            _c.sent()
            // Accept invite
            return [
              4 /*yield*/,
              page
                .getByRole('button', { name: 'Toevoegen', exact: true })
                .click(),
            ]
          case 32:
            // Accept invite
            _c.sent()
            return [4 /*yield*/, page.waitForLoadState('networkidle')]
          case 33:
            _c.sent()
            collectionTitleInOverview = collectionTitle.slice(0, 57) + '...'
            // Go to werkruimte as other user and check new collection
            return [
              4 /*yield*/,
              page.getByRole('link', { name: 'Mijn werkruimte' }).focus(),
            ]
          case 34:
            // Go to werkruimte as other user and check new collection
            _c.sent()
            return [
              4 /*yield*/,
              page.getByRole('link', { name: 'Mijn werkruimte' }).click(),
            ]
          case 35:
            _c.sent()
            return [4 /*yield*/, page.waitForLoadState('networkidle')]
          case 36:
            _c.sent()
            return [
              4 /*yield*/,
              (0, test_1.expect)(
                page.getByRole('link', { name: collectionTitleInOverview }),
              ).toBeVisible(),
            ]
          case 37:
            _c.sent()
            // Logout
            return [
              4 /*yield*/,
              (0, logout_onderwijs_avo_1.logoutOnderwijsAvo)(page),
            ]
          case 38:
            // Logout
            _c.sent()
            return [4 /*yield*/, page.waitForLoadState('networkidle')]
          case 39:
            _c.sent()
            // Login as first user
            return [
              4 /*yield*/,
              (0, login_onderwijs_avo_1.loginOnderwijsAvo)(
                page,
                clientEndpoint,
                process.env.TEST_ADMIN_USER,
                process.env.TEST_ADMIN_PASS,
              ),
            ]
          case 40:
            // Login as first user
            _c.sent()
            // Go to admin page
            return [
              4 /*yield*/,
              page.getByRole('link', { name: 'Beheer' }).click(),
            ]
          case 41:
            // Go to admin page
            _c.sent()
            return [4 /*yield*/, page.waitForLoadState('networkidle')]
          case 42:
            _c.sent()
            return [
              4 /*yield*/,
              (0, test_1.expect)(
                page.getByRole('heading', { name: 'Dashboard' }),
              ).toBeVisible(),
            ]
          case 43:
            _c.sent()
            // Click on collection tab
            return [
              4 /*yield*/,
              page.getByRole('link', { name: 'Collectiebeheer' }).click(),
            ]
          case 44:
            // Click on collection tab
            _c.sent()
            return [4 /*yield*/, page.waitForLoadState('networkidle')]
          case 45:
            _c.sent()
            return [
              4 /*yield*/,
              (0, test_1.expect)(
                page.getByRole('heading', { name: 'Collecties', exact: true }),
              ).toBeVisible(),
            ]
          case 46:
            _c.sent()
            // Check that new collection is shown in a table
            return [
              4 /*yield*/,
              (0, test_1.expect)(
                page.locator('tbody > tr').first(),
              ).toContainText('Aangemaakt door'),
            ]
          case 47:
            // Check that new collection is shown in a table
            _c.sent()
            // Check new collection is shown
            return [
              4 /*yield*/,
              (0, test_1.expect)(
                page.getByRole('link', {
                  name: collectionTitleInAdminOverview,
                }),
              ).toBeVisible(),
            ]
          case 48:
            // Check new collection is shown
            _c.sent()
            // Open the collection
            return [
              4 /*yield*/,
              page
                .getByRole('link', { name: collectionTitleInAdminOverview })
                .click(),
            ]
          case 49:
            // Open the collection
            _c.sent()
            // Check collection opens
            return [
              4 /*yield*/,
              (0, test_1.expect)(
                page.getByRole('heading', { name: 'Over deze collectie' }),
              ).toBeVisible(),
            ]
          case 50:
            // Check collection opens
            _c.sent()
            // Click share button
            return [
              4 /*yield*/,
              page.click(
                'button[aria-label="Deel de collectie met collega\'s (kijken of bewerken)"]',
              ),
            ]
          case 51:
            // Click share button
            _c.sent()
            // Edit added user
            return [
              4 /*yield*/,
              page
                .locator(
                  'ul.c-colleagues-info-list > li:nth-child(2) > div.c-colleague-info-row__action > button:nth-child(1)',
                )
                .click(),
            ]
          case 52:
            // Edit added user
            _c.sent()
            // Check modal opened
            return [
              4 /*yield*/,
              (0, test_1.expect)(
                page.getByRole('heading', {
                  name: 'Rol van gebruiker aanpassen',
                }),
              ).toBeVisible(),
            ]
          case 53:
            // Check modal opened
            _c.sent()
            // Open dropdown
            return [4 /*yield*/, page.click('div.c-rights-select')]
          case 54:
            // Open dropdown
            _c.sent()
            // Select give ownership
            return [
              4 /*yield*/,
              page.getByText('Eigenaarschap overdragen').click(),
            ]
          case 55:
            // Select give ownership
            _c.sent()
            // Confirm
            return [
              4 /*yield*/,
              page.getByRole('button', { name: 'Bevestigen' }).click(),
            ]
          case 56:
            // Confirm
            _c.sent()
            return [4 /*yield*/, page.waitForLoadState('networkidle')]
          case 57:
            _c.sent()
            // Check toast message was succesful
            // await expect(page.getByText('Eigenaarschap succesvol overgedragen')).toBeVisible({
            // 	timeout: TIMEOUT_SECONDS,
            // });
            // CLEANUP
            //REMOVE COLLECTION
            return [
              4 /*yield*/,
              page.getByRole('link', { name: 'Beheer' }).click(),
            ]
          case 58:
            // Check toast message was succesful
            // await expect(page.getByText('Eigenaarschap succesvol overgedragen')).toBeVisible({
            // 	timeout: TIMEOUT_SECONDS,
            // });
            // CLEANUP
            //REMOVE COLLECTION
            _c.sent()
            return [4 /*yield*/, page.waitForLoadState('networkidle')]
          case 59:
            _c.sent()
            return [
              4 /*yield*/,
              (0, test_1.expect)(
                page.getByRole('heading', { name: 'Dashboard' }),
              ).toBeVisible(),
            ]
          case 60:
            _c.sent()
            // Click on collection tab
            return [
              4 /*yield*/,
              page.getByRole('link', { name: 'Collectiebeheer' }).click(),
            ]
          case 61:
            // Click on collection tab
            _c.sent()
            return [4 /*yield*/, page.waitForLoadState('networkidle')]
          case 62:
            _c.sent()
            return [
              4 /*yield*/,
              (0, test_1.expect)(
                page.getByRole('heading', { name: 'Collecties', exact: true }),
              ).toBeVisible(),
            ]
          case 63:
            _c.sent()
            // Check new collection is shown
            return [
              4 /*yield*/,
              (0, test_1.expect)(
                page.getByRole('link', {
                  name: collectionTitleInAdminOverview,
                }),
              ).toBeVisible(),
            ]
          case 64:
            // Check new collection is shown
            _c.sent()
            // Open the collection
            return [
              4 /*yield*/,
              page
                .getByRole('link', { name: collectionTitleInAdminOverview })
                .click(),
            ]
          case 65:
            // Open the collection
            _c.sent()
            // Check collection opens
            return [
              4 /*yield*/,
              (0, test_1.expect)(
                page.getByRole('heading', { name: 'Over deze collectie' }),
              ).toBeVisible(),
            ]
          case 66:
            // Check collection opens
            _c.sent()
            // Click more options
            return [
              4 /*yield*/,
              page.locator('button[aria-label="Meer opties"]').click(),
            ]
          case 67:
            // Click more options
            _c.sent()
            // Click remove
            return [
              4 /*yield*/,
              page.getByText('Verwijderen', { exact: true }).click(),
            ]
          case 68:
            // Click remove
            _c.sent()
            return [4 /*yield*/, page.waitForLoadState('networkidle')]
          case 69:
            _c.sent()
            // Check remove modal opens
            return [
              4 /*yield*/,
              (0, test_1.expect)(
                page.getByRole('heading', {
                  name: 'Verwijder deze collectie',
                  exact: true,
                }),
              ).toBeVisible(),
            ]
          case 70:
            // Check remove modal opens
            _c.sent()
            // Confirm remove modal
            return [
              4 /*yield*/,
              page.getByRole('button', { name: 'Verwijder' }).click(),
            ]
          case 71:
            // Confirm remove modal
            _c.sent()
            // Check toast
            return [
              4 /*yield*/,
              (0, test_1.expect)(
                page.getByText('De collectie werd succesvol verwijderd.'),
              ).toBeVisible(),
            ]
          case 72:
            // Check toast
            _c.sent()
            return [2 /*return*/]
        }
      })
    })
  },
)
