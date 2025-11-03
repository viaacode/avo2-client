import { type MiddlewareFunction, redirect, type RouteObject } from 'react-router';

import { AppWithAdminCoreConfig } from './App';
import { AppClientLayout } from './AppClientLayout';
import { Admin } from './admin/Admin';
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
import { URL_REDIRECT_PATH } from './admin/url-redirects/url-redirects.const';
import { UrlRedirectEdit, UrlRedirectOverview } from './admin/url-redirects/views';
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
import { ErrorBoundary } from './shared/components/ErrorBoundary/ErrorBoundary';
import { FullPageSpinner } from './shared/components/FullPageSpinner/FullPageSpinner';
import { ROUTE_PARTS } from './shared/constants';
import { EducationalAuthorItemRequestForm } from './user-item-request-form/views/EducationalAuthorItemRequestForm';
import { EducationalAuthorItemRequestFormConfirm } from './user-item-request-form/views/EducationalAuthorItemRequestFormConfirm';
import { UserItemRequestForm } from './user-item-request-form/views/UserItemRequestForm';
import { UserItemRequestFormConfirm } from './user-item-request-form/views/UserItemRequestFormConfirm';
import { Workspace } from './workspace/views/Workspace';

async function logRoutesMiddleware({ request }: Parameters<MiddlewareFunction>[0]) {
	console.log(`${request.method} ${request.url}`);
}

