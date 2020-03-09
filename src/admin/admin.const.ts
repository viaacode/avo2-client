import { CONTENT_PATH } from './content/content.const';
import { DASHBOARD_PATH } from './dashboard/dashboard.const';
import { MENU_PATH } from './menu/menu.const';
import { USER_GROUP_PATH } from './user-groups/user-group.const';
import { USER_PATH } from './users/user.const';
import { NavigationItemInfo } from '../shared/types';
import i18n from '../shared/translations/i18n';

export const ADMIN_PATH = Object.freeze({
	...DASHBOARD_PATH,
	...USER_PATH,
	...USER_GROUP_PATH,
	...MENU_PATH,
	...CONTENT_PATH,
});

export const NAV_ITEMS: NavigationItemInfo[] = [
	{
		label: i18n.t('Gebruikers'),
		location: ADMIN_PATH.USER,
		key: 'users',
		exact: false,
	},
	{
		label: i18n.t('Navigatie'),
		location: ADMIN_PATH.MENU,
		key: 'navigatie',
		exact: false,
	},
	{
		label: i18n.t('Content'),
		location: ADMIN_PATH.CONTENT,
		key: 'content',
		exact: false,
		subLinks: [
			{
				label: i18n.t('Projecten'),
				location: ADMIN_PATH.PROJECTS,
				key: 'projects',
				exact: true,
			},
			{
				label: i18n.t('Nieuws'),
				location: ADMIN_PATH.NEWS,
				key: 'news',
				exact: true,
			},
			{
				label: i18n.t('FAQs'),
				location: ADMIN_PATH.FAQS,
				key: 'faqs',
				exact: true,
			},
		],
	},
];
