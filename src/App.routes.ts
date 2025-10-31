import { PermissionName } from '@viaa/avo2-types';
import { type MiddlewareFunction, redirect, type RouteObject } from 'react-router';

import { AppWithAdminCoreConfig } from './App';
import { Admin } from './admin/Admin';
import { AdminRedirect } from './admin/AdminRedirect';
import { ASSIGNMENTS_PATH } from './admin/assignments/assignments.const';
import { AssignmentMarcomOverview } from './admin/assignments/views/AssignmentsMarcomOverview';
import { AssignmentOverviewAdmin } from './admin/assignments/views/AssignmentsOverviewAdmin';
import { COLLECTIONS_OR_BUNDLES_PATH } from './admin/collectionsOrBundles/collections-or-bundles.const';
import { CollectionOrBundleActualisationOverview } from './admin/collectionsOrBundles/views/CollectionOrBundleActualisationOverview';
import { CollectionOrBundleMarcomOverview } from './admin/collectionsOrBundles/views/CollectionOrBundleMarcomOverview';
import { CollectionOrBundleQualityCheckOverview } from './admin/collectionsOrBundles/views/CollectionOrBundleQualityCheckOverview';
import { CollectionsOrBundlesOverview } from './admin/collectionsOrBundles/views/CollectionsOrBundlesOverview';
import { CONTENT_PAGE_PATH } from './admin/content-page/content-page.consts';
import ContentPageDetailPage from './admin/content-page/views/ContentPageDetailPage';
import ContentPageEditPage from './admin/content-page/views/ContentPageEditPage';
import { ContentPageOverviewPage } from './admin/content-page/views/ContentPageOverviewPage';
import { CONTENT_PAGE_LABEL_PATH } from './admin/content-page-labels/content-page-label.const';
import ContentPageLabelDetailPage from './admin/content-page-labels/views/ContentPageLabelDetailPage';
import ContentPageLabelEditPage from './admin/content-page-labels/views/ContentPageLabelEditPage';
import ContentPageLabelOverviewPage from './admin/content-page-labels/views/ContentPageLabelOverviewPage';
import { Dashboard } from './admin/dashboard/views/Dashboard';
import { INTERACTIVE_TOUR_PATH } from './admin/interactive-tour/interactive-tour.const';
import { InteractiveTourDetail } from './admin/interactive-tour/views/InteractiveTourDetail';
import { InteractiveTourEdit } from './admin/interactive-tour/views/InteractiveTourEdit';
import { InteractiveTourOverview } from './admin/interactive-tour/views/InteractiveTourOverview';
import { ITEMS_PATH } from './admin/items/items.const';
import { ItemDetail } from './admin/items/views/ItemDetail';
import { ItemsOverview } from './admin/items/views/ItemsOverview';
import { PublishItemsOverview } from './admin/items/views/PublishItemsOverview';
import { MaintenanceAlertsOverviewPage } from './admin/maintenance-alerts-overview/MaintenanceAlertsOverviewPage';
import { NAVIGATIONS_PATH } from './admin/navigations/navigations.const';
import {
	NavigationBarDetail,
	NavigationBarOverview,
	NavigationItemEdit,
} from './admin/navigations/views';
import { PUPIL_COLLECTIONS_PATH } from './admin/pupil-collection/pupil-collection.const';
import { PupilCollectionsOverview } from './admin/pupil-collection/views/PupilCollectionsOverview';
import { TRANSLATIONS_PATH } from './admin/translations/translations.const';
import TranslationsOverviewPage from './admin/translations/views/TranslationsOverviewPage';
import { USER_GROUP_PATH } from './admin/user-groups/user-group.const';
import UserGroupOverviewPage from './admin/user-groups/views/UserGroupOverviewPage';
import { USER_PATH } from './admin/users/user.const';
import UserDetailPage from './admin/users/views/UserDetailPage';
import { UserEditPage } from './admin/users/views/UserEditPage';
import { UserOverviewPage } from './admin/users/views/UserOverviewPage';
import { AssignmentDetailSwitcher } from './assignment/views/AssignmentDetailSwitcher';
import { AssignmentEdit } from './assignment/views/AssignmentEdit';
import { AssignmentPupilCollectionDetail } from './assignment/views/AssignmentPupilCollectionDetail';
import { AssignmentResponseAdminEdit } from './assignment/views/AssignmentResponseEdit/AssignmentResponseAdminEdit';
import { LinkYourAccount } from './authentication/views/LinkYourAccount';
import { Login } from './authentication/views/Login';
import { Logout } from './authentication/views/Logout';
import { RegisterOrLogin } from './authentication/views/RegisterOrLogin';
import { AcceptConditions } from './authentication/views/registration-flow/l8-accept-conditions';
import { StudentTeacher } from './authentication/views/registration-flow/r10-student-teacher';
import { RegisterStamboek } from './authentication/views/registration-flow/r3-stamboek';
import { ManualRegistration } from './authentication/views/registration-flow/r4-manual-registration';
import { BundleDetail } from './bundle/views/BundleDetail';
import { BundleEdit } from './bundle/views/BundleEdit';
import { CollectionDetail } from './collection/views/CollectionDetail';
import { CollectionEdit } from './collection/views/CollectionEdit';
import { APP_PATH } from './constants';
import { CookiePolicy } from './cookie-policy/views';
import DynamicRouteResolver from './dynamic-route-resolver/views/DynamicRouteResolver';
import { EmbedCodeDetail } from './embed-code/views/EmbedCodeDetail';
import { ErrorView } from './error/views/ErrorView';
import { LoggedInHome } from './home/views/LoggedInHome';
import { LoggedOutHome } from './home/views/LoggedOutHome';
import { ItemDetailRoute } from './item/views/ItemDetailRoute';
import { QuickLaneDetail } from './quick-lane/views/QuickLaneDetail';
import { Search } from './search/views/Search';
import { CompleteProfileStep } from './settings/components/CompleteProfileStep';
import { Email } from './settings/components/Email/Email';
import { Profile } from './settings/components/Profile';
import { Settings } from './settings/views/Settings';
import { FullPageSpinner } from './shared/components/FullPageSpinner/FullPageSpinner';
import { ROUTE_PARTS } from './shared/constants';
import {
	checkLoginLoaderAsync,
	hasAllPermissionsLoader,
	hasAnyPermissionLoader,
	hasPermissionLoader,
	isLoggedInLoader,
	routeLoaders,
} from './shared/helpers/routing/route-loaders';
import { EducationalAuthorItemRequestForm } from './user-item-request-form/views/EducationalAuthorItemRequestForm';
import { EducationalAuthorItemRequestFormConfirm } from './user-item-request-form/views/EducationalAuthorItemRequestFormConfirm';
import { UserItemRequestForm } from './user-item-request-form/views/UserItemRequestForm';
import { UserItemRequestFormConfirm } from './user-item-request-form/views/UserItemRequestFormConfirm';
import { Workspace } from './workspace/views/Workspace';
import { WorkspaceAssignmentRedirect } from './workspace/views/WorkspaceAssignmentRedirect';
import { UrlRedirectEdit, UrlRedirectOverview } from './admin/url-redirects/views';
import { URL_REDIRECT_PATH } from './admin/url-redirects/url-redirects.const';

