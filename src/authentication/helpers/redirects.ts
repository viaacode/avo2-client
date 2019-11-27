import { History, Location } from 'history';
import queryString from 'query-string';

import { get } from 'lodash-es';
import { SEARCH_PATH } from '../../search/search.const';
import { getEnv } from '../../shared/helpers';
import toastService from '../../shared/services/toast-service';
import { AUTH_PATH, SERVER_LOGOUT_PAGE } from '../authentication.const';
import { STAMBOEK_LOCAL_STORAGE_KEY } from '../views/registration-flow/r3-stamboek';

/** Client redirect functions **/
export function redirectToClientLogin(history: History, location: Location) {
	history.push(AUTH_PATH.LOGIN_AVO, {
		from: { pathname: get(location, 'state.from.pathname', SEARCH_PATH.SEARCH) },
	});
}

export function redirectToClientRegister(history: History, location: Location) {
	history.push(AUTH_PATH.PUPIL_OR_TEACHER, {
		from: { pathname: get(location, 'state.from.pathname', SEARCH_PATH.SEARCH) },
	});
}

export function redirectToClientStamboek(history: History) {
	history.push(AUTH_PATH.STAMBOEK);
}

export function redirectToClientManualAccessRequest(history: History) {
	toastService.info('Deze functionaliteit is nog niet beschikbaar');
	// history.push(`/${RouteParts.ManualAccessRequest}`);
}

export function redirectToExternalPage(returnToUrl: string) {
	window.location.href = returnToUrl;
}

/** Server redirect functions **/
export function redirectToServerSmartschoolLogin(location: Location) {
	// Redirect to smartschool login form
	const base = window.location.href.split(AUTH_PATH.REGISTER_OR_LOGIN)[0];
	// Url to return to after authentication is completed and server stored auth object in session
	const returnToUrl = base + get(location, 'state.from.pathname', SEARCH_PATH.SEARCH);
	window.location.href = `${getEnv('PROXY_URL')}/auth/smartschool/login?${queryString.stringify({
		returnToUrl,
	})}`;
}

export function redirectToServerArchiefRegistrationIdp(location: Location, stamboekNumber: string) {
	const base = window.location.href.split(AUTH_PATH.STAMBOEK)[0];
	const returnToUrl = base + get(location, 'state.from.pathname', AUTH_PATH.LOGIN_AVO);

	window.location.href = `${getEnv('PROXY_URL')}/auth/hetarchief/register?${queryString.stringify({
		returnToUrl,
		stamboekNumber,
	})}`;
}

export function redirectToServerLoginPage(returnToUrl: string) {
	// Not logged in, we need to redirect the user to the SAML identity server login page
	window.location.href = `${getEnv('PROXY_URL')}/auth/login?${queryString.stringify({
		returnToUrl,
		stamboekNumber: localStorage.getItem(STAMBOEK_LOCAL_STORAGE_KEY),
	})}`;
}

export function redirectToServerLogoutPage(returnToUrl: string) {
	window.location.href = `${getEnv('PROXY_URL')}/${SERVER_LOGOUT_PAGE}?${queryString.stringify({
		returnToUrl,
	})}`;
}
