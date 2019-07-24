import React, { Fragment, FunctionComponent, useEffect, useState } from 'react';
import { Provider } from 'react-redux';

import { renderRoutes } from 'react-router-config';
import { BrowserRouter as Router, RouteComponentProps, withRouter } from 'react-router-dom';

import { Navigation } from './shared/components/Navigation/Navigation';

import { ROUTES } from './routes';
import store from './store';

const App: FunctionComponent<RouteComponentProps> = ({ history }) => {
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
		<Fragment>
			<Navigation
				primaryItems={[
					{ label: 'Home', location: '/' },
					{ label: 'Zoeken', location: '/search' },
					{ label: 'Ontdek', location: '/' },
					{ label: 'Mijn Archief', location: '/mijn-werkruimte/collecties' },
					{ label: 'Projecten', location: '/' },
					{ label: 'Nieuws', location: '/' },
				]}
				secondaryItems={[
					{ label: 'Registreren', location: '/' },
					{ label: 'Aanmelden', location: '/' },
				]}
				isOpen={menuOpen}
				handleMenuClick={toggleMenu}
			/>
			{renderRoutes(ROUTES)}
		</Fragment>
	);
};

const AppWithRouter = withRouter(App);

const Root: FunctionComponent = () => {
	return (
		<Provider store={store}>
			<Router>
				<AppWithRouter />
			</Router>
		</Provider>
	);
};

export default Root;
