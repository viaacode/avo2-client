import { ApolloProvider as ApolloHooksProvider } from '@apollo/react-hooks';
import classnames from 'classnames';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { ApolloProvider } from 'react-apollo';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, RouteComponentProps, withRouter } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';
import { QueryParamProvider } from 'use-query-params';

import Admin from './admin/Admin';
import { ADMIN_PATH } from './admin/admin.const';
import { SecuredRoute } from './authentication/components';
import { APP_PATH } from './constants';
import { renderRoutes } from './routes';
import { Footer, LoadingErrorLoadedComponent, LoadingInfo, Navigation } from './shared/components';
import ZendeskWrapper from './shared/components/ZendeskWrapper/ZendeskWrapper';
import { ROUTE_PARTS } from './shared/constants';
import { dataService } from './shared/services';
import { waitForTranslations } from './shared/translations/i18n';
import store from './store';
import './styles/main.scss';

interface AppProps extends RouteComponentProps {}

const App: FunctionComponent<AppProps> = props => {
	const isAdminRoute = new RegExp(`^/${ROUTE_PARTS.admin}`, 'g').test(props.location.pathname);

	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	useEffect(() => {
		waitForTranslations.then(() => {
			setLoadingInfo({ state: 'loaded' });
		});
	}, [setLoadingInfo]);

	// Render
	const renderApp = () => {
		return (
			<div className={classnames('o-app', { 'o-app--admin': isAdminRoute })}>
				<ToastContainer
					autoClose={4000}
					className="c-alert-stack"
					closeButton={false}
					closeOnClick={false}
					draggable={false}
					position="bottom-left"
					transition={Slide}
				/>
				{/* TODO: Based on current user permissions */}
				{isAdminRoute ? (
					<SecuredRoute component={Admin} exact={false} path={ADMIN_PATH.DASHBOARD} />
				) : (
					<>
						{props.location.pathname !== APP_PATH.LOGIN.route && (
							<Navigation {...props} />
						)}
						{renderRoutes()}
						{props.location.pathname !== APP_PATH.LOGIN.route && <Footer {...props} />}
						<ZendeskWrapper />
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

const AppWithRouter = withRouter(App);

const Root: FunctionComponent = () => (
	<ApolloProvider client={dataService}>
		<ApolloHooksProvider client={dataService}>
			<Provider store={store}>
				<Router>
					<QueryParamProvider ReactRouterRoute={Route}>
						<AppWithRouter />
					</QueryParamProvider>
				</Router>
			</Provider>
		</ApolloHooksProvider>
	</ApolloProvider>
);

export default Root;
