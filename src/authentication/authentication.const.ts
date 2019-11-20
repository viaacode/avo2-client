import { ROUTE_PARTS } from '../shared/constants/routes';

export const AUTH_PATH = Object.freeze({
	LOGIN_AVO: `/${ROUTE_PARTS.loginAvo}`,
	LOGOUT: `/${ROUTE_PARTS.logout}`,
	REGISTER: `/${ROUTE_PARTS.register}`,
	REGISTER_OR_LOGIN: `/${ROUTE_PARTS.registerOrLogin}`,
});
