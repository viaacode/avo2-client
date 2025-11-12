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
var logout_onderwijs_avo_1 = require('../helpers/logout-onderwijs-avo') /**
 * This test requires `PROXY_E2E=true`
 * https://github.com/viaacode/avo2-proxy/commit/ae4e79f3b1c4826f5c81ba570b15d904990d43b7
 * https://github.com/viaacode/avo2-proxy/commit/9b9b740fea4b66478d850da4de8a1d74da8d845e
 */
/**
 * This test requires `PROXY_E2E=true`
 * https://github.com/viaacode/avo2-proxy/commit/ae4e79f3b1c4826f5c81ba570b15d904990d43b7
 * https://github.com/viaacode/avo2-proxy/commit/9b9b740fea4b66478d850da4de8a1d74da8d845e
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
  'T65: opdracht delen van lesgever lager naar lesgever secundair',
  function (_a) {
    return __awaiter(void 0, [_a], void 0, function (_b) {
      var page = _b.page
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            return [
              4 /*yield*/,
              shareAssignmentAndAccept(
                page,
                {
                  user: process.env.TEST_LESGEVER_LAGER_GEBRUIKER_USER,
                  pass: process.env.TEST_LESGEVER_LAGER_GEBRUIKER_PASS,
                },
                {
                  user: process.env.TEST_LESGEVER_SECUNDAIR_GEBRUIKER_USER,
                  pass: process.env.TEST_LESGEVER_SECUNDAIR_GEBRUIKER_PASS,
                },
                false,
              ),
            ]
          case 1:
            _c.sent()
            return [2 /*return*/]
        }
      })
    })
  },
)
;(0, test_1.test)(
  'T65: opdracht delen van lesgever secundair naar lesgever lager',
  function (_a) {
    return __awaiter(void 0, [_a], void 0, function (_b) {
      var page = _b.page
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            return [
              4 /*yield*/,
              shareAssignmentAndAccept(
                page,
                {
                  user: process.env.TEST_LESGEVER_SECUNDAIR_GEBRUIKER_USER,
                  pass: process.env.TEST_LESGEVER_SECUNDAIR_GEBRUIKER_PASS,
                },
                {
                  user: process.env.TEST_LESGEVER_LAGER_GEBRUIKER_USER,
                  pass: process.env.TEST_LESGEVER_LAGER_GEBRUIKER_PASS,
                },
                false,
              ),
            ]
          case 1:
            _c.sent()
            return [2 /*return*/]
        }
      })
    })
  },
)
;(0, test_1.test)(
  'T65: opdracht delen van lesgever lager naar lesgever beide',
  function (_a) {
    return __awaiter(void 0, [_a], void 0, function (_b) {
      var page = _b.page
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            return [
              4 /*yield*/,
              shareAssignmentAndAccept(
                page,
                {
                  user: process.env.TEST_LESGEVER_LAGER_GEBRUIKER_USER,
                  pass: process.env.TEST_LESGEVER_LAGER_GEBRUIKER_PASS,
                },
                {
                  user: process.env.TEST_LESGEVER_BEIDE_GEBRUIKER_USER,
                  pass: process.env.TEST_LESGEVER_BEIDE_GEBRUIKER_PASS,
                },
                true,
              ),
            ]
          case 1:
            _c.sent()
            return [2 /*return*/]
        }
      })
    })
  },
)
;(0, test_1.test)(
  'T65: opdracht delen van lesgever secundair naar lesgever beide',
  function (_a) {
    return __awaiter(void 0, [_a], void 0, function (_b) {
      var page = _b.page
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            return [
              4 /*yield*/,
              shareAssignmentAndAccept(
                page,
                {
                  user: process.env.TEST_LESGEVER_SECUNDAIR_GEBRUIKER_USER,
                  pass: process.env.TEST_LESGEVER_SECUNDAIR_GEBRUIKER_PASS,
                },
                {
                  user: process.env.TEST_LESGEVER_BEIDE_GEBRUIKER_USER,
                  pass: process.env.TEST_LESGEVER_BEIDE_GEBRUIKER_PASS,
                },
                true,
              ),
            ]
          case 1:
            _c.sent()
            return [2 /*return*/]
        }
      })
    })
  },
)
function createAssignmentWithTitle(page) {
  return __awaiter(this, void 0, void 0, function () {
    var date, assignmentTitle
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          // Click mijn werkruimte
          return [
            4 /*yield*/,
            page.getByRole('link', { name: 'Mijn werkruimte' }).click(),
          ]
        case 1:
          // Click mijn werkruimte
          _a.sent()
          // Go to assignments tab
          return [4 /*yield*/, page.click('div[data-id="opdrachten"]')]
        case 2:
          // Go to assignments tab
          _a.sent()
          // Create new assignment
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Nieuwe opdracht' }).click(),
          ]
        case 3:
          // Create new assignment
          _a.sent()
          // Check if banner appeared
          return [
            4 /*yield*/,
            (0, test_1.expect)(page.locator('div.c-sticky-bar')).toContainText(
              'Wijzigingen opslaan?',
            ),
          ]
        case 4:
          // Check if banner appeared
          _a.sent()
          return [4 /*yield*/, page.waitForTimeout(1000)]
        case 5:
          _a.sent()
          // Save changes
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Opslaan' }).click(),
          ]
        case 6:
          // Save changes
          _a.sent()
          // Edit assignment
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Bewerken' }).click(),
          ]
        case 7:
          // Edit assignment
          _a.sent()
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
        case 8:
          // Open input title
          _a.sent()
          date = new Date()
          assignmentTitle = 'Aangemaakt door automatische test ' + date
          return [
            4 /*yield*/,
            page
              .locator('input[placeholder="Geef een titel in"]')
              .nth(1)
              .fill(assignmentTitle),
          ]
        case 9:
          _a.sent()
          return [4 /*yield*/, page.click('div.c-content-input__submit')]
        case 10:
          _a.sent()
          return [4 /*yield*/, page.waitForTimeout(1000)]
        case 11:
          _a.sent()
          // Save changes
          return [
            4 /*yield*/,
            page.getByRole('button', { name: 'Opslaan' }).click(),
          ]
        case 12:
          // Save changes
          _a.sent()
          return [2 /*return*/, page.url()]
      }
    })
  })
}
function goToShareWithColleagues(page) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          // Click "Delen"
          return [
            4 /*yield*/,
            page.click(
              'div.u-hide-lt-bp2 > div > div.o-container-vertical.o-container-vertical--small > div > div > div.c-toolbar__right > div > div.u-hide-lt-bp2 > div > div.c-share-dropdown.c-dropdown.c-dropdown__trigger > button',
            ),
          ]
        case 1:
          // Click "Delen"
          _a.sent()
          // Click "Collega's"
          return [
            4 /*yield*/,
            page.click(
              '.c-share-dropdown + .c-dropdown__content-open .c-tab-item:first-child',
            ),
          ]
        case 2:
          // Click "Collega's"
          _a.sent()
          return [4 /*yield*/, page.waitForTimeout(1000)]
        case 3:
          _a.sent()
          return [2 /*return*/]
      }
    })
  })
}
function shareAssignmentWith(page_1, email_1) {
  return __awaiter(this, arguments, void 0, function (page, email, role) {
    if (role === void 0) {
      role = 1
    }
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          // enter contributor email
          return [
            4 /*yield*/,
            page
              .locator(
                '.c-share-dropdown + .c-dropdown__content-open .c-add-colleague input',
              )
              .nth(0)
              .fill(email),
          ]
        case 1:
          // enter contributor email
          _a.sent()
          // open role selection
          return [
            4 /*yield*/,
            page.click(
              '.c-share-dropdown + .c-dropdown__content-open .c-add-colleague .c-dropdown__trigger',
            ),
          ]
        case 2:
          // open role selection
          _a.sent()
          return [
            4 /*yield*/,
            page.click(
              '.c-share-dropdown + .c-dropdown__content-open .c-add-colleague .c-dropdown__content-open .c-menu__item:nth-child('.concat(
                role,
                ')',
              ),
            ),
          ]
        case 3:
          _a.sent()
          return [4 /*yield*/, page.waitForTimeout(1000)]
        case 4:
          _a.sent()
          // submit add contributor
          return [
            4 /*yield*/,
            page.click(
              '.c-share-dropdown + .c-dropdown__content-open .c-add-colleague__button',
            ),
          ]
        case 5:
          // submit add contributor
          _a.sent()
          // confirm warning
          return [
            4 /*yield*/,
            page.click(
              '.c-modal-context--visible .c-button-toolbar .c-button--primary',
            ),
          ]
        case 6:
          // confirm warning
          _a.sent()
          return [4 /*yield*/, page.waitForTimeout(5000)]
        case 7:
          _a.sent()
          return [2 /*return*/]
      }
    })
  })
}
function acceptAssignmentInvitation(page, assignmentId) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          // Go to assignment page with token
          return [
            4 /*yield*/,
            page.goto(
              ''
                .concat(process.env.TEST_CLIENT_ENDPOINT, 'opdrachten/')
                .concat(assignmentId, '?inviteToken=')
                .concat(assignmentId),
            ),
          ]
        case 1:
          // Go to assignment page with token
          _a.sent()
          return [4 /*yield*/, page.waitForTimeout(1000)]
        case 2:
          _a.sent()
          // click "Toevoegen"
          return [
            4 /*yield*/,
            page.click('.c-sticky-bar__cta ~ button:nth-child(3)'),
          ]
        case 3:
          // click "Toevoegen"
          _a.sent()
          return [2 /*return*/]
      }
    })
  })
}
function shareAssignmentAndAccept(page, from, to, shouldBeEditable) {
  return __awaiter(this, void 0, void 0, function () {
    var url, title, assignmentUrl, assignmentId
    var _a
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          url = process.env.TEST_CLIENT_ENDPOINT
          title = process.env.TEST_CLIENT_TITLE
          return [
            4 /*yield*/,
            (0, go_to_page_and_accept_cookies_1.goToPageAndAcceptCookies)(
              page,
              url,
              title,
            ),
          ]
        case 1:
          _b.sent()
          return [
            4 /*yield*/,
            (0, login_onderwijs_avo_1.loginOnderwijsAvo)(
              page,
              url,
              from.user,
              from.pass,
            ),
          ]
        case 2:
          _b.sent()
          return [4 /*yield*/, createAssignmentWithTitle(page)]
        case 3:
          assignmentUrl = _b.sent()
          assignmentId =
            (_a = assignmentUrl.match(/opdrachten\/(.*)\/bewerk/)) === null ||
            _a === void 0
              ? void 0
              : _a[1]
          ;(0, test_1.expect)(assignmentId).toBeTruthy()
          return [4 /*yield*/, page.waitForTimeout(5000)]
        case 4:
          _b.sent()
          return [4 /*yield*/, goToShareWithColleagues(page)]
        case 5:
          _b.sent()
          return [4 /*yield*/, shareAssignmentWith(page, to.user)]
        case 6:
          _b.sent()
          return [
            4 /*yield*/,
            (0, logout_onderwijs_avo_1.logoutOnderwijsAvo)(
              page,
              from.user === process.env.TEST_LESGEVER_SECUNDAIR_GEBRUIKER_USER,
            ),
          ]
        case 7:
          _b.sent()
          return [
            4 /*yield*/,
            (0, login_onderwijs_avo_1.loginOnderwijsAvo)(
              page,
              url,
              to.user,
              to.pass,
            ),
          ]
        case 8:
          _b.sent()
          return [4 /*yield*/, acceptAssignmentInvitation(page, assignmentId)]
        case 9:
          _b.sent()
          // Check "Bewerken" button
          return [
            4 /*yield*/,
            (0, test_1.expect)(
              page.locator('.c-header .c-button--primary').nth(0),
            ).toBeVisible({
              visible: shouldBeEditable,
            }),
          ]
        case 10:
          // Check "Bewerken" button
          _b.sent()
          return [2 /*return*/]
      }
    })
  })
}
