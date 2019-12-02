import { ROUTE_PARTS } from '../shared/constants';

export const SETTINGS_PATH = Object.freeze({
	SETTINGS: `/${ROUTE_PARTS.settings}`,
	SETTINGS_TAB: `/${ROUTE_PARTS.settings}/:tabId`,
});

export const PROFILE_ID = ROUTE_PARTS.profile;
export const ACCOUNT_ID = ROUTE_PARTS.account;
export const EMAIL_ID = ROUTE_PARTS.email;
export const NOTIFICATIONS_ID = ROUTE_PARTS.notifications;

export type SettingsTab =
	| typeof PROFILE_ID
	| typeof ACCOUNT_ID
	| typeof EMAIL_ID
	| typeof NOTIFICATIONS_ID;
