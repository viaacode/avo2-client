import { ApolloClient, ApolloProvider as ApolloHooksProvider } from '@apollo/react-hooks';
import classnames from 'classnames';
import { createBrowserHistory } from 'history';
import { wrapHistory } from 'oaf-react-router';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { ApolloProvider } from 'react-apollo';
import 'react-datepicker/dist/react-datepicker.css'; // TODO: lazy-load
import { Provider } from 'react-redux';
import { Route, RouteComponentProps, Router, withRouter } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';
import { compose } from 'redux';
import { QueryParamProvider } from 'use-query-params';

import Admin from './admin/Admin';
import { ADMIN_PATH } from './admin/admin.const';
import { SecuredRoute } from './authentication/components';
import { APP_PATH } from './constants';
import { renderRoutes } from './routes';
import { Footer, LoadingErrorLoadedComponent, LoadingInfo, Navigation } from './shared/components';
import ACMIDMNudgeModal from './shared/components/ACMIDMNudgeModal/ACMIDMNudgeModal';
import ZendeskWrapper from './shared/components/ZendeskWrapper/ZendeskWrapper';
import { ROUTE_PARTS } from './shared/constants';
import { CustomError } from './shared/helpers';
import { insideIframe } from './shared/helpers/inside-iframe';
import withUser from './shared/hocs/withUser';
import { dataService } from './shared/services';
import { waitForTranslations } from './shared/translations/i18n';
import store from './store';

import './styles/main.scss';

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

const App: FunctionComponent<RouteComponentProps> = (props) => {
	const isAdminRoute = new RegExp(`^/${ROUTE_PARTS.admin}`, 'g').test(props.location.pathname);

	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	useEffect(() => {
		waitForTranslations
			.then(() => {
				setLoadingInfo({ state: 'loaded' });
			})
			.catch((err) => {
				console.error(new CustomError('Failed to wait for translations', err));
			});
	}, [setLoadingInfo]);

	// Render
	const renderApp = () => {
		const isInsideIframe = insideIframe();
		const isLoginRoute = props.location.pathname === APP_PATH.LOGIN.route;

		return (
			<div
				className={classnames('o-app', {
					'o-app--admin': isAdminRoute,
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
				/>
				{isAdminRoute ? (
					<SecuredRoute component={Admin} exact={false} path={ADMIN_PATH.DASHBOARD} />
				) : (
					<>
						{!isLoginRoute && <Navigation {...props} />}
						{renderRoutes()}
						{!isLoginRoute && !isInsideIframe && <Footer {...props} />}
						{!isInsideIframe && <ZendeskWrapper />}
						<ACMIDMNudgeModal />
					</>
				)}
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

const AppWithRouter = compose(withRouter, withUser)(App) as FunctionComponent;

const Root: FunctionComponent = () => (
	<ApolloProvider client={dataService}>
		<ApolloHooksProvider client={dataService as unknown as ApolloClient<any>}>
			<Provider store={store}>
				<Router history={history as any}>
					<QueryParamProvider ReactRouterRoute={Route}>
						<AppWithRouter />
					</QueryParamProvider>
				</Router>
			</Provider>
		</ApolloHooksProvider>
	</ApolloProvider>
);

export default Root;