async function logRoutesMiddleware({ request }: Parameters<MiddlewareFunction>[0]) {
	console.log(`Starting navigation: ${request.url}`);
}

export const getAppRoutes = (): RouteObject[] => [
	{
		path: '/',
		middleware: [logRoutesMiddleware],
		loader: checkLoginLoaderAsync(),
		children: [
			////////////////////////////////////////////////////////////////////////////////////////
			// ADMIN ROUTES
			////////////////////////////////////////////////////////////////////////////////////////
			{
				path: `/${ROUTE_PARTS.beheer}`,
				loader: () => {
					console.log('Redirecting to /admin');
					return redirect(`/${ROUTE_PARTS.admin}`);
				},
				Component: FullPageSpinner,
			},
			{
				path: `/${ROUTE_PARTS.admin}`,
				Component: Admin,
				children: getAdminRoutes(),
			},
			////////////////////////////////////////////////////////////////////////////////////////
			// CLIENT ROUTES
			////////////////////////////////////////////////////////////////////////////////////////
			{
				path: '/',
				Component: AppWithAdminCoreConfig,
				children: [
					////////////////////////////////////////////////////////////////////////////////////////
					// UNAUTHENTICATED
					////////////////////////////////////////////////////////////////////////////////////////
					...getUnauthenticatedClientRoutes(),

					////////////////////////////////////////////////////////////////////////////////////////
					// AUTHENTICATED ROUTES
					////////////////////////////////////////////////////////////////////////////////////////
					{
						loader: isLoggedInLoader(),
						children: getAuthenticatedClientRoutes(),
					},

					////////////////////////////////////////////////////////////////////////////////////////
					// DYNAMIC ROUTES (CONTENT PAGES) AND 404 HANDLING
					////////////////////////////////////////////////////////////////////////////////////////
					// This route needs to be the last one, since it handles all remaining routes
					{ Component: DynamicRouteResolver, path: APP_PATH.ALL_ROUTES.route },
				],
			},
		],
	},
];

