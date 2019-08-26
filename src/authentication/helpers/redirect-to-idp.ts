import queryString from 'query-string';
import { CustomWindow } from '../../shared/types/CustomWindow';

export function redirectToLoginPage(returnToUrl: string) {
	// Not logged in, we need to redirect the user to the SAML identity server login page
	const url = `${(window as CustomWindow)._ENV_.PROXY_URL}/auth/login?${queryString.stringify({
		returnToUrl,
	})}`;
	window.location.href = url;
}

export function redirectToPage(returnToUrl: string) {
	window.location.href = returnToUrl;
}

export function redirectToLogoutPage(returnToUrl: string) {
	const url = `${(window as CustomWindow)._ENV_.PROXY_URL}/auth/logout?${queryString.stringify({
		returnToUrl,
	})}`;
	window.location.href = url;
}
