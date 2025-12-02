import {
  NavigationBarDetail,
  NavigationBarOverview,
  NavigationItemEdit,
} from '@meemoo/admin-core-ui/admin';
import { ComponentType } from 'react';
import {
  type MiddlewareFunction,
  type RouteObject,
  redirect,
} from 'react-router';
import App from './App.tsx';
import AppClientLayout from './AppClientLayout.tsx';
import { Admin } from './admin/Admin.tsx';
import { ASSIGNMENTS_PATH } from './admin/assignments/assignments.routes';
import AssignmentsMarcomOverview from './admin/assignments/views/AssignmentsMarcomOverview.tsx';
import AssignmentsOverviewAdmin from './admin/assignments/views/AssignmentsOverviewAdmin.tsx';
import { COLLECTIONS_OR_BUNDLES_PATH } from './admin/collectionsOrBundles/collections-or-bundles.routes';
import { CONTENT_PAGE_PATH } from './admin/content-page/content-page.routes';
import ContentPageEditPage from './admin/content-page/views/ContentPageEditPage.tsx';
import ContentPageDetailPage from './admin/content-page/views/ContentPageEditPage.tsx';
import ContentPageOverviewPage from './admin/content-page/views/ContentPageOverviewPage.tsx';
import { CONTENT_PAGE_LABEL_PATH } from './admin/content-page-labels/content-page-label.routes';
import Dashboard from './admin/dashboard/views/Dashboard.tsx';
import { INTERACTIVE_TOUR_PATH } from './admin/interactive-tour/interactive-tour.routes';
import InteractiveTourDetail from './admin/interactive-tour/views/InteractiveTourDetail.tsx';
import InteractiveTourEdit from './admin/interactive-tour/views/InteractiveTourEdit.tsx';
import InteractiveTourOverview from './admin/interactive-tour/views/InteractiveTourOverview.tsx';
import { ITEMS_PATH } from './admin/items/items.routes';
import { ItemsOverview } from './admin/items/views/ItemsOverview.tsx';
import { PublishItemsOverview } from './admin/items/views/PublishItemsOverview.tsx';
import { NAVIGATIONS_PATH } from './admin/navigations/navigations.routes.ts';
import { PUPIL_COLLECTIONS_PATH } from './admin/pupil-collection/pupil-collection.routes';
import { PupilCollectionsOverview } from './admin/pupil-collection/views/PupilCollectionsOverview.tsx';
import { TRANSLATIONS_PATH } from './admin/translations/translations.routes.ts';
import TranslationsOverviewPage from './admin/translations/views/TranslationsOverviewPage.tsx';
import { URL_REDIRECT_PATH } from './admin/url-redirects/url-redirects.routes';
import UrlRedirectEdit from './admin/url-redirects/views/UrlRedirectEdit.tsx';
import UrlRedirectOverview from './admin/url-redirects/views/UrlRedirectOverview.tsx';
import { USER_GROUP_PATH } from './admin/user-groups/user-group.routes';
import UserGroupOverviewPage from './admin/user-groups/views/UserGroupOverviewPage.tsx';
import { USER_PATH } from './admin/users/user.routes.ts';
import UserDetailPage from './admin/users/views/UserDetailPage.tsx';
import { UserEditPage } from './admin/users/views/UserEditPage.tsx';
import { UserOverviewPage } from './admin/users/views/UserOverviewPage.tsx';
import AssignmentDetailSwitcher from './assignment/views/AssignmentDetailSwitcher.tsx';
import AssignmentEdit from './assignment/views/AssignmentEdit.tsx';
import AssignmentPupilCollectionDetail from './assignment/views/AssignmentPupilCollectionDetail.tsx';
import LinkYourAccount from './authentication/views/LinkYourAccount.tsx';
import Login from './authentication/views/Login.tsx';
import Logout from './authentication/views/Logout.tsx';
import R3Stamboek from './authentication/views/registration-flow/r3-stamboek.tsx';
import BundleDetail from './bundle/views/BundleDetail.tsx';
import BundleEdit from './bundle/views/BundleEdit.tsx';
import CollectionDetail from './collection/views/CollectionDetail.tsx';
import CollectionEdit from './collection/views/CollectionEdit.tsx';
import { APP_PATH } from './constants';
import CookiePolicy from './cookie-policy/views/CookiePolicy.tsx';
import { RegisterOrLogin } from './embed/components/RegisterOrLogin.tsx';
import EmbedCodeDetail from './embed-code/views/EmbedCodeDetail.tsx';
import ErrorView from './error/views/ErrorView.tsx';
import LoggedInHome from './home/views/LoggedInHome.tsx';
import LoggedOutHome from './home/views/LoggedOutHome.tsx';
import { ItemDetail } from './item/views/ItemDetail.tsx';
import ItemDetailRoute from './item/views/ItemDetailRoute.tsx';
import QuickLaneDetail from './quick-lane/views/QuickLaneDetail.tsx';
import Search from './search/views/Search.tsx';
import CompleteProfileStep from './settings/components/CompleteProfileStep.tsx';
import Email from './settings/components/Email/Email.tsx';
import Profile from './settings/components/Profile.tsx';
import Settings from './settings/views/Settings.tsx';
import { ErrorBoundary } from './shared/components/ErrorBoundary/ErrorBoundary';
import { FullPageSpinner } from './shared/components/FullPageSpinner/FullPageSpinner';
import { ROUTE_PARTS } from './shared/constants/routes';
import UserItemRequestForm from './user-item-request-form/views/UserItemRequestForm.tsx';
import Workspace from './workspace/views/Workspace.tsx';

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
    Component: App,
    // lazy: () => import('./App').then(reactRouterConvert),
    // hydrateFallbackElement: <FullPageSpinner/>,
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
        // lazy: () => import('./admin/Admin').then(reactRouterConvert),
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
        // lazy: () =>
        //   import('./authentication/views/Login').then(reactRouterConvert),
      },
      {
        id: 'app-client-layout',
        Component: AppClientLayout,
        // lazy: () => import('./AppClientLayout').then(reactRouterConvert),
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
            // lazy: () =>
            //   import(
            //     './dynamic-route-resolver/views/DynamicRouteResolver'
            //   ).then(reactRouterConvert),
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
      Component: LoggedOutHome,
      // lazy: () => import('./home/views/LoggedOutHome').then(reactRouterConvert),
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'Logout',
      path: APP_PATH.LOGOUT.route,
      Component: Logout,
      // lazy: () =>
      //   import('./authentication/views/Logout').then(reactRouterConvert),
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'RegisterStamboek',
      path: APP_PATH.STAMBOEK.route,
      Component: R3Stamboek,
      // lazy: () =>
      //   import('./authentication/views/registration-flow/r3-stamboek').then(
      //     reactRouterConvert,
      //   ),
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'ManualRegistration',
      path: APP_PATH.MANUAL_ACCESS_REQUEST.route,
      // lazy: () =>
      //   import(
      //     './authentication/views/registration-flow/r4-manual-registration'
      //   ).then(reactRouterConvert),
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'StudentTeacher',
      path: APP_PATH.STUDENT_TEACHER.route,
      // lazy: () =>
      //   import(
      //     './authentication/views/registration-flow/r10-student-teacher'
      //   ).then(reactRouterConvert),
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'RegisterOrLogin',
      path: APP_PATH.REGISTER_OR_LOGIN.route,
      Component: RegisterOrLogin,
      // lazy: () =>
      //   import('./authentication/views/RegisterOrLogin').then(
      //     reactRouterConvert,
      //   ),
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'LinkYourAccount',
      path: APP_PATH.LINK_YOUR_ACCOUNT.route,
      Component: LinkYourAccount,
      // lazy: () =>
      //   import('./authentication/views/LinkYourAccount').then(
      //     reactRouterConvert,
      //   ),
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'AcceptConditions',
      path: APP_PATH.ACCEPT_CONDITIONS.route,
      // lazy: () =>
      //   import(
      //     './authentication/views/registration-flow/l8-accept-conditions'
      //   ).then(reactRouterConvert),
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'CompleteProfileStep',
      path: APP_PATH.COMPLETE_PROFILE.route,
      Component: CompleteProfileStep,
      // lazy: () =>
      //   import('./settings/components/CompleteProfileStep').then(
      //     reactRouterConvert,
      //   ),
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'ErrorView',
      path: APP_PATH.ERROR.route,
      Component: ErrorView,
      // lazy: () => import('./error/views/ErrorView').then(reactRouterConvert),
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'CookiePolicy',
      path: APP_PATH.COOKIE_POLICY.route,
      Component: CookiePolicy,
      // lazy: () =>
      //   import('./cookie-policy/views/CookiePolicy').then(reactRouterConvert),
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'Email',
      path: APP_PATH.EMAIL_PREFERENCES_LOGGED_OUT.route,
      Component: Email,
      // lazy: () =>
      //   import('./settings/components/Email/Email').then(reactRouterConvert),
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
      // lazy: () => import('./home/views/LoggedInHome').then(reactRouterConvert),
      id: 'LoggedInHome',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.SEARCH.route,
      Component: Search,
      // lazy: () => import('./search/views/Search').then(reactRouterConvert),
      id: 'Search',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.ITEM_DETAIL.route,
      Component: ItemDetailRoute,
      // lazy: () =>
      //   import('./item/views/ItemDetailRoute').then(reactRouterConvert),
      id: 'ItemDetailRoute',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.COLLECTION_DETAIL.route,
      Component: CollectionDetail,
      // lazy: () =>
      //   import('./collection/views/CollectionDetail').then(reactRouterConvert),
      id: 'CollectionDetail',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.COLLECTION_EDIT_TAB.route,
      Component: CollectionEdit,
      // lazy: () =>
      //   import('./collection/views/CollectionEdit').then(reactRouterConvert),
      id: 'CollectionEdit tab',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.COLLECTION_EDIT.route,
      Component: CollectionEdit,
      // lazy: () =>
      //   import('./collection/views/CollectionEdit').then(reactRouterConvert),
      id: 'CollectionEdit',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.BUNDLE_DETAIL.route,
      Component: BundleDetail,
      // lazy: () =>
      //   import('./bundle/views/BundleDetail').then(reactRouterConvert),
      id: 'BundleDetail',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.BUNDLE_EDIT_TAB.route,
      Component: BundleEdit,
      // lazy: () => import('./bundle/views/BundleEdit').then(reactRouterConvert),
      id: 'BundleEdit tab',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.BUNDLE_EDIT.route,
      Component: BundleEdit,
      // lazy: () => import('./bundle/views/BundleEdit').then(reactRouterConvert),
      id: 'BundleEdit',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.ASSIGNMENT_CREATE.route,
      Component: AssignmentEdit,
      // lazy: () =>
      //   import('./assignment/views/AssignmentEdit').then(reactRouterConvert),
      id: 'AssignmentEdit create',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.ASSIGNMENT_DETAIL.route,
      Component: AssignmentDetailSwitcher,
      // lazy: () =>
      //   import('./assignment/views/AssignmentDetailSwitcher').then(
      //     reactRouterConvert,
      //   ),
      id: 'AssignmentDetailSwitcher',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.ASSIGNMENT_EDIT_TAB.route,
      Component: AssignmentEdit,
      // lazy: () =>
      //   import('./assignment/views/AssignmentEdit').then(reactRouterConvert),
      id: 'AssignmentEdit edit tab',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.ASSIGNMENT_EDIT.route,
      Component: AssignmentEdit,
      // lazy: () =>
      //   import('./assignment/views/AssignmentEdit').then(reactRouterConvert),
      id: 'AssignmentEdit edit',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.ASSIGNMENT_RESPONSE_CREATE.route,
      Component: AssignmentDetailSwitcher,
      // lazy: () =>
      //   import('./assignment/views/AssignmentDetailSwitcher').then(
      //     reactRouterConvert,
      //   ),
      id: 'AssignmentDetailSwitcher create',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.ASSIGNMENT_RESPONSE_EDIT.route,
      Component: AssignmentDetailSwitcher,
      // lazy: () =>
      //   import('./assignment/views/AssignmentDetailSwitcher').then(
      //     reactRouterConvert,
      // ),
      id: 'AssignmentDetailSwitcher edit',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    // view pupil collection response as teacher/ad{min
    {
      path: APP_PATH.ASSIGNMENT_PUPIL_COLLECTION_DETAIL.route,
      Component: AssignmentPupilCollectionDetail,
      // lazy: () =>
      //   import('./assignment/views/AssignmentPupilCollectionDetail').then(
      //     reactRouterConvert,
      //   ),
      id: 'AssignmentPupilCollectionDetail',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    // edit pupil collection response as admin
    {
      path: APP_PATH.ASSIGNMENT_PUPIL_COLLECTION_ADMIN_EDIT.route,
      // lazy: () =>
      //   import(
      //     './assignment/views/AssignmentResponseEdit/AssignmentResponseAdminEdit'
      //   ).then(reactRouterConvert),
      id: 'AssignmentResponseAdminEdit',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.WORKSPACE_TAB.route,
      Component: Workspace,
      // lazy: () =>
      //   import('./workspace/views/Workspace').then(reactRouterConvert),
      id: 'Workspace tab',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.WORKSPACE.route,
      Component: Workspace,
      // lazy: () =>
      //   import('./workspace/views/Workspace').then(reactRouterConvert),
      id: 'Workspace',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: `${APP_PATH.WORKSPACE.route}${APP_PATH.ASSIGNMENT_DETAIL.route}`,
      loader: (props) => {
        const assignmentId = props.params?.assignmentId;
        return redirect(
          `/${ROUTE_PARTS.assignments}/${assignmentId}${location.search}`,
        );
      },
      Component: FullPageSpinner,
      id: 'WorkspaceAssignmentRedirect',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.SETTINGS_TAB.route,
      Component: Settings,
      // lazy: () => import('./settings/views/Settings').then(reactRouterConvert),
      id: 'Settings tab',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.SETTINGS.route,
      Component: Settings,
      // lazy: () => import('./settings/views/Settings').then(reactRouterConvert),
      id: 'Settings',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.COMPLETE_PROFILE.route,
      Component: Profile,
      // lazy: () =>
      //   import('./settings/components/Profile').then(reactRouterConvert),
      id: 'Profile',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.USER_ITEM_REQUEST_FORM.route,
      Component: UserItemRequestForm,
      // lazy: () =>
      //   import('./user-item-request-form/views/UserItemRequestForm').then(
      //     reactRouterConvert,
      //   ),
      id: 'UserItemRequestForm',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.USER_ITEM_REQUEST_FORM_CONFIRM.route,
      // lazy: () =>
      //   import(
      // './user-item-request-form/views/UserItemRequestFormConfirm'
      // ).then(reactRouterConvert),
      id: 'UserItemRequestFormConfirm',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.EDUCATIONAL_USER_ITEM_REQUEST_FORM.route,
      // lazy: () =>
      //   import(
      //     './user-item-request-form/views/EducationalAuthorItemRequestForm'
      //   ).then(reactRouterConvert),
      id: 'EducationalAuthorItemRequestForm',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.EDUCATIONAL_USER_ITEM_REQUEST_FORM_CONFIRM.route,
      // lazy: () =>
      //   import(
      //     './user-item-request-form/views/EducationalAuthorItemRequestFormConfirm'
      //   ).then(reactRouterConvert),
      id: 'EducationalAuthorItemRequestFormConfirm',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.QUICK_LANE.route,
      Component: QuickLaneDetail,
      // lazy: () =>
      //   import('./quick-lane/views/QuickLaneDetail').then(reactRouterConvert),
      id: 'QuickLaneDetail',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.EMBED.route,
      Component: EmbedCodeDetail,
      // lazy: () =>
      //   import('./embed-code/views/EmbedCodeDetail').then(reactRouterConvert),
      ErrorBoundary: ErrorBoundary,
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
      // lazy: () =>
      //import('./admin/dashboard/views/Dashboard').then(reactRouterConvert),
      index: true,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'AssignmentOverviewAdmin',
      Component: AssignmentsOverviewAdmin,
      // lazy: () =>
      //import('./admin/assignments/views/AssignmentsOverviewAdmin').then(
      //   reactRouterConvert,
      // ),
      path: ASSIGNMENTS_PATH.ASSIGNMENTS_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'AssignmentMarcomOverview',
      Component: AssignmentsMarcomOverview,
      // lazy: () =>
      //import('./admin/assignments/views/AssignmentsMarcomOverview').then(
      //   reactRouterConvert,
      // ),
      path: ASSIGNMENTS_PATH.ASSIGNMENTS_MARCOM_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'CollectionsOverview',
      // lazy: () =>
      //   import(
      //     './admin/collectionsOrBundles/views/CollectionsOrBundlesOverview'
      //   ).then(reactRouterConvert),
      path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTIONS_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'CollectionActualisationOverview',
      // lazy: () =>
      //   import(
      //     './admin/collectionsOrBundles/views/CollectionOrBundleActualisationOverview'
      //   ).then(reactRouterConvert),
      path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_ACTUALISATION_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'CollectionQualityCheckOverview',
      // lazy: () =>
      //   import(
      //     './admin/collectionsOrBundles/views/CollectionOrBundleQualityCheckOverview'
      //   ).then(reactRouterConvert),
      path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_QUALITYCHECK_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'CollectionMarcomOverview',
      // lazy: () =>
      //   import(
      //     './admin/collectionsOrBundles/views/CollectionOrBundleMarcomOverview'
      //   ).then(reactRouterConvert),
      path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_MARCOM_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'BundlesOverview',
      // lazy: () =>
      //   import(
      //     './admin/collectionsOrBundles/views/CollectionsOrBundlesOverview'
      //   ).then(reactRouterConvert),
      path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLES_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'BundleActualisationOverview',
      // lazy: () =>
      //   import(
      //     './admin/collectionsOrBundles/views/CollectionOrBundleActualisationOverview'
      //   ).then(reactRouterConvert),
      path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_ACTUALISATION_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'BundleQualityCheckOverview',
      // lazy: () =>
      //   import(
      //     './admin/collectionsOrBundles/views/CollectionOrBundleQualityCheckOverview'
      //   ).then(reactRouterConvert),
      path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_QUALITYCHECK_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'BundleMarcomOverview',
      // lazy: () =>
      //   import(
      //     './admin/collectionsOrBundles/views/CollectionOrBundleMarcomOverview'
      //   ).then(reactRouterConvert),
      path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_MARCOM_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageOverviewPage',
      Component: ContentPageOverviewPage,
      // lazy: () =>
      //import('./admin/content-page/views/ContentPageOverviewPage').then(
      //   reactRouterConvert,
      // ),
      path: CONTENT_PAGE_PATH.CONTENT_PAGE_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageEditPage create',
      Component: ContentPageEditPage,
      // lazy: () =>
      //import('./admin/content-page/views/ContentPageEditPage').then(
      //   reactRouterConvert,
      // ),
      path: CONTENT_PAGE_PATH.CONTENT_PAGE_CREATE,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageEditPage edit',
      Component: ContentPageEditPage,
      // lazy: () =>
      //import('./admin/content-page/views/ContentPageEditPage').then(
      //   reactRouterConvert,
      // ),
      path: CONTENT_PAGE_PATH.CONTENT_PAGE_EDIT,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageDetailPage',
      Component: ContentPageDetailPage,
      // lazy: () =>
      //import('./admin/content-page/views/ContentPageDetailPage').then(
      //   reactRouterConvert,
      // ),
      path: CONTENT_PAGE_PATH.CONTENT_PAGE_DETAIL,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageLabelOverviewPage',
      // lazy: () =>
      //   import(
      //     './admin/content-page-labels/views/ContentPageLabelOverviewPage'
      //   ).then(reactRouterConvert),
      path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageLabelEditPage create',
      // lazy: () =>
      //   import(
      //     './admin/content-page-labels/views/ContentPageLabelEditPage'
      //   ).then(reactRouterConvert),
      path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_CREATE,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageLabelEditPage edit',
      // lazy: () =>
      //   import(
      //     './admin/content-page-labels/views/ContentPageLabelEditPage'
      //   ).then(reactRouterConvert),
      path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_EDIT,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageLabelDetailPage',
      // lazy: () =>
      //   import(
      //     './admin/content-page-labels/views/ContentPageLabelDetailPage'
      //   ).then(reactRouterConvert),
      path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_DETAIL,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'InteractiveTourOverview',
      Component: InteractiveTourOverview,
      // lazy: () =>
      //import('./admin/interactive-tour/views/InteractiveTourOverview').then(
      //   reactRouterConvert,
      // ),
      path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'InteractiveTourEdit create',
      Component: InteractiveTourEdit,
      // lazy: () =>
      //import('./admin/interactive-tour/views/InteractiveTourEdit').then(
      //   reactRouterConvert,
      // ),
      path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_CREATE,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'InteractiveTourEdit edit',
      Component: InteractiveTourEdit,
      // lazy: () =>
      //import('./admin/interactive-tour/views/InteractiveTourEdit').then(
      //   reactRouterConvert,
      // ),
      path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_EDIT,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'InteractiveTourDetail',
      Component: InteractiveTourDetail,
      // lazy: () =>
      //import('./admin/interactive-tour/views/InteractiveTourDetail').then(
      //   reactRouterConvert,
      // ),
      path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_DETAIL,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'ItemsOverview',
      Component: ItemsOverview,
      // lazy: () =>
      //import('./admin/items/views/ItemsOverview').then(reactRouterConvert),
      path: ITEMS_PATH.ITEMS_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'ItemDetail',
      Component: ItemDetail,
      // lazy: () =>
      //import('./admin/items/views/ItemDetail').then(reactRouterConvert),
      path: ITEMS_PATH.ITEM_DETAIL,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'PublishItemsOverview',
      Component: PublishItemsOverview,
      // lazy: () =>
      //import('./admin/items/views/PublishItemsOverview').then(
      //   reactRouterConvert,
      // ),
      path: ITEMS_PATH.PUBLISH_ITEMS_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'NavigationBarOverview',
      Component: NavigationBarOverview,
      // lazy: () =>
      //import('./admin/navigations/views/NavigationBarOverview').then(
      //   reactRouterConvert,
      // ),
      path: NAVIGATIONS_PATH.NAVIGATIONS_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'NavigationBarDetail',
      Component: NavigationBarDetail as ComponentType<{}>,
      // lazy: () =>
      //import('./admin/navigations/views/NavigationBarDetail').then(
      //   reactRouterConvert,
      // ),
      path: NAVIGATIONS_PATH.NAVIGATIONS_DETAIL,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'NavigationItemEdit create',
      Component: NavigationItemEdit as ComponentType<{}>,
      // lazy: () =>
      //import('./admin/navigations/views/NavigationItemEdit').then(
      //   reactRouterConvert,
      // ),
      path: NAVIGATIONS_PATH.NAVIGATIONS_ITEM_CREATE,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'NavigationItemEdit edit',
      Component: NavigationItemEdit as ComponentType<{}>,
      // lazy: () =>
      //import('./admin/navigations/views/NavigationItemEdit').then(
      //   reactRouterConvert,
      // ),
      path: NAVIGATIONS_PATH.NAVIGATIONS_ITEM_EDIT,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'UrlRedirectOverview',
      Component: UrlRedirectOverview,
      // lazy: () =>
      //import('./admin/url-redirects/views/UrlRedirectOverview').then(
      //   reactRouterConvert,
      // ),
      path: URL_REDIRECT_PATH.URL_REDIRECT_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'UrlRedirectEdit create',
      Component: UrlRedirectEdit,
      // lazy: () =>
      //import('./admin/url-redirects/views/UrlRedirectEdit').then(
      //   reactRouterConvert,
      // ),
      path: URL_REDIRECT_PATH.URL_REDIRECT_CREATE,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'UrlRedirectEdit edit',
      Component: UrlRedirectEdit,
      // lazy: () =>
      //import('./admin/url-redirects/views/UrlRedirectEdit').then(
      //   reactRouterConvert,
      // ),
      path: URL_REDIRECT_PATH.URL_REDIRECT_EDIT,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'PupilCollectionsOverview',
      Component: PupilCollectionsOverview,
      // lazy: () =>
      //import('./admin/pupil-collection/views/PupilCollectionsOverview').then(
      //   reactRouterConvert,
      // ),
      path: PUPIL_COLLECTIONS_PATH.ASSIGNMENT_PUPIL_COLLECTIONS_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'TranslationsOverviewPage',
      Component: TranslationsOverviewPage,
      // lazy: () =>
      //import('./admin/translations/views/TranslationsOverviewPage').then(
      //   reactRouterConvert,
      // ),
      path: TRANSLATIONS_PATH.TRANSLATIONS,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'UserGroupOverviewPage',
      Component: UserGroupOverviewPage,
      // lazy: () =>
      //import('./admin/user-groups/views/UserGroupOverviewPage').then(
      //   reactRouterConvert,
      // ),
      path: USER_GROUP_PATH.USER_GROUP_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'UserOverviewPage',
      Component: UserOverviewPage,
      // lazy: () =>
      //import('./admin/users/views/UserOverviewPage').then(reactRouterConvert),
      path: USER_PATH.USER_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'UserDetailPage',
      Component: UserDetailPage,
      // lazy: () =>
      //import('./admin/users/views/UserDetailPage').then(reactRouterConvert),
      path: USER_PATH.USER_DETAIL,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'UserEditPage',
      Component: UserEditPage,
      // lazy: () =>
      //import('./admin/users/views/UserEditPage').then(reactRouterConvert),
      path: USER_PATH.USER_EDIT,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'MaintenanceAlertsOverviewPage',
      // lazy: () =>
      //   import(
      //     './admin/maintenance-alerts-overview/MaintenanceAlertsOverviewPage'
      //   ).then(reactRouterConvert),
      path: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.alerts}`,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
  ];
}

export default APP_ROUTES;
