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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var uuid_1 = require("uuid");
var go_to_page_and_accept_cookies_1 = require("../helpers/go-to-page-and-accept-cookies");
/**
 * New: https://docs.google.com/spreadsheets/d/1IvhK0v0HSntCwTcXiFseHargwwWwpoCkDMjmMehaDMA/edit#gid=0
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */
test_1.test.skip('T02: Nieuw account aanmaken', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var userId, userEmail, userPassword, stamboekNummer, recapchaFrame, recaptcha, greenCheckmark;
    var page = _b.page;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                userId = (0, uuid_1.v4)().replace(/-/g, '');
                userEmail = "hetarchief2.0+atbasisgebruiker".concat(userId, "@meemoo.be");
                userPassword = process.env.TEST_NEW_USER_PASSWORD;
                stamboekNummer = '97436428856';
                return [4 /*yield*/, (0, go_to_page_and_accept_cookies_1.goToPageAndAcceptCookies)(page, process.env.TEST_CLIENT_ENDPOINT, //TODO: use INT env so a dev version of captcha is used
                    process.env.TEST_CLIENT_TITLE)];
            case 1:
                _c.sent();
                // Click log in button
                return [4 /*yield*/, page.getByText('Account aanmaken', { exact: true }).click()];
            case 2:
                // Click log in button
                _c.sent();
                // Check flyout opens
                return [4 /*yield*/, (0, test_1.expect)(page.getByRole('heading', { name: 'Ben je lesgever?' })).toBeVisible()];
            case 3:
                // Check flyout opens
                _c.sent();
                // Click create free teacher account button
                return [4 /*yield*/, page.getByRole('button', { name: 'Maak je gratis account aan' }).click()];
            case 4:
                // Click create free teacher account button
                _c.sent();
                // Check teacher login page opens
                return [4 /*yield*/, (0, test_1.expect)(page.getByRole('heading', { name: 'Geef hieronder je lerarenkaart- of stamboeknummer in.' })).toBeVisible()];
            case 5:
                // Check teacher login page opens
                _c.sent();
                // Fill in credentials
                return [4 /*yield*/, page.fill('div.m-stamboek-input > input', stamboekNummer)];
            case 6:
                // Fill in credentials
                _c.sent();
                // Check teachernumber is correct
                return [4 /*yield*/, (0, test_1.expect)(page.getByText('Het stamboeknummer is geldig.', { exact: true })).toBeVisible()];
            case 7:
                // Check teachernumber is correct
                _c.sent();
                // Click create account button
                return [4 /*yield*/, page.getByRole('button', { name: 'Account aanmaken' }).click()];
            case 8:
                // Click create account button
                _c.sent();
                // Check form page opens
                return [4 /*yield*/, (0, test_1.expect)(page.getByRole('heading', { name: 'Maak je gratis account aan' })).toBeVisible()];
            case 9:
                // Check form page opens
                _c.sent();
                // Fill in credentials
                return [4 /*yield*/, page.fill('#person_email', userEmail)];
            case 10:
                // Fill in credentials
                _c.sent();
                return [4 /*yield*/, page.fill('#person_first_name', 'Automated')];
            case 11:
                _c.sent();
                return [4 /*yield*/, page.fill('#person_last_name', 'Test')];
            case 12:
                _c.sent();
                return [4 /*yield*/, page.fill('#password_field', userPassword)];
            case 13:
                _c.sent();
                return [4 /*yield*/, page.fill('#password_confirmation_field', userPassword)];
            case 14:
                _c.sent();
                return [4 /*yield*/, page.click('body')];
            case 15:
                _c.sent();
                return [4 /*yield*/, page.frameLocator('iframe[title="reCAPTCHA"]')];
            case 16:
                recapchaFrame = _c.sent();
                recaptcha = recapchaFrame.locator('#recaptcha-anchor');
                return [4 /*yield*/, recaptcha.click()];
            case 17:
                _c.sent();
                return [4 /*yield*/, recapchaFrame.locator('.recaptcha-checkbox-checked')];
            case 18:
                greenCheckmark = _c.sent();
                return [4 /*yield*/, greenCheckmark.waitFor({
                        timeout: 10000,
                        state: 'visible',
                    })];
            case 19:
                _c.sent();
                // Accept the gdpr checkbox
                return [4 /*yield*/, page.locator('#person_confirm_gdpr').click()];
            case 20:
                // Accept the gdpr checkbox
                _c.sent();
                return [4 /*yield*/, page.waitForTimeout(2000)];
            case 21:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