////////////////////////////////////////////////////////////////////////////////////////
// UNAUTHENTICATED
////////////////////////////////////////////////////////////////////////////////////////
function getUnauthenticatedClientRoutes(): RouteObject[] {
	return [
		{ index: true, Component: LoggedOutHome },
		{ path: APP_PATH.LOGIN.route, Component: Login },
		{ path: APP_PATH.LOGOUT.route, Component: Logout },
		{ path: APP_PATH.STAMBOEK.route, Component: RegisterStamboek },
		{ path: APP_PATH.MANUAL_ACCESS_REQUEST.route, Component: ManualRegistration },
		{ path: APP_PATH.STUDENT_TEACHER.route, Component: StudentTeacher },
		{ path: APP_PATH.REGISTER_OR_LOGIN.route, Component: RegisterOrLogin },
		{ path: APP_PATH.LINK_YOUR_ACCOUNT.route, Component: LinkYourAccount },
		{ path: APP_PATH.ACCEPT_CONDITIONS.route, Component: AcceptConditions },
		{ path: APP_PATH.COMPLETE_PROFILE.route, Component: CompleteProfileStep },
		{ path: APP_PATH.ERROR.route, Component: ErrorView },
		{ path: APP_PATH.COOKIE_POLICY.route, Component: CookiePolicy },
		{ path: APP_PATH.EMAIL_PREFERENCES_LOGGED_OUT.route, Component: Email },
	];
}

