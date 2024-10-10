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
(0, test_1.test)('T41: Werkruimte - collecties: Detail collectie zet publiek', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
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
                // Go to werkruimte
                return [4 /*yield*/, page.getByRole('link', { name: 'Mijn werkruimte' }).click()];
            case 4:
                // Go to werkruimte
                _c.sent();
                collectionTitleInOverview = collectionTitle.slice(0, 57) + '...';
                return [4 /*yield*/, (0, test_1.expect)(page.getByRole('link', { name: collectionTitleInOverview })).toBeVisible()];
            case 5:
                _c.sent();
                // Click on the above link
                return [4 /*yield*/, page.getByRole('link', { name: collectionTitleInOverview }).click()];
            case 6:
                // Click on the above link
                _c.sent();
                // Click public button
                return [4 /*yield*/, page.click("button[aria-label='Maak deze collectie publiek']")];
            case 7:
                // Click public button
                _c.sent();
                // Check modal opens
                return [4 /*yield*/, (0, test_1.expect)(page.getByRole('heading', { name: 'Maak deze collectie publiek' })).toBeVisible()];
            case 8:
                // Check modal opens
                _c.sent();
                // Check public radio button
                return [4 /*yield*/, page
                        .locator('div.c-modal-context.c-modal-context--visible > div > div.scrollbar-container.c-modal__body.ps > div.o-form-group > div > div.c-radio-group > div:nth-child(2) > label > input[type=radio]')
                        .check()];
            case 9:
                // Check public radio button
                _c.sent();
                return [4 /*yield*/, page.waitForTimeout(1000)];
            case 10:
                _c.sent();
                // Confirm public modal
                return [4 /*yield*/, page.getByRole('button', { name: 'Opslaan' }).click()];
            case 11:
                // Confirm public modal
                _c.sent();
                // Check errors are shown
                return [4 /*yield*/, (0, test_1.expect)(page.locator('div.o-form-group.o-form-group--error > div > div:nth-child(3)')).toContainText('De collectie heeft geen beschrijving.')];
            case 12:
                // Check errors are shown
                _c.sent();
                return [4 /*yield*/, (0, test_1.expect)(page.locator('div.o-form-group.o-form-group--error > div > div:nth-child(4)')).toContainText('De collectie heeft geen onderwijsniveau(s).')];
            case 13:
                _c.sent();
                return [4 /*yield*/, (0, test_1.expect)(page.locator('div.o-form-group.o-form-group--error > div > div:nth-child(5)')).toContainText('De collectie heeft geen thema(s).')];
            case 14:
                _c.sent();
                return [4 /*yield*/, (0, test_1.expect)(page.locator('div.o-form-group.o-form-group--error > div > div:nth-child(6)')).toContainText('De collectie heeft geen vak(ken).')];
            case 15:
                _c.sent();
                // Cancel public modal
                return [4 /*yield*/, page.getByRole('button', { name: 'Annuleren' }).click()];
            case 16:
                // Cancel public modal
                _c.sent();
                // Edit collection
                return [4 /*yield*/, page.getByRole('button', { name: 'Bewerken', exact: true }).click()];
            case 17:
                // Edit collection
                _c.sent();
                // Click on publication details tab
                return [4 /*yield*/, page.click('div.c-collection-or-bundle-edit > div.c-navbar.c-navbar--bordered-bottom.c-navbar--auto.c-navbar--bg-alt > div > nav > div:nth-child(2)')];
            case 18:
                // Click on publication details tab
                _c.sent();
                // Check if Onderwijs input is visible
                return [4 /*yield*/, (0, test_1.expect)(page.locator('#educationId')).toBeVisible()];
            case 19:
                // Check if Onderwijs input is visible
                _c.sent();
                // Check if Thema's input is visible
                return [4 /*yield*/, (0, test_1.expect)(page.locator('#themeId')).toBeVisible()];
            case 20:
                // Check if Thema's input is visible
                _c.sent();
                // Check if Vakken input is visible
                return [4 /*yield*/, (0, test_1.expect)(page.locator('#subjectId')).toBeVisible()];
            case 21:
                // Check if Vakken input is visible
                _c.sent();
                // Check if Korte beschrijving input is visible
                return [4 /*yield*/, (0, test_1.expect)(page.locator('#shortDescriptionId')).toBeVisible()];
            case 22:
                // Check if Korte beschrijving input is visible
                _c.sent();
                // Check if 'Persoonlijke notities' input is visible
                return [4 /*yield*/, (0, test_1.expect)(page.locator('#personalRemarkId')).toBeVisible()];
            case 23:
                // Check if 'Persoonlijke notities' input is visible
                _c.sent();
                // Open Onderwijs dropdown
                return [4 /*yield*/, page.click('#educationId')];
            case 24:
                // Open Onderwijs dropdown
                _c.sent();
                // Select option
                return [4 /*yield*/, page.getByText('Deeltijds kunstonderwijs', { exact: true }).click()];
            case 25:
                // Select option
                _c.sent();
                // Open Onderwijs dropdown
                return [4 /*yield*/, page.click('#educationId')];
            case 26:
                // Open Onderwijs dropdown
                _c.sent();
                // Select option
                return [4 /*yield*/, page.getByText('Hoger onderwijs', { exact: true }).click()];
            case 27:
                // Select option
                _c.sent();
                // Open Thema's dropdown
                return [4 /*yield*/, page.click('#themeId')];
            case 28:
                // Open Thema's dropdown
                _c.sent();
                // Select subdropdown
                return [4 /*yield*/, page.getByText('MAATSCHAPPIJ EN WELZIJN').click()];
            case 29:
                // Select subdropdown
                _c.sent();
                // Select option
                return [4 /*yield*/, page.getByText('armoede en welvaart', { exact: true }).click()];
            case 30:
                // Select option
                _c.sent();
                // Open Thema's dropdown
                return [4 /*yield*/, page.click('#themeId')];
            case 31:
                // Open Thema's dropdown
                _c.sent();
                // Select subdropdown
                return [4 /*yield*/, page.getByText('GESCHIEDENIS').click()];
            case 32:
                // Select subdropdown
                _c.sent();
                // Select option
                return [4 /*yield*/, page.getByText('erfgoed', { exact: true }).click()];
            case 33:
                // Select option
                _c.sent();
                // Open Vakken dropdown
                return [4 /*yield*/, page.click('#subjectId')];
            case 34:
                // Open Vakken dropdown
                _c.sent();
                // Select option
                return [4 /*yield*/, page.getByText('Aardrijkskunde', { exact: true }).click()];
            case 35:
                // Select option
                _c.sent();
                // Open Vakken dropdown
                return [4 /*yield*/, page.click('#subjectId')];
            case 36:
                // Open Vakken dropdown
                _c.sent();
                // Select option
                return [4 /*yield*/, page.getByText('Toegepaste informatica', { exact: true }).click()];
            case 37:
                // Select option
                _c.sent();
                // Fill in korte beschrijving
                return [4 /*yield*/, page.fill('#shortDescriptionId', 'Dit is een korte beschrijving tekst.')];
            case 38:
                // Fill in korte beschrijving
                _c.sent();
                // Fill in Persoonlijke notities
                return [4 /*yield*/, page.fill('#personalRemarkId', 'Dit is een persoonlijke notitie tekst.')];
            case 39:
                // Fill in Persoonlijke notities
                _c.sent();
                // Check if banner appeared
                return [4 /*yield*/, (0, test_1.expect)(page.locator('div.c-sticky-bar')).toContainText('Wijzigingen opslaan?')];
            case 40:
                // Check if banner appeared
                _c.sent();
                // Save changes
                return [4 /*yield*/, page.getByRole('button', { name: 'Opslaan' }).click()];
            case 41:
                // Save changes
                _c.sent();
                return [4 /*yield*/, page.waitForTimeout(3000)];
            case 42:
                _c.sent();
                // Click public button
                return [4 /*yield*/, page.click("button[aria-label='Maak deze collectie publiek']")];
            case 43:
                // Click public button
                _c.sent();
                // Check modal opens
                return [4 /*yield*/, (0, test_1.expect)(page.getByRole('heading', { name: 'Maak deze collectie publiek' })).toBeVisible()];
            case 44:
                // Check modal opens
                _c.sent();
                // Check public radio button
                return [4 /*yield*/, page
                        .locator('div.c-modal-context.c-modal-context--visible > div > div.scrollbar-container.c-modal__body.ps > div.o-form-group > div > div.c-radio-group > div:nth-child(2) > label > input[type=radio]')
                        .check()];
            case 45:
                // Check public radio button
                _c.sent();
                return [4 /*yield*/, page.waitForTimeout(1000)];
            case 46:
                _c.sent();
                // Confirm public modal
                return [4 /*yield*/, page.getByRole('button', { name: 'Opslaan' }).click()];
            case 47:
                // Confirm public modal
                _c.sent();
                return [4 /*yield*/, page.waitForTimeout(3000)];
            case 48:
                _c.sent();
                // Check toast message was succesful
                return [4 /*yield*/, (0, test_1.expect)(page.getByText('De collectie staat nu publiek.')).toBeVisible()];
            case 49:
                // Check toast message was succesful
                _c.sent();
                // Go to werkruimte
                return [4 /*yield*/, page.getByRole('link', { name: 'Mijn werkruimte' }).click()];
            case 50:
                // Go to werkruimte
                _c.sent();
                // Check if Collection is public
                return [4 /*yield*/, (0, test_1.expect)(page.locator("tr:nth-child(1) > td:nth-child(5) > div[title='Publiek']")).toBeVisible()];
            case 51:
                // Check if Collection is public
                _c.sent();
                return [4 /*yield*/, (0, test_1.expect)(page.locator("tr:nth-child(1) > td:nth-child(5) > div[title='Niet publiek']")).not.toBeVisible()];
            case 52:
                _c.sent();
                // CLEANUP
                //REMOVE COLLECTION
                // // Go to werkruimte
                // await page.getByRole('link', { name: 'Mijn werkruimte' }).click();
                // Open options of the newly created collection
                return [4 /*yield*/, page
                        .locator('tr:nth-child(1) > td:nth-child(6) > div > div.c-dropdown__trigger > button')
                        .click()];
            case 53:
                // CLEANUP
                //REMOVE COLLECTION
                // // Go to werkruimte
                // await page.getByRole('link', { name: 'Mijn werkruimte' }).click();
                // Open options of the newly created collection
                _c.sent();
                // Click 'Verwijderen'
                return [4 /*yield*/, page
                        .locator('tr:nth-child(1) > td:nth-child(6) > div > div.c-dropdown__content-open > div > div:nth-child(3)')
                        .click()];
            case 54:
                // Click 'Verwijderen'
                _c.sent();
                // Confirm remove modal
                return [4 /*yield*/, page.getByRole('button', { name: 'Verwijder' }).click()];
            case 55:
                // Confirm remove modal
                _c.sent();
                // Check new collection is removed
                return [4 /*yield*/, (0, test_1.expect)(page.getByRole('link', { name: collectionTitleInOverview })).not.toBeVisible()];
            case 56:
                // Check new collection is removed
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
