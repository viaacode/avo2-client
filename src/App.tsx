import { PermissionName } from '@viaa/avo2-types';
import { clsx } from 'clsx';
import { isEqual, noop, uniq } from 'es-toolkit';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { type FC, useCallback, useEffect, useState } from 'react';
import { MetaDescriptor, Outlet, useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';

import pkg from '../package.json' with { type: 'json' };

import { SpecialUserGroupId } from './admin/user-groups/user-group.const';
import { commonUserAtom } from './authentication/authentication.store';
import { getLoginStateAtom } from './authentication/authentication.store.actions';
import { PermissionService } from './authentication/helpers/permission-service';
import { ConfirmModal } from './shared/components/ConfirmModal/ConfirmModal';
import { ROUTE_PARTS } from './shared/constants/routes';
import { getEnv } from './shared/helpers/env';
import { ReactRouter7Adapter } from './shared/helpers/routing/react-router-v7-adapter-for-use-query-params';
import { QueryParamProvider } from './shared/helpers/routing/use-query-params-ssr';
import { tHtml } from './shared/helpers/translate-html';
import { tText } from './shared/helpers/translate-text';
import { useHideZendeskWidget } from './shared/hooks/useHideZendeskWidget';
import { usePageLoaded } from './shared/hooks/usePageLoaded';
import { ToastService } from './shared/services/toast-service';
import { embedFlowAtom, historyLocationsAtom } from './shared/store/ui.store';

import 'react-datepicker/dist/react-datepicker.css'; // TODO: lazy-load
import '@meemoo/admin-core-ui/styles.css';
import './App.scss';
import './styles/main.scss';
import { AdminConfig } from '@meemoo/admin-core-ui/admin';
import { AdminConfigManager } from '@meemoo/admin-core-ui/client';
import {
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { AvoAuthIdpLinkedSuccessQueryParam } from '@viaa/avo2-types';
import { getAdminCoreConfig } from './admin/shared/helpers/get-admin-core-config.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      placeholderData: keepPreviousData,
      retry: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
    },
  },
});