export const getAppRoutes = (): RouteObject[] => [
	{
		id: 'root',
		path: '/',
		middleware: [logRoutesMiddleware],
		Component: AppWithAdminCoreConfig,
		children: [
			////////////////////////////////////////////////////////////////////////////////////////
			// ADMIN ROUTES
			////////////////////////////////////////////////////////////////////////////////////////
			{
				// Redirect /beheer to /admin
				id: 'beheer',
				path: `/${ROUTE_PARTS.beheer}`,
				loader: () => {
					return redirect(`/${ROUTE_PARTS.admin}`);
				},
				Component: FullPageSpinner,
			},
			{
				id: 'admin',
				path: `/${ROUTE_PARTS.admin}`,
				Component: Admin,
				children: getAdminRoutes(),
			},
			////////////////////////////////////////////////////////////////////////////////////////
			// CLIENT ROUTES
			////////////////////////////////////////////////////////////////////////////////////////
			{
				id: 'login',
				// Login route doesn't need navigation or footer
				path: APP_PATH.LOGIN.route,
				Component: Login,
			},
			{
				id: 'app-client-layout',
				Component: AppClientLayout,
				children: [
					////////////////////////////////////////////////////////////////////////////////////////
					// UNAUTHENTICATED
					////////////////////////////////////////////////////////////////////////////////////////
					...getUnauthenticatedClientRoutes(),

					////////////////////////////////////////////////////////////////////////////////////////
					// AUTHENTICATED ROUTES
					////////////////////////////////////////////////////////////////////////////////////////
					{
						id: 'authenticated-client-routes',
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
		{
			id: 'LoggedOutHome',
			index: true,
			Component: LoggedOutHome,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'Logout',
			path: APP_PATH.LOGOUT.route,
			Component: Logout,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'RegisterStamboek',
			path: APP_PATH.STAMBOEK.route,
			Component: RegisterStamboek,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'ManualRegistration',
			path: APP_PATH.MANUAL_ACCESS_REQUEST.route,
			Component: ManualRegistration,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'StudentTeacher',
			path: APP_PATH.STUDENT_TEACHER.route,
			Component: StudentTeacher,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'RegisterOrLogin',
			path: APP_PATH.REGISTER_OR_LOGIN.route,
			Component: RegisterOrLogin,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'LinkYourAccount',
			path: APP_PATH.LINK_YOUR_ACCOUNT.route,
			Component: LinkYourAccount,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'AcceptConditions',
			path: APP_PATH.ACCEPT_CONDITIONS.route,
			Component: AcceptConditions,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'CompleteProfileStep',
			path: APP_PATH.COMPLETE_PROFILE.route,
			Component: CompleteProfileStep,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'ErrorView',
			path: APP_PATH.ERROR.route,
			Component: ErrorView,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'CookiePolicy',
			path: APP_PATH.COOKIE_POLICY.route,
			Component: CookiePolicy,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'Email',
			path: APP_PATH.EMAIL_PREFERENCES_LOGGED_OUT.route,
			Component: Email,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
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
			id: 'LoggedInHome',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.SEARCH.route,
			Component: Search,
			id: 'Search',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.ITEM_DETAIL.route,
			Component: ItemDetailRoute,
			id: 'ItemDetailRoute',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.COLLECTION_DETAIL.route,
			Component: CollectionDetail,
			id: 'CollectionDetail',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.COLLECTION_EDIT_TAB.route,
			Component: CollectionEdit,
			id: 'CollectionEdit tab',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.COLLECTION_EDIT.route,
			Component: CollectionEdit,
			id: 'CollectionEdit',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.BUNDLE_DETAIL.route,
			Component: BundleDetail,
			id: 'BundleDetail',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.BUNDLE_EDIT_TAB.route,
			Component: BundleEdit,
			id: 'BundleEdit tab',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.BUNDLE_EDIT.route,
			Component: BundleEdit,
			id: 'BundleEdit',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.ASSIGNMENT_CREATE.route,
			Component: AssignmentEdit,
			id: 'AssignmentEdit create',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.ASSIGNMENT_DETAIL.route,
			Component: AssignmentDetailSwitcher,
			id: 'AssignmentDetailSwitcher',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.ASSIGNMENT_EDIT_TAB.route,
			Component: AssignmentEdit,
			id: 'AssignmentEdit edit tab',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.ASSIGNMENT_EDIT.route,
			Component: AssignmentEdit,
			id: 'AssignmentEdit edit',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.ASSIGNMENT_RESPONSE_CREATE.route,
			Component: AssignmentDetailSwitcher,
			id: 'AssignmentDetailSwitcher create',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.ASSIGNMENT_RESPONSE_EDIT.route,
			Component: AssignmentDetailSwitcher,
			id: 'AssignmentDetailSwitcher edit',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		// view pupil collection response as teacher/ad{min
		{
			path: APP_PATH.ASSIGNMENT_PUPIL_COLLECTION_DETAIL.route,
			Component: AssignmentPupilCollectionDetail,
			id: 'AssignmentPupilCollectionDetail',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		// edit pupil collection response as admin
		{
			path: APP_PATH.ASSIGNMENT_PUPIL_COLLECTION_ADMIN_EDIT.route,
			Component: AssignmentResponseAdminEdit,
			id: 'AssignmentResponseAdminEdit',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.WORKSPACE_TAB.route,
			Component: Workspace,
			id: 'Workspace tab',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.WORKSPACE.route,

			Component: Workspace,
			id: 'Workspace',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: `${APP_PATH.WORKSPACE.route}${APP_PATH.ASSIGNMENT_DETAIL.route}`,
			loader: (props) => {
				const assignmentId = props.params?.assignmentId;
				return redirect(`/${ROUTE_PARTS.assignments}/${assignmentId}${location.search}`);
			},
			Component: FullPageSpinner,
			id: 'WorkspaceAssignmentRedirect',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.SETTINGS_TAB.route,
			Component: Settings,
			id: 'Settings tab',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.SETTINGS.route,
			Component: Settings,
			id: 'Settings',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.COMPLETE_PROFILE.route,
			Component: Profile,
			id: 'Profile',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.USER_ITEM_REQUEST_FORM.route,
			Component: UserItemRequestForm,
			id: 'UserItemRequestForm',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.USER_ITEM_REQUEST_FORM_CONFIRM.route,
			Component: UserItemRequestFormConfirm,
			id: 'UserItemRequestFormConfirm',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.EDUCATIONAL_USER_ITEM_REQUEST_FORM.route,
			Component: EducationalAuthorItemRequestForm,
			id: 'EducationalAuthorItemRequestForm',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.EDUCATIONAL_USER_ITEM_REQUEST_FORM_CONFIRM.route,
			Component: EducationalAuthorItemRequestFormConfirm,
			id: 'EducationalAuthorItemRequestFormConfirm',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.QUICK_LANE.route,
			Component: QuickLaneDetail,
			id: 'QuickLaneDetail',
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			path: APP_PATH.EMBED.route,
			Component: EmbedCodeDetail,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
	];
}

function getAdminRoutes(): RouteObject[] {
	return [
		{
			id: 'Dashboard',
			Component: Dashboard,
			index: true,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'AssignmentOverviewAdmin',
			Component: AssignmentOverviewAdmin,
			path: ASSIGNMENTS_PATH.ASSIGNMENTS_OVERVIEW,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'AssignmentMarcomOverview',
			Component: AssignmentMarcomOverview,
			path: ASSIGNMENTS_PATH.ASSIGNMENTS_MARCOM_OVERVIEW,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'CollectionsOverview',
			Component: CollectionsOrBundlesOverview,
			path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTIONS_OVERVIEW,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'CollectionActualisationOverview',
			Component: CollectionOrBundleActualisationOverview,
			path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_ACTUALISATION_OVERVIEW,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'CollectionQualityCheckOverview',
			Component: CollectionOrBundleQualityCheckOverview,
			path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_QUALITYCHECK_OVERVIEW,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'CollectionMarcomOverview',
			Component: CollectionOrBundleMarcomOverview,
			path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_MARCOM_OVERVIEW,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'BundlesOverview',
			Component: CollectionsOrBundlesOverview,
			path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLES_OVERVIEW,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'BundleActualisationOverview',
			Component: CollectionOrBundleActualisationOverview,
			path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_ACTUALISATION_OVERVIEW,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'BundleQualityCheckOverview',
			Component: CollectionOrBundleQualityCheckOverview,
			path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_QUALITYCHECK_OVERVIEW,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'BundleMarcomOverview',
			Component: CollectionOrBundleMarcomOverview,
			path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_MARCOM_OVERVIEW,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'ContentPageOverviewPage',
			Component: ContentPageOverviewPage,
			path: CONTENT_PAGE_PATH.CONTENT_PAGE_OVERVIEW,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'ContentPageEditPage create',
			Component: ContentPageEditPage,
			path: CONTENT_PAGE_PATH.CONTENT_PAGE_CREATE,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'ContentPageEditPage edit',
			Component: ContentPageEditPage,
			path: CONTENT_PAGE_PATH.CONTENT_PAGE_EDIT,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'ContentPageDetailPage',
			Component: ContentPageDetailPage,
			path: CONTENT_PAGE_PATH.CONTENT_PAGE_DETAIL,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'ContentPageLabelOverviewPage',
			Component: ContentPageLabelOverviewPage,
			path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_OVERVIEW,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'ContentPageLabelEditPage create',
			Component: ContentPageLabelEditPage,
			path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_CREATE,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'ContentPageLabelEditPage edit',
			Component: ContentPageLabelEditPage,
			path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_EDIT,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'ContentPageLabelDetailPage',
			Component: ContentPageLabelDetailPage,
			path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_DETAIL,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'InteractiveTourOverview',
			Component: InteractiveTourOverview,
			path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_OVERVIEW,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'InteractiveTourEdit create',
			Component: InteractiveTourEdit,
			path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_CREATE,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'InteractiveTourEdit edit',
			Component: InteractiveTourEdit,
			path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_EDIT,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'InteractiveTourDetail',
			Component: InteractiveTourDetail,
			path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_DETAIL,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'ItemsOverview',
			Component: ItemsOverview,
			path: ITEMS_PATH.ITEMS_OVERVIEW,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'ItemDetail',
			Component: ItemDetail,
			path: ITEMS_PATH.ITEM_DETAIL,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'PublishItemsOverview',
			Component: PublishItemsOverview,
			path: ITEMS_PATH.PUBLISH_ITEMS_OVERVIEW,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'NavigationBarOverview',
			Component: NavigationBarOverview,
			path: NAVIGATIONS_PATH.NAVIGATIONS_OVERVIEW,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'NavigationBarDetail',
			Component: NavigationBarDetail,
			path: NAVIGATIONS_PATH.NAVIGATIONS_DETAIL,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'NavigationItemEdit create',
			Component: NavigationItemEdit,
			path: NAVIGATIONS_PATH.NAVIGATIONS_ITEM_CREATE,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'NavigationItemEdit edit',
			Component: NavigationItemEdit,
			path: NAVIGATIONS_PATH.NAVIGATIONS_ITEM_EDIT,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'UrlRedirectOverview',
			Component: UrlRedirectOverview,
			path: URL_REDIRECT_PATH.URL_REDIRECT_OVERVIEW,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'UrlRedirectEdit create',
			Component: UrlRedirectEdit,
			path: URL_REDIRECT_PATH.URL_REDIRECT_CREATE,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'UrlRedirectEdit edit',
			Component: UrlRedirectEdit,
			path: URL_REDIRECT_PATH.URL_REDIRECT_EDIT,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'PupilCollectionsOverview',
			Component: PupilCollectionsOverview,
			path: PUPIL_COLLECTIONS_PATH.ASSIGNMENT_PUPIL_COLLECTIONS_OVERVIEW,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'TranslationsOverviewPage',
			Component: TranslationsOverviewPage,
			path: TRANSLATIONS_PATH.TRANSLATIONS,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'UserGroupOverviewPage',
			Component: UserGroupOverviewPage,
			path: USER_GROUP_PATH.USER_GROUP_OVERVIEW,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'UserOverviewPage',
			Component: UserOverviewPage,
			path: USER_PATH.USER_OVERVIEW,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'UserDetailPage',
			Component: UserDetailPage,
			path: USER_PATH.USER_DETAIL,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'UserEditPage',
			Component: UserEditPage,
			path: USER_PATH.USER_EDIT,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
		{
			id: 'MaintenanceAlertsOverviewPage',
			Component: MaintenanceAlertsOverviewPage,
			path: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.alerts}`,
			ErrorBoundary: ErrorBoundary,
			hasErrorBoundary: true,
		},
	];
}
