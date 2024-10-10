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
var create_collection_1 = require("../helpers/create-collection");
var go_to_page_and_accept_cookies_1 = require("../helpers/go-to-page-and-accept-cookies");
var login_onderwijs_avo_1 = require("../helpers/login-onderwijs-avo");
/**
 * New: https://docs.google.com/spreadsheets/d/1IvhK0v0HSntCwTcXiFseHargwwWwpoCkDMjmMehaDMA/edit#gid=0
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */
(0, test_1.test)('T43: Werkruimte - collecties: Detail collectie voeg tekstblok toe', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var collectionTitle, collectionTitleInOverview;
    var page = _b.page;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, (0, go_to_page_and_accept_cookies_1.goToPageAndAcceptCookies)(page, process.env.TEST_CLIENT_ENDPOINT, process.env.TEST_CLIENT_TITLE)];
            case 1:
                _c.sent();
                return [4 /*yield*/, (0, login_onderwijs_avo_1.loginOnderwijsAvo)(page, process.env.TEST_CLIENT_ENDPOINT, process.env.TEST_BASIS_GEBRUIKER_USER, process.env.TEST_BASIS_GEBRUIKER_PASS)];
            case 2:
                _c.sent();
                return [4 /*yield*/, (0, create_collection_1.createCollection)(page)];
            case 3:
                collectionTitle = _c.sent();
                // Add a second video to the same collection
                return [4 /*yield*/, page.click("button[aria-label='Knip of voeg toe aan collectie']")];
            case 4:
                // Add a second video to the same collection
                _c.sent();
                // Check modal opens
                return [4 /*yield*/, page.waitForTimeout(1000)];
            case 5:
                // Check modal opens
                _c.sent();
                return [4 /*yield*/, (0, test_1.expect)(page.getByRole('heading', { name: 'Voeg dit fragment toe aan een' })).toContainText('Voeg dit fragment toe aan een collectie')];
            case 6:
                _c.sent();
                // Open dropdown existing collections
                return [4 /*yield*/, page.click('#existingCollection')];
            case 7:
                // Open dropdown existing collections
                _c.sent();
                // Select existing collection created earlier in the test
                return [4 /*yield*/, page.getByText(collectionTitle).click()];
            case 8:
                // Select existing collection created earlier in the test
                _c.sent();
                // Save
                return [4 /*yield*/, page.getByRole('button', { name: 'Toepassen' }).click()];
            case 9:
                // Save
                _c.sent();
                // Check toast message was succesful
                return [4 /*yield*/, (0, test_1.expect)(page.locator('div > div.Toastify__toast-body > div > div > div.c-alert__message')).toContainText('Het fragment is toegevoegd aan de collectie in je Werkruimte.')];
            case 10:
                // Check toast message was succesful
                _c.sent();
                return [4 /*yield*/, page.waitForTimeout(1000)];
            case 11:
                _c.sent();
                // Go to werkruimte
                return [4 /*yield*/, page.getByRole('link', { name: 'Mijn werkruimte' }).click()];
            case 12:
                // Go to werkruimte
                _c.sent();
                collectionTitleInOverview = collectionTitle.slice(0, 57) + '...';
                return [4 /*yield*/, (0, test_1.expect)(page.getByRole('link', { name: collectionTitleInOverview })).toBeVisible()];
            case 13:
                _c.sent();
                // Click on the above link
                return [4 /*yield*/, page.getByRole('link', { name: collectionTitleInOverview }).click()];
            case 14:
                // Click on the above link
                _c.sent();
                // Edit collection
                return [4 /*yield*/, page.getByRole('button', { name: 'Bewerken', exact: true }).click()];
            case 15:
                // Edit collection
                _c.sent();
                return [4 /*yield*/, page.waitForTimeout(1000)];
            case 16:
                _c.sent();
                // Click second Add block button
                return [4 /*yield*/, page
                        .locator('div.c-sticky-bar__wrapper > div > div > div:nth-child(3) > div > div:nth-child(2) > button')
                        .click()];
            case 17:
                // Click second Add block button
                _c.sent();
                // Fill in title and description of text block
                return [4 /*yield*/, page.fill('div.m-collection-or-bundle-edit-content.o-container-vertical > div > div:nth-child(4) > div.c-panel__body > div > div > div:nth-child(1) > div > input', 'Automatische test titel tekst blok')];
            case 18:
                // Fill in title and description of text block
                _c.sent();
                return [4 /*yield*/, page.fill('div.DraftEditor-editorContainer > div[contenteditable="true"]', 'Automatische test beschrijving tekst blok')];
            case 19:
                _c.sent();
                // Check if banner appeared
                return [4 /*yield*/, (0, test_1.expect)(page.locator('div.c-sticky-bar')).toContainText('Wijzigingen opslaan?')];
            case 20:
                // Check if banner appeared
                _c.sent();
                // Wait for toast
                return [4 /*yield*/, page.waitForTimeout(2000)];
            case 21:
                // Wait for toast
                _c.sent();
                // Save changes
                return [4 /*yield*/, page.getByRole('button', { name: 'Opslaan' }).click()];
            case 22:
                // Save changes
                _c.sent();
                // Wait for toast
                return [4 /*yield*/, page.waitForTimeout(2000)];
            case 23:
                // Wait for toast
                _c.sent();
                // Check toast message was succesful
                return [4 /*yield*/, (0, test_1.expect)(page.locator('div > div.Toastify__toast-body > div > div > div.c-alert__message')).toContainText('Collectie opgeslagen')];
            case 24:
                // Check toast message was succesful
                _c.sent();
                // Close edit mode
                return [4 /*yield*/, page.getByRole('button', { name: 'Sluiten' }).click()];
            case 25:
                // Close edit mode
                _c.sent();
                // Check if text block is visible and as a second block
                return [4 /*yield*/, (0, test_1.expect)(page.locator('ul.c-collection-list > li:nth-child(2) > div > h3')).toContainText('Automatische test titel tekst blok')];
            case 26:
                // Check if text block is visible and as a second block
                _c.sent();
                return [4 /*yield*/, (0, test_1.expect)(page.locator('ul.c-collection-list > li:nth-child(2) > div > div > div > p')).toContainText('Automatische test beschrijving tekst blok')];
            case 27:
                _c.sent();
                return [4 /*yield*/, page.waitForTimeout(3000)];
            case 28:
                _c.sent();
                // CLEANUP
                //REMOVE COLLECTION
                // Go to werkruimte
                return [4 /*yield*/, page.getByRole('link', { name: 'Mijn werkruimte' }).click()];
            case 29:
                // CLEANUP
                //REMOVE COLLECTION
                // Go to werkruimte
                _c.sent();
                // Open options of the newly created collection
                return [4 /*yield*/, page
                        .locator('tr:nth-child(1) > td:nth-child(6) > div > div.c-dropdown__trigger > button')
                        .click()];
            case 30:
                // Open options of the newly created collection
                _c.sent();
                // Click 'Verwijderen'
                return [4 /*yield*/, page
                        .locator('tr:nth-child(1) > td:nth-child(6) > div > div.c-dropdown__content-open > div > div:nth-child(3)')
                        .click()];
            case 31:
                // Click 'Verwijderen'
                _c.sent();
                // Confirm remove modal
                return [4 /*yield*/, page.getByRole('button', { name: 'Verwijder' }).click()];
            case 32:
                // Confirm remove modal
                _c.sent();
                // Check new collection is removed
                return [4 /*yield*/, (0, test_1.expect)(page.getByRole('link', { name: collectionTitleInOverview })).not.toBeVisible()];
            case 33:
                // Check new collection is removed
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