export const App: FC = () => {
  const location = useLocation();
  const navigateFunc = useNavigate();
  const getLoginState = useSetAtom(getLoginStateAtom);

  const commonUser = useAtomValue(commonUserAtom);
  const [historyLocations, setHistoryLocations] = useAtom(historyLocationsAtom);
  const setEmbedFlow = useSetAtom(embedFlowAtom);

  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] =
    useState(false);

  const isAdminRoute = new RegExp(`^/${ROUTE_PARTS.admin}`, 'g').test(
    location.pathname,
  );
  const isPupilUser = [
    SpecialUserGroupId.PupilSecondary,
    SpecialUserGroupId.PupilElementary,
  ]
    .map(String)
    .includes(String(commonUser?.userGroup?.id));
  const query = new URLSearchParams(location?.search || '');
  const isPreviewRoute = query.get('preview') === 'true';

  // const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({
  //   state: 'loading',
  // });

  const consoleLogClientAndServerVersions = useCallback(async () => {
    console.info(`%c client version: ${pkg.version}`, 'color: #bada55');
    const { fetchWithLogoutJson } = await import(
      '@meemoo/admin-core-ui/client'
    );
    const proxyUrl = getEnv('PROXY_URL');
    if (!proxyUrl) {
      console.warn('PROXY_URL is not defined, cannot fetch server version');
      return;
    }
    const response = await fetchWithLogoutJson<{ version: string }>(proxyUrl);

    console.info(`%c server version: ${response.version}`, 'color: #bada55');
  }, []);

  /**
   * Scroll to the element with the id that is in the hash of the url
   */
  const handlePageLoaded = useCallback(() => {
    if (window.location.hash) {
      const decodedHash = decodeURIComponent(window.location.hash).replaceAll(
        ' ',
        '-',
      );
      document
        .querySelector(decodedHash)
        ?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);
  usePageLoaded(handlePageLoaded, !!location.hash);

  /**
   * Set admin core config once navigateFunc is available
   * Since during route loading we only set the config, but we don't have access to navigateFunc yet
   */
  useEffect(() => {
    const config: AdminConfig = getAdminCoreConfig(navigateFunc);
    AdminConfigManager.setConfig(config);
  }, [navigateFunc]);

  /**
   * Load login status as soon as possible
   */
  useEffect(() => {
    getLoginState(false);
  }, [getLoginState]);

  /**
   * Write the client and server versions to the console
   */
  useEffect(() => {
    consoleLogClientAndServerVersions();
  }, [consoleLogClientAndServerVersions]);

  /**
   * Hide zendesk when a pupil is logged in
   */
  useHideZendeskWidget(commonUser, isPupilUser);

  /**
   * Redirect after linking an account the the hetarchief account (eg: leerid, smartschool, klascement)
   */
  useEffect(() => {
    // if (loadingInfo.state === 'loaded') {
    const url = new URL(window.location.href);
    const linked: AvoAuthIdpLinkedSuccessQueryParam = 'linked';
    const hasLinked = url.searchParams.get(linked) !== null;
    if (hasLinked) {
      ToastService.success(tHtml('app___je-account-is-gekoppeld'));
      url.searchParams.delete(linked);
      navigateFunc(url.toString().replace(url.origin, ''), { replace: true });
    }
    // }
  }, [navigateFunc]);

  /**
   * Keep track of route changes and track the 3 last visited pages for tracking events
   * Store them in the redux store
   */
  useEffect(() => {
    const existingHistoryLocations = historyLocations;
    const newHistoryLocations = uniq([
      ...existingHistoryLocations,
      location.pathname,
    ]).slice(-3);
    if (!isEqual(existingHistoryLocations, newHistoryLocations)) {
      setHistoryLocations(newHistoryLocations);
    }
    handlePageLoaded();
  }, [location, historyLocations, setHistoryLocations, handlePageLoaded]);

  /**
   * Check if this window was opened from somewhere else and get the embed-flow query param
   * Store the embed-flow query param in the redux store
   */
  useEffect(() => {
    const url = new URL(window.location.href);
    const embedFlow = url.searchParams.get('embed-flow') || '';
    const isOpenedByOtherPage = !!window.opener;

    if (isOpenedByOtherPage && !!embedFlow && commonUser) {
      if (
        PermissionService.hasPerm(
          commonUser,
          PermissionName.EMBED_ITEMS_ON_OTHER_SITES,
        )
      ) {
        setEmbedFlow(embedFlow);
      } else {
        ToastService.info(
          tHtml('app___je-hebt-geen-toegang-tot-de-embed-functionaliteit'),
        );
      }
    } else if (embedFlow) {
      console.error(
        "Embed flow query param is present, but the page wasn't opened from another page, so window.opener is undefined. Cannot start the embed flow",
      );
    }
  }, [setEmbedFlow, commonUser]);

  // Render
  const renderApp = () => {
    return (
      <div
        className={clsx('o-app', {
          'o-app--admin': isAdminRoute,
          'o-app--preview': isPreviewRoute,
        })}
      >
        <ToastContainer
          autoClose={4000}
          className="c-alert-stack"
          closeButton={false}
          closeOnClick={false}
          draggable={false}
          position="bottom-left"
          transition={Slide}
          hideProgressBar={true}
          pauseOnFocusLoss={true}
          pauseOnHover={true}
        />
        <Outlet />
        <ConfirmModal
          className="c-modal__unsaved-changes"
          isOpen={isUnsavedChangesModalOpen}
          confirmCallback={() => {
            setIsUnsavedChangesModalOpen(false);
            (confirmUnsavedChangesCallback || noop)(true);
            confirmUnsavedChangesCallback = null;
          }}
          onClose={() => {
            setIsUnsavedChangesModalOpen(false);
            (confirmUnsavedChangesCallback || noop)(false);
            confirmUnsavedChangesCallback = null;
          }}
          cancelLabel={tText('app___blijven')}
          confirmLabel={tText('app___verlaten')}
          title={tHtml('app___wijzigingen-opslaan')}
          body={tHtml(
            'app___er-zijn-nog-niet-opgeslagen-wijzigingen-weet-u-zeker-dat-u-de-pagina-wil-verlaten',
          )}
          confirmButtonType="primary"
        />
      </div>
    );
  };

  return (
    <QueryParamProvider adapter={ReactRouter7Adapter}>
      <QueryClientProvider client={queryClient}>
        {/*<LoadingErrorLoadedComponent*/}
        {/*  loadingInfo={loadingInfo}*/}
        {/*  dataObject={{}}*/}
        {/*  render={}*/}
        {/*  locationId="app"*/}
        {/*/>*/}
        {renderApp()}
      </QueryClientProvider>
    </QueryParamProvider>
  );
};

export function meta(): MetaDescriptor[] {
  // {/* TODO react 19 */}
  // {/* https://reactrouter.com/start/framework/route-module#meta */}
  // <title>Het Archief voor Onderwijs</title>
  // <meta charSet="utf-8" />
  // <meta name="viewport" content="width=device-width, initial-scale=1" />
  // <meta name="theme-color" content="#000000" />
  return [
    { title: 'Het Archief voor Onderwijs' },
    { charSet: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#000000' },
  ];
}

export function links() {
  // {/* TODO react 19 */}
  // {/* https://reactrouter.com/start/framework/route-module#meta */}
  // <link rel="shortcut icon" href="/favicon.ico" />
  // <link rel="manifest" href="/manifest.json" />
  // <link rel="preload" href="/fonts/montserrat-italic.woff2" as="font" />
  // <link rel="preload" href="/fonts/montserrat-medium.woff2" as="font" />
  // <link
  //     rel="preload"
  //     href="/fonts/avenir-lt-std-medium.woff2"
  //     as="font"
  // />
  return [
    {
      rel: 'shortcut icon',
      href: '/favicon.ico',
    },
    {
      rel: 'manifest',
      href: '/manifest.json',
    },
    {
      rel: 'preload',
      href: '/fonts/montserrat-italic.woff2',
      as: 'font',
    },
    {
      rel: 'preload',
      href: '/fonts/montserrat-medium.woff2',
      as: 'font',
    },
    {
      rel: 'preload',
      href: '/fonts/avenir-lt-std-medium.woff2',
      as: 'font',
    },
  ];
}

export default App;

let confirmUnsavedChangesCallback: ((navigateAway: boolean) => void) | null;
