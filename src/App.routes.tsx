import { MaintenanceAlertsOverviewPage } from '@meemoo/admin-core-ui/dist/modules/alerts/MaintenanceAlertsOverviewPage';
import { type RouteObject } from 'react-router';

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
import { DASHBOARD_PATH } from './admin/dashboard/dashboard.const';
import { Dashboard } from './admin/dashboard/views/Dashboard';
import { INTERACTIVE_TOUR_PATH } from './admin/interactive-tour/interactive-tour.const';
import { InteractiveTourDetail } from './admin/interactive-tour/views/InteractiveTourDetail';
import { InteractiveTourEdit } from './admin/interactive-tour/views/InteractiveTourEdit';
import { InteractiveTourOverview } from './admin/interactive-tour/views/InteractiveTourOverview';
import { ITEMS_PATH } from './admin/items/items.const';
import { ItemDetail } from './admin/items/views/ItemDetail';
import { ItemsOverview } from './admin/items/views/ItemsOverview';
import { PublishItemsOverview } from './admin/items/views/PublishItemsOverview';
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
import { Home } from './home/views/Home';
import { ItemDetailRoute } from './item/views/ItemDetailRoute';
import { QuickLaneDetail } from './quick-lane/views/QuickLaneDetail';
import { Search } from './search/views/Search';
import { CompleteProfileStep } from './settings/components/CompleteProfileStep';
import { Email } from './settings/components/Email/Email';
import { Profile } from './settings/components/Profile';
import { Settings } from './settings/views/Settings';
import { ROUTE_PARTS } from './shared/constants';
import { EducationalAuthorItemRequestForm } from './user-item-request-form/views/EducationalAuthorItemRequestForm';
import { EducationalAuthorItemRequestFormConfirm } from './user-item-request-form/views/EducationalAuthorItemRequestFormConfirm';
import { UserItemRequestForm } from './user-item-request-form/views/UserItemRequestForm';
import { UserItemRequestFormConfirm } from './user-item-request-form/views/UserItemRequestFormConfirm';
import { Workspace } from './workspace/views/Workspace';
import { WorkspaceAssignmentRedirect } from './workspace/views/WorkspaceAssignmentRedirect';

