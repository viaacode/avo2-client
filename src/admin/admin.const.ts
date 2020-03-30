import i18n from '../shared/translations/i18n';
import { NavigationItemInfo } from '../shared/types';
import { COLLECTIONS_OR_BUNDLES_PATH } from './collectionsOrBundles/collections-or-bundles.const';
import { CONTENT_PATH } from './content/content.const';
import { DASHBOARD_PATH } from './dashboard/dashboard.const';
import { INTERACTIVE_TOUR_PATH } from './interactive-tour/interactive-tour.const';
import { ITEMS_PATH } from './items/items.const';
import { MENU_PATH } from './menu/menu.const';
import { PERMISSION_GROUP_PATH } from './permission-groups/permission-group.const';
import { TRANSLATIONS_PATH } from './translations/translations.const';
import { USER_GROUP_PATH } from './user-groups/user-group.const';
import { USER_PATH } from './users/user.const';

export const ADMIN_PATH = Object.freeze({
	...DASHBOARD_PATH,
	...USER_PATH,
	...USER_GROUP_PATH,
	...MENU_PATH,
	...CONTENT_PATH,
	...TRANSLATIONS_PATH,
	...PERMISSION_GROUP_PATH,
	...COLLECTIONS_OR_BUNDLES_PATH,
	...ITEMS_PATH,
	...INTERACTIVE_TOUR_PATH,
});

export const GET_NAV_ITEMS: () => NavigationItemInfo[] = () => [
	{
		label: i18n.t('admin/admin___gebruikers'),
		location: ADMIN_PATH.USER,
		key: 'users',
		exact: false,
		subLinks: [
			{
				label: i18n.t('admin/admin___gebruikersgroepen'),
				location: ADMIN_PATH.USER_GROUP_OVERVIEW,
				key: 'userGroups',
				exact: false,
			},
			{
				label: i18n.t('admin/admin___permissie-groepen'),
				location: ADMIN_PATH.PERMISSION_GROUP_OVERVIEW,
				key: 'permissionGroups',
				exact: false,
			},
		],
	},
	{
		label: i18n.t('admin/admin___navigatie'),
		location: ADMIN_PATH.MENU,
		key: 'navigatie',
		exact: false,
	},
	{
		label: i18n.t('admin/admin___content-paginas'),
		location: ADMIN_PATH.CONTENT,
		key: 'content',
		exact: false,
		subLinks: [
			{
				label: i18n.t("Pagina's"),
				location: ADMIN_PATH.PAGES,
				key: 'pages',
				exact: true,
			},
			{
				label: i18n.t('admin/admin___projecten'),
				location: ADMIN_PATH.PROJECTS,
				key: 'projects',
				exact: true,
			},
			{
				label: i18n.t('admin/admin___nieuws'),
				location: ADMIN_PATH.NEWS,
				key: 'news',
				exact: true,
			},
			{
				label: i18n.t('admin/admin___screencasts'),
				location: ADMIN_PATH.SCREENCAST,
				key: 'screencasts',
				exact: true,
			},
			{
				label: i18n.t('admin/admin___fa-qs'),
				location: ADMIN_PATH.FAQS,
				key: 'faqs',
				exact: true,
			},
		],
	},
	{
		label: i18n.t('admin/admin___media-items'),
		location: ADMIN_PATH.ITEMS_OVERVIEW,
		key: 'items',
		exact: false,
		subLinks: [
			{
				label: i18n.t('admin/admin___collecties'),
				location: ADMIN_PATH.COLLECTIONS_OVERVIEW,
				key: 'collections',
				exact: false,
			},
			{
				label: i18n.t('admin/admin___bundels'),
				location: ADMIN_PATH.BUNDLES_OVERVIEW,
				key: 'bundels',
				exact: false,
			},
		],
	},
	{
		label: i18n.t('admin/admin___interactive-tours'),
		location: ADMIN_PATH.INTERACTIVE_TOUR_OVERVIEW,
		key: 'interactiveTours',
		exact: false,
	},
	{
		label: i18n.t('admin/admin___vertaling'),
		location: ADMIN_PATH.TRANSLATIONS,
		key: 'translations',
		exact: false,
	},
];