////////////////////////////////////////////////////////////////////////////////////////
// AUTHENTICATED ROUTES
////////////////////////////////////////////////////////////////////////////////////////
function getAuthenticatedClientRoutes(): RouteObject[] {
	return [
		{
			path: APP_PATH.LOGGED_IN_HOME.route,
			Component: LoggedInHome,
		},
		{
			path: `/${ROUTE_PARTS.beheer}`,
			Component: AdminRedirect,
		},
		{
			path: APP_PATH.SEARCH.route,
			loader: isLoggedInLoader(),
			Component: Search,
		},
		{
			path: APP_PATH.ITEM_DETAIL.route,
			Component: ItemDetailRoute,
		},
		{
			path: APP_PATH.COLLECTION_DETAIL.route,
			Component: CollectionDetail,
		},
		{
			path: APP_PATH.COLLECTION_EDIT.route,
			Component: CollectionEdit,
		},
		{
			path: APP_PATH.COLLECTION_EDIT_TAB.route,
			Component: CollectionEdit,
		},
		{
			path: APP_PATH.BUNDLE_DETAIL.route,
			Component: BundleDetail,
		},
		{
			path: APP_PATH.BUNDLE_EDIT.route,
			loader: isLoggedInLoader(),
			Component: BundleEdit,
		},
		{
			path: APP_PATH.BUNDLE_EDIT_TAB.route,
			Component: BundleEdit,
		},
		{
			path: APP_PATH.ASSIGNMENT_CREATE.route,
			Component: AssignmentEdit,
		},
		{
			path: APP_PATH.ASSIGNMENT_DETAIL.route,
			Component: AssignmentDetailSwitcher,
		},
		{
			path: APP_PATH.ASSIGNMENT_EDIT.route,
			Component: AssignmentEdit,
		},
		{
			path: APP_PATH.ASSIGNMENT_EDIT_TAB.route,
			Component: AssignmentEdit,
		},
		{
			path: APP_PATH.ASSIGNMENT_RESPONSE_CREATE.route,
			Component: AssignmentDetailSwitcher,
		},
		{
			path: APP_PATH.ASSIGNMENT_RESPONSE_EDIT.route,
			Component: AssignmentDetailSwitcher,
		},
		// view pupil collection response as teacher/ad{min
		{
			path: APP_PATH.ASSIGNMENT_PUPIL_COLLECTION_DETAIL.route,
			Component: AssignmentPupilCollectionDetail,
		},
		// edit pupil collection response as admin
		{
			path: APP_PATH.ASSIGNMENT_PUPIL_COLLECTION_ADMIN_EDIT.route,
			Component: AssignmentResponseAdminEdit,
		},
		{
			path: APP_PATH.WORKSPACE.route,
			loader: isLoggedInLoader(),
			Component: Workspace,
		},
		{
			path: `${APP_PATH.WORKSPACE.route}${APP_PATH.ASSIGNMENT_DETAIL.route}`,
			loader: (props) => {
				const assignmentId = props.params?.assignmentId;
				return redirect(`/${ROUTE_PARTS.assignments}/${assignmentId}${location.search}`);
			},
			Component: WorkspaceAssignmentRedirect,
		},
		{
			path: APP_PATH.WORKSPACE_TAB.route,
			Component: Workspace,
		},
		{
			path: APP_PATH.SETTINGS.route,
			loader: isLoggedInLoader(),
			Component: Settings,
		},
		{
			path: APP_PATH.SETTINGS_TAB.route,
			loader: isLoggedInLoader(),
			Component: Settings,
		},
		{
			path: APP_PATH.COMPLETE_PROFILE.route,
			Component: Profile,
		},
		{
			path: APP_PATH.USER_ITEM_REQUEST_FORM.route,
			Component: UserItemRequestForm,
		},
		{
			path: APP_PATH.USER_ITEM_REQUEST_FORM_CONFIRM.route,
			Component: UserItemRequestFormConfirm,
		},
		{
			path: APP_PATH.EDUCATIONAL_USER_ITEM_REQUEST_FORM.route,
			Component: EducationalAuthorItemRequestForm,
		},
		{
			path: APP_PATH.EDUCATIONAL_USER_ITEM_REQUEST_FORM_CONFIRM.route,
			Component: EducationalAuthorItemRequestFormConfirm,
		},
		{
			path: APP_PATH.QUICK_LANE.route,
			Component: QuickLaneDetail,
		},
		{ path: APP_PATH.EMBED.route, Component: EmbedCodeDetail },
	];
}

