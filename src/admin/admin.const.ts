import { every, isArray, some } from 'lodash-es';

import { PermissionName } from '../authentication/helpers/permission-names';
import { buildLink, CustomError } from '../shared/helpers';
import { ContentPageService } from '../shared/services/content-page-service';
import { ToastService } from '../shared/services/toast-service';
import i18n from '../shared/translations/i18n';
import { NavigationItemInfo } from '../shared/types';

import { ASSIGNMENTS_PATH } from './assignments/assignments.const';
import { COLLECTIONS_OR_BUNDLES_PATH } from './collectionsOrBundles/collections-or-bundles.const';
import { CONTENT_PAGE_LABEL_PATH } from './content-page-labels/content-page-label.const';
import { CONTENT_PATH } from './content/content.const';
import { DASHBOARD_PATH } from './dashboard/dashboard.const';
import { INTERACTIVE_TOUR_PATH } from './interactive-tour/interactive-tour.const';
import { ITEMS_PATH } from './items/items.const';
import { MENU_PATH } from './menu/menu.const';
import { PUPIL_COLLECTIONS_PATH } from './pupil-collection/pupil-collection.const';
import { TRANSLATIONS_PATH } from './translations/translations.const';
import { USER_GROUP_PATH } from './user-groups/user-group.const';
import { USER_PATH } from './users/user.const';

export const ADMIN_PATH = Object.freeze({
	...DASHBOARD_PATH,
	...USER_PATH,
	...USER_GROUP_PATH,
	...MENU_PATH,
	...CONTENT_PATH,
	...CONTENT_PAGE_LABEL_PATH,
	...TRANSLATIONS_PATH,
	...COLLECTIONS_OR_BUNDLES_PATH,
	...ASSIGNMENTS_PATH,
	...PUPIL_COLLECTIONS_PATH,
	...ITEMS_PATH,
	...INTERACTIVE_TOUR_PATH,
});

function getNavWithSubLinks(
	itemsAndPermissions: { navItem: NavigationItemInfo; permission: string }[],
	userPermissions: string[]
): NavigationItemInfo[] {
	const availableNavItems: NavigationItemInfo[] = [];
	itemsAndPermissions.forEach((navItemAndPermission) => {
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
					location: ADMIN_PATH.USER_OVERVIEW,
					key: 'users',
					exact: false,
				},
				permission: 'VIEW_USERS',
			},
			{
				navItem: {
					label: i18n.t('admin/admin___groepen-en-permissies'),
					location: ADMIN_PATH.USER_GROUP_OVERVIEW,
					key: 'userGroups',
					exact: false,
				},
				permission: 'EDIT_USER_GROUPS',
			},
		],
		userPermissions
	);
}

function hasPermissions(
	permissions: string[],
	booleanOperator: 'AND' | 'OR',
	userPermissions: string[],
	navInfos: NavigationItemInfo | NavigationItemInfo[]
): NavigationItemInfo[] {
	const navInfoObj: NavigationItemInfo[] = isArray(navInfos) ? navInfos : [navInfos];
	if (booleanOperator === 'OR') {
		// OR
		// If at least one of the permissions is met, render the routes
		if (some(permissions, (permission) => userPermissions.includes(permission))) {
			return navInfoObj;
		}
	} else {
		// AND
		// All permissions have to be met
		if (every(permissions, (permission) => userPermissions.includes(permission))) {
			return navInfoObj;
		}
	}
	return [];
}

async function getContentPageDetailRouteByPath(path: string): Promise<string | undefined> {
	try {
		const page = await ContentPageService.getContentPageByPath(path);
		if (!page) {
			throw new CustomError('Failed to fetch content page by path, reponse was null', null, {
				page,
			});
		}
		return buildLink(CONTENT_PATH.CONTENT_PAGE_DETAIL, { id: page.id });
	} catch (err) {
		console.error(new CustomError('Failed to fetch content page by pad', err, { path }));
		ToastService.danger(
			`${i18n.t(
				'admin/admin___het-ophalen-van-de-route-adhv-het-pagina-pad-is-mislukt'
			)}: ${path}`
		);
		return undefined;
	}
}

