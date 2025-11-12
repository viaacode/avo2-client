import {
  type MiddlewareFunction,
  redirect,
  type RouteObject,
} from 'react-router'

import { AppWithAdminCoreConfig } from './App.js'
import { ASSIGNMENTS_PATH } from './admin/assignments/assignments.const.js'
import { COLLECTIONS_OR_BUNDLES_PATH } from './admin/collectionsOrBundles/collections-or-bundles.const.js'
import { CONTENT_PAGE_PATH } from './admin/content-page/content-page.consts.js'
import { CONTENT_PAGE_LABEL_PATH } from './admin/content-page-labels/content-page-label.const.js'
import { INTERACTIVE_TOUR_PATH } from './admin/interactive-tour/interactive-tour.const.js'
import { ITEMS_PATH } from './admin/items/items.const.js'
import { NAVIGATIONS_PATH } from './admin/navigations/navigations.const.js'
import { PUPIL_COLLECTIONS_PATH } from './admin/pupil-collection/pupil-collection.const.js'
import { TRANSLATIONS_PATH } from './admin/translations/translations.const.js'
import { URL_REDIRECT_PATH } from './admin/url-redirects/url-redirects.const.js'
import { USER_GROUP_PATH } from './admin/user-groups/user-group.const.js'
import { USER_PATH } from './admin/users/user.const.js'
import { APP_PATH } from './constants.js'
import { ErrorBoundary } from './shared/components/ErrorBoundary/ErrorBoundary.js'
import { FullPageSpinner } from './shared/components/FullPageSpinner/FullPageSpinner.js'
import { ROUTE_PARTS } from './shared/constants/index.js'
import { reactRouterConvert } from './shared/helpers/routing/convert-route-component-to-react-router-v7-module.js'

async function logRoutesMiddleware({
  request,
}: Parameters<MiddlewareFunction>[0]) {
  console.log(`${request.method} ${request.url}`)
}

export default [
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
          return redirect(`/${ROUTE_PARTS.admin}`)
        },
        Component: FullPageSpinner,
      },
      {
        id: 'admin',
        path: `/${ROUTE_PARTS.admin}`,
        lazy: () => import('./admin/Admin.js').then(reactRouterConvert),
        children: getAdminRoutes(),
      },
      ////////////////////////////////////////////////////////////////////////////////////////
      // CLIENT ROUTES
      ////////////////////////////////////////////////////////////////////////////////////////
      {
        id: 'login',
        // Login route doesn't need navigation or footer
        path: APP_PATH.LOGIN.route,
        lazy: () =>
          import('./authentication/views/Login.js').then(reactRouterConvert),
      },
      {
        id: 'app-client-layout',
        lazy: () => import('./AppClientLayout.js').then(reactRouterConvert),
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
            lazy: () =>
              import(
                './dynamic-route-resolver/views/DynamicRouteResolver.js'
              ).then(reactRouterConvert),
            path: APP_PATH.ALL_ROUTES.route,
          },
        ],
      },
    ],
  },
]

