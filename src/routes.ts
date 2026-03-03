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
import { ITEMS_ADMIN_PATH } from './admin/items/items.routes';
import ItemDetailAdmin from './admin/items/views/ItemDetailAdmin.tsx';
import { ItemsOverviewAdmin } from './admin/items/views/ItemsOverviewAdmin.tsx';
import { PublishItemsOverviewAdmin } from './admin/items/views/PublishItemsOverviewAdmin.tsx';
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
import EnsureUserLoggedIn from './authentication/components/EnsureUserLoggedIn.tsx';
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
import { ItemDetailPage } from './item/views/ItemDetailPage.tsx';
import { QuickLaneDetail } from './quick-lane/views/QuickLaneDetail.tsx';
import {
  fetchAssignmentLoader,
  fetchCollectionLoader,
  fetchContentPageLoader,
  fetchItemLoader,
  initAppLoader,
  passUrlLoader,
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
  console.info(`${request.method} ${request.url}`);
}

const APP_ROUTES: RouteObject[] = [
  {
    id: 'root-set-admin-core-config',
    path: '/',
    middleware: [logRoutesMiddleware],
    loader: initAppLoader,
    shouldRevalidate: () => false,
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
        id: 'RegisterOrLogin',
        path: APP_PATH.REGISTER_OR_LOGIN.route,
        Component: RegisterOrLogin,
        ErrorBoundary: () => ErrorBoundary('RegisterOrLogin--route'),
        hasErrorBoundary: true,
      },
      {
        id: 'app-client-layout',
        loader: passUrlLoader,
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
            Component: EnsureUserLoggedIn,
            children: getAuthenticatedClientRoutes(),
          },
          ////////////////////////////////////////////////////////////////////////////////////////
          // DYNAMIC ROUTES (CONTENT PAGES) AND 404 HANDLING
          ////////////////////////////////////////////////////////////////////////////////////////
          // This route needs to be the last one, since it handles all remaining routes
          {
            id: 'catch-all-route-for-content-pages',
            path: APP_PATH.ALL_ROUTES.route,
            loader: fetchContentPageLoader,
            Component: DynamicRouteResolver,
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
      loader: fetchContentPageLoader,
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
      id: 'LoggedInHome',
      path: APP_PATH.LOGGED_IN_HOME.route,
      Component: LoggedInHome,
      ErrorBoundary: () => ErrorBoundary('LoggedInHome--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'Search',
      path: APP_PATH.SEARCH.route,
      Component: Search,
      ErrorBoundary: () => ErrorBoundary('Search--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'ItemDetailRoute',
      path: APP_PATH.ITEM_DETAIL.route,
      Component: ItemDetailPage,
      loader: fetchItemLoader,
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
      id: 'CollectionEdit',
      path: APP_PATH.COLLECTION_EDIT.route,
      Component: CollectionEdit,
      ErrorBoundary: () => ErrorBoundary('CollectionEdit--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'BundleDetail',
      path: APP_PATH.BUNDLE_DETAIL.route,
      Component: BundleDetail,
      loader: fetchCollectionLoader,
      ErrorBoundary: () => ErrorBoundary('BundleDetail--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'BundleEdit-tab',
      path: APP_PATH.BUNDLE_EDIT_TAB.route,
      Component: BundleEdit,
      ErrorBoundary: () => ErrorBoundary('BundleEdit-tab--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'BundleEdit',
      path: APP_PATH.BUNDLE_EDIT.route,
      Component: BundleEdit,
      ErrorBoundary: () => ErrorBoundary('BundleEdit--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'AssignmentEdit-create',
      path: APP_PATH.ASSIGNMENT_CREATE.route,
      Component: AssignmentEdit,
      ErrorBoundary: () => ErrorBoundary('AssignmentEdit-create--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'AssignmentDetailSwitcher',
      path: APP_PATH.ASSIGNMENT_DETAIL.route,
      // Switches between the pupil and teacher view of an assignment
      // Pupil can view the assignment and build a pupil collection response for the assignment
      // Teacher can view the assignment details and manage responses and edit the assignment through an edit button
      Component: AssignmentDetailSwitcher,
      loader: fetchAssignmentLoader,
      ErrorBoundary: () => ErrorBoundary('AssignmentDetailSwitcher--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'AssignmentEdit-edit-tab',
      path: APP_PATH.ASSIGNMENT_EDIT_TAB.route,
      Component: AssignmentEdit,
      ErrorBoundary: () => ErrorBoundary('AssignmentEdit-edit-tab--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'AssignmentEdit-edit',
      path: APP_PATH.ASSIGNMENT_EDIT.route,
      Component: AssignmentEdit,
      ErrorBoundary: () => ErrorBoundary('AssignmentEdit-edit--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'AssignmentDetailSwitcher-create',
      path: APP_PATH.ASSIGNMENT_RESPONSE_CREATE.route,
      Component: AssignmentDetailSwitcher,
      ErrorBoundary: () =>
        ErrorBoundary('AssignmentDetailSwitcher-create--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'AssignmentDetailSwitcher-edit',
      path: APP_PATH.ASSIGNMENT_RESPONSE_EDIT.route,
      Component: AssignmentDetailSwitcher,
      ErrorBoundary: () =>
        ErrorBoundary('AssignmentDetailSwitcher-edit--route'),
      hasErrorBoundary: true,
    },
    // view pupil collection response as teacher/ad{min
    {
      id: 'AssignmentPupilCollectionDetail',
      path: APP_PATH.ASSIGNMENT_PUPIL_COLLECTION_DETAIL.route,
      Component: AssignmentPupilCollectionDetail,
      ErrorBoundary: () =>
        ErrorBoundary('AssignmentPupilCollectionDetail--route'),
      hasErrorBoundary: true,
    },
    // edit pupil collection response as admin
    {
      id: 'AssignmentResponseAdminEdit',
      path: APP_PATH.ASSIGNMENT_PUPIL_COLLECTION_ADMIN_EDIT.route,
      Component: AssignmentResponseAdminEdit,
      ErrorBoundary: () => ErrorBoundary('AssignmentResponseAdminEdit--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'Workspace-tab',
      path: APP_PATH.WORKSPACE_TAB.route,
      Component: Workspace,
      ErrorBoundary: () => ErrorBoundary('Workspace-tab--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'Workspace',
      path: APP_PATH.WORKSPACE.route,
      Component: Workspace,
      ErrorBoundary: () => ErrorBoundary('Workspace--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'WorkspaceAssignmentRedirect',
      path: `${APP_PATH.WORKSPACE.route}${APP_PATH.ASSIGNMENT_DETAIL.route}`,
      loader: (props) =>
        redirect(
          `/${ROUTE_PARTS.assignments}/${props.params?.assignmentId}${location.search}`,
        ),
      Component: FullPageSpinnerPage,
      ErrorBoundary: () => ErrorBoundary('WorkspaceAssignmentRedirect--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'Settings-tab',
      path: APP_PATH.SETTINGS_TAB.route,
      Component: Settings,
      ErrorBoundary: () => ErrorBoundary('Settings-tab--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'Settings',
      path: APP_PATH.SETTINGS.route,
      Component: Settings,
      ErrorBoundary: () => ErrorBoundary('Settings--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'Profile',
      path: APP_PATH.COMPLETE_PROFILE.route,
      Component: Profile,
      ErrorBoundary: () => ErrorBoundary('Profile--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'UserItemRequestForm',
      path: APP_PATH.USER_ITEM_REQUEST_FORM.route,
      Component: UserItemRequestForm,
      ErrorBoundary: () => ErrorBoundary('UserItemRequestForm--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'UserItemRequestFormConfirm',
      path: APP_PATH.USER_ITEM_REQUEST_FORM_CONFIRM.route,
      Component: UserItemRequestFormConfirm,
      ErrorBoundary: () => ErrorBoundary('UserItemRequestFormConfirm--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'EducationalAuthorItemRequestForm',
      path: APP_PATH.EDUCATIONAL_USER_ITEM_REQUEST_FORM.route,
      Component: EducationalAuthorItemRequestForm,
      ErrorBoundary: () =>
        ErrorBoundary('EducationalAuthorItemRequestForm--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'EducationalAuthorItemRequestFormConfirm',
      path: APP_PATH.EDUCATIONAL_USER_ITEM_REQUEST_FORM_CONFIRM.route,
      Component: EducationalAuthorItemRequestFormConfirm,
      ErrorBoundary: () =>
        ErrorBoundary('EducationalAuthorItemRequestFormConfirm--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'QuickLaneDetail',
      path: APP_PATH.QUICK_LANE.route,
      Component: QuickLaneDetail,
      ErrorBoundary: () => ErrorBoundary('QuickLaneDetail--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'EmbedCodeDetail',
      path: APP_PATH.EMBED.route,
      Component: EmbedCodeDetail,
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
      index: true,
      Component: Dashboard,
      ErrorBoundary: () => ErrorBoundary('Dashboard--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'AssignmentOverviewAdmin',
      path: ASSIGNMENTS_PATH.ASSIGNMENTS_OVERVIEW,
      Component: AssignmentOverviewAdmin,
      ErrorBoundary: () => ErrorBoundary('AssignmentOverviewAdmin--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'AssignmentMarcomOverview',
      path: ASSIGNMENTS_PATH.ASSIGNMENTS_MARCOM_OVERVIEW,
      Component: AssignmentMarcomOverview,
      ErrorBoundary: () => ErrorBoundary('AssignmentMarcomOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'CollectionsOverview',
      path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTIONS_OVERVIEW,
      Component: CollectionsOrBundlesOverview,
      ErrorBoundary: () => ErrorBoundary('CollectionsOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'CollectionActualisationOverview',
      path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_ACTUALISATION_OVERVIEW,
      Component: CollectionOrBundleActualisationOverview,
      ErrorBoundary: () =>
        ErrorBoundary('CollectionActualisationOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'CollectionQualityCheckOverview',
      path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_QUALITYCHECK_OVERVIEW,
      Component: CollectionOrBundleQualityCheckOverview,
      ErrorBoundary: () =>
        ErrorBoundary('CollectionQualityCheckOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'CollectionMarcomOverview',
      path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_MARCOM_OVERVIEW,
      Component: CollectionOrBundleMarcomOverview,
      ErrorBoundary: () => ErrorBoundary('CollectionMarcomOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'BundlesOverview',
      path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLES_OVERVIEW,
      Component: CollectionsOrBundlesOverview,
      ErrorBoundary: () => ErrorBoundary('BundlesOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'BundleActualisationOverview',
      path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_ACTUALISATION_OVERVIEW,
      Component: CollectionOrBundleActualisationOverview,
      ErrorBoundary: () => ErrorBoundary('BundleActualisationOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'BundleQualityCheckOverview',
      path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_QUALITYCHECK_OVERVIEW,
      Component: CollectionOrBundleQualityCheckOverview,
      ErrorBoundary: () => ErrorBoundary('BundleQualityCheckOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'BundleMarcomOverview',
      path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_MARCOM_OVERVIEW,
      Component: CollectionOrBundleMarcomOverview,
      ErrorBoundary: () => ErrorBoundary('BundleMarcomOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageOverviewPage',
      path: CONTENT_PAGE_PATH.CONTENT_PAGE_OVERVIEW,
      Component: ContentPageOverviewPage,
      ErrorBoundary: () => ErrorBoundary('ContentPageOverviewPage--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageEditPage-create',
      path: CONTENT_PAGE_PATH.CONTENT_PAGE_CREATE,
      loader: passUrlLoader,
      Component: ContentPageEditPage,
      ErrorBoundary: () => ErrorBoundary('ContentPageEditPage-create--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageEditPage-edit',
      path: CONTENT_PAGE_PATH.CONTENT_PAGE_EDIT,
      loader: passUrlLoader,
      Component: ContentPageEditPage,
      ErrorBoundary: () => ErrorBoundary('ContentPageEditPage-edit--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageDetailPage',
      path: CONTENT_PAGE_PATH.CONTENT_PAGE_DETAIL,
      Component: ContentPageDetailPage,
      ErrorBoundary: () => ErrorBoundary('ContentPageDetailPage--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageLabelOverviewPage',
      path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_OVERVIEW,
      Component: ContentPageLabelOverviewPage,
      ErrorBoundary: () => ErrorBoundary('ContentPageLabelOverviewPage--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageLabelEditPage-create',
      path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_CREATE,
      Component: ContentPageLabelEditPage,
      ErrorBoundary: () =>
        ErrorBoundary('ContentPageLabelEditPage-create--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageLabelEditPage-edit',
      path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_EDIT,
      Component: ContentPageLabelEditPage,
      ErrorBoundary: () =>
        ErrorBoundary('ContentPageLabelEditPage-edit--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageLabelDetailPage',
      path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_DETAIL,
      Component: ContentPageLabelDetailPage,
      ErrorBoundary: () => ErrorBoundary('ContentPageLabelDetailPage--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'InteractiveTourOverview',
      path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_OVERVIEW,
      Component: InteractiveTourOverview,
      ErrorBoundary: () => ErrorBoundary('InteractiveTourOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'InteractiveTourEdit-create',
      path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_CREATE,
      Component: InteractiveTourEdit,
      ErrorBoundary: () => ErrorBoundary('InteractiveTourEdit-create--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'InteractiveTourEdit-edit',
      path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_EDIT,
      Component: InteractiveTourEdit,
      ErrorBoundary: () => ErrorBoundary('InteractiveTourEdit-edit--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'InteractiveTourDetail',
      path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_DETAIL,
      Component: InteractiveTourDetail,
      ErrorBoundary: () => ErrorBoundary('InteractiveTourDetail--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'ItemsOverview',
      path: ITEMS_ADMIN_PATH.ITEMS_OVERVIEW,
      Component: ItemsOverviewAdmin,
      ErrorBoundary: () => ErrorBoundary('ItemsOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'ItemDetail',
      path: ITEMS_ADMIN_PATH.ITEM_DETAIL,
      Component: ItemDetailAdmin,
      ErrorBoundary: () => ErrorBoundary('ItemDetail--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'PublishItemsOverview',
      path: ITEMS_ADMIN_PATH.PUBLISH_ITEMS_OVERVIEW,
      Component: PublishItemsOverviewAdmin,
      ErrorBoundary: () => ErrorBoundary('PublishItemsOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'NavigationBarOverview',
      path: NAVIGATIONS_PATH.NAVIGATIONS_OVERVIEW,
      Component: NavigationBarOverviewPage,
      ErrorBoundary: () => ErrorBoundary('NavigationBarOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'NavigationBarDetail',
      path: NAVIGATIONS_PATH.NAVIGATIONS_DETAIL,
      Component: NavigationBarDetailPage,
      ErrorBoundary: () => ErrorBoundary('NavigationBarDetail--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'NavigationItemEdit-create',
      path: NAVIGATIONS_PATH.NAVIGATIONS_ITEM_CREATE,
      Component: NavigationItemEditPage,
      ErrorBoundary: () => ErrorBoundary('NavigationItemEdit-create--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'NavigationItemEdit-edit',
      path: NAVIGATIONS_PATH.NAVIGATIONS_ITEM_EDIT,
      Component: NavigationItemEditPage,
      ErrorBoundary: () => ErrorBoundary('NavigationItemEdit-edit--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'UrlRedirectOverview',
      path: URL_REDIRECT_PATH.URL_REDIRECT_OVERVIEW,
      Component: UrlRedirectOverview,
      ErrorBoundary: () => ErrorBoundary('UrlRedirectOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'UrlRedirectEdit-create',
      path: URL_REDIRECT_PATH.URL_REDIRECT_CREATE,
      Component: UrlRedirectEdit,
      ErrorBoundary: () => ErrorBoundary('UrlRedirectEdit-create--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'UrlRedirectEdit-edit',
      path: URL_REDIRECT_PATH.URL_REDIRECT_EDIT,
      Component: UrlRedirectEdit,
      ErrorBoundary: () => ErrorBoundary('UrlRedirectEdit-edit--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'PupilCollectionsOverview',
      path: PUPIL_COLLECTIONS_PATH.ASSIGNMENT_PUPIL_COLLECTIONS_OVERVIEW,
      Component: PupilCollectionsOverview,
      ErrorBoundary: () => ErrorBoundary('PupilCollectionsOverview--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'TranslationsOverviewPage',
      path: TRANSLATIONS_PATH.TRANSLATIONS,
      Component: TranslationsOverviewPage,
      ErrorBoundary: () => ErrorBoundary('TranslationsOverviewPage--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'UserGroupOverviewPage',
      path: USER_GROUP_PATH.USER_GROUP_OVERVIEW,
      Component: UserGroupOverviewPage,
      ErrorBoundary: () => ErrorBoundary('UserGroupOverviewPage--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'UserOverviewPage',
      path: USER_PATH.USER_OVERVIEW,
      Component: UserOverviewPage,
      ErrorBoundary: () => ErrorBoundary('UserOverviewPage--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'UserDetailPage',
      path: USER_PATH.USER_DETAIL,
      Component: UserDetailPage,
      ErrorBoundary: () => ErrorBoundary('UserDetailPage--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'UserEditPage',
      path: USER_PATH.USER_EDIT,
      Component: UserEditPage,
      ErrorBoundary: () => ErrorBoundary('UserEditPage--route'),
      hasErrorBoundary: true,
    },
    {
      id: 'MaintenanceAlertsOverviewPage',
      path: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.alerts}`,
      Component: MaintenanceAlertsOverviewPage,
      ErrorBoundary: () =>
        ErrorBoundary('MaintenanceAlertsOverviewPage--route'),
      hasErrorBoundary: true,
    },
  ];
}

export default APP_ROUTES;
