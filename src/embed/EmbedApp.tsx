import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Flex, Spinner } from '@viaa/avo2-components';
import { IconNameSchema } from '@viaa/avo2-components/dist/components/Icon/Icon.types';
import React, { type FC, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';

import { LoginMessage } from '../authentication/authentication.types';
import { EmbedCodeService } from '../embed-code/embed-code-service';
import { ErrorView } from '../error/views';
import { CustomError } from '../shared/helpers/custom-error';
import { tText } from '../shared/helpers/translate-text';
import { waitForTranslations } from '../shared/translations/i18n';
import store from '../store';

import Embed from './components/Embed';
import RegisterOrLogin from './components/RegisterOrLogin';
import { useGetLoginStateForEmbed } from './hooks/useGetLoginState';

import '../styles/main.scss';

const EmbedApp: FC = () => {
	const [translationsLoaded, setTranslationsLoaded] = useState<boolean>(false);

	const { data: loginState, isLoading: loginStateLoading } = useGetLoginStateForEmbed();
	const [ltiJwtToken, setLtiJwtToken] = useState<string | null>(null);

	useEffect(() => {
		// Get the JWT token from the URL
		const jwtToken = EmbedCodeService.getJwtTokenFromUrl();
		if (jwtToken) {
			setLtiJwtToken(jwtToken);
		}
	}, []);

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
					icon={IconNameSchema.alertTriangle}
				/>
			);
		}

		if (loginState?.message !== LoginMessage.LOGGED_IN) {
			return <RegisterOrLogin />;
		}

		// Check if the page requires the user to be logged in and not both logged in or out
		return <Embed />;
	};

	return renderApp();
};

const queryClient = new QueryClient();

const EmbedRoot: FC = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<Provider store={store}>
				<BrowserRouter>
					<QueryParamProvider ReactRouterRoute={Route}>
						<EmbedApp />
					</QueryParamProvider>
				</BrowserRouter>
			</Provider>
		</QueryClientProvider>
	);
};

export default EmbedRoot;
