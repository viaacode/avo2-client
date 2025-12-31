"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var test_1 = require("@playwright/test");
var go_to_page_and_accept_cookies_1 = require("../helpers/go-to-page-and-accept-cookies");
var login_onderwijs_avo_1 = require("../helpers/login-onderwijs-avo");
/**
 * New: https://docs.google.com/spreadsheets/d/1IvhK0v0HSntCwTcXiFseHargwwWwpoCkDMjmMehaDMA/edit#gid=0
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */
(0, test_1.test)('T12: Zoeken - zoeken op keyword', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var page = _b.page;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, (0, go_to_page_and_accept_cookies_1.goToPageAndAcceptCookies)(page, process.env.TEST_CLIENT_ENDPOINT, process.env.TEST_CLIENT_TITLE)];
            case 1:
                _c.sent();
                return [4 /*yield*/, (0, login_onderwijs_avo_1.loginOnderwijsAvo)(page, process.env.TEST_CLIENT_ENDPOINT, process.env.TEST_BASIS_GEBRUIKER_USER, process.env.TEST_BASIS_GEBRUIKER_PASS)
                    // Click search button
                ];
            case 2:
                _c.sent();
                // Click search button
                return [4 /*yield*/, page.getByRole('link', { name: 'Zoeken', exact: true }).click()
                    // Check Search page opens
                ];
            case 3:
                // Click search button
                _c.sent();
                // Check Search page opens
                return [4 /*yield*/, (0, test_1.expect)(page.getByRole('heading', { name: 'Zoekresultaten' })).toBeVisible()
                    // Fill in keyword
                ];
            case 4:
                // Check Search page opens
                _c.sent();
                // Fill in keyword
                return [4 /*yield*/, page.fill('#query', 'test')
                    // Wait for items to load
                ];
            case 5:
                // Fill in keyword
                _c.sent();
                // Wait for items to load
                return [4 /*yield*/, page.waitForTimeout(2000)
                    // Click search button
                ];
            case 6:
                // Wait for items to load
                _c.sent();
                // Click search button
                return [4 /*yield*/, page.getByRole('button', { name: 'Zoeken' }).click()
                    // Wait for items to load
                ];
            case 7:
                // Click search button
                _c.sent();
                // Wait for items to load
                return [4 /*yield*/, page.waitForTimeout(2000)
                    // Click first item
                ];
            case 8:
                // Wait for items to load
                _c.sent();
                // Click first item
                return [4 /*yield*/, page.locator('.c-thumbnail-meta--img-is-loaded').first().click()
                    // Check title and body contains test
                ];
            case 9:
                // Click first item
                _c.sent();
                // Check title and body contains test
                return [4 /*yield*/, (0, test_1.expect)(page.locator('h2.c-item-detail__header')).toContainText('Test')];
            case 10:
                // Check title and body contains test
                _c.sent();
                return [4 /*yield*/, (0, test_1.expect)(page.locator('.c-content').first()).toContainText('test')
                    // // Wait for close to save the videos
                    // await context.close();
                ];
            case 11:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