function getAdminRoutes(): RouteObject[] {
	return [
		{
			Component: Dashboard,
			index: true,
		},
		{
			Component: AssignmentOverviewAdmin,
			loader: hasPermissionLoader(PermissionName.VIEW_ANY_ASSIGNMENTS),
			path: ASSIGNMENTS_PATH.ASSIGNMENTS_OVERVIEW,
		},
		{
			Component: AssignmentMarcomOverview,
			loader: hasPermissionLoader(PermissionName.VIEW_ANY_ASSIGNMENTS),
			path: ASSIGNMENTS_PATH.ASSIGNMENTS_MARCOM_OVERVIEW,
		},
		{
			Component: CollectionsOrBundlesOverview,
			loader: routeLoaders(
				(permissions) =>
					permissions.includes(PermissionName.VIEW_COLLECTIONS_OVERVIEW) &&
					(permissions.includes(PermissionName.VIEW_ANY_PUBLISHED_COLLECTIONS) ||
						permissions.includes(PermissionName.VIEW_ANY_UNPUBLISHED_COLLECTIONS))
			),
			path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTIONS_OVERVIEW,
		},
		{
			Component: CollectionOrBundleActualisationOverview,
			loader: hasAllPermissionsLoader(
				PermissionName.VIEW_COLLECTIONS_OVERVIEW,
				PermissionName.VIEW_COLLECTION_EDITORIAL_OVERVIEWS
			),
			path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_ACTUALISATION_OVERVIEW,
		},
		{
			Component: CollectionOrBundleQualityCheckOverview,
			loader: hasAllPermissionsLoader(
				PermissionName.VIEW_COLLECTIONS_OVERVIEW,
				PermissionName.VIEW_COLLECTION_EDITORIAL_OVERVIEWS
			),
			path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_QUALITYCHECK_OVERVIEW,
		},
		{
			Component: CollectionOrBundleMarcomOverview,
			loader: hasAllPermissionsLoader(
				PermissionName.VIEW_COLLECTIONS_OVERVIEW,
				PermissionName.VIEW_COLLECTION_EDITORIAL_OVERVIEWS
			),
			path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_MARCOM_OVERVIEW,
		},
		{
			Component: CollectionsOrBundlesOverview,
			loader: routeLoaders(
				(permissions) =>
					permissions.includes(PermissionName.VIEW_BUNDLES_OVERVIEW) &&
					(permissions.includes(PermissionName.VIEW_ANY_PUBLISHED_BUNDLES) ||
						permissions.includes(PermissionName.VIEW_ANY_UNPUBLISHED_BUNDLES))
			),
			path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLES_OVERVIEW,
		},
		{
			Component: CollectionOrBundleActualisationOverview,
			loader: hasAllPermissionsLoader(
				PermissionName.VIEW_BUNDLES_OVERVIEW,
				PermissionName.VIEW_BUNDLE_EDITORIAL_OVERVIEWS
			),
			path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_ACTUALISATION_OVERVIEW,
		},
		{
			Component: CollectionOrBundleQualityCheckOverview,
			loader: hasAllPermissionsLoader(
				PermissionName.VIEW_BUNDLES_OVERVIEW,
				PermissionName.VIEW_BUNDLE_EDITORIAL_OVERVIEWS
			),
			path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_QUALITYCHECK_OVERVIEW,
		},
		{
			Component: CollectionOrBundleMarcomOverview,
			loader: hasAllPermissionsLoader(
				PermissionName.VIEW_BUNDLES_OVERVIEW,
				PermissionName.VIEW_BUNDLE_EDITORIAL_OVERVIEWS
			),
			path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_MARCOM_OVERVIEW,
		},
		{
			Component: ContentPageOverviewPage,
			loader: hasAnyPermissionLoader(
				PermissionName.EDIT_OWN_CONTENT_PAGES,
				PermissionName.EDIT_ANY_CONTENT_PAGES
			),
			path: CONTENT_PAGE_PATH.CONTENT_PAGE_OVERVIEW,
		},
		{
			Component: ContentPageEditPage,
			loader: hasAnyPermissionLoader(
				PermissionName.EDIT_OWN_CONTENT_PAGES,
				PermissionName.EDIT_ANY_CONTENT_PAGES
			),
			path: CONTENT_PAGE_PATH.CONTENT_PAGE_CREATE,
		},
		{
			Component: ContentPageDetailPage,
			loader: hasAnyPermissionLoader(
				PermissionName.EDIT_OWN_CONTENT_PAGES,
				PermissionName.EDIT_ANY_CONTENT_PAGES
			),
			path: CONTENT_PAGE_PATH.CONTENT_PAGE_DETAIL,
		},
		{
			Component: ContentPageEditPage,
			loader: hasAnyPermissionLoader(
				PermissionName.EDIT_OWN_CONTENT_PAGES,
				PermissionName.EDIT_ANY_CONTENT_PAGES
			),
			path: CONTENT_PAGE_PATH.CONTENT_PAGE_EDIT,
		},
		{
			Component: ContentPageLabelOverviewPage,
			loader: hasPermissionLoader(PermissionName.EDIT_CONTENT_PAGE_LABELS),
			path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_OVERVIEW,
		},
		{
			Component: ContentPageLabelEditPage,
			loader: hasPermissionLoader(PermissionName.EDIT_CONTENT_PAGE_LABELS),
			path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_CREATE,
		},
		{
			Component: ContentPageLabelEditPage,
			loader: hasPermissionLoader(PermissionName.EDIT_CONTENT_PAGE_LABELS),
			path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_EDIT,
		},
		{
			Component: ContentPageLabelDetailPage,
			loader: hasPermissionLoader(PermissionName.EDIT_CONTENT_PAGE_LABELS),
			path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_DETAIL,
		},
		{
			Component: InteractiveTourOverview,
			loader: hasPermissionLoader(PermissionName.EDIT_INTERACTIVE_TOURS),
			path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_OVERVIEW,
		},
		{
			Component: InteractiveTourEdit,
			loader: hasPermissionLoader(PermissionName.EDIT_INTERACTIVE_TOURS),
			path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_CREATE,
		},
		{
			Component: InteractiveTourEdit,
			loader: hasPermissionLoader(PermissionName.EDIT_INTERACTIVE_TOURS),
			path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_EDIT,
		},
		{
			Component: InteractiveTourDetail,
			loader: hasPermissionLoader(PermissionName.EDIT_INTERACTIVE_TOURS),
			path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_DETAIL,
		},
		{
			Component: ItemsOverview,
			loader: hasPermissionLoader(PermissionName.VIEW_ITEMS_OVERVIEW),
			path: ITEMS_PATH.ITEMS_OVERVIEW,
		},
		{
			Component: ItemDetail,
			loader: hasPermissionLoader(PermissionName.VIEW_ITEMS_OVERVIEW),
			path: ITEMS_PATH.ITEM_DETAIL,
		},
		{
			Component: PublishItemsOverview,
			loader: hasPermissionLoader(PermissionName.PUBLISH_ITEMS),
			path: ITEMS_PATH.PUBLISH_ITEMS_OVERVIEW,
		},
		{
			Component: NavigationBarOverview,
			loader: hasPermissionLoader(PermissionName.EDIT_NAVIGATION_BARS),
			path: NAVIGATIONS_PATH.NAVIGATIONS_OVERVIEW,
		},
		{
			Component: NavigationItemEdit,
			loader: hasPermissionLoader(PermissionName.EDIT_NAVIGATION_BARS),
			path: NAVIGATIONS_PATH.NAVIGATIONS_CREATE,
		},
		{
			Component: NavigationBarDetail,
			loader: hasPermissionLoader(PermissionName.EDIT_NAVIGATION_BARS),
			path: NAVIGATIONS_PATH.NAVIGATIONS_DETAIL,
		},
		{
			Component: NavigationItemEdit,
			loader: hasPermissionLoader(PermissionName.EDIT_NAVIGATION_BARS),
			path: NAVIGATIONS_PATH.NAVIGATIONS_ITEM_CREATE,
		},
		{
			Component: NavigationItemEdit,
			loader: hasPermissionLoader(PermissionName.EDIT_NAVIGATION_BARS),
			path: NAVIGATIONS_PATH.NAVIGATIONS_ITEM_EDIT,
		},
		{
			Component: UrlRedirectOverview,
			loader: hasPermissionLoader(PermissionName.EDIT_REDIRECTS),
			path: URL_REDIRECT_PATH.URL_REDIRECT_OVERVIEW,
		},
		{
			Component: UrlRedirectEdit,
			loader: hasPermissionLoader(PermissionName.EDIT_REDIRECTS),
			path: URL_REDIRECT_PATH.URL_REDIRECT_CREATE,
		},
		{
			Component: UrlRedirectEdit,
			loader: hasPermissionLoader(PermissionName.EDIT_REDIRECTS),
			path: URL_REDIRECT_PATH.URL_REDIRECT_EDIT,
		},
		{
			Component: PupilCollectionsOverview,
			loader: hasPermissionLoader(PermissionName.VIEW_ANY_PUPIL_COLLECTIONS),
			path: PUPIL_COLLECTIONS_PATH.ASSIGNMENT_PUPIL_COLLECTIONS_OVERVIEW,
		},
		{
			Component: TranslationsOverviewPage,
			loader: hasPermissionLoader(PermissionName.EDIT_TRANSLATIONS),
			path: TRANSLATIONS_PATH.TRANSLATIONS,
		},
		{
			Component: UserGroupOverviewPage,
			loader: hasPermissionLoader(PermissionName.EDIT_USER_GROUPS),
			path: USER_GROUP_PATH.USER_GROUP_OVERVIEW,
		},
		{
			Component: UserOverviewPage,
			loader: hasPermissionLoader(PermissionName.VIEW_USERS),
			path: USER_PATH.USER_OVERVIEW,
		},
		{
			Component: UserDetailPage,
			loader: hasPermissionLoader(PermissionName.VIEW_USERS),
			path: USER_PATH.USER_DETAIL,
		},
		{
			Component: UserEditPage,
			loader: hasPermissionLoader(PermissionName.VIEW_USERS),
			path: USER_PATH.USER_EDIT,
		},
		{
			Component: MaintenanceAlertsOverviewPage,
			loader: hasPermissionLoader(PermissionName.VIEW_ANY_MAINTENANCE_ALERTS),
			path: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.alerts}`,
		},
	];
}
