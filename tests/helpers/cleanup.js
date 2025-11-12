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
exports.cleanupTestdata = void 0
var test_1 = require('@playwright/test')
var login_onderwijs_avo_1 = require('./login-onderwijs-avo')
var logout_onderwijs_avo_1 = require('./logout-onderwijs-avo')
function removeCollectionsByE2ETest(page) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          // Recurring function
          // as long as there are collections with 'Aangemaakt door ...' it needs to be removed
          return [4 /*yield*/, page.waitForTimeout(2000)]
        case 1:
          // Recurring function
          // as long as there are collections with 'Aangemaakt door ...' it needs to be removed
          _a.sent()
          // Go to admin page
          return [
            4 /*yield*/,
            page.getByRole('link', { name: 'Beheer' }).click(),
          ]
        case 2:
          // Go to admin page
          _a.sent()
          return [4 /*yield*/, page.waitForLoadState('networkidle')]
        case 3:
          _a.sent()
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.getByRole('heading', { name: 'Dashboard' }),
            ).toBeVisible(),
          ]
        case 4:
          _a.sent()
          // Click on collection tab
          return [
            4 /*yield*/,
            page.getByRole('link', { name: 'Collectiebeheer' }).click(),
          ]
        case 5:
          // Click on collection tab
          _a.sent()
          return [4 /*yield*/, page.waitForLoadState('networkidle')]
        case 6:
          _a.sent()
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.getByRole('heading', { name: 'Collecties', exact: true }),
            ).toBeVisible(),
          ]
        case 7:
          _a.sent()
          return [4 /*yield*/, page.waitForTimeout(2000)]
        case 8:
          _a.sent()
          return [
            4 /*yield*/,
            page
              .locator('tbody > tr:nth-child(1) > td:nth-child(2) > a', {
                hasText: 'Aangemaakt door automatische test',
              })
              .isVisible(),
          ]
        case 9:
          if (!_a.sent()) return [3 /*break*/, 16]
          // Open the collection
          return [
            4 /*yield*/,
            page
              .locator('tbody > tr:nth-child(1) > td:nth-child(2) > a', {
                hasText: 'Aangemaakt door automatische test',
              })
              .click(),
          ]
        case 10:
          // Open the collection
          _a.sent()
          // Click more options
          return [
            4 /*yield*/,
            page.locator('button[aria-label="Meer opties"]').click(),
          ]
        case 11:
          // Click more options
          _a.sent()
          // Click remove
          return [
            4 /*yield*/,
            page.getByText('Verwijderen', { exact: true }).click(),
          ]
        case 12:
          // Click remove
          _a.sent()
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
        case 13:
          // Check remove modal opens
          _a.sent()
          // Confirm remove modal
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Verwijder' }).click(),
          ]
        case 14:
          // Confirm remove modal
          _a.sent()
          // Check for collections again
          return [4 /*yield*/, removeCollectionsByE2ETest(page)]
        case 15:
          // Check for collections again
          _a.sent()
          return [3 /*break*/, 17]
        case 16:
          return [2 /*return*/]
        case 17:
          return [2 /*return*/]
      }
    })
  })
}
function removeBundlesByE2ETest(page) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          // Recurring function
          // as long as there are collections with 'Aangemaakt door ...' it needs to be removed
          return [4 /*yield*/, page.waitForTimeout(2000)]
        case 1:
          // Recurring function
          // as long as there are collections with 'Aangemaakt door ...' it needs to be removed
          _a.sent()
          // Go to admin page
          return [
            4 /*yield*/,
            page.getByRole('link', { name: 'Beheer', exact: true }).click(),
          ]
        case 2:
          // Go to admin page
          _a.sent()
          return [4 /*yield*/, page.waitForLoadState('networkidle')]
        case 3:
          _a.sent()
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.getByRole('heading', { name: 'Dashboard' }),
            ).toBeVisible(),
          ]
        case 4:
          _a.sent()
          // Click on collection tab
          return [
            4 /*yield*/,
            page.getByRole('link', { name: 'Bundelbeheer' }).click(),
          ]
        case 5:
          // Click on collection tab
          _a.sent()
          return [4 /*yield*/, page.waitForLoadState('networkidle')]
        case 6:
          _a.sent()
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.getByRole('heading', { name: 'Collecties', exact: true }),
            ).toBeVisible(),
          ]
        case 7:
          _a.sent()
          return [4 /*yield*/, page.waitForTimeout(2000)]
        case 8:
          _a.sent()
          return [
            4 /*yield*/,
            page
              .locator('tbody > tr:nth-child(1) > td:nth-child(2) > a', {
                hasText: 'Aangemaakt door automatische test',
              })
              .isVisible(),
          ]
        case 9:
          if (!_a.sent()) return [3 /*break*/, 15]
          // Edit bundle
          return [
            4 /*yield*/,
            page
              .locator(
                'tbody > tr:nth-child(1) > td:nth-child(14) > div > a > button[aria-label="Bewerk de bundel"]',
              )
              .click(),
          ]
        case 10:
          // Edit bundle
          _a.sent()
          // Open options of the newly created bundle
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Meer opties' }).click(),
          ]
        case 11:
          // Open options of the newly created bundle
          _a.sent()
          // Click 'Verwijderen'
          return [
            4 /*yield*/,
            page
              .locator('div.c-dropdown__content-open > div > div:nth-child(2)')
              .click(),
          ]
        case 12:
          // Click 'Verwijderen'
          _a.sent()
          // Confirm remove modal
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Verwijder' }).click(),
          ]
        case 13:
          // Confirm remove modal
          _a.sent()
          // Check for bundles again
          return [4 /*yield*/, removeBundlesByE2ETest(page)]
        case 14:
          // Check for bundles again
          _a.sent()
          return [3 /*break*/, 16]
        case 15:
          return [2 /*return*/]
        case 16:
          return [2 /*return*/]
      }
    })
  })
}
function cleanupTestdata(page) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, page.goto(process.env.TEST_CLIENT_ENDPOINT)]
        case 1:
          _a.sent()
          // Logout first
          return [
            4 /*yield*/,
            (0, logout_onderwijs_avo_1.logoutOnderwijsAvo)(page),
          ]
        case 2:
          // Logout first
          _a.sent()
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
        case 3:
          // Login as admin
          _a.sent()
          console.info('CLEANING UP TESTDATA')
          return [4 /*yield*/, removeCollectionsByE2ETest(page)]
        case 4:
          _a.sent()
          return [4 /*yield*/, removeBundlesByE2ETest(page)]
        case 5:
          _a.sent()
          return [2 /*return*/]
      }
    })
  })
}
exports.cleanupTestdata = cleanupTestdata
