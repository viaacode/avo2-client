import { History, Location } from 'history';
import { get } from 'lodash-es';
import queryString from 'query-string';

import { Avo } from '@viaa/avo2-types';

import { APP_PATH } from '../../constants';
import { getEnv } from '../../shared/helpers';
import { SERVER_LOGOUT_PAGE } from '../authentication.const';
import { STAMBOEK_LOCAL_STORAGE_KEY } from '../views/registration-flow/r3-stamboek';

/**
 *
 * Client redirect functions
 *
 **/
export function redirectToClientPage(path: string, history: History, fromPath?: string) {
	if (fromPath) {
		history.push(path, { from: { pathname: fromPath } });
	} else {
		history.push(path);
	}
}

/**
 *
 * Server redirect functions
 *
 **/
export function redirectToServerSmartschoolLogin(location: Location) {
	// Redirect to smartschool login form
	// Url to return to after authentication is completed and server stored auth object in session
	const returnToUrl = getBaseUrl(location) + getFromPath(location);
	window.location.href = `${getEnv('PROXY_URL')}/auth/smartschool/login?${queryString.stringify({
		returnToUrl,
	})}`;
}

export function redirectToServerKlascementLogin(location: Location) {
	// Redirect to klascement login form
	// Url to return to after authentication is completed and server stored auth object in session
	const returnToUrl = getBaseUrl(location) + getFromPath(location);
	window.location.href = `${getEnv('PROXY_URL')}/auth/klascement/login?${queryString.stringify({
		returnToUrl,
	})}`;
}

export function redirectToServerArchiefRegistrationIdp(location: Location, stamboekNumber: string) {
	const returnToUrl = getBaseUrl(location) + APP_PATH.LOGIN.route;
	window.location.href = `${getEnv('PROXY_URL')}/auth/hetarchief/register?${queryString.stringify(
		{
			returnToUrl,
			stamboekNumber,
		}
	)}`;
}

export function redirectToServerLoginPage(location: Location) {
	// Redirect to login form
	// Url to return to after authentication is completed and server stored auth object in session
	const returnToUrl = getBaseUrl(location) + getFromPath(location);
	// Not logged in, we need to redirect the user to the SAML identity server login page
	window.location.href = `${getEnv('PROXY_URL')}/auth/login?${queryString.stringify({
		returnToUrl,
		stamboekNumber: localStorage.getItem(STAMBOEK_LOCAL_STORAGE_KEY),
	})}`;
}

export function redirectToServerLogoutPage(location: Location, routeAfterLogout: string) {
	// Url to return to after logout is completed
	const returnToUrl = `${getBaseUrl(location)}${routeAfterLogout}`;
	window.location.href = `${getEnv('PROXY_URL')}/${SERVER_LOGOUT_PAGE}?${queryString.stringify({
		returnToUrl,
	})}`;
}

export function logoutAndRedirectToLogin() {
	// Url to return to after logout is completed
	const returnToUrl = window.location.origin + APP_PATH.REGISTER_OR_LOGIN.route;
	window.location.href = `${getEnv('PROXY_URL')}/${SERVER_LOGOUT_PAGE}?${queryString.stringify({
		returnToUrl,
	})}`;
}

/**
 * Redirect to server link accounts route
 * @param location
 * @param idpType
 */
export function redirectToServerLinkAccount(location: Location, idpType: Avo.Auth.IdpType) {
	const returnToUrl = getBaseUrl(location) + location.pathname;
	window.location.href = `${getEnv('PROXY_URL')}/auth/link-account?${queryString.stringify({
		returnToUrl,
		idpType,
	})}`;
}

export function redirectToServerUnlinkAccount(location: Location, idpType: Avo.Auth.IdpType) {
	const returnToUrl = getBaseUrl(location) + location.pathname;
	window.location.href = `${getEnv('PROXY_URL')}/auth/unlink-account?${queryString.stringify({
		returnToUrl,
		idpType,
	})}`;
}

/**
 *
 * Other redirect functions
 *
 **/
export function redirectToExternalPage(link: string, target: '_blank' | string | null | undefined) {
	if (target === '_blank') {
		window.open(link, '_blank', 'noopener,noreferrer');
	} else {
		window.location.href = link;
	}
}

export function getBaseUrl(location: Location): string {
	return window.location.href.split(location.pathname)[0];
}

export function getFromPath(
	location: Location,
	defaultPath: string = APP_PATH.LOGGED_IN_HOME.route
): string {
	return (
		get(location, 'state.from.pathname', defaultPath) + get(location, 'state.from.search', '')
	);
}
