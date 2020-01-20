import { ApolloProvider as ApolloHooksProvider } from '@apollo/react-hooks';
import classnames from 'classnames';
import React, { FunctionComponent } from 'react';
import { ApolloProvider } from 'react-apollo';
import { connect, Provider } from 'react-redux';
import { BrowserRouter as Router, RouteComponentProps, withRouter } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';
import Zendesk from 'react-zendesk';

import Admin from './admin/Admin';
import { APP_PATH } from './constants';
import { renderRoutes } from './routes';
import { Footer, Navigation } from './shared/components';
import { ROUTE_PARTS } from './shared/constants';
import { dataService } from './shared/services/data-service';
import { selectIsModalOpen } from './shared/store/selectors';
import './shared/translations/i18n';
import store from './store';
import './styles/main.scss';

interface AppProps extends RouteComponentProps {
	isModalOpen: boolean;
}

const App: FunctionComponent<AppProps> = props => {
	const isAdminRoute = new RegExp(`^/${ROUTE_PARTS.admin}`, 'g').test(props.location.pathname);

	// Render
	if (props.isModalOpen) {
		document.body.classList.add('modal-open');
	} else {
		document.body.classList.remove('modal-open');
	}
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
					{props.location.pathname !== APP_PATH.LOGIN_AVO && <Navigation {...props} />}
					{renderRoutes()}
					{props.location.pathname !== APP_PATH.LOGIN_AVO && <Footer {...props} />}
					<Zendesk zendeskKey="2aae0d3b-eb63-48ee-89ef-a7adcfacc410" />
				</>
			)}
		</div>
	);
};

const mapStateToProps = (state: any) => ({
	isModalOpen: selectIsModalOpen(state),
});

const AppWithRouter = withRouter(connect(mapStateToProps)(App));

const Root: FunctionComponent = () => (
	<ApolloProvider client={dataService}>
		<ApolloHooksProvider client={dataService}>
			<Provider store={store}>
				<Router>
					<AppWithRouter />
				</Router>
			</Provider>
		</ApolloHooksProvider>
	</ApolloProvider>
);

export default Root;
