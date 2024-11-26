import { type Avo } from '@viaa/avo2-types';
import { get, isString, omit, trimEnd, trimStart } from 'lodash-es';
import queryString, { stringifyUrl } from 'query-string';
import { type RouteComponentProps } from 'react-router-dom';

import { APP_PATH } from '../../constants';
import { type ErrorViewQueryParams } from '../../error/views/ErrorView';
import { ROUTE_PARTS } from '../../shared/constants';
import { getEnv } from '../../shared/helpers';
import { insideIframe } from '../../shared/helpers/inside-iframe';
import { JWT_TOKEN, SERVER_LOGOUT_PAGE } from '../authentication.const';
import { STAMBOEK_LOCAL_STORAGE_KEY } from '../views/registration-flow/r3-stamboek';

// TODO replace this with a page on the avo domain
const CLOSE_BROWSER_WINDOW_PAGE =
	'https://bertyhell.s3.eu-central-1.amazonaws.com/projects/meemoo/avo/embed/close-browser.html';

/**
 *
 * Client redirect functions
 *
 **/
export function redirectToClientPage(path: string, history: RouteComponentProps['history']): void {
	history.push(path);
}

export function redirectToErrorPage(
	props: ErrorViewQueryParams,
	location: RouteComponentProps['location']
): void {
	const baseUrl = getBaseUrl(location);
	window.location.href = `${baseUrl}/error?${queryString.stringify(props)}`;
}

export function redirectToLoggedOutHome(location: RouteComponentProps['location']): void {
	window.location.href = getBaseUrl(location);
}

export function redirectToLoggedInHome(location: RouteComponentProps['location']): void {
	window.location.href = `${getBaseUrl(location)}/start`;
}

/**
 *
 * Server redirect functions
 *
 **/
function openLoginPageLink(pageUrl: string, queryParams: Record<string, any>): void {
	const isInsideIframe = insideIframe();
	const loginPageLink = stringifyUrl({
		url: pageUrl,
		query: {
			...queryParams,
			returnToUrl: isInsideIframe ? CLOSE_BROWSER_WINDOW_PAGE : queryParams.returnToUrl,
		},
	});

	if (isInsideIframe) {
		// If we're inside an iframe, we need to open the login page in a new window
		window.open(loginPageLink, '_blank', 'noopener,noreferrer');
	} else {
		// Open login page in the current browser tab
		window.location.href = loginPageLink;
	}
}

export function redirectToServerLoginPage(location: RouteComponentProps['location']): void {
	// Redirect to login form
	// Url to return to after authentication is completed and server stored auth object in session
	const returnToUrl = getRedirectAfterLogin(location);
	// Not logged in, we need to redirect the user to the SAML identity server login page
	openLoginPageLink(`${getEnv('PROXY_URL')}/auth/hetarchief/login`, {
		returnToUrl,
		stamboekNumber: localStorage && localStorage.getItem(STAMBOEK_LOCAL_STORAGE_KEY),
		jwtToken: new URLSearchParams(window.location.search).get(JWT_TOKEN), // Token from the parent page of the avo embed (smartschool, bookwidgets)
	});
}

export function redirectToServerItsmeLogin(location: RouteComponentProps['location']): void {
	const returnToUrl = getRedirectAfterLogin(location);
	openLoginPageLink(`${getEnv('PROXY_URL')}/auth/acmidm/login`, {
		returnToUrl,
		authMech: 'itsme',
		jwtToken: new URLSearchParams(window.location.search).get(JWT_TOKEN), // Token from the parent page of the avo embed (smartschool, bookwidgets)
	});
}

export function redirectToServerLeerIDLogin(location: RouteComponentProps['location']): void {
	const returnToUrl = getRedirectAfterLogin(location);
	openLoginPageLink(`${getEnv('PROXY_URL')}/auth/acmidm/login`, {
		returnToUrl,
		authMech: 'leerid',
		jwtToken: new URLSearchParams(window.location.search).get(JWT_TOKEN), // Token from the parent page of the avo embed (smartschool, bookwidgets)
	});
}

export function redirectToServerACMIDMLogin(location: RouteComponentProps['location']): void {
	const returnToUrl = getRedirectAfterLogin(location);
	openLoginPageLink(`${getEnv('PROXY_URL')}/auth/acmidm/login`, {
		returnToUrl,
		jwtToken: new URLSearchParams(window.location.search).get(JWT_TOKEN), // Token from the parent page of the avo embed (smartschool, bookwidgets)
	});
}

export function redirectToServerSmartschoolLogin(location: RouteComponentProps['location']): void {
	// Redirect to smartschool login form
	// Url to return to after authentication is completed and server stored auth object in session
	const returnToUrl = getRedirectAfterLogin(location);
	openLoginPageLink(`${getEnv('PROXY_URL')}/auth/smartschool/login`, {
		returnToUrl,
		jwtToken: new URLSearchParams(window.location.search).get(JWT_TOKEN), // Token from the parent page of the avo embed (smartschool, bookwidgets)
	});
}

