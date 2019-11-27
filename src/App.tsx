import { ApolloProvider as ApolloHooksProvider } from '@apollo/react-hooks';
import classnames from 'classnames';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { ApolloProvider } from 'react-apollo';
import { connect, Provider } from 'react-redux';
import { BrowserRouter as Router, RouteComponentProps, withRouter } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';

import Admin from './admin/Admin';
import { selectLogin } from './authentication/store/selectors';
import { LoginMessage, LoginResponse } from './authentication/store/types';
import { Footer, Navigation } from './shared/components';
import { ROUTE_PARTS } from './shared/constants';
import { dataService } from './shared/services/data-service';
import { NavigationItem } from './shared/types';

import { APP_PATH } from './constants';
import { renderRoutes } from './routes';
import store, { AppState } from './store';

import './styles/main.scss';

interface AppProps extends RouteComponentProps {
	loginState: LoginResponse | null;
}

const App: FunctionComponent<AppProps> = ({ history, location, loginState }) => {
	const PRIMARY_ITEMS: NavigationItem[] = [
		{ label: 'Home', location: APP_PATH.HOME },
		{
			label: 'Zoeken',
			location: APP_PATH.SEARCH,
			icon: 'search',
		},
		{ label: 'Ontdek', location: APP_PATH.DISCOVER },
		{
			label: 'Mijn Werkruimte',
			location: APP_PATH.WORKSPACE,
			icon: 'briefcase',
		},
		{ label: 'Projecten', location: APP_PATH.PROJECTS },
		{ label: 'Nieuws', location: APP_PATH.NEWS },
	];
	const SECONDARY_ITEMS: NavigationItem[] =
		loginState && loginState.message === LoginMessage.LOGGED_IN
			? [{ label: 'Afmelden', location: APP_PATH.LOGOUT }]
			: [
					{ label: 'Registreren', location: APP_PATH.PUPIL_OR_TEACHER },
					{ label: 'Aanmelden', location: APP_PATH.REGISTER_OR_LOGIN },
			  ];

	// State
	const [menuOpen, setMenuOpen] = useState(false);

	useEffect(() => history.listen(onCloseMenu));

	// Methods
	const onToggleMenu = () => setMenuOpen(!menuOpen);

	const onCloseMenu = () => setMenuOpen(false);

	const isAdminRoute = new RegExp(`^/${ROUTE_PARTS.admin}`, 'g').test(location.pathname);

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
					<Navigation
						primaryItems={PRIMARY_ITEMS}
						secondaryItems={SECONDARY_ITEMS}
						isOpen={menuOpen}
						handleMenuClick={onToggleMenu}
					/>
					{renderRoutes()}
					<Footer />
				</>
			)}
		</div>
	);
};

const mapStateToProps = (state: AppState) => ({
	loginState: selectLogin(state),
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
