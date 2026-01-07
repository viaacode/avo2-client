import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Flex, IconName, Spinner } from '@viaa/avo2-components';
import queryString from 'query-string';
import { type FC, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import { LoginMessage } from '../authentication/authentication.types';
import { EmbedCodeService } from '../embed-code/embed-code-service';
import { toEmbedCodeDetail } from '../embed-code/helpers/links';
import { ErrorView } from '../error/views/ErrorView';
import { CustomError } from '../shared/helpers/custom-error';
import { isUuid } from '../shared/helpers/isUuid';
import { ReactRouter7Adapter } from '../shared/helpers/routing/react-router-v7-adapter-for-use-query-params';
import { QueryParamProvider } from '../shared/helpers/routing/use-query-params-ssr';
import { tText } from '../shared/helpers/translate-text';
import { loadTranslations } from '../shared/translations/i18n';
import { Embed } from './components/Embed';
import { EmbedErrorView } from './components/EmbedErrorView';
import { RegisterOrLogin } from './components/RegisterOrLogin';
import { useGetLoginStateForEmbed } from './hooks/useGetLoginStateForEmbed';
import '@viaa/avo2-components/styles.css';
import '@meemoo/react-components/styles.css';
import '@meemoo/admin-core-ui/admin.css';
import '@meemoo/admin-core-ui/client.css';
import '../App.scss';
import '../styles/main.scss';

const EmbedApp: FC = () => {
  const location = useLocation();

  const [translationsLoaded, setTranslationsLoaded] = useState<boolean>(false);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [embedId, setEmbedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorIcon, setErrorIcon] = useState<IconName | null>(null);
  const [parentPageUrl, setParentPageUrl] = useState<string>('');
  const [showMetadata, setShowMetadata] = useState<boolean>(false);
  const ltiJwtToken = EmbedCodeService.getJwtToken();

  const {
    data: loginState,
    isLoading: loginStateLoading,
    refetch: refetchLoginState,
  } = useGetLoginStateForEmbed();

  const isRenderedInAnIframe = () => {
    let isIframe = false;

    // Try to access the location href of the parent. If we are in an Iframe, this will fail
    try {
      window.parent?.location.href;
    } catch (err) {
      // Most likely this is an iframe, and we encountered a security error for a cross-origin frame
      // There is no other reason why the line above would fail otherwise
      isIframe = true;
    }
    return isIframe;
  };

  /*
   * Method called by the explicit click on the reload button of the Error View
   * Normally we should have the original URL with the JWT token, but just in case we check and log an error if something is wrong
   */
  const onReloadPage = useCallback(() => {
    if (!originalUrl) {
      console.error("Can't reload iframe, original iframe url was not stored");
      return;
    }
    window.location.replace(originalUrl);
  }, [originalUrl]);

  /**
   * Refetch the login state when the browser tab becomes visible again and the user is not logged in yet
   */
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (
        document.visibilityState === 'visible' &&
        loginState?.message !== LoginMessage.LOGGED_IN
      ) {
        // Refetch the login state when the tab becomes visible
        // Since the user might just have logged in through the external browser tab
        await refetchLoginState();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loginState, refetchLoginState]);

  /**
   * Store query params in specific state variables
   */
  useEffect(() => {
    setOriginalUrl(window.location.href);
    const query = new URLSearchParams(location?.search || '');

    if (!query) {
      return;
    }

    EmbedCodeService.setJwtToken(query.get('jwtToken') || '');
    setShowMetadata(query.get('showMetadata') === 'true');

    const urlInfo = queryString.parseUrl(window.location.href);
    const foundEmbedId =
      query.get('embedId') || urlInfo.url.split('/').pop() || '';

    if (foundEmbedId && isUuid(foundEmbedId)) {
      setEmbedId(foundEmbedId);

      // If the embed code url is loaded outside an iframe, we'll redirect to the view url of that embed
      // eg: /embed/506951e8-a3c9-4e2a-80aa-8e68531add20 => /ingesloten-fragment/506951e8-a3c9-4e2a-80aa-8e68531add20
      // https://meemoo.atlassian.net/browse/AVO-3719
      if (!isRenderedInAnIframe()) {
        const newUrl = toEmbedCodeDetail(foundEmbedId);
        window.location.href = newUrl;
        window.history.replaceState(null, '', newUrl);
        return;
      }
    }

    // Get the parentPage from the URL query parameters if they are present
    const parentPage = query.get('parentPageUrl');
    if (!parentPage) {
      console.error(
        'Parent page niet beschikbaar, geen tracking mogelijk voor',
        window.location.href,
        foundEmbedId,
      );
    }
    setParentPageUrl(parentPage || '');

    // Get the error message and icon from the URL query parameters if they are present
    const errorMessageTemp = query.get('errorMessage');
    if (errorMessageTemp) {
      setErrorMessage(errorMessageTemp);
    }

    const errorIconTemp = query.get('icon');
    if (errorIconTemp) {
      setErrorIcon(errorIconTemp as IconName);
    }

    window.history.replaceState(null, '', window.location.href.split('?')[0]);
  }, []);

  /**
   * Wait for translations to be loaded before rendering the app
   */
  useEffect(() => {
    loadTranslations()
      .then(() => {
        setTranslationsLoaded(true);
      })
      .catch((err) => {
        console.error(new CustomError('Failed to wait for translations', err));
      });
  }, [setTranslationsLoaded]);

  // Render
  const renderApp = useCallback(() => {
    if (errorMessage) {
      return <EmbedErrorView message={errorMessage} icon={errorIcon} />;
    }

    if (loginStateLoading || !translationsLoaded) {
      // Wait for login check
      return (
        <Flex center style={{ height: '100%' }}>
          <Spinner size="large" />
        </Flex>
      );
    }

    if (!ltiJwtToken) {
      // No JWT token in URL, redirect to error page
      return (
        <ErrorView
          locationId="embed-app--error"
          message={tText(
            'embed/embed-app___deze-embedcode-heeft-geen-jwt-query-param-en-kan-dus-niet-geladen-worden',
          )}
          icon={IconName.alertTriangle}
        />
      );
    }

    if (loginState?.message !== LoginMessage.LOGGED_IN) {
      return <RegisterOrLogin />;
    }

    // Check if the page requires the user to be logged in and not both logged in or out
    return (
      <Embed
        embedId={embedId}
        showMetadata={showMetadata}
        parentPage={parentPageUrl}
        onReload={onReloadPage}
      />
    );
  }, [
    embedId,
    errorIcon,
    errorMessage,
    loginState?.message,
    loginStateLoading,
    ltiJwtToken,
    onReloadPage,
    parentPageUrl,
    showMetadata,
    translationsLoaded,
  ]);

  return renderApp();
};

const EmbedAppWithRouter = EmbedApp;

const queryClient = new QueryClient();

export const EmbedRoot: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <QueryParamProvider adapter={ReactRouter7Adapter}>
          <EmbedAppWithRouter />
        </QueryParamProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