////////////////////////////////////////////////////////////////////////////////////////
// UNAUTHENTICATED
////////////////////////////////////////////////////////////////////////////////////////
function getUnauthenticatedClientRoutes(): RouteObject[] {
  return [
    {
      id: 'LoggedOutHome',
      index: true,
      lazy: () =>
        import('./home/views/LoggedOutHome.js').then(reactRouterConvert),
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'Logout',
      path: APP_PATH.LOGOUT.route,
      lazy: () =>
        import('./authentication/views/Logout.js').then(reactRouterConvert),
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'RegisterStamboek',
      path: APP_PATH.STAMBOEK.route,
      lazy: () =>
        import('./authentication/views/registration-flow/r3-stamboek.js').then(
          reactRouterConvert,
        ),
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'ManualRegistration',
      path: APP_PATH.MANUAL_ACCESS_REQUEST.route,
      lazy: () =>
        import(
          './authentication/views/registration-flow/r4-manual-registration.js'
        ).then(reactRouterConvert),
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'StudentTeacher',
      path: APP_PATH.STUDENT_TEACHER.route,
      lazy: () =>
        import(
          './authentication/views/registration-flow/r10-student-teacher.js'
        ).then(reactRouterConvert),
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'RegisterOrLogin',
      path: APP_PATH.REGISTER_OR_LOGIN.route,
      lazy: () =>
        import('./authentication/views/RegisterOrLogin.js').then(
          reactRouterConvert,
        ),
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'LinkYourAccount',
      path: APP_PATH.LINK_YOUR_ACCOUNT.route,
      lazy: () =>
        import('./authentication/views/LinkYourAccount.js').then(
          reactRouterConvert,
        ),
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'AcceptConditions',
      path: APP_PATH.ACCEPT_CONDITIONS.route,
      lazy: () =>
        import(
          './authentication/views/registration-flow/l8-accept-conditions.js'
        ).then(reactRouterConvert),
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'CompleteProfileStep',
      path: APP_PATH.COMPLETE_PROFILE.route,
      lazy: () =>
        import('./settings/components/CompleteProfileStep.js').then(
          reactRouterConvert,
        ),
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'ErrorView',
      path: APP_PATH.ERROR.route,
      lazy: () => import('./error/views/ErrorView.js').then(reactRouterConvert),
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'CookiePolicy',
      path: APP_PATH.COOKIE_POLICY.route,
      lazy: () =>
        import('./cookie-policy/views/CookiePolicy.js').then(
          reactRouterConvert,
        ),
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'Email',
      path: APP_PATH.EMAIL_PREFERENCES_LOGGED_OUT.route,
      lazy: () =>
        import('./settings/components/Email/Email.js').then(reactRouterConvert),
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
  ]
}

////////////////////////////////////////////////////////////////////////////////////////
// AUTHENTICATED ROUTES
////////////////////////////////////////////////////////////////////////////////////////
function getAuthenticatedClientRoutes(): RouteObject[] {
  return [
    {
      path: APP_PATH.LOGGED_IN_HOME.route,
      lazy: () =>
        import('./home/views/LoggedInHome.js').then(reactRouterConvert),
      id: 'LoggedInHome',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.SEARCH.route,
      lazy: () => import('./search/views/Search.js').then(reactRouterConvert),
      id: 'Search',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.ITEM_DETAIL.route,
      lazy: () =>
        import('./item/views/ItemDetailRoute.js').then(reactRouterConvert),
      id: 'ItemDetailRoute',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.COLLECTION_DETAIL.route,
      lazy: () =>
        import('./collection/views/CollectionDetail.js').then(
          reactRouterConvert,
        ),
      id: 'CollectionDetail',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.COLLECTION_EDIT_TAB.route,
      lazy: () =>
        import('./collection/views/CollectionEdit.js').then(reactRouterConvert),
      id: 'CollectionEdit tab',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.COLLECTION_EDIT.route,
      lazy: () =>
        import('./collection/views/CollectionEdit.js').then(reactRouterConvert),
      id: 'CollectionEdit',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.BUNDLE_DETAIL.route,
      lazy: () =>
        import('./bundle/views/BundleDetail.js').then(reactRouterConvert),
      id: 'BundleDetail',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.BUNDLE_EDIT_TAB.route,
      lazy: () =>
        import('./bundle/views/BundleEdit.js').then(reactRouterConvert),
      id: 'BundleEdit tab',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.BUNDLE_EDIT.route,
      lazy: () =>
        import('./bundle/views/BundleEdit.js').then(reactRouterConvert),
      id: 'BundleEdit',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.ASSIGNMENT_CREATE.route,
      lazy: () =>
        import('./assignment/views/AssignmentEdit.js').then(reactRouterConvert),
      id: 'AssignmentEdit create',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.ASSIGNMENT_DETAIL.route,
      lazy: () =>
        import('./assignment/views/AssignmentDetailSwitcher.js').then(
          reactRouterConvert,
        ),
      id: 'AssignmentDetailSwitcher',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.ASSIGNMENT_EDIT_TAB.route,
      lazy: () =>
        import('./assignment/views/AssignmentEdit.js').then(reactRouterConvert),
      id: 'AssignmentEdit edit tab',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.ASSIGNMENT_EDIT.route,
      lazy: () =>
        import('./assignment/views/AssignmentEdit.js').then(reactRouterConvert),
      id: 'AssignmentEdit edit',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.ASSIGNMENT_RESPONSE_CREATE.route,
      lazy: () =>
        import('./assignment/views/AssignmentDetailSwitcher.js').then(
          reactRouterConvert,
        ),
      id: 'AssignmentDetailSwitcher create',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.ASSIGNMENT_RESPONSE_EDIT.route,
      lazy: () =>
        import('./assignment/views/AssignmentDetailSwitcher.js').then(
          reactRouterConvert,
        ),
      id: 'AssignmentDetailSwitcher edit',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    // view pupil collection response as teacher/ad{min
    {
      path: APP_PATH.ASSIGNMENT_PUPIL_COLLECTION_DETAIL.route,
      lazy: () =>
        import('./assignment/views/AssignmentPupilCollectionDetail.js').then(
          reactRouterConvert,
        ),
      id: 'AssignmentPupilCollectionDetail',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    // edit pupil collection response as admin
    {
      path: APP_PATH.ASSIGNMENT_PUPIL_COLLECTION_ADMIN_EDIT.route,
      lazy: () =>
        import(
          './assignment/views/AssignmentResponseEdit/AssignmentResponseAdminEdit.js'
        ).then(reactRouterConvert),
      id: 'AssignmentResponseAdminEdit',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.WORKSPACE_TAB.route,
      lazy: () =>
        import('./workspace/views/Workspace.js').then(reactRouterConvert),
      id: 'Workspace tab',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.WORKSPACE.route,
      lazy: () =>
        import('./workspace/views/Workspace.js').then(reactRouterConvert),
      id: 'Workspace',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: `${APP_PATH.WORKSPACE.route}${APP_PATH.ASSIGNMENT_DETAIL.route}`,
      loader: (props) => {
        const assignmentId = props.params?.assignmentId
        return redirect(
          `/${ROUTE_PARTS.assignments}/${assignmentId}${location.search}`,
        )
      },
      Component: FullPageSpinner,
      id: 'WorkspaceAssignmentRedirect',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.SETTINGS_TAB.route,
      lazy: () =>
        import('./settings/views/Settings.js').then(reactRouterConvert),
      id: 'Settings tab',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.SETTINGS.route,
      lazy: () =>
        import('./settings/views/Settings.js').then(reactRouterConvert),
      id: 'Settings',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.COMPLETE_PROFILE.route,
      lazy: () =>
        import('./settings/components/Profile.js').then(reactRouterConvert),
      id: 'Profile',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.USER_ITEM_REQUEST_FORM.route,
      lazy: () =>
        import('./user-item-request-form/views/UserItemRequestForm.js').then(
          reactRouterConvert,
        ),
      id: 'UserItemRequestForm',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.USER_ITEM_REQUEST_FORM_CONFIRM.route,
      lazy: () =>
        import(
          './user-item-request-form/views/UserItemRequestFormConfirm.js'
        ).then(reactRouterConvert),
      id: 'UserItemRequestFormConfirm',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.EDUCATIONAL_USER_ITEM_REQUEST_FORM.route,
      lazy: () =>
        import(
          './user-item-request-form/views/EducationalAuthorItemRequestForm.js'
        ).then(reactRouterConvert),
      id: 'EducationalAuthorItemRequestForm',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.EDUCATIONAL_USER_ITEM_REQUEST_FORM_CONFIRM.route,
      lazy: () =>
        import(
          './user-item-request-form/views/EducationalAuthorItemRequestFormConfirm.js'
        ).then(reactRouterConvert),
      id: 'EducationalAuthorItemRequestFormConfirm',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.QUICK_LANE.route,
      lazy: () =>
        import('./quick-lane/views/QuickLaneDetail.js').then(
          reactRouterConvert,
        ),
      id: 'QuickLaneDetail',
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      path: APP_PATH.EMBED.route,
      lazy: () =>
        import('./embed-code/views/EmbedCodeDetail.js').then(
          reactRouterConvert,
        ),
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
  ]
}

function getAdminRoutes(): RouteObject[] {
  return [
    {
      id: 'Dashboard',
      lazy: () =>
        import('./admin/dashboard/views/Dashboard.js').then(reactRouterConvert),
      index: true,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'AssignmentOverviewAdmin',
      lazy: () =>
        import('./admin/assignments/views/AssignmentsOverviewAdmin.js').then(
          reactRouterConvert,
        ),
      path: ASSIGNMENTS_PATH.ASSIGNMENTS_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'AssignmentMarcomOverview',
      lazy: () =>
        import('./admin/assignments/views/AssignmentsMarcomOverview.js').then(
          reactRouterConvert,
        ),
      path: ASSIGNMENTS_PATH.ASSIGNMENTS_MARCOM_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'CollectionsOverview',
      lazy: () =>
        import(
          './admin/collectionsOrBundles/views/CollectionsOrBundlesOverview.js'
        ).then(reactRouterConvert),
      path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTIONS_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'CollectionActualisationOverview',
      lazy: () =>
        import(
          './admin/collectionsOrBundles/views/CollectionOrBundleActualisationOverview.js'
        ).then(reactRouterConvert),
      path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_ACTUALISATION_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'CollectionQualityCheckOverview',
      lazy: () =>
        import(
          './admin/collectionsOrBundles/views/CollectionOrBundleQualityCheckOverview.js'
        ).then(reactRouterConvert),
      path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_QUALITYCHECK_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'CollectionMarcomOverview',
      lazy: () =>
        import(
          './admin/collectionsOrBundles/views/CollectionOrBundleMarcomOverview.js'
        ).then(reactRouterConvert),
      path: COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_MARCOM_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'BundlesOverview',
      lazy: () =>
        import(
          './admin/collectionsOrBundles/views/CollectionsOrBundlesOverview.js'
        ).then(reactRouterConvert),
      path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLES_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'BundleActualisationOverview',
      lazy: () =>
        import(
          './admin/collectionsOrBundles/views/CollectionOrBundleActualisationOverview.js'
        ).then(reactRouterConvert),
      path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_ACTUALISATION_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'BundleQualityCheckOverview',
      lazy: () =>
        import(
          './admin/collectionsOrBundles/views/CollectionOrBundleQualityCheckOverview.js'
        ).then(reactRouterConvert),
      path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_QUALITYCHECK_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'BundleMarcomOverview',
      lazy: () =>
        import(
          './admin/collectionsOrBundles/views/CollectionOrBundleMarcomOverview.js'
        ).then(reactRouterConvert),
      path: COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_MARCOM_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageOverviewPage',
      lazy: () =>
        import('./admin/content-page/views/ContentPageOverviewPage.js').then(
          reactRouterConvert,
        ),
      path: CONTENT_PAGE_PATH.CONTENT_PAGE_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageEditPage create',
      lazy: () =>
        import('./admin/content-page/views/ContentPageEditPage.js').then(
          reactRouterConvert,
        ),
      path: CONTENT_PAGE_PATH.CONTENT_PAGE_CREATE,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageEditPage edit',
      lazy: () =>
        import('./admin/content-page/views/ContentPageEditPage.js').then(
          reactRouterConvert,
        ),
      path: CONTENT_PAGE_PATH.CONTENT_PAGE_EDIT,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageDetailPage',
      lazy: () =>
        import('./admin/content-page/views/ContentPageDetailPage.js').then(
          reactRouterConvert,
        ),
      path: CONTENT_PAGE_PATH.CONTENT_PAGE_DETAIL,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageLabelOverviewPage',
      lazy: () =>
        import(
          './admin/content-page-labels/views/ContentPageLabelOverviewPage.js'
        ).then(reactRouterConvert),
      path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageLabelEditPage create',
      lazy: () =>
        import(
          './admin/content-page-labels/views/ContentPageLabelEditPage.js'
        ).then(reactRouterConvert),
      path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_CREATE,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageLabelEditPage edit',
      lazy: () =>
        import(
          './admin/content-page-labels/views/ContentPageLabelEditPage.js'
        ).then(reactRouterConvert),
      path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_EDIT,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'ContentPageLabelDetailPage',
      lazy: () =>
        import(
          './admin/content-page-labels/views/ContentPageLabelDetailPage.js'
        ).then(reactRouterConvert),
      path: CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_DETAIL,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'InteractiveTourOverview',
      lazy: () =>
        import(
          './admin/interactive-tour/views/InteractiveTourOverview.js'
        ).then(reactRouterConvert),
      path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'InteractiveTourEdit create',
      lazy: () =>
        import('./admin/interactive-tour/views/InteractiveTourEdit.js').then(
          reactRouterConvert,
        ),
      path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_CREATE,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'InteractiveTourEdit edit',
      lazy: () =>
        import('./admin/interactive-tour/views/InteractiveTourEdit.js').then(
          reactRouterConvert,
        ),
      path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_EDIT,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'InteractiveTourDetail',
      lazy: () =>
        import('./admin/interactive-tour/views/InteractiveTourDetail.js').then(
          reactRouterConvert,
        ),
      path: INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_DETAIL,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'ItemsOverview',
      lazy: () =>
        import('./admin/items/views/ItemsOverview.js').then(reactRouterConvert),
      path: ITEMS_PATH.ITEMS_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'ItemDetail',
      lazy: () =>
        import('./admin/items/views/ItemDetail.js').then(reactRouterConvert),
      path: ITEMS_PATH.ITEM_DETAIL,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'PublishItemsOverview',
      lazy: () =>
        import('./admin/items/views/PublishItemsOverview.js').then(
          reactRouterConvert,
        ),
      path: ITEMS_PATH.PUBLISH_ITEMS_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'NavigationBarOverview',
      lazy: () =>
        import('./admin/navigations/views/NavigationBarOverview.js').then(
          reactRouterConvert,
        ),
      path: NAVIGATIONS_PATH.NAVIGATIONS_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'NavigationBarDetail',
      lazy: () =>
        import('./admin/navigations/views/NavigationBarDetail.js').then(
          reactRouterConvert,
        ),
      path: NAVIGATIONS_PATH.NAVIGATIONS_DETAIL,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'NavigationItemEdit create',
      lazy: () =>
        import('./admin/navigations/views/NavigationItemEdit.js').then(
          reactRouterConvert,
        ),
      path: NAVIGATIONS_PATH.NAVIGATIONS_ITEM_CREATE,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'NavigationItemEdit edit',
      lazy: () =>
        import('./admin/navigations/views/NavigationItemEdit.js').then(
          reactRouterConvert,
        ),
      path: NAVIGATIONS_PATH.NAVIGATIONS_ITEM_EDIT,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'UrlRedirectOverview',
      lazy: () =>
        import('./admin/url-redirects/views/UrlRedirectOverview.js').then(
          reactRouterConvert,
        ),
      path: URL_REDIRECT_PATH.URL_REDIRECT_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'UrlRedirectEdit create',
      lazy: () =>
        import('./admin/url-redirects/views/UrlRedirectEdit.js').then(
          reactRouterConvert,
        ),
      path: URL_REDIRECT_PATH.URL_REDIRECT_CREATE,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'UrlRedirectEdit edit',
      lazy: () =>
        import('./admin/url-redirects/views/UrlRedirectEdit.js').then(
          reactRouterConvert,
        ),
      path: URL_REDIRECT_PATH.URL_REDIRECT_EDIT,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'PupilCollectionsOverview',
      lazy: () =>
        import(
          './admin/pupil-collection/views/PupilCollectionsOverview.js'
        ).then(reactRouterConvert),
      path: PUPIL_COLLECTIONS_PATH.ASSIGNMENT_PUPIL_COLLECTIONS_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'TranslationsOverviewPage',
      lazy: () =>
        import('./admin/translations/views/TranslationsOverviewPage.js').then(
          reactRouterConvert,
        ),
      path: TRANSLATIONS_PATH.TRANSLATIONS,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'UserGroupOverviewPage',
      lazy: () =>
        import('./admin/user-groups/views/UserGroupOverviewPage.js').then(
          reactRouterConvert,
        ),
      path: USER_GROUP_PATH.USER_GROUP_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'UserOverviewPage',
      lazy: () =>
        import('./admin/users/views/UserOverviewPage.js').then(
          reactRouterConvert,
        ),
      path: USER_PATH.USER_OVERVIEW,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'UserDetailPage',
      lazy: () =>
        import('./admin/users/views/UserDetailPage.js').then(
          reactRouterConvert,
        ),
      path: USER_PATH.USER_DETAIL,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'UserEditPage',
      lazy: () =>
        import('./admin/users/views/UserEditPage.js').then(reactRouterConvert),
      path: USER_PATH.USER_EDIT,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
    {
      id: 'MaintenanceAlertsOverviewPage',
      lazy: () =>
        import(
          './admin/maintenance-alerts-overview/MaintenanceAlertsOverviewPage.js'
        ).then(reactRouterConvert),
      path: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.alerts}`,
      ErrorBoundary: ErrorBoundary,
      hasErrorBoundary: true,
    },
  ]
}
