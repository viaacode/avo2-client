import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type Avo } from '@viaa/avo2-types';
import { createBrowserHistory } from 'history';
import { wrapHistory } from 'oaf-react-router';
import React, { type FC, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { Switch } from 'react-router';
import {
	Route,
	type RouteComponentProps,
	BrowserRouter as Router,
	withRouter,
} from 'react-router-dom';
import { compose } from 'redux';
import { QueryParamProvider } from 'use-query-params';

import { APP_PATH } from '../constants';
import { ErrorView } from '../error/views';
import {
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { CustomError } from '../shared/helpers';
import withUser, { type UserProps } from '../shared/hocs/withUser';
import useTranslation from '../shared/hooks/useTranslation';
import { ToastService } from '../shared/services/toast-service';
import { waitForTranslations } from '../shared/translations/i18n';

import Embed from './Embed';
import store from './store';

import '../styles/main.scss';
import { renderAuthenticationRoutes } from '../authentication/authentication.routes';
import { SecuredRoute } from '../authentication/components';

const history = createBrowserHistory();
wrapHistory(history, {
	smoothScroll: false,
	shouldHandleAction: (
		previousLocation: RouteComponentProps['location'],
		nextLocation: RouteComponentProps['location']
	) => {
		// We don't want to set focus when only the hash changes
		return (
			previousLocation.pathname !== nextLocation.pathname ||
			previousLocation.search !== nextLocation.search
		);
	},
});

const EmbedApp: FC<RouteComponentProps & UserProps> = () => {
	const { tHtml } = useTranslation();
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	/**
	 * Wait for translations to be loaded before rendering the app
	 */
	useEffect(() => {
		waitForTranslations
			.then(() => {
				setLoadingInfo({ state: 'loaded' });
			})
			.catch((err) => {
				console.error(new CustomError('Failed to wait for translations', err));
			});
	}, [setLoadingInfo]);

	/**
	 * Redirect after linking an account the the hetarchief account (eg: leerid, smartschool, klascement)
	 */
	useEffect(() => {
		if (loadingInfo.state === 'loaded') {
			const url = new URL(window.location.href);
			const linked: Avo.Auth.IdpLinkedSuccessQueryParam = 'linked';
			const hasLinked = url.searchParams.get(linked) !== null;
			if (hasLinked) {
				ToastService.success(tHtml('app___je-account-is-gekoppeld'));
				url.searchParams.delete(linked);
				history.replace(url.toString().replace(url.origin, ''));
			}
		}
	}, [loadingInfo, tHtml]);

	// Render
	const renderApp = () => {
		// Check if the page requires the user to be logged in and not both logged in or out
		return (
			<div className="o-app">
				<Switch>
					{renderAuthenticationRoutes()}
					<Route
						path={APP_PATH.ERROR.route}
						exact
						component={ErrorView}
						key="error-view"
					/>
					<SecuredRoute component={Embed} path="/" key="embed" />,
				</Switch>
			</div>
		);
	};

	return (
		<>
			<LoadingErrorLoadedComponent
				loadingInfo={loadingInfo}
				dataObject={{}}
				render={renderApp}
			/>
		</>
	);
};

const EmbedAppWithRouter = compose(withRouter, withUser)(EmbedApp) as FC;

const queryClient = new QueryClient();

const EmbedRoot: FC = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<Provider store={store}>
				<Router>
					<QueryParamProvider ReactRouterRoute={Route}>
						<EmbedAppWithRouter />
					</QueryParamProvider>
				</Router>
			</Provider>
		</QueryClientProvider>
	);
};

export default EmbedRoot;
