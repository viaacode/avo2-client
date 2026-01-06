import {
  AdminConfigManager,
  type ContentPageInfo,
  ContentPageRenderer,
  type DbContentPage,
} from '@meemoo/admin-core-ui/client';
import { IconName } from '@viaa/avo2-components';
import {
  AvoAuthLoginResponseLoggedIn,
  AvoContentPagePage,
  AvoContentPageType,
  AvoSearchOrderDirection,
  PermissionName,
} from '@viaa/avo2-types';
import { decodeHTML } from 'entities';
import { useAtomValue, useSetAtom } from 'jotai';
import { stringifyUrl } from 'query-string';
import { type FC, useCallback, useEffect, useState } from 'react';
import { Navigate, useLoaderData, useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import { ItemsService } from '../../admin/items/items.service';
import { UrlRedirectsService } from '../../admin/url-redirects/url-redirects.service';
import { loginAtom } from '../../authentication/authentication.store';
import { getLoginStateAtom } from '../../authentication/authentication.store.actions';
import { SpecialPermissionGroups } from '../../authentication/authentication.types';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { redirectToErrorPage } from '../../authentication/helpers/redirects/redirect-to-error-page';
import { CollectionService } from '../../collection/collection.service';
import { APP_PATH } from '../../constants';
import { ErrorView } from '../../error/views/ErrorView';
import { SearchFilter } from '../../search/search.const';
import { FullPageSpinner } from '../../shared/components/FullPageSpinner/FullPageSpinner';
import { InteractiveTour } from '../../shared/components/InteractiveTour/InteractiveTour';
import {
  LoadingErrorLoadedComponent,
  type LoadingInfo,
} from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { SeoMetadata } from '../../shared/components/SeoMetadata/SeoMetadata.tsx';
import { buildLink } from '../../shared/helpers/build-link';
import { CustomError } from '../../shared/helpers/custom-error';
import { getEnv } from '../../shared/helpers/env';
import { getFullName } from '../../shared/helpers/formatters/avatar.tsx';
import { stripHtml } from '../../shared/helpers/formatters/strip-html.ts';
import { isPupil } from '../../shared/helpers/is-pupil';
import { generateSearchLinkString } from '../../shared/helpers/link';
import { renderWrongUserRoleError } from '../../shared/helpers/render-wrong-user-role-error';
import { tHtml } from '../../shared/helpers/translate-html';
import { getPageNotFoundError } from '../../shared/translations/page-not-found';
import {
  DynamicRouteType,
  GET_ERROR_MESSAGES,
} from '../dynamic-route-resolver.const';

interface RouteInfo {
  type: DynamicRouteType;
  data: any;
}

export const DynamicRouteResolver: FC = () => {
  const navigateFunc = useNavigate();
  const location = useLocation();

  // State
  const loginAtomValue = useAtomValue(loginAtom);
  const loginState = loginAtomValue.data;
  const loginStateLoading = loginAtomValue.loading;
  const loginStateError = loginAtomValue.error;
  const getLoginState = useSetAtom(getLoginStateAtom);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({
    state: 'loading',
  });
  const contentPageInfoFromRoute = useLoaderData<{
    contentPage: AvoContentPagePage | null;
    url: string;
  }>();

  const analyseRoute = useCallback(async () => {
    try {
      if (!loginState) {
        setLoadingInfo({
          state: 'error',
          message: tHtml(
            'dynamic-route-resolver/views/dynamic-route-resolver___het-controleren-van-je-login-status-is-mislukt',
          ),
          actionButtons: ['home', 'helpdesk'],
        });
        return;
      }

      const pathname = location.pathname;

      // Check if path is avo1 path that needs to be redirected
      const redirects = await UrlRedirectsService.fetchUrlRedirectMap();
      const pathWithHash = pathname + location.hash;
      const key: string | undefined = Object.keys(redirects).find((key) =>
        new RegExp(`^${key}$`, 'gi').test(pathWithHash),
      );
      if (key && redirects[key]) {
        window.location.href = redirects[key];
        return;
      }

      if (pathname === '/' && loginState.message === 'LOGGED_IN') {
        // Redirect the logged out homepage to the logged in homepage is the user is logged in
        navigateFunc('/start', { replace: true });
        return;
      }

      // Check if path is an old media url
      if (/\/media\/[^/]+\/[^/]+/g.test(pathname)) {
        const avo1Id = (pathname.split('/').pop() || '').trim();
        if (avo1Id) {
          // Check if id matches an item mediamosa id
          const itemExternalId =
            await ItemsService.fetchItemExternalIdByMediamosaId(avo1Id);

          if (itemExternalId) {
            // Redirect to the new bundle url, since we want to discourage use of the old avo1 urls
            navigateFunc(
              buildLink(APP_PATH.ITEM_DETAIL.route, { id: itemExternalId }),
              { replace: true },
            );
            return;
          } // else keep analysing

          // Check if id matches a bundle id
          const bundleUuid = await CollectionService.fetchUuidByAvo1Id(avo1Id);
          if (bundleUuid) {
            // Redirect to the new bundle url, since we want to discourage use of the old avo1 urls
            navigateFunc(
              buildLink(APP_PATH.BUNDLE_DETAIL.route, { id: bundleUuid }),
              {
                replace: true,
              },
            );
            return;
          } // else keep analysing
        }
      }

      // Check if path is old item id
      if (/\/pid\/[^/]+/g.test(pathname)) {
        const itemPid = (pathname.split('/').pop() || '').trim();
        navigateFunc(buildLink(APP_PATH.ITEM_DETAIL.route, { id: itemPid }), {
          replace: true,
        });
        return;
      }

      // Special route exception
      // /klaar/archief: redirect teachers to search page with klaar filter
      const commonUserInfo = (loginState as AvoAuthLoginResponseLoggedIn)
        ?.commonUserInfo;
      if (
        pathname === '/klaar/archief' &&
        commonUserInfo &&
        PermissionService.hasPerm(commonUserInfo, PermissionName.SEARCH)
      ) {
        navigateFunc(
          generateSearchLinkString(
            SearchFilter.serie,
            'KLAAR',
            SearchFilter.broadcastDate,
            AvoSearchOrderDirection.DESC,
          ),
          { replace: true },
        );
        return;
      }

      // Check if path points to a content page
      try {
        const contentPage: AvoContentPagePage | null =
          contentPageInfoFromRoute.contentPage;
        if (contentPage) {
          // Path is indeed a content page url
          setRouteInfo({
            type: DynamicRouteType.CONTENT_PAGE,
            data: contentPage,
          });
        }
      } catch (err) {
        console.error({
          message: 'Failed to check if path corresponds to a content page',
          innerException: err,
          additionalInfo: { pathname },
        });
        if (JSON.stringify(err).includes('CONTENT_PAGE_DEPUBLISHED')) {
          const type = (err as any)?.innerException?.additionalInfo
            ?.responseBody?.additionalInfo?.contentPageType;
          setRouteInfo({
            type: DynamicRouteType.DEPUBLISHED_CONTENT_PAGE,
            data: { type },
          });
        } else if (
          commonUserInfo &&
          JSON.stringify(err).includes('CONTENT_PAGE_WRONG_USER_GROUP')
        ) {
          const contentPageUserGroups = (err as any)?.innerException
            ?.additionalInfo?.responseBody?.additionalInfo
            ?.contentPageUserGroups as string[];
          const nonPupilsRoles = contentPageUserGroups.filter(
            (userGroup) => !isPupil(userGroup),
          );

          if (
            contentPageUserGroups.length > 1 &&
            nonPupilsRoles.length === 1 &&
            contentPageUserGroups.every(
              (userGroup) =>
                isPupil(userGroup) || userGroup === nonPupilsRoles[0],
            )
          ) {
            // The page is for pupils and the role that created the page (so technically a pupils only page was the intention)
            setRouteInfo({
              type: DynamicRouteType.PUPIL_ONLY_PAGE,
              data: null,
            });
          } else if (
            contentPageUserGroups.every((userGroup) => !isPupil(userGroup)) &&
            isPupil(commonUserInfo.userGroup?.id)
          ) {
            // THe page was not for pupils and the current user is a pupil
            setRouteInfo({
              type: DynamicRouteType.NOT_FOR_PUPIL_PAGE,
              data: null,
            });
          } else {
            setRouteInfo({
              type: DynamicRouteType.WRONG_USER_GROUP_PAGE,
              data: null,
            });
          }
        } else {
          setRouteInfo({ type: DynamicRouteType.NOT_FOUND, data: null });
        }
      }

      return;
    } catch (err) {
      console.error(
        new CustomError('Error during analysis of the route', err, {
          path: location.pathname,
        }),
      );
      setLoadingInfo({
        state: 'error',
        message: getPageNotFoundError(loginState?.message === 'LOGGED_IN'),
        icon: IconName.search,
      });
    }
  }, [loginState, location.pathname, location.hash, navigateFunc]);

  // Check if current user is logged in
  useEffect(() => {
    if (!loginState && !loginStateLoading && !loginStateError) {
      getLoginState(false);
    } else if (loginStateError) {
      console.error(
        new CustomError('Login error was encountered', null, {
          loginStateError,
          loginState,
        }),
      );
      redirectToErrorPage(
        {
          message: tHtml(
            'dynamic-route-resolver/views/dynamic-route-resolver___er-ging-iets-mis-bij-het-inloggen',
          ),
          actionButtons: ['home', 'helpdesk'],
        },
        location,
      );
    }
  }, [getLoginState, loginState, loginStateError, loginStateLoading, location]);

  useEffect(() => {
    if (loginState && location.pathname) {
      // Analyse the path and determine the routeType
      analyseRoute();
    }
  }, [loginState, location.pathname, analyseRoute]);

  useEffect(() => {
    if (routeInfo) {
      setLoadingInfo({ state: 'loaded' });
    }
  }, [routeInfo]);

  const renderRouteComponent = () => {
    if (routeInfo && routeInfo.type === DynamicRouteType.CONTENT_PAGE) {
      const routeUserGroupIds = (
        (routeInfo.data as DbContentPage).userGroupIds ?? []
      ).map((id: string) => String(id));
      // Check if the page requires the user to be logged in and not both logged in or out
      if (
        routeUserGroupIds.includes(SpecialPermissionGroups.loggedInUsers) &&
        !routeUserGroupIds.includes(SpecialPermissionGroups.loggedOutUsers) &&
        loginState?.message !== 'LOGGED_IN'
      ) {
        return <Navigate to={APP_PATH.REGISTER_OR_LOGIN.route} />;
      }

      return (
        <>
          {routeInfo.data && (
            <>
              <InteractiveTour showButton={false} />
              <ContentPageRenderer
                contentPageInfo={routeInfo.data as ContentPageInfo}
                renderFakeTitle={
                  (routeInfo.data as ContentPageInfo).contentType ===
                  AvoContentPageType.FAQ_ITEM
                }
                renderNoAccessError={renderWrongUserRoleError}
              />
            </>
          )}
        </>
      );
    }
    if (
      routeInfo &&
      routeInfo.type === DynamicRouteType.DEPUBLISHED_CONTENT_PAGE
    ) {
      return (
        <ErrorView
          locationId="dynamic-route-resolver--error"
          icon={IconName.clock}
          actionButtons={['home', 'helpdesk']}
          message={
            GET_ERROR_MESSAGES()[`DEPUBLISHED_${routeInfo.data.type}`] ||
            GET_ERROR_MESSAGES()[`DEPUBLISHED_PAGINA`]
          }
        />
      );
    }
    if (routeInfo && routeInfo.type === DynamicRouteType.PUPIL_ONLY_PAGE) {
      return (
        <ErrorView
          locationId="dynamic-route-resolver--error"
          icon={IconName.clock}
          actionButtons={['help', 'helpdesk']}
          message={GET_ERROR_MESSAGES()[`PUPIL_ONLY`]}
        />
      );
    }
    if (routeInfo && routeInfo.type === DynamicRouteType.NOT_FOR_PUPIL_PAGE) {
      return (
        <ErrorView
          locationId="dynamic-route-resolver--error"
          icon={IconName.clock}
          actionButtons={['pupils']}
          message={GET_ERROR_MESSAGES()[`NOT_FOR_PUPILS`]}
        />
      );
    }
    if (
      routeInfo &&
      routeInfo.type === DynamicRouteType.WRONG_USER_GROUP_PAGE
    ) {
      return renderWrongUserRoleError();
    }
    console.error(
      new CustomError(
        "Route doesn't seem to be a bundle or content page",
        null,
        {
          routeInfo,
          path: location.pathname,
        },
      ),
    );

    window.open(
      stringifyUrl({
        url: `${getEnv('PROXY_URL')}/not-found`,
        query: {
          message: getPageNotFoundError(loginState?.message === 'LOGGED_IN'),
          url: window.location.href,
        },
      }),
      '_self',
    );
    return <FullPageSpinner locationId="dynamic-route-resolver--loading" />;
  };

  return (
    <>
      <SeoMetadata
        title={contentPageInfoFromRoute?.contentPage?.title}
        description={
          contentPageInfoFromRoute?.contentPage?.seo_description ||
          decodeHTML(
            stripHtml(contentPageInfoFromRoute?.contentPage?.description),
          )
        }
        image={contentPageInfoFromRoute.contentPage?.seo_image_path}
        url={contentPageInfoFromRoute.url}
        organisationName="meemoo"
        author={getFullName(
          contentPageInfoFromRoute.contentPage?.profile,
          false,
          false,
        )}
        updatedAt={contentPageInfoFromRoute.contentPage?.updated_at}
        createdAt={contentPageInfoFromRoute?.contentPage?.created_at}
        publishedAt={contentPageInfoFromRoute?.contentPage?.published_at}
      />
      <LoadingErrorLoadedComponent
        loadingInfo={loadingInfo}
        dataObject={routeInfo}
        render={renderRouteComponent}
        locationId="dynamic-route-resolver"
      />
    </>
  );
};

export default DynamicRouteResolver;
