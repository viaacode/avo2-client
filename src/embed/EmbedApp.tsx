import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Flex, Spacer, Spinner } from '@viaa/avo2-components';
import React, { type FC, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';

import { LoginMessage } from '../authentication/authentication.types';
import { CustomError } from '../shared/helpers/custom-error';
import { waitForTranslations } from '../shared/translations/i18n';

import Embed from './components/Embed';
import RegisterOrLogin from './components/RegisterOrLogin';
import '../styles/main.scss';
import { useGetLoginStateForEmbed } from './hooks/useGetLoginState';
import store from './store';

const EmbedApp: FC = () => {
	const [translationsLoaded, setTranslationsLoaded] = useState<boolean>(false);

	const { data: loginState, isLoading: loginStateLoading } = useGetLoginStateForEmbed();

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
				<Spacer margin={['top-large', 'bottom-large']}>
					<Flex center>
						<Spinner size="large" />
					</Flex>
				</Spacer>
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