export function redirectToServerKlascementLogin(location: RouteComponentProps['location']): void {
	// Redirect to klascement login form
	// Url to return to after authentication is completed and server stored auth object in session
	const returnToUrl = getRedirectAfterLogin(location);
	openLoginPageLink(`${getEnv('PROXY_URL')}/auth/klascement/login`, {
		returnToUrl,
		jwtToken: new URLSearchParams(window.location.search).get(JWT_TOKEN), // Token from the parent page of the avo embed (smartschool, bookwidgets)
	});
}

export function redirectToServerArchiefRegistrationIdp(
	location: RouteComponentProps['location'],
	stamboekNumber: string
): void {
	const returnToUrl = getBaseUrl(location) + APP_PATH.LOGIN.route;
	openLoginPageLink(`${getEnv('PROXY_URL')}/auth/hetarchief/register`, {
		returnToUrl,
		stamboekNumber,
		jwtToken: new URLSearchParams(window.location.search).get(JWT_TOKEN), // Token from the parent page of the avo embed (smartschool, bookwidgets)
	});
}

export function redirectToServerLogoutPage(
	location: RouteComponentProps['location'],
	routeAfterLogout: string
): void {
	// Url to return to after logout is completed
	const returnToUrl = `${getBaseUrl(location)}${routeAfterLogout}`;
	openLoginPageLink(`${getEnv('PROXY_URL')}/${SERVER_LOGOUT_PAGE}`, {
		returnToUrl,
	});
}

export function logoutAndRedirectToLogin(location?: RouteComponentProps['location']): void {
	// Url to return to after logout is completed
	let returnToUrl = window.location.origin + APP_PATH.REGISTER_OR_LOGIN.route;

	if (location) {
		returnToUrl = `${returnToUrl}?${queryString.stringify({
			// Url to redirect to after logging back in
			returnToUrl: getRedirectAfterLogin(location),
		})}`;
	}

	openLoginPageLink(`${getEnv('PROXY_URL')}/${SERVER_LOGOUT_PAGE}`, {
		returnToUrl,
	});
}

/**
 * Redirect to server link accounts route
 * @param location
 * @param idpType
 * @param idpParameters optional query parameters that are sent to the IDP login url
 */
export function redirectToServerLinkAccount(
	location: RouteComponentProps['location'],
	idpType: Avo.Auth.IdpType,
	idpParameters?: string
): void {
	const returnToUrl = getBaseUrl(location) + location.pathname;
	window.location.href = `${getEnv('PROXY_URL')}/auth/link-account?${queryString.stringify({
		returnToUrl,
		idpType,
		idpParameters,
	})}`;
}

export function redirectToServerUnlinkAccount(
	location: RouteComponentProps['location'],
	idpType: Avo.Auth.IdpType
): void {
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
export function redirectToExternalPage(
	link: string,
	target: '_blank' | string | null | undefined
): void {
	if (target === '_blank') {
		window.open(link, '_blank', 'noopener,noreferrer');
	} else {
		window.location.href = link;
	}
}

export function getBaseUrl(location: RouteComponentProps['location']): string {
	if (location.pathname === '/') {
		return trimEnd(window.location.href, '/');
	}
	return trimEnd(decodeURIComponent(window.location.href).split(location.pathname)[0], '/');
}

function getFromPath(
	location: RouteComponentProps['location'],
	defaultPath: string = APP_PATH.LOGGED_IN_HOME.route
): string {
	let fromPath = get(location, 'state.from.pathname') || get(location, 'pathname') || defaultPath;
	if (fromPath === `/${ROUTE_PARTS.registerOrLogin}`) {
		fromPath = '/';
	}
	const fromSearch = get(location, 'state.from.search') || get(location, 'search') || '';
	return `/${trimStart(fromPath + fromSearch, '/')}`;
}

export function getRedirectAfterLogin(
	location: RouteComponentProps['location'],
	defaultPath: string = APP_PATH.LOGGED_IN_HOME.route
): string {
	// From query string
	const queryStrings = queryString.parse(location.search);

	if (queryStrings.returnToUrl && isString(queryStrings.returnToUrl)) {
		const returnToUrl = queryStrings.returnToUrl;
		if (!returnToUrl.startsWith('http') && !returnToUrl.startsWith('//')) {
			// make url absolute
			return getBaseUrl(location) + returnToUrl;
		}
		return returnToUrl;
	}

	// From location history
	if (location.pathname === `/${ROUTE_PARTS.registerOrLogin}`) {
		return getBaseUrl(location) + getFromPath(location);
	}

	const base = getBaseUrl(location);
	const from = getFromPath(location, defaultPath);
	if (from === '/' || from.startsWith('/error')) {
		return `${base}${defaultPath}`;
	}
	return queryString.stringifyUrl({
		url: `${base}${from}`,
		query: omit(queryStrings, ['returnToUrl']),
	});
}
