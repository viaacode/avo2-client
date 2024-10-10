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
var go_to_admin_1 = require("../../helpers/go-to-admin");
/**
 * New: https://docs.google.com/spreadsheets/d/1sy6q3Q6Hl3LhvXY4JeCblhh4-REj8gyzAzyYwQVZZxc/edit#gid=95954947
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */
(0, test_1.test)('T15: Beheer - Contentpagina bewerken', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var date, pageTitle, hyperlinkTitle, inputValue, pageTitleInOverview;
    var page = _b.page;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, (0, go_to_admin_1.goToAdminPage)(page)];
            case 1:
                _c.sent();
                // Click on contentpages tab
                return [4 /*yield*/, page.getByRole('link', { name: "Contentpagina's" }).click()];
            case 2:
                // Click on contentpages tab
                _c.sent();
                return [4 /*yield*/, (0, test_1.expect)(page.getByRole('heading', { name: 'Contentoverzicht', exact: true })).toBeVisible()];
            case 3:
                _c.sent();
                return [4 /*yield*/, page.waitForTimeout(1000)];
            case 4:
                _c.sent();
                // Click on add page
                return [4 /*yield*/, page.getByRole('button', { name: 'Pagina toevoegen' }).click()];
            case 5:
                // Click on add page
                _c.sent();
                // Check we are on the create content page
                return [4 /*yield*/, (0, test_1.expect)(page.getByRole('heading', { name: 'Content toevoegen', exact: true })).toBeVisible()];
            case 6:
                // Check we are on the create content page
                _c.sent();
                // Open publication details tab
                return [4 /*yield*/, page.getByText('Publicatiedetails').click()];
            case 7:
                // Open publication details tab
                _c.sent();
                date = new Date();
                pageTitle = 'Automatische test ' + date;
                hyperlinkTitle = '/automatische-test';
                // Fill in title
                return [4 /*yield*/, page.getByRole('textbox').nth(1).fill(pageTitle)];
            case 8:
                // Fill in title
                _c.sent();
                return [4 /*yield*/, page.waitForTimeout(1000)];
            case 9:
                _c.sent();
                // Check hyperlink is shown
                return [4 /*yield*/, page
                        .locator('div.c-content-edit-form.o-form-group-layout > div > div:nth-child(7) > div > div > input')
                        .scrollIntoViewIfNeeded()];
            case 10:
                // Check hyperlink is shown
                _c.sent();
                return [4 /*yield*/, page
                        .locator('div.c-content-edit-form.o-form-group-layout > div > div:nth-child(7) > div > div > input')
                        .getAttribute('value')];
            case 11:
                inputValue = _c.sent();
                (0, test_1.expect)(inputValue).toContain(hyperlinkTitle);
                return [4 /*yield*/, page.waitForTimeout(1000)];
            case 12:
                _c.sent();
                // Save page
                return [4 /*yield*/, page.getByRole('button', { name: 'Opslaan', exact: true }).click()];
            case 13:
                // Save page
                _c.sent();
                // Check toast
                return [4 /*yield*/, (0, test_1.expect)(page.locator('div > div.Toastify__toast-body > div > div > div.c-alert__message')).toContainText('Het content-item is succesvol opgeslagen.')];
            case 14:
                // Check toast
                _c.sent();
                // Check page title
                return [4 /*yield*/, (0, test_1.expect)(page.locator('h2.c-admin__page-title')).toContainText('Content: Automatische test')];
            case 15:
                // Check page title
                _c.sent();
                // Check edit button is shown
                return [4 /*yield*/, (0, test_1.expect)(page.getByRole('button', { name: 'Bewerken', exact: true })).toBeVisible()];
            case 16:
                // Check edit button is shown
                _c.sent();
                return [4 /*yield*/, page.waitForTimeout(3000)];
            case 17:
                _c.sent();
                // Go back
                return [4 /*yield*/, page.locator('div.c-admin__back > button').click()];
            case 18:
                // Go back
                _c.sent();
                return [4 /*yield*/, page.waitForTimeout(1000)];
            case 19:
                _c.sent();
                // Go back to overview
                return [4 /*yield*/, page.locator('div.c-admin__back > button').click()];
            case 20:
                // Go back to overview
                _c.sent();
                return [4 /*yield*/, (0, test_1.expect)(page.getByRole('heading', { name: 'Contentoverzicht', exact: true })).toBeVisible()];
            case 21:
                _c.sent();
                pageTitleInOverview = pageTitle.slice(0, 57) + '...';
                return [4 /*yield*/, (0, test_1.expect)(page.getByRole('link', { name: pageTitleInOverview })).toBeVisible()];
            case 22:
                _c.sent();
                return [4 /*yield*/, page.waitForTimeout(1000)];
            case 23:
                _c.sent();
                // Open newly created page
                return [4 /*yield*/, page.getByRole('link', { name: pageTitleInOverview }).click()];
            case 24:
                // Open newly created page
                _c.sent();
                return [4 /*yield*/, page.waitForTimeout(1000)];
            case 25:
                _c.sent();
                // Check page title
                return [4 /*yield*/, (0, test_1.expect)(page.locator('h2.c-admin__page-title')).toContainText('Content: Automatische test')];
            case 26:
                // Check page title
                _c.sent();
                return [4 /*yield*/, page.getByRole('button', { name: 'Bewerken', exact: true }).click()];
            case 27:
                _c.sent();
                return [4 /*yield*/, page.waitForTimeout(1000)];
            case 28:
                _c.sent();
                // Add contentblock
                return [4 /*yield*/, page.locator('div.c-select__control', { hasText: 'Voeg een contentblock toe' }).click()];
            case 29:
                // Add contentblock
                _c.sent();
                return [4 /*yield*/, page.waitForTimeout(1000)];
            case 30:
                _c.sent();
                // Choose title
                return [4 /*yield*/, page.getByText('Titel', { exact: true }).click()];
            case 31:
                // Choose title
                _c.sent();
                return [4 /*yield*/, page.waitForTimeout(1000)];
            case 32:
                _c.sent();
                // Fill in a title
                return [4 /*yield*/, page.locator('div.o-form-group__controls > input').first().fill('Automated test title')];
            case 33:
                // Fill in a title
                _c.sent();
                // Save page
                return [4 /*yield*/, page.getByRole('button', { name: 'Opslaan', exact: true }).click()];
            case 34:
                // Save page
                _c.sent();
                return [4 /*yield*/, page.waitForTimeout(2000)];
            case 35:
                _c.sent();
                // Check toast
                return [4 /*yield*/, (0, test_1.expect)(page.locator('div > div.Toastify__toast-body > div > div > div.c-alert__message')).toContainText('Het content-item is succesvol opgeslagen.')];
            case 36:
                // Check toast
                _c.sent();
                // Check title is shown
                return [4 /*yield*/, (0, test_1.expect)(page.getByRole('heading', { name: 'Automated test title', exact: true })).toBeVisible()];
            case 37:
                // Check title is shown
                _c.sent();
                // Go back to exit edit mode
                return [4 /*yield*/, page.locator('div.c-admin__back > button').click()];
            case 38:
                // Go back to exit edit mode
                _c.sent();
                return [4 /*yield*/, page.waitForTimeout(1000)];
            case 39:
                _c.sent();
                // Go back
                return [4 /*yield*/, page.locator('div.c-admin__back > button').click()];
            case 40:
                // Go back
                _c.sent();
                return [4 /*yield*/, page.waitForTimeout(1000)];
            case 41:
                _c.sent();
                // Go back to overview
                return [4 /*yield*/, page.locator('div.c-admin__back > button').click()];
            case 42:
                // Go back to overview
                _c.sent();
                return [4 /*yield*/, (0, test_1.expect)(page.getByRole('heading', { name: 'Contentoverzicht', exact: true })).toBeVisible()];
            case 43:
                _c.sent();
                return [4 /*yield*/, page.waitForTimeout(1000)];
            case 44:
                _c.sent();
                // CLEANUP
                // Remove page (on the detail page the more options dropdown is not completely shown, and so does not work)
                // Open newly created page
                // await page.getByRole('link', { name: pageTitleInOverview }).click();
                // // Check page title
                // await expect(page.locator('h2.c-admin__page-title')).toContainText(
                // 	'Content: Automatische test'
                // );
                // await page.locator('button[aria-label="Meer opties"]').click();
                // await page.waitForTimeout(1000);
                // await page.locator('div.c-dropdown__content-open > div > div:nth-child(2)').click();
                // await page.getByText('Verwijderen', { exact: true }).click();
                return [4 /*yield*/, page
                        .locator('table > tbody > tr:nth-child(1) > td:nth-child(9) > div > button[aria-label="Verwijder content"]')
                        .click()];
            case 45:
                // CLEANUP
                // Remove page (on the detail page the more options dropdown is not completely shown, and so does not work)
                // Open newly created page
                // await page.getByRole('link', { name: pageTitleInOverview }).click();
                // // Check page title
                // await expect(page.locator('h2.c-admin__page-title')).toContainText(
                // 	'Content: Automatische test'
                // );
                // await page.locator('button[aria-label="Meer opties"]').click();
                // await page.waitForTimeout(1000);
                // await page.locator('div.c-dropdown__content-open > div > div:nth-child(2)').click();
                // await page.getByText('Verwijderen', { exact: true }).click();
                _c.sent();
                // Check modal opens
                return [4 /*yield*/, (0, test_1.expect)(page.getByRole('heading', { name: 'Ben je zeker dat je deze actie wil uitvoeren?' })).toBeVisible()];
            case 46:
                // Check modal opens
                _c.sent();
                // Confirm to remove page
                return [4 /*yield*/, page.getByRole('button', { name: 'Verwijder', exact: true }).click()];
            case 47:
                // Confirm to remove page
                _c.sent();
                return [4 /*yield*/, page.waitForTimeout(1000)];
            case 48:
                _c.sent();
                // Check page is removed
                return [4 /*yield*/, (0, test_1.expect)(page.locator('div > div.Toastify__toast-body > div > div > div.c-alert__message')).toContainText('Het content-item is succesvol verwijderd.')];
            case 49:
                // Check page is removed
                _c.sent();
                return [4 /*yield*/, (0, test_1.expect)(page.getByRole('link', { name: pageTitleInOverview })).not.toBeVisible()];
            case 50:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
