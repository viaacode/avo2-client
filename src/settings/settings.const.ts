import { ROUTE_PARTS } from '../shared/constants/index.js';
import { tText } from '../shared/helpers/translate-text.js';

export const PROFILE_ID = ROUTE_PARTS.profile;
export const ACCOUNT_ID = ROUTE_PARTS.account;
export const LINKED_ACCOUNTS = ROUTE_PARTS.linkedAccounts;
export const EMAIL_ID = ROUTE_PARTS.email;
export const NOTIFICATIONS_ID = ROUTE_PARTS.notifications;

export type SettingsTab =
	| typeof PROFILE_ID
	| typeof ACCOUNT_ID
	| typeof EMAIL_ID
	| typeof NOTIFICATIONS_ID
	| typeof LINKED_ACCOUNTS;

export const GET_NEWSLETTER_LABELS = () => ({
	newsletter: tText(
		'settings/settings___ik-ontvang-graag-tips-en-inspiratie-voor-mijn-lessen-en-nieuws-van-partners'
	),
	workshop: tText('settings/settings___ik-wil-berichten-over-workshops-en-events-ontvangen'),
	ambassador: tText(
		'settings/settings___ik-krijg-graag-berichten-om-actief-mee-te-werken-aan-het-archief-voor-onderwijs'
	),
});

export const USERS_IN_SAME_COMPANY_COLUMNS = () => [
	{
		label: tText('settings/settings___naam'),
		id: 'full_name',
	},
	{
		label: tText('settings/settings___rol'),
		id: 'user_group',
	},
	{
		label: tText('settings/settings___geblokkeerd'),
		id: 'is_blocked',
	},
	{
		label: tText('settings/settings___laatste-login'),
		id: 'last_access_at',
	},
	{
		label: tText('settings/settings___tijdelijke-toegang'),
		id: 'temp_access',
	},
];
