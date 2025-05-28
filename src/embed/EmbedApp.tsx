import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Flex, type IconName, Spinner } from '@viaa/avo2-components';
import { IconNameSchema } from '@viaa/avo2-components/dist/components/Icon/Icon.types';
import { parse } from 'query-string';
import React, { type FC, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { Route, type RouteComponentProps } from 'react-router';
import { BrowserRouter, withRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';

import { LoginMessage } from '../authentication/authentication.types';
import { EmbedCodeService } from '../embed-code/embed-code-service';
import { ErrorView } from '../error/views';
import { CustomError } from '../shared/helpers/custom-error';
import { tText } from '../shared/helpers/translate-text';
import { waitForTranslations } from '../shared/translations/i18n';
import store from '../store';

import Embed from './components/Embed';
import { EmbedErrorView } from './components/EmbedErrorView';
import RegisterOrLogin from './components/RegisterOrLogin';
import { useGetLoginStateForEmbed } from './hooks/useGetLoginState';

import '../styles/main.scss';

const EmbedApp: FC<RouteComponentProps> = ({ location }) => {
	const query = parse(location?.search || '');
	const [translationsLoaded, setTranslationsLoaded] = useState<boolean>(false);

	const { data: loginState, isLoading: loginStateLoading } = useGetLoginStateForEmbed();
	const [ltiJwtToken, setLtiJwtToken] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [errorIcon, setErrorIcon] = useState<IconName | null>(null);

	useEffect(() => {
		// Get the JWT token from the URL
		const jwtToken = EmbedCodeService.getJwtTokenFromUrl();
		if (jwtToken) {
			setLtiJwtToken(jwtToken);
		}
	}, []);

	useEffect(() => {
		const errorMessageTemp = query['errorMessage'];
		if (errorMessageTemp && typeof errorMessageTemp === 'string') {
			setErrorMessage(errorMessageTemp);
		}

		const errorIconTemp = query['icon'];
		if (errorIconTemp && typeof errorIconTemp === 'string') {
			setErrorIcon(errorIconTemp as IconName);
		}
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
