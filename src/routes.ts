import {
  type MiddlewareFunction,
  type RouteObject,
  redirect,
} from 'react-router';
import App from './App.tsx';
import AppClientLayout from './AppClientLayout.tsx';
import { Admin } from './admin/Admin.tsx';
import { ASSIGNMENTS_PATH } from './admin/assignments/assignments.routes';
import { AssignmentMarcomOverview } from './admin/assignments/views/AssignmentMarcomOverview.tsx';
import { AssignmentOverviewAdmin } from './admin/assignments/views/AssignmentOverviewAdmin.tsx';
import { COLLECTIONS_OR_BUNDLES_PATH } from './admin/collectionsOrBundles/collections-or-bundles.routes';
import { CollectionOrBundleActualisationOverview } from './admin/collectionsOrBundles/views/CollectionOrBundleActualisationOverview.tsx';
import { CollectionOrBundleMarcomOverview } from './admin/collectionsOrBundles/views/CollectionOrBundleMarcomOverview.tsx';
import { CollectionOrBundleQualityCheckOverview } from './admin/collectionsOrBundles/views/CollectionOrBundleQualityCheckOverview.tsx';
import { CollectionsOrBundlesOverview } from './admin/collectionsOrBundles/views/CollectionsOrBundlesOverview.tsx';
import { CONTENT_PAGE_PATH } from './admin/content-page/content-page.routes';
import { ContentPageDetailPage } from './admin/content-page/views/ContentPageDetailPage.tsx';
import { ContentPageEditPage } from './admin/content-page/views/ContentPageEditPage.tsx';
import ContentPageOverviewPage from './admin/content-page/views/ContentPageOverviewPage.tsx';
import { CONTENT_PAGE_LABEL_PATH } from './admin/content-page-labels/content-page-label.routes';
import { ContentPageLabelDetailPage } from './admin/content-page-labels/views/ContentPageLabelDetailPage.tsx';
import { ContentPageLabelEditPage } from './admin/content-page-labels/views/ContentPageLabelEditPage.tsx';
import { ContentPageLabelOverviewPage } from './admin/content-page-labels/views/ContentPageLabelOverviewPage.tsx';
import { Dashboard } from './admin/dashboard/views/Dashboard.tsx';
import { INTERACTIVE_TOUR_PATH } from './admin/interactive-tour/interactive-tour.routes';
import { InteractiveTourDetail } from './admin/interactive-tour/views/InteractiveTourDetail.tsx';
import { InteractiveTourEdit } from './admin/interactive-tour/views/InteractiveTourEdit.tsx';
import { InteractiveTourOverview } from './admin/interactive-tour/views/InteractiveTourOverview.tsx';
import { ITEMS_PATH } from './admin/items/items.routes';
import { ItemsOverview } from './admin/items/views/ItemsOverview.tsx';
import { PublishItemsOverview } from './admin/items/views/PublishItemsOverview.tsx';
import { MaintenanceAlertsOverviewPage } from './admin/maintenance-alerts-overview/MaintenanceAlertsOverviewPage.tsx';
import { NAVIGATIONS_PATH } from './admin/navigations/navigations.routes.ts';
import { NavigationBarDetailPage } from './admin/navigations/views/NavigationBarDetailPage.tsx';
import { NavigationBarOverviewPage } from './admin/navigations/views/NavigationBarOverviewPage.tsx';
import { NavigationItemEditPage } from './admin/navigations/views/NavigationItemEditPage.tsx';
import { PUPIL_COLLECTIONS_PATH } from './admin/pupil-collection/pupil-collection.routes';
import { PupilCollectionsOverview } from './admin/pupil-collection/views/PupilCollectionsOverview.tsx';
import { TRANSLATIONS_PATH } from './admin/translations/translations.routes.ts';
import { TranslationsOverviewPage } from './admin/translations/views/TranslationsOverviewPage.tsx';
import { URL_REDIRECT_PATH } from './admin/url-redirects/url-redirects.routes';
import { UrlRedirectEdit } from './admin/url-redirects/views/UrlRedirectEdit.tsx';
import { UrlRedirectOverview } from './admin/url-redirects/views/UrlRedirectOverview.tsx';
import { USER_GROUP_PATH } from './admin/user-groups/user-group.routes';
import { UserGroupOverviewPage } from './admin/user-groups/views/UserGroupOverviewPage.tsx';
import { USER_PATH } from './admin/users/user.routes.ts';
import { UserDetailPage } from './admin/users/views/UserDetailPage.tsx';
import { UserEditPage } from './admin/users/views/UserEditPage.tsx';
import { UserOverviewPage } from './admin/users/views/UserOverviewPage.tsx';
import { AssignmentDetailSwitcher } from './assignment/views/AssignmentDetailSwitcher.tsx';
import { AssignmentEdit } from './assignment/views/AssignmentEdit.tsx';
import { AssignmentPupilCollectionDetail } from './assignment/views/AssignmentPupilCollectionDetail.tsx';
import { AssignmentResponseAdminEdit } from './assignment/views/AssignmentResponseEdit/AssignmentResponseAdminEdit.tsx';
import { LinkYourAccount } from './authentication/views/LinkYourAccount.tsx';
import { Login } from './authentication/views/Login.tsx';
import { Logout } from './authentication/views/Logout.tsx';
import { RegisterOrLogin } from './authentication/views/RegisterOrLogin.tsx';
import { AcceptConditions } from './authentication/views/registration-flow/accept-conditions.tsx';
import { ManualRegistration } from './authentication/views/registration-flow/manual-registration.tsx';
import { RegisterStamboek } from './authentication/views/registration-flow/register-stamboek.tsx';
import { StudentTeacher } from './authentication/views/registration-flow/student-teacher.tsx';
import { BundleDetail } from './bundle/views/BundleDetail.tsx';
import { BundleEdit } from './bundle/views/BundleEdit.tsx';
import { CollectionDetail } from './collection/views/CollectionDetail.tsx';
import { CollectionEdit } from './collection/views/CollectionEdit.tsx';
import { APP_PATH } from './constants';
import CookiePolicy from './cookie-policy/views/CookiePolicy.tsx';
import { DynamicRouteResolver } from './dynamic-route-resolver/views/DynamicRouteResolver.tsx';
import { EmbedCodeDetail } from './embed-code/views/EmbedCodeDetail.tsx';
import ErrorViewPage from './error/views/ErrorViewPage.tsx';
import { LoggedInHome } from './home/views/LoggedInHome.tsx';
import { LoggedOutHome } from './home/views/LoggedOutHome.tsx';
import { ItemDetail } from './item/views/ItemDetail.tsx';
import { ItemDetailRoute } from './item/views/ItemDetailRoute.tsx';
import { QuickLaneDetail } from './quick-lane/views/QuickLaneDetail.tsx';
import {
  fetchCollectionLoader,
  initAppLoader,
  loadLoggedOutHomeContentPage,
} from './routes.loaders.ts';
import { Search } from './search/views/Search.tsx';
import { CompleteProfileStep } from './settings/components/CompleteProfileStep.tsx';
import { Email } from './settings/components/Email/Email.tsx';
import { Profile } from './settings/components/Profile.tsx';
import { Settings } from './settings/views/Settings.tsx';
import { ErrorBoundary } from './shared/components/ErrorBoundary/ErrorBoundary';
import FullPageSpinnerPage from './shared/components/FullPageSpinner/FullPageSpinnerRoute.tsx';
import { ROUTE_PARTS } from './shared/constants/routes';
import { EducationalAuthorItemRequestForm } from './user-item-request-form/views/EducationalAuthorItemRequestForm.tsx';
import { EducationalAuthorItemRequestFormConfirm } from './user-item-request-form/views/EducationalAuthorItemRequestFormConfirm.tsx';
import { UserItemRequestForm } from './user-item-request-form/views/UserItemRequestForm.tsx';
import { UserItemRequestFormConfirm } from './user-item-request-form/views/UserItemRequestFormConfirm.tsx';
import { Workspace } from './workspace/views/Workspace.tsx';

