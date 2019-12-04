import { History, Location } from 'history';
import { get } from 'lodash-es';
import queryString from 'query-string';

import { SEARCH_PATH } from '../../search/search.const';
import { getEnv } from '../../shared/helpers';
import { AUTH_PATH, SERVER_LOGOUT_PAGE } from '../authentication.const';
import { STAMBOEK_LOCAL_STORAGE_KEY } from '../views/registration-flow/r3-stamboek';

/**
 *
 * Client redirect functions
 *
 **/
export function redirectToClientPage(path: string, history: History) {
	history.push(path);
}

/**
 *
 * Server redirect functions
 *
 **/
export function redirectToServerSmartschoolLogin(location: Location) {
	// Redirect to smartschool login form
	// Url to return to after authentication is completed and server stored auth object in session
	const returnToUrl =
		getBaseUrl(location) + get(location, 'state.from.pathname', SEARCH_PATH.SEARCH);
	window.location.href = `${getEnv('PROXY_URL')}/auth/smartschool/login?${queryString.stringify({
		returnToUrl,
	})}`;
}

export function redirectToServerArchiefRegistrationIdp(location: Location, stamboekNumber: string) {
	const returnToUrl =
		getBaseUrl(location) + get(location, 'state.from.pathname', AUTH_PATH.LOGIN_AVO);
	window.location.href = `${getEnv('PROXY_URL')}/auth/hetarchief/register?${queryString.stringify({
		returnToUrl,
		stamboekNumber,
	})}`;
}

export function redirectToServerLoginPage(location: Location) {
	// Redirect to login form
	// Url to return to after authentication is completed and server stored auth object in session
	const returnToUrl =
		getBaseUrl(location) + get(location, 'state.from.pathname', SEARCH_PATH.SEARCH);
	// Not logged in, we need to redirect the user to the SAML identity server login page
	window.location.href = `${getEnv('PROXY_URL')}/auth/login?${queryString.stringify({
		returnToUrl,
		stamboekNumber: localStorage.getItem(STAMBOEK_LOCAL_STORAGE_KEY),
	})}`;
}

export function redirectToServerLogoutPage(location: Location) {
	// Url to return to after logout is completed
	const returnToUrl = `${getBaseUrl(location)}/`;
	window.location.href = `${getEnv('PROXY_URL')}/${SERVER_LOGOUT_PAGE}?${queryString.stringify({
		returnToUrl,
	})}`;
}

/**
 *
 * Other redirect functions
 *
 **/
export function redirectToExternalPage(returnToUrl: string) {
	window.location.href = returnToUrl;
}

function getBaseUrl(location: Location) {
	return window.location.href.split(location.pathname)[0];
}