export const renderRoutes = (): RouteObject[] => [
	// UNAUTHENTICATED
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

	// AUTHENTICATED ROUTES
	{ path: `/${ROUTE_PARTS.beheer}`, Component: AdminRedirect },
	{ path: APP_PATH.LOGGED_IN_HOME.route, Component: Home },
	{ path: APP_PATH.SEARCH.route, Component: Search },
	{ path: APP_PATH.ITEM_DETAIL.route, Component: ItemDetailRoute },
	{ path: APP_PATH.COLLECTION_DETAIL.route, Component: CollectionDetail },
	{ path: APP_PATH.COLLECTION_EDIT.route, Component: CollectionEdit },
	{ path: APP_PATH.COLLECTION_EDIT_TAB.route, Component: CollectionEdit },
	{ path: APP_PATH.BUNDLE_DETAIL.route, Component: BundleDetail },
	{ path: APP_PATH.BUNDLE_EDIT.route, Component: BundleEdit },
	{ path: APP_PATH.BUNDLE_EDIT_TAB.route, Component: BundleEdit },
	{ path: APP_PATH.ASSIGNMENT_CREATE.route, Component: AssignmentEdit },
	{ path: APP_PATH.ASSIGNMENT_DETAIL.route, Component: AssignmentDetailSwitcher },
	{ path: APP_PATH.ASSIGNMENT_EDIT.route, Component: AssignmentEdit },
	{ path: APP_PATH.ASSIGNMENT_EDIT_TAB.route, Component: AssignmentEdit },
	{ path: APP_PATH.ASSIGNMENT_RESPONSE_CREATE.route, Component: AssignmentDetailSwitcher },
	{ path: APP_PATH.ASSIGNMENT_RESPONSE_EDIT.route, Component: AssignmentDetailSwitcher },
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
	{ path: APP_PATH.WORKSPACE.route, Component: Workspace },
	{
		path: `${APP_PATH.WORKSPACE.route}${APP_PATH.ASSIGNMENT_DETAIL.route}`,
		Component: WorkspaceAssignmentRedirect,
	},
	{ path: APP_PATH.WORKSPACE_TAB.route, Component: Workspace },
	{ path: APP_PATH.SETTINGS.route, Component: Settings },
	{ path: APP_PATH.SETTINGS_TAB.route, Component: Settings },
	{ path: APP_PATH.COMPLETE_PROFILE.route, Component: Profile },
	{ path: APP_PATH.USER_ITEM_REQUEST_FORM.route, Component: UserItemRequestForm },
	{ path: APP_PATH.USER_ITEM_REQUEST_FORM_CONFIRM.route, Component: UserItemRequestFormConfirm },
	{
		path: APP_PATH.EDUCATIONAL_USER_ITEM_REQUEST_FORM.route,
		Component: EducationalAuthorItemRequestForm,
	},
	{
		path: APP_PATH.EDUCATIONAL_USER_ITEM_REQUEST_FORM_CONFIRM.route,
		Component: EducationalAuthorItemRequestFormConfirm,
	},
	{ path: APP_PATH.QUICK_LANE.route, Component: QuickLaneDetail },
	{ path: APP_PATH.EMBED.route, Component: EmbedCodeDetail },

	// ADMIN ROUTES
	// PermissionName.VIEW_ANY_ASSIGNMENTS
	{
		Component: AssignmentOverviewAdmin,
		path: ASSIGNMENTS_PATH.ASSIGNMENTS_OVERVIEW,
	},
	// PermissionName.VIEW_ANY_ASSIGNMENTS
	{
		Component: AssignmentMarcomOverview,
		path: ASSIGNMENTS_PATH.ASSIGNMENTS_MARCOM_OVERVIEW,
	},
	// [PermissionName.VIEW_COLLECTIONS_OVERVIEW, PermissionName.VIEW_BUNDLES_OVERVIEW],
	// userPermissions.includes(PermissionName.VIEW_COLLECTIONS_OVERVIEW) &&
	// (userPermissions.includes(PermissionName.VIEW_ANY_PUBLISHED_COLLECTIONS) ||
	// 	userPermissions.includes(PermissionName.VIEW_ANY_UNPUBLISHED_COLLECTIONS)),
	{
		Component: CollectionsOrBundlesOverview,
		path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTIONS_OVERVIEW,
	},
	// [PermissionName.VIEW_COLLECTIONS_OVERVIEW, PermissionName.VIEW_BUNDLES_OVERVIEW],
	// userPermissions.includes(PermissionName.VIEW_COLLECTION_EDITORIAL_OVERVIEWS),
	{
		Component: CollectionOrBundleActualisationOverview,
		path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_ACTUALISATION_OVERVIEW,
	},
	// [PermissionName.VIEW_COLLECTIONS_OVERVIEW, PermissionName.VIEW_BUNDLES_OVERVIEW],
	// userPermissions.includes(PermissionName.VIEW_COLLECTION_EDITORIAL_OVERVIEWS),
	{
		Component: CollectionOrBundleQualityCheckOverview,
		path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_QUALITYCHECK_OVERVIEW,
	},
	// [PermissionName.VIEW_COLLECTIONS_OVERVIEW, PermissionName.VIEW_BUNDLES_OVERVIEW],
	// userPermissions.includes(PermissionName.VIEW_COLLECTION_EDITORIAL_OVERVIEWS),
	{
		Component: CollectionOrBundleMarcomOverview,
		path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_MARCOM_OVERVIEW,
	},
	// [PermissionName.VIEW_COLLECTIONS_OVERVIEW, PermissionName.VIEW_BUNDLES_OVERVIEW],
	// userPermissions.includes(PermissionName.VIEW_BUNDLES_OVERVIEW) &&
	// (userPermissions.includes(PermissionName.VIEW_ANY_PUBLISHED_BUNDLES) ||
	// userPermissions.includes(PermissionName.VIEW_ANY_UNPUBLISHED_BUNDLES)),
	{
		Component: CollectionsOrBundlesOverview,
		path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLES_OVERVIEW,
	},
	// [PermissionName.VIEW_COLLECTIONS_OVERVIEW, PermissionName.VIEW_BUNDLES_OVERVIEW],
	// userPermissions.includes(PermissionName.VIEW_BUNDLE_EDITORIAL_OVERVIEWS),
	{
		Component: CollectionOrBundleActualisationOverview,
		path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_ACTUALISATION_OVERVIEW,
	},
	// [PermissionName.VIEW_COLLECTIONS_OVERVIEW, PermissionName.VIEW_BUNDLES_OVERVIEW],
	// userPermissions.includes(PermissionName.VIEW_BUNDLE_EDITORIAL_OVERVIEWS),
	{
		Component: CollectionOrBundleQualityCheckOverview,
		path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_QUALITYCHECK_OVERVIEW,
	},
	// [PermissionName.VIEW_COLLECTIONS_OVERVIEW, PermissionName.VIEW_BUNDLES_OVERVIEW],
	// userPermissions.includes(PermissionName.VIEW_BUNDLE_EDITORIAL_OVERVIEWS),
	{
		Component: CollectionOrBundleMarcomOverview,
		path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_MARCOM_OVERVIEW,
	},
	// PermissionName.EDIT_OWN_CONTENT_PAGES, PermissionName.EDIT_ANY_CONTENT_PAGES
	{
		Component: ContentPageOverviewPage,
		path: CONTENT_PAGE_PATH.CONTENT_PAGE_OVERVIEW,
	},
	// PermissionName.EDIT_OWN_CONTENT_PAGES, PermissionName.EDIT_ANY_CONTENT_PAGES
	{
		Component: ContentPageEditPage,
		path: CONTENT_PAGE_PATH.CONTENT_PAGE_CREATE,
	},
	// PermissionName.EDIT_OWN_CONTENT_PAGES, PermissionName.EDIT_ANY_CONTENT_PAGES
	{
		Component: ContentPageDetailPage,
		path: CONTENT_PAGE_PATH.CONTENT_PAGE_DETAIL,
	},
	// PermissionName.EDIT_OWN_CONTENT_PAGES, PermissionName.EDIT_ANY_CONTENT_PAGES
	{
		Component: ContentPageEditPage,
		path: CONTENT_PAGE_PATH.CONTENT_PAGE_EDIT,
	},
	// PermissionName.EDIT_CONTENT_PAGE_LABELS
	{
		Component: ContentPageLabelOverviewPage,
		path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_OVERVIEW,
	},
	// PermissionName.EDIT_CONTENT_PAGE_LABELS
	{
		Component: ContentPageLabelEditPage,
		path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_CREATE,
	},
	// PermissionName.EDIT_CONTENT_PAGE_LABELS
	{
		Component: ContentPageLabelEditPage,
		path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_EDIT,
	},
	// PermissionName.EDIT_CONTENT_PAGE_LABELS
	{
		Component: ContentPageLabelDetailPage,
		path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_DETAIL,
	},
	{
		Component: Dashboard,
		path: DASHBOARD_PATH.DASHBOARD,
	},
	// PermissionName.EDIT_INTERACTIVE_TOURS
	{
		Component: InteractiveTourOverview,
		path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_OVERVIEW,
	},
	// PermissionName.EDIT_INTERACTIVE_TOURS
	{
		Component: InteractiveTourEdit,
		path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_CREATE,
	},
	// PermissionName.EDIT_INTERACTIVE_TOURS
	{
		Component: InteractiveTourEdit,
		path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_EDIT,
	},
	// PermissionName.EDIT_INTERACTIVE_TOURS
	{
		Component: InteractiveTourDetail,
		path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_DETAIL,
	},
	// PermissionName.VIEW_ITEMS_OVERVIEW
	{
		Component: ItemsOverview,
		path: ITEMS_PATH.ITEMS_OVERVIEW,
	},
	// PermissionName.VIEW_ITEMS_OVERVIEW
	{
		Component: ItemDetail,
		path: ITEMS_PATH.ITEM_DETAIL,
	},
	// PermissionName.PUBLISH_ITEMS
	{
		Component: PublishItemsOverview,
		path: ITEMS_PATH.PUBLISH_ITEMS_OVERVIEW,
	},
	// PermissionName.EDIT_NAVIGATION_BARS
	{
		Component: NavigationBarOverview,
		path: NAVIGATIONS_PATH.NAVIGATIONS_OVERVIEW,
	},
	// PermissionName.EDIT_NAVIGATION_BARS
	{
		Component: NavigationItemEdit,
		path: NAVIGATIONS_PATH.NAVIGATIONS_CREATE,
	},
	// PermissionName.EDIT_NAVIGATION_BARS
	{
		Component: NavigationBarDetail,
		path: NAVIGATIONS_PATH.NAVIGATIONS_DETAIL,
	},
	// PermissionName.EDIT_NAVIGATION_BARS
	{
		Component: NavigationItemEdit,
		path: NAVIGATIONS_PATH.NAVIGATIONS_ITEM_CREATE,
	},
	// PermissionName.EDIT_NAVIGATION_BARS
	{
		Component: NavigationItemEdit,
		path: NAVIGATIONS_PATH.NAVIGATIONS_ITEM_EDIT,
	},
	// PermissionName.VIEW_ANY_PUPIL_COLLECTIONS
	{
		Component: PupilCollectionsOverview,
		path: PUPIL_COLLECTIONS_PATH.ASSIGNMENT_PUPIL_COLLECTIONS_OVERVIEW,
	},
	// PermissionName.EDIT_TRANSLATIONS,
	{
		Component: TranslationsOverviewPage,
		path: TRANSLATIONS_PATH.TRANSLATIONS,
	},
	// PermissionName.EDIT_USER_GROUPS
	{
		Component: UserGroupOverviewPage,
		path: USER_GROUP_PATH.USER_GROUP_OVERVIEW,
	},
	// PermissionName.VIEW_USERS
	{
		Component: UserOverviewPage,
		path: USER_PATH.USER_OVERVIEW,
	},
	// PermissionName.VIEW_USERS
	{
		Component: UserDetailPage,
		path: USER_PATH.USER_DETAIL,
	},
	// PermissionName.VIEW_USERS
	{
		Component: UserEditPage,
		path: USER_PATH.USER_EDIT,
	},

	// Admin core routes
	{
		Component: MaintenanceAlertsOverviewPage,
		path: `/${ROUTE_PARTS.alerts}`,
	},

	// UNAUTHENTICATED
	// This route needs to be the last one, since it handles all remaining routes
	{ Component: DynamicRouteResolver, path: APP_PATH.ALL_ROUTES.route },
];