async function logRoutesMiddleware({
  request,
}: Parameters<MiddlewareFunction>[0]) {
  console.log(`${request.method} ${request.url}`);
}

const APP_ROUTES: RouteObject[] = [
  {
    id: 'root-set-admin-core-config',
    path: '/',
    middleware: [logRoutesMiddleware],
    loader: initAppLoader,
    Component: App,
    // hydrateFallbackElement: <FullPageSpinner/>,
    children: [
      ////////////////////////////////////////////////////////////////////////////////////////
      // ADMIN ROUTES
      ////////////////////////////////////////////////////////////////////////////////////////
      {
        // Redirect /beheer to /admin
        id: 'beheer',
        path: `/${ROUTE_PARTS.beheer}`,
        loader: () => redirect(`/${ROUTE_PARTS.admin}`),
        Component: FullPageSpinnerPage,
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
          {
            Component: DynamicRouteResolver,
            path: APP_PATH.ALL_ROUTES.route,
          },
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
      loader: loadLoggedOutHomeContentPage,
      Component: LoggedOutHome,
      ErrorBoundary: () => ErrorBoundary('LoggedOutHome--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'Logout',
      path: APP_PATH.LOGOUT.route,
      Component: Logout,
      ErrorBoundary: () => ErrorBoundary('Logout--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'RegisterStamboek',
      path: APP_PATH.STAMBOEK.route,
      Component: RegisterStamboek,
      ErrorBoundary: () => ErrorBoundary('RegisterStamboek--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'ManualRegistration',
      path: APP_PATH.MANUAL_ACCESS_REQUEST.route,
      Component: ManualRegistration,
      ErrorBoundary: () => ErrorBoundary('ManualRegistration--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'StudentTeacher',
      path: APP_PATH.STUDENT_TEACHER.route,
      Component: StudentTeacher,
      ErrorBoundary: () => ErrorBoundary('StudentTeacher--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'RegisterOrLogin',
      path: APP_PATH.REGISTER_OR_LOGIN.route,
      Component: RegisterOrLogin,
      ErrorBoundary: () => ErrorBoundary('RegisterOrLogin--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'LinkYourAccount',
      path: APP_PATH.LINK_YOUR_ACCOUNT.route,
      Component: LinkYourAccount,
      ErrorBoundary: () => ErrorBoundary('LinkYourAccount--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'AcceptConditions',
      path: APP_PATH.ACCEPT_CONDITIONS.route,
      Component: AcceptConditions,
      ErrorBoundary: () => ErrorBoundary('AcceptConditions--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'CompleteProfileStep',
      path: APP_PATH.COMPLETE_PROFILE.route,
      Component: CompleteProfileStep,
      ErrorBoundary: () => ErrorBoundary('CompleteProfileStep--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'ErrorView',
      path: APP_PATH.ERROR.route,
      Component: ErrorViewPage,
      ErrorBoundary: () => ErrorBoundary('ErrorView--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'CookiePolicy',
      path: APP_PATH.COOKIE_POLICY.route,
      Component: CookiePolicy,
      ErrorBoundary: () => ErrorBoundary('CookiePolicy--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'Email',
      path: APP_PATH.EMAIL_PREFERENCES_LOGGED_OUT.route,
      Component: Email,
      ErrorBoundary: () => ErrorBoundary('Email--route'),
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
      ErrorBoundary: () => ErrorBoundary('LoggedInHome--route'),
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.SEARCH.route,
      Component: Search,
      id: 'Search',
      ErrorBoundary: () => ErrorBoundary('Search--route'),
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.ITEM_DETAIL.route,
      Component: ItemDetailRoute,
      id: 'ItemDetailRoute',
      ErrorBoundary: () => ErrorBoundary('ItemDetailRoute--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'CollectionDetail',
      path: APP_PATH.COLLECTION_DETAIL.route,
      loader: fetchCollectionLoader,
      Component: CollectionDetail,
      ErrorBoundary: () => ErrorBoundary('CollectionDetail--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'CollectionEdit-tab',
      path: APP_PATH.COLLECTION_EDIT_TAB.route,
      Component: CollectionEdit,
      ErrorBoundary: () => ErrorBoundary('CollectionEdit-tab--route--route'),
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.COLLECTION_EDIT.route,
      Component: CollectionEdit,
      id: 'CollectionEdit',
      ErrorBoundary: () => ErrorBoundary('CollectionEdit--route'),
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.BUNDLE_DETAIL.route,
      Component: BundleDetail,
      id: 'BundleDetail',
      ErrorBoundary: () => ErrorBoundary('BundleDetail--route'),
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.BUNDLE_EDIT_TAB.route,
      Component: BundleEdit,
      id: 'BundleEdit-tab',
      ErrorBoundary: () => ErrorBoundary('BundleEdit-tab--route'),
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.BUNDLE_EDIT.route,
      Component: BundleEdit,
      id: 'BundleEdit',
      ErrorBoundary: () => ErrorBoundary('BundleEdit--route'),
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.ASSIGNMENT_CREATE.route,
      Component: AssignmentEdit,
      id: 'AssignmentEdit-create',
      ErrorBoundary: () => ErrorBoundary('AssignmentEdit-create--route'),
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.ASSIGNMENT_DETAIL.route,
      Component: AssignmentDetailSwitcher,
      id: 'AssignmentDetailSwitcher',
      ErrorBoundary: () => ErrorBoundary('AssignmentDetailSwitcher--route'),
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.ASSIGNMENT_EDIT_TAB.route,
      Component: AssignmentEdit,
      id: 'AssignmentEdit-edit-tab',
      ErrorBoundary: () => ErrorBoundary('AssignmentEdit-edit-tab--route'),
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.ASSIGNMENT_EDIT.route,
      Component: AssignmentEdit,
      id: 'AssignmentEdit-edit',
      ErrorBoundary: () => ErrorBoundary('AssignmentEdit-edit--route'),
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.ASSIGNMENT_RESPONSE_CREATE.route,
      Component: AssignmentDetailSwitcher,
      id: 'AssignmentDetailSwitcher-create',
      ErrorBoundary: () =>
        ErrorBoundary('AssignmentDetailSwitcher-create--route'),
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.ASSIGNMENT_RESPONSE_EDIT.route,
      Component: AssignmentDetailSwitcher,
      id: 'AssignmentDetailSwitcher-edit',
      ErrorBoundary: () =>
        ErrorBoundary('AssignmentDetailSwitcher-edit--route'),
      hasErrorBoundary: true,
    },
    // view pupil collection response as teacher/ad{min
    {
      path: APP_PATH.ASSIGNMENT_PUPIL_COLLECTION_DETAIL.route,
      Component: AssignmentPupilCollectionDetail,
      id: 'AssignmentPupilCollectionDetail',
      ErrorBoundary: () =>
        ErrorBoundary('AssignmentPupilCollectionDetail--route'),
      hasErrorBoundary: true,
    },
    // edit pupil collection response as admin
    {
      path: APP_PATH.ASSIGNMENT_PUPIL_COLLECTION_ADMIN_EDIT.route,
      Component: AssignmentResponseAdminEdit,
      id: 'AssignmentResponseAdminEdit',
      ErrorBoundary: () => ErrorBoundary('AssignmentResponseAdminEdit--route'),
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.WORKSPACE_TAB.route,
      Component: Workspace,
      id: 'Workspace-tab',
      ErrorBoundary: () => ErrorBoundary('Workspace-tab--route'),
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.WORKSPACE.route,
      Component: Workspace,
      id: 'Workspace',
      ErrorBoundary: () => ErrorBoundary('Workspace--route'),
      hasErrorBoundary: true,
    },
    {
      path: `${APP_PATH.WORKSPACE.route}${APP_PATH.ASSIGNMENT_DETAIL.route}`,
      loader: (props) =>
        redirect(
          `/${ROUTE_PARTS.assignments}/${props.params?.assignmentId}${location.search}`,
        ),
      Component: FullPageSpinnerPage,
      id: 'WorkspaceAssignmentRedirect',
      ErrorBoundary: () => ErrorBoundary('WorkspaceAssignmentRedirect--route'),
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.SETTINGS_TAB.route,
      Component: Settings,
      id: 'Settings-tab',
      ErrorBoundary: () => ErrorBoundary('Settings-tab--route'),
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.SETTINGS.route,
      Component: Settings,
      id: 'Settings',
      ErrorBoundary: () => ErrorBoundary('Settings--route'),
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.COMPLETE_PROFILE.route,
      Component: Profile,
      id: 'Profile',
      ErrorBoundary: () => ErrorBoundary('Profile--route'),
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.USER_ITEM_REQUEST_FORM.route,
      Component: UserItemRequestForm,
      id: 'UserItemRequestForm',
      ErrorBoundary: () => ErrorBoundary('UserItemRequestForm--route'),
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.USER_ITEM_REQUEST_FORM_CONFIRM.route,
      Component: UserItemRequestFormConfirm,
      id: 'UserItemRequestFormConfirm',
      ErrorBoundary: () => ErrorBoundary('UserItemRequestFormConfirm--route'),
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.EDUCATIONAL_USER_ITEM_REQUEST_FORM.route,
      Component: EducationalAuthorItemRequestForm,
      id: 'EducationalAuthorItemRequestForm',
      ErrorBoundary: () =>
        ErrorBoundary('EducationalAuthorItemRequestForm--route'),
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.EDUCATIONAL_USER_ITEM_REQUEST_FORM_CONFIRM.route,
      Component: EducationalAuthorItemRequestFormConfirm,
      id: 'EducationalAuthorItemRequestFormConfirm',
      ErrorBoundary: () =>
        ErrorBoundary('EducationalAuthorItemRequestFormConfirm--route'),
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.QUICK_LANE.route,
      Component: QuickLaneDetail,
      id: 'QuickLaneDetail',
      ErrorBoundary: () => ErrorBoundary('QuickLaneDetail--route'),
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.EMBED.route,
      Component: EmbedCodeDetail,
      id: 'EmbedCodeDetail',
      ErrorBoundary: () => ErrorBoundary('EmbedCodeDetail--route'),
      hasErrorBoundary: true,
    },
  ];
}

function getAdminRoutes(): RouteObject[] {
  // @ts-ignore
  return [
    {
      id: 'Dashboard',
      Component: Dashboard,
      index: true,
      ErrorBoundary: () => ErrorBoundary('Dashboard--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'AssignmentOverviewAdmin',
      Component: AssignmentOverviewAdmin,
      path: ASSIGNMENTS_PATH.ASSIGNMENTS_OVERVIEW,
      ErrorBoundary: () => ErrorBoundary('AssignmentOverviewAdmin--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'AssignmentMarcomOverview',
      Component: AssignmentMarcomOverview,
      path: ASSIGNMENTS_PATH.ASSIGNMENTS_MARCOM_OVERVIEW,
      ErrorBoundary: () => ErrorBoundary('AssignmentMarcomOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'CollectionsOverview',
      Component: CollectionsOrBundlesOverview,
      path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTIONS_OVERVIEW,
      ErrorBoundary: () => ErrorBoundary('CollectionsOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'CollectionActualisationOverview',
      Component: CollectionOrBundleActualisationOverview,
      path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_ACTUALISATION_OVERVIEW,
      ErrorBoundary: () =>
        ErrorBoundary('CollectionActualisationOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'CollectionQualityCheckOverview',
      Component: CollectionOrBundleQualityCheckOverview,
      path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_QUALITYCHECK_OVERVIEW,
      ErrorBoundary: () =>
        ErrorBoundary('CollectionQualityCheckOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'CollectionMarcomOverview',
      Component: CollectionOrBundleMarcomOverview,
      path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_MARCOM_OVERVIEW,
      ErrorBoundary: () => ErrorBoundary('CollectionMarcomOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'BundlesOverview',
      Component: CollectionsOrBundlesOverview,
      path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLES_OVERVIEW,
      ErrorBoundary: () => ErrorBoundary('BundlesOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'BundleActualisationOverview',
      Component: CollectionOrBundleActualisationOverview,
      path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_ACTUALISATION_OVERVIEW,
      ErrorBoundary: () => ErrorBoundary('BundleActualisationOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'BundleQualityCheckOverview',
      Component: CollectionOrBundleQualityCheckOverview,
      path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_QUALITYCHECK_OVERVIEW,
      ErrorBoundary: () => ErrorBoundary('BundleQualityCheckOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'BundleMarcomOverview',
      Component: CollectionOrBundleMarcomOverview,
      path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_MARCOM_OVERVIEW,
      ErrorBoundary: () => ErrorBoundary('BundleMarcomOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageOverviewPage',
      Component: ContentPageOverviewPage,
      path: CONTENT_PAGE_PATH.CONTENT_PAGE_OVERVIEW,
      ErrorBoundary: () => ErrorBoundary('ContentPageOverviewPage--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageEditPage-create',
      Component: ContentPageEditPage,
      path: CONTENT_PAGE_PATH.CONTENT_PAGE_CREATE,
      ErrorBoundary: () => ErrorBoundary('ContentPageEditPage-create--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageEditPage-edit',
      Component: ContentPageEditPage,
      path: CONTENT_PAGE_PATH.CONTENT_PAGE_EDIT,
      ErrorBoundary: () => ErrorBoundary('ContentPageEditPage-edit--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageDetailPage',
      Component: ContentPageDetailPage,
      path: CONTENT_PAGE_PATH.CONTENT_PAGE_DETAIL,
      ErrorBoundary: () => ErrorBoundary('ContentPageDetailPage--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageLabelOverviewPage',
      Component: ContentPageLabelOverviewPage,
      path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_OVERVIEW,
      ErrorBoundary: () => ErrorBoundary('ContentPageLabelOverviewPage--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageLabelEditPage-create',
      Component: ContentPageLabelEditPage,
      path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_CREATE,
      ErrorBoundary: () =>
        ErrorBoundary('ContentPageLabelEditPage-create--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageLabelEditPage-edit',
      Component: ContentPageLabelEditPage,
      path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_EDIT,
      ErrorBoundary: () =>
        ErrorBoundary('ContentPageLabelEditPage-edit--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageLabelDetailPage',
      Component: ContentPageLabelDetailPage,
      path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_DETAIL,
      ErrorBoundary: () => ErrorBoundary('ContentPageLabelDetailPage--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'InteractiveTourOverview',
      Component: InteractiveTourOverview,
      path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_OVERVIEW,
      ErrorBoundary: () => ErrorBoundary('InteractiveTourOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'InteractiveTourEdit-create',
      Component: InteractiveTourEdit,
      path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_CREATE,
      ErrorBoundary: () => ErrorBoundary('InteractiveTourEdit-create--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'InteractiveTourEdit-edit',
      Component: InteractiveTourEdit,
      path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_EDIT,
      ErrorBoundary: () => ErrorBoundary('InteractiveTourEdit-edit--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'InteractiveTourDetail',
      Component: InteractiveTourDetail,
      path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_DETAIL,
      ErrorBoundary: () => ErrorBoundary('InteractiveTourDetail--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'ItemsOverview',
      Component: ItemsOverview,
      path: ITEMS_PATH.ITEMS_OVERVIEW,
      ErrorBoundary: () => ErrorBoundary('ItemsOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'ItemDetail',
      Component: ItemDetail,
      path: ITEMS_PATH.ITEM_DETAIL,
      ErrorBoundary: () => ErrorBoundary('ItemDetail--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'PublishItemsOverview',
      Component: PublishItemsOverview,
      path: ITEMS_PATH.PUBLISH_ITEMS_OVERVIEW,
      ErrorBoundary: () => ErrorBoundary('PublishItemsOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'NavigationBarOverview',
      Component: NavigationBarOverviewPage,
      path: NAVIGATIONS_PATH.NAVIGATIONS_OVERVIEW,
      ErrorBoundary: () => ErrorBoundary('NavigationBarOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'NavigationBarDetail',
      Component: NavigationBarDetailPage,
      path: NAVIGATIONS_PATH.NAVIGATIONS_DETAIL,
      ErrorBoundary: () => ErrorBoundary('NavigationBarDetail--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'NavigationItemEdit-create',
      Component: NavigationItemEditPage,
      path: NAVIGATIONS_PATH.NAVIGATIONS_ITEM_CREATE,
      ErrorBoundary: () => ErrorBoundary('NavigationItemEdit-create--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'NavigationItemEdit-edit',
      Component: NavigationItemEditPage,
      path: NAVIGATIONS_PATH.NAVIGATIONS_ITEM_EDIT,
      ErrorBoundary: () => ErrorBoundary('NavigationItemEdit-edit--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'UrlRedirectOverview',
      Component: UrlRedirectOverview,
      path: URL_REDIRECT_PATH.URL_REDIRECT_OVERVIEW,
      ErrorBoundary: () => ErrorBoundary('UrlRedirectOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'UrlRedirectEdit-create',
      Component: UrlRedirectEdit,
      path: URL_REDIRECT_PATH.URL_REDIRECT_CREATE,
      ErrorBoundary: () => ErrorBoundary('UrlRedirectEdit-create--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'UrlRedirectEdit-edit',
      Component: UrlRedirectEdit,
      path: URL_REDIRECT_PATH.URL_REDIRECT_EDIT,
      ErrorBoundary: () => ErrorBoundary('UrlRedirectEdit-edit--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'PupilCollectionsOverview',
      Component: PupilCollectionsOverview,
      path: PUPIL_COLLECTIONS_PATH.ASSIGNMENT_PUPIL_COLLECTIONS_OVERVIEW,
      ErrorBoundary: () => ErrorBoundary('PupilCollectionsOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'TranslationsOverviewPage',
      Component: TranslationsOverviewPage,
      path: TRANSLATIONS_PATH.TRANSLATIONS,
      ErrorBoundary: () => ErrorBoundary('TranslationsOverviewPage--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'UserGroupOverviewPage',
      Component: UserGroupOverviewPage,
      path: USER_GROUP_PATH.USER_GROUP_OVERVIEW,
      ErrorBoundary: () => ErrorBoundary('UserGroupOverviewPage--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'UserOverviewPage',
      Component: UserOverviewPage,
      path: USER_PATH.USER_OVERVIEW,
      ErrorBoundary: () => ErrorBoundary('UserOverviewPage--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'UserDetailPage',
      Component: UserDetailPage,
      path: USER_PATH.USER_DETAIL,
      ErrorBoundary: () => ErrorBoundary('UserDetailPage--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'UserEditPage',
      Component: UserEditPage,
      path: USER_PATH.USER_EDIT,
      ErrorBoundary: () => ErrorBoundary('UserEditPage--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'MaintenanceAlertsOverviewPage',
      Component: MaintenanceAlertsOverviewPage,
      path: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.alerts}`,
      ErrorBoundary: () =>
        ErrorBoundary('MaintenanceAlertsOverviewPage--route'),
      hasErrorBoundary: true,
    },
  ];
}

export default APP_ROUTES;
