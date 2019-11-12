import queryString from 'query-string';

import { getEnv } from '../../shared/helpers/env';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';
import { getLogoutPath } from './get-profile-info';

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
	const logoutPath = getLogoutPath();
	if (!logoutPath) {
		toastService('Het uitloggen is mislukt', TOAST_TYPE.DANGER);
		return;
	}
	window.location.href = `${getEnv('PROXY_URL')}/${logoutPath}?${queryString.stringify({
		returnToUrl,
	})}`;
}
