import { every, some } from 'lodash-es';

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

function getNavWithSubLinks(
	itemsAndPermissions: { navItem: NavigationItemInfo; permission: string }[],
	userPermissions: string[]
): NavigationItemInfo[] {
	const availableNavItems: NavigationItemInfo[] = [];
	itemsAndPermissions.forEach(navItemAndPermission => {
		if (userPermissions.includes(navItemAndPermission.permission)) {
			availableNavItems.push(navItemAndPermission.navItem);
		}
	});
	if (availableNavItems[0]) {
		// The first item we'll show as the main nav item
		return [
			{
				...availableNavItems[0],
				// Any other items will show up as sublinks
				subLinks: availableNavItems.slice(1),
			},
		];
	}
	// None of the items the current user can see
	return [];
}

function getUserNavItems(userPermissions: string[]): NavigationItemInfo[] {
	return getNavWithSubLinks(
		[
			{
				navItem: {
					label: i18n.t('admin/admin___gebruikers'),
					location: ADMIN_PATH.USER,
					key: 'users',
					exact: false,
				},
				permission: 'VIEW_USERS',
			},
			{
				navItem: {
					label: i18n.t('admin/admin___gebruikersgroepen'),
					location: ADMIN_PATH.USER_GROUP_OVERVIEW,
					key: 'userGroups',
					exact: false,
				},
				permission: 'EDIT_USER_GROUPS',
			},
			{
				navItem: {
					label: i18n.t('admin/admin___permissie-groepen'),
					location: ADMIN_PATH.PERMISSION_GROUP_OVERVIEW,
					key: 'permissionGroups',
					exact: false,
				},
				permission: 'EDIT_PERMISSION_GROUPS',
			},
		],
		userPermissions
	);
}

function getMediaNavItems(userPermissions: string[]): NavigationItemInfo[] {
	return getNavWithSubLinks(
		[
			{
				navItem: {
					label: i18n.t('admin/admin___media-items'),
					location: ADMIN_PATH.ITEMS_OVERVIEW,
					key: 'items',
					exact: false,
				},
				permission: 'VIEW_ITEMS_OVERVIEW',
			},
			{
				navItem: {
					label: i18n.t('admin/admin___collecties'),
					location: ADMIN_PATH.COLLECTIONS_OVERVIEW,
					key: 'collections',
					exact: false,
				},
				permission: 'VIEW_COLLECTIONS_OVERVIEW',
			},
			{
				navItem: {
					label: i18n.t('admin/admin___bundels'),
					location: ADMIN_PATH.BUNDLES_OVERVIEW,
					key: 'bundels',
					exact: false,
				},
				permission: 'VIEW_BUNDLES_OVERVIEW',
			},
		],
		userPermissions
	);
}

function hasPermissions(
	permissions: string[],
	booleanOperator: 'AND' | 'OR',
	userPermissions: string[],
	navInfo: NavigationItemInfo
): NavigationItemInfo[] {
	if (booleanOperator === 'OR') {
		// OR
		// If at least one of the permissions is met, render the routes
		if (some(permissions, permission => userPermissions.includes(permission))) {
			return [navInfo];
		}
	} else {
		// AND
		// All permissions have to be met
		if (every(permissions, permission => userPermissions.includes(permission))) {
			return [navInfo];
		}
	}
	return [];
}

export const GET_NAV_ITEMS = (userPermissions: string[]): NavigationItemInfo[] => [
	...getUserNavItems(userPermissions),
	...hasPermissions(['EDIT_NAVIGATION_BARS'], 'OR', userPermissions, {
		label: i18n.t('admin/admin___navigatie'),
		location: ADMIN_PATH.MENU,
		key: 'navigatie',
		exact: false,
	}),
	...hasPermissions(['EDIT_ANY_CONTENT_PAGES', 'EDIT_OWN_CONTENT_PAGES'], 'OR', userPermissions, {
		label: i18n.t('admin/admin___content-paginas'),
		location: ADMIN_PATH.CONTENT,
		key: 'content',
		exact: false,
		subLinks: [
			{
				label: i18n.t('admin/admin___paginas'),
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
				location: ADMIN_PATH.SCREENCASTS,
				key: 'screencasts',
				exact: true,
			},
			{
				label: i18n.t('admin/admin___fa-qs'),
				location: ADMIN_PATH.FAQS,
				key: 'faqs',
				exact: true,
			},
			{
				label: i18n.t('admin/admin___overzichtspaginas'),
				location: ADMIN_PATH.OVERVIEWS,
				key: 'faqs',
				exact: true,
			},
		],
	}),
	...getMediaNavItems(userPermissions),
	...hasPermissions(['EDIT_INTERACTIVE_TOURS'], 'OR', userPermissions, {
		label: i18n.t('admin/admin___interactive-tours'),
		location: ADMIN_PATH.INTERACTIVE_TOUR_OVERVIEW,
		key: 'interactiveTours',
		exact: false,
	}),
	...hasPermissions(['EDIT_TRANSLATIONS'], 'OR', userPermissions, {
		label: i18n.t('admin/admin___vertaling'),
		location: ADMIN_PATH.TRANSLATIONS,
		key: 'translations',
		exact: false,
	}),
];