export const GET_NAV_ITEMS = async (userPermissions: string[]): Promise<NavigationItemInfo[]> => {
	return [
		...getUserNavItems(userPermissions),
		...hasPermissions([PermissionName.EDIT_NAVIGATION_BARS], 'OR', userPermissions, {
			label: i18n.t('admin/admin___navigatie'),
			location: ADMIN_PATH.MENU_OVERVIEW,
			key: 'navigatie',
			exact: false,
		}),
		...hasPermissions(
			['EDIT_ANY_CONTENT_PAGES', 'EDIT_OWN_CONTENT_PAGES'],
			'OR',
			userPermissions,
			{
				label: i18n.t('admin/admin___content-paginas'),
				location: ADMIN_PATH.CONTENT_PAGE_OVERVIEW,
				key: 'content',
				exact: false,
				subLinks: [
					// Only show the startpages to the users that can edit all pages
					...(userPermissions.includes(PermissionName.EDIT_ANY_CONTENT_PAGES)
						? [
								{
									label: i18n.t('admin/admin___start-uitgelogd'),
									location: await getContentPageDetailRouteByPath('/'),
									key: 'faqs',
									exact: true,
								},
								{
									label: i18n.t('admin/admin___start-uitgelogd-leerlingen'),
									location: await getContentPageDetailRouteByPath('/leerlingen'),
									key: 'faqs',
									exact: true,
								},
								{
									label: i18n.t('admin/admin___start-ingelogd-lesgever'),
									location: await getContentPageDetailRouteByPath('/start'),
									key: 'faqs',
									exact: true,
								},
						  ]
						: []),
				],
			}
		),
		...hasPermissions([PermissionName.EDIT_CONTENT_PAGE_LABELS], 'OR', userPermissions, {
			label: i18n.t('admin/admin___content-pagina-labels'),
			location: ADMIN_PATH.CONTENT_PAGE_LABEL_OVERVIEW,
			key: 'content-page-labels',
			exact: false,
		}),
		...hasPermissions([PermissionName.VIEW_ITEMS_OVERVIEW], 'OR', userPermissions, {
			label: i18n.t('admin/admin___media-items'),
			location: ADMIN_PATH.ITEMS_OVERVIEW,
			key: 'items',
			exact: false,
		}),
		...hasPermissions([PermissionName.VIEW_COLLECTIONS_OVERVIEW], 'OR', userPermissions, {
			label: i18n.t('admin/admin___collectiebeheer'),
			location: ADMIN_PATH.COLLECTIONS_OVERVIEW,
			key: 'collections',
			exact: false,
			subLinks: [
				...hasPermissions(
					[PermissionName.VIEW_BUNDLE_EDITORIAL_OVERVIEWS],
					'OR',
					userPermissions,
					[
						{
							label: i18n.t('admin/admin___actualisatie'),
							location: ADMIN_PATH.COLLECTION_ACTUALISATION_OVERVIEW,
							key: 'collections',
							exact: false,
						},
						{
							label: i18n.t('admin/admin___kwaliteitscontrole'),
							location: ADMIN_PATH.COLLECTION_QUALITYCHECK_OVERVIEW,
							key: 'collections',
							exact: false,
						},
						{
							label: i18n.t('admin/admin___marcom'),
							location: ADMIN_PATH.COLLECTION_MARCOM_OVERVIEW,
							key: 'collections',
							exact: false,
						},
					]
				),
			],
		}),
		...hasPermissions([PermissionName.VIEW_BUNDLES_OVERVIEW], 'OR', userPermissions, {
			label: i18n.t('admin/admin___bundelbeheer'),
			location: ADMIN_PATH.BUNDLES_OVERVIEW,
			key: 'bundels',
			exact: false,
			subLinks: [
				...hasPermissions(
					[PermissionName.VIEW_BUNDLE_EDITORIAL_OVERVIEWS],
					'OR',
					userPermissions,
					[
						{
							label: i18n.t('admin/admin___actualisatie'),
							location: ADMIN_PATH.BUNDLE_ACTUALISATION_OVERVIEW,
							key: 'collections',
							exact: false,
						},
						{
							label: i18n.t('admin/admin___kwaliteitscontrole'),
							location: ADMIN_PATH.BUNDLE_QUALITYCHECK_OVERVIEW,
							key: 'collections',
							exact: false,
						},
						{
							label: i18n.t('admin/admin___marcom'),
							location: ADMIN_PATH.BUNDLE_MARCOM_OVERVIEW,
							key: 'collections',
							exact: false,
						},
					]
				),
			],
		}),
		...hasPermissions([PermissionName.VIEW_ANY_ASSIGNMENTS], 'OR', userPermissions, {
			label: i18n.t('admin/admin___opdrachtenbeheer'),
			location: ADMIN_PATH.ASSIGNMENTS_OVERVIEW,
			key: 'assignments',
			exact: false,
			subLinks: [
				...hasPermissions(
					[PermissionName.VIEW_ANY_PUPIL_COLLECTIONS],
					'OR',
					userPermissions,
					[
						{
							label: i18n.t('admin/admin___leerlingencollecties'),
							location: ADMIN_PATH.ASSIGNMENT_PUPIL_COLLECTIONS_OVERVIEW,
							key: 'pupil-collections',
							exact: false,
						},
					]
				),
			],
		}),
		...hasPermissions([PermissionName.VIEW_ANY_UNPUBLISHED_ITEMS], 'OR', userPermissions, {
			label: i18n.t('admin/admin___items-publiceren'),
			location: ADMIN_PATH.PUBLISH_ITEMS_OVERVIEW,
			key: 'publish-items',
			exact: false,
		}),
		...hasPermissions([PermissionName.EDIT_INTERACTIVE_TOURS], 'OR', userPermissions, {
			label: i18n.t('admin/admin___interactive-tours'),
			location: ADMIN_PATH.INTERACTIVE_TOUR_OVERVIEW,
			key: 'interactiveTours',
			exact: false,
		}),
		...hasPermissions([PermissionName.EDIT_TRANSLATIONS], 'OR', userPermissions, {
			label: i18n.t('admin/admin___vertaling'),
			location: ADMIN_PATH.TRANSLATIONS,
			key: 'translations',
			exact: false,
		}),
	];
};
