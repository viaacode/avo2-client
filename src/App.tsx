import { ApolloProvider as ApolloHooksProvider } from '@apollo/react-hooks';
import classnames from 'classnames';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { ApolloProvider } from 'react-apollo';
import { connect, Provider } from 'react-redux';
import { BrowserRouter as Router, RouteComponentProps, withRouter } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';

import { selectLogin } from './authentication/store/selectors';
import { LoginResponse } from './authentication/store/types';
import { Footer, Navigation, Sidebar } from './shared/components';
import { dataService } from './shared/services/data-service';
import { NavigationItem } from './shared/types/types';

import { RouteParts } from './constants';
import { renderRoutes } from './routes';
import store, { AppState } from './store';

import './styles/main.scss';

interface AppProps extends RouteComponentProps {
	loginState: LoginResponse | null;
}

const App: FunctionComponent<AppProps> = ({ history, location, loginState }) => {
	const {
		Admin,
		Discover,
		Search,
		Projects,
		News,
		Logout,
		RegisterOrLogin,
		Menus,
		Workspace,
		Register,
	} = RouteParts;
	const PRIMARY_ITEMS: NavigationItem[] = [
		{ label: 'Home', location: '/' },
		{
			label: 'Zoeken',
			location: `/${Search}`,
			icon: 'search',
		},
		{ label: 'Ontdek', location: `/${Discover}` },
		{
			label: 'Mijn Werkruimte',
			location: `/${Workspace}`,
			icon: 'briefcase',
		},
		{ label: 'Projecten', location: `/${Projects}` },
		{ label: 'Nieuws', location: `/${News}` },
	];
	const SECONDARY_ITEMS: NavigationItem[] =
		loginState && loginState.message === 'LOGGED_IN'
			? [{ label: 'Afmelden', location: `/${Logout}` }]
			: [
					{ label: 'Registreren', location: `/${Register}` },
					{ label: 'Aanmelden', location: `/${RegisterOrLogin}` },
			  ];

	// State
	const [menuOpen, setMenuOpen] = useState(false);

	useEffect(() => history.listen(onCloseMenu));

	// Methods
	const onToggleMenu = () => setMenuOpen(!menuOpen);

	const onCloseMenu = () => setMenuOpen(false);

	const isAdminRoute = new RegExp(`^/${Admin}`, 'g').test(location.pathname);

	// Render
	const renderAdmin = () => (
		<div className="u-d-flex">
			<Sidebar
				headerLink={`/${Admin}`}
				navItems={[{ label: 'Navigatie', location: `/${Admin}/${Menus}` }]}
			/>
			<div className="u-content-flex u-scroll">{renderRoutes()}</div>
		</div>
	);

	const renderApp = () => (
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
	);

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
			{isAdminRoute ? renderAdmin() : renderApp()}
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
