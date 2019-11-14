import { ApolloProvider as ApolloHooksProvider } from '@apollo/react-hooks';
import classnames from 'classnames';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { ApolloProvider } from 'react-apollo';
import { connect, Provider } from 'react-redux';
import { BrowserRouter as Router, RouteComponentProps, withRouter } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';

import { Flex } from '@viaa/avo2-components';

import { ADMIN_PATH } from './admin/admin.const';
import { Sidebar } from './admin/components';
import { selectLogin } from './authentication/store/selectors';
import { LoginResponse } from './authentication/store/types';
import { Footer, Navigation } from './shared/components';
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
	const PRIMARY_ITEMS: NavigationItem[] = [
		{ label: 'Home', location: '/' },
		{
			label: 'Zoeken',
			location: `/${RouteParts.Search}`,
			icon: 'search',
		},
		{ label: 'Ontdek', location: `/${RouteParts.Discover}` },
		{
			label: 'Mijn Werkruimte',
			location: `/${RouteParts.Workspace}`,
			icon: 'briefcase',
		},
		{ label: 'Projecten', location: `/${RouteParts.Projects}` },
		{ label: 'Nieuws', location: `/${RouteParts.News}` },
	];
	const SECONDARY_ITEMS: NavigationItem[] =
		loginState && loginState.message === 'LOGGED_IN'
			? [{ label: 'Afmelden', location: `/${RouteParts.Logout}` }]
			: [
					{ label: 'Registreren', location: `/${RouteParts.Register}` },
					{ label: 'Aanmelden', location: `/${RouteParts.RegisterOrLogin}` },
			  ];

	// State
	const [menuOpen, setMenuOpen] = useState(false);

	useEffect(() => history.listen(onCloseMenu));

	// Methods
	const onToggleMenu = () => setMenuOpen(!menuOpen);

	const onCloseMenu = () => setMenuOpen(false);

	const isAdminRoute = new RegExp(`^/${RouteParts.Admin}`, 'g').test(location.pathname);

	// Render
	const renderAdmin = () => (
		<Flex>
			<Sidebar
				headerLink={`/${RouteParts.Admin}`}
				navItems={[{ label: 'Navigatie', location: ADMIN_PATH.MENU }]}
			/>
			<Flex className="u-flex-auto u-scroll" orientation="vertical">
				{renderRoutes()}
			</Flex>
		</Flex>
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
