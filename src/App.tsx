import { ApolloProvider as ApolloHooksProvider } from '@apollo/react-hooks';
import classnames from 'classnames';
import React, { FunctionComponent } from 'react';
import { ApolloProvider } from 'react-apollo';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, RouteComponentProps, withRouter } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';
import Zendesk from 'react-zendesk';
import { QueryParamProvider } from 'use-query-params';

import Admin from './admin/Admin';
import { APP_PATH } from './constants';
import { renderRoutes } from './routes';
import { CookieDeclaration, Footer, Navigation } from './shared/components';
import { ROUTE_PARTS } from './shared/constants';
import { getEnv } from './shared/helpers';
import { dataService } from './shared/services';
import './shared/translations/i18n';
import store from './store';
import './styles/main.scss';

interface AppProps extends RouteComponentProps {}

const App: FunctionComponent<AppProps> = props => {
	const isAdminRoute = new RegExp(`^/${ROUTE_PARTS.admin}`, 'g').test(props.location.pathname);

	// Render
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
				<Admin />
			) : (
				<>
					{props.location.pathname !== APP_PATH.LOGIN.route && <Navigation {...props} />}
					{renderRoutes()}
					{props.location.pathname !== APP_PATH.LOGIN.route && <Footer {...props} />}
					<Zendesk zendeskKey={getEnv('ZENDESK_KEY') as string} />
					<CookieDeclaration />
				</>
			)}
		</div>
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
