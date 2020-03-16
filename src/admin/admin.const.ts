import i18n from '../shared/translations/i18n';
import { NavigationItemInfo } from '../shared/types';
import { COLLECTIONS_OR_BUNDLES_PATH } from './collectionsOrBundles/collections-or-bundles.const';
import { CONTENT_PATH } from './content/content.const';
import { DASHBOARD_PATH } from './dashboard/dashboard.const';
import { INTERACTIVE_TOUR_PATH } from './interactive-tour/interactive-tour.const';
import { ITEMS_PATH } from './items/items.const';
import { MENU_PATH } from './menu/menu.const';
import { USER_GROUP_PATH } from './user-groups/user-group.const';
import { USER_PATH } from './users/user.const';

export const ADMIN_PATH = Object.freeze({
	...DASHBOARD_PATH,
	...USER_PATH,
	...USER_GROUP_PATH,
	...MENU_PATH,
	...CONTENT_PATH,
	...COLLECTIONS_OR_BUNDLES_PATH,
	...ITEMS_PATH,
	...INTERACTIVE_TOUR_PATH,
});

export const NAV_ITEMS: NavigationItemInfo[] = [
	{
		label: i18n.t('Gebruikers'),
		location: ADMIN_PATH.USER,
		key: 'users',
		exact: false,
	},
	{
		label: 'Gebruikersgroepen',
		location: ADMIN_PATH.USER_GROUP_OVERVIEW,
		key: 'userGroups',
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
	{
		label: i18n.t('Items'),
		location: ADMIN_PATH.ITEMS_OVERVIEW,
		key: 'items',
		exact: false,
	},
	{
		label: i18n.t('Collecties'),
		location: ADMIN_PATH.COLLECTIONS_OVERVIEW,
		key: 'collections',
		exact: false,
	},
	{
		label: i18n.t('Bundels'),
		location: ADMIN_PATH.BUNDLES_OVERVIEW,
		key: 'bundels',
		exact: false,
	},
	{
		label: i18n.t('Interactive tours'),
		location: ADMIN_PATH.INTERACTIVE_TOUR_OVERVIEW,
		key: 'interactiveTours',
		exact: false,
	},
];
