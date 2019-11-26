import queryString from 'query-string';

import { getEnv } from '../../shared/helpers';
import { SERVER_LOGOUT_PAGE } from '../authentication.const';

export function redirectToLoginPage(returnToUrl: string) {
	// Not logged in, we need to redirect the user to the SAML identity server login page
	window.location.href = `${getEnv('PROXY_URL')}/auth/login?${queryString.stringify({
		returnToUrl,
	})}`;
}

export function redirectToPage(returnToUrl: string) {
	window.location.href = returnToUrl;
}

export function redirectToLogoutPage(returnToUrl: string) {
	window.location.href = `${getEnv('PROXY_URL')}/${SERVER_LOGOUT_PAGE}?${queryString.stringify({
		returnToUrl,
	})}`;
}
