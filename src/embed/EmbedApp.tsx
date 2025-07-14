import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Flex, IconName, Spinner } from '@viaa/avo2-components';
import { noop } from 'lodash-es';
import queryString from 'query-string';
import React, { type FC, useCallback, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { Route, type RouteComponentProps } from 'react-router';
import { BrowserRouter, withRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';

import { LoginMessage } from '../authentication/authentication.types';
import { EmbedCodeService } from '../embed-code/embed-code-service';
import { ErrorView } from '../error/views';
import { CustomError } from '../shared/helpers/custom-error';
import { isUuid } from '../shared/helpers/isUuid';
import { tText } from '../shared/helpers/translate-text';
import { waitForTranslations } from '../shared/translations/i18n';
import store from '../store';

import Embed from './components/Embed';
import { EmbedErrorView } from './components/EmbedErrorView';
import RegisterOrLogin from './components/RegisterOrLogin';
import { useGetLoginStateForEmbed } from './hooks/useGetLoginStateForEmbed';

import '../styles/main.scss';

const EmbedApp: FC<RouteComponentProps> = ({ location }) => {
	const [translationsLoaded, setTranslationsLoaded] = useState<boolean>(false);
	const [query, setQuery] = useState<URLSearchParams | null>(null);
	const [originalUrl, setOriginalUrl] = useState<string | null>(null);
	const [embedId, setEmbedId] = useState<string | null>(null);
	const ltiJwtToken = EmbedCodeService.getJwtToken();

	const {
		data: loginState,
		isLoading: loginStateLoading,
		refetch: checkLoginAgain,
	} = useGetLoginStateForEmbed();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [errorIcon, setErrorIcon] = useState<IconName | null>(null);

	const doCheckLoginStateAgain = async () => {
		await checkLoginAgain()
			.then(noop)
			.catch((err) => {
				console.error(new CustomError('Failed to check login', err));
			});
	};

	/*
	 * Method called by the explicit click on the reload button of the Error View
	 * Normally we should have the original URL with the JWT token, but just in case we check and log an error if something is wrong
	 */
	const onReloadPage = () => {
		if (!originalUrl) {
			console.error("Can't reload iframe, original iframe url was not stored");
			return;
		}
		window.location.replace(originalUrl);
	};

	/**
	 * Store URL query params in the state
	 */
	useEffect(() => {
		setQuery(new URLSearchParams(location?.search || ''));
		setOriginalUrl(window.location.href);
	}, []);

	/**
	 * refresh login state once we have the LTI token, otherwise we will always get a LOGGED_OUT message
	 */
	useEffect(() => {
		doCheckLoginStateAgain();
	}, [doCheckLoginStateAgain]);

	/**
	 * Store query params in specific state variables
	 */
	useEffect(() => {
		if (!query) {
			return;
		}

		EmbedCodeService.setJwtToken(query.get('jwtToken') || '');

		const urlInfo = queryString.parseUrl(window.location.href);
		const foundEmbedId = query.get('embedId') || urlInfo.url.split('/').pop() || '';

		if (foundEmbedId && isUuid(foundEmbedId)) {
			setEmbedId(foundEmbedId);
		}

		// Get the parentPage from the URL query parameters if they are present
		const parentPage = query.get('parentPage');
		if (!parentPage) {
			console.error(
				'Parent page niet beschikbaar, geen tracking mogelijk voor',
				window.location.href,
				foundEmbedId
			);
		}

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
	}, [query]);

	/**
	 * Wait for translations to be loaded before rendering the app
	 */
	useEffect(() => {
		waitForTranslations
			.then(() => {
				setTranslationsLoaded(true);
			})
			.catch((err) => {
				console.error(new CustomError('Failed to wait for translations', err));
			});
	}, [setTranslationsLoaded]);

	// Render
	const renderApp = () => {
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
					message={tText(
						'embed/embed-app___deze-embedcode-heeft-geen-jwt-query-param-en-kan-dus-niet-geladen-worden'
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
				showMetadata={query?.get('showMetadata') === 'true'}
				parentPage={query?.get('parentPageUrl') || ''}
				onReload={onReloadPage}
			/>
		);
	};

	return renderApp();
};

const EmbedAppWithRouter = withRouter(EmbedApp);

const queryClient = new QueryClient();

const EmbedRoot: FC = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<Provider store={store}>
				<BrowserRouter>
					<QueryParamProvider ReactRouterRoute={Route}>
						<EmbedAppWithRouter />
					</QueryParamProvider>
				</BrowserRouter>
			</Provider>
		</QueryClientProvider>
	);
};

export default EmbedRoot;
