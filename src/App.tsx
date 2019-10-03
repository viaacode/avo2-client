import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect, Provider } from 'react-redux';

import { BrowserRouter as Router, RouteComponentProps, withRouter } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';

import { selectLogin } from './authentication/store/selectors';
import { LoginResponse } from './authentication/store/types';
import { renderRoutes } from './routes';
import { Footer } from './shared/components/Footer/Footer';
import { Navigation } from './shared/components/Navigation/Navigation';

import { ApolloProvider as ApolloHooksProvider } from '@apollo/react-hooks';
import { ApolloProvider } from 'react-apollo';
import { RouteParts } from './constants';
import { dataService } from './shared/services/data-service';
import store from './store';

import './styles/main.scss';

interface AppProps {
	loginState: LoginResponse | null;
}

const App: FunctionComponent<AppProps & RouteComponentProps> = ({ history, loginState }) => {
	const [menuOpen, setMenuOpen] = useState(false);

	useEffect(() => {
		return history.listen(closeMenu);
	});

	const toggleMenu = () => {
		setMenuOpen(!menuOpen);
	};

	const closeMenu = () => {
		setMenuOpen(false);
	};

	return (
		<div className="o-app">
			<ToastContainer
				autoClose={4000}
				className="c-alert-stack"
				closeButton={false}
				closeOnClick={false}
				draggable={false}
				position="bottom-left"
				transition={Slide}
			/>
			<Navigation
				primaryItems={[
					{ label: 'Home', location: '/' },
					{
						label: 'Zoeken',
						location: `/${RouteParts.Search}`,
						icon: 'search',
					},
					{ label: 'Ontdek', location: `/${RouteParts.Discover}` },
					{
						label: 'Mijn Werkruimte',
						location: `/${RouteParts.MyWorkspace}`,
						icon: 'briefcase',
					},
					{ label: 'Projecten', location: `/${RouteParts.Projects}` },
					{ label: 'Nieuws', location: `/${RouteParts.News}` },
				]}
				secondaryItems={
					loginState && loginState.message === 'LOGGED_IN'
						? [{ label: 'Afmelden', location: `/${RouteParts.Logout}` }]
						: [
								{ label: 'Registreren', location: `/${RouteParts.Register}` },
								{ label: 'Aanmelden', location: `/${RouteParts.Login}` },
						  ]
				}
				isOpen={menuOpen}
				handleMenuClick={toggleMenu}
			/>
			{renderRoutes()}
			<Footer />
		</div>
	);
};

const mapStateToProps = (state: any) => ({
	loginState: selectLogin(state),
});

const AppWithRouter = withRouter(connect(mapStateToProps)(App));

const Root: FunctionComponent = () => {
	return (
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
};

export default Root;
