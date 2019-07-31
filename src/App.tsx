import React, { Fragment, FunctionComponent, useEffect, useState } from 'react';
import { Provider } from 'react-redux';

import { BrowserRouter as Router, RouteComponentProps, withRouter } from 'react-router-dom';

import { renderRoutes, RouteParts } from './routes';
import { Navigation } from './shared/components/Navigation/Navigation';
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
					{ label: 'Zoeken', location: `/${RouteParts.Search}` },
					{ label: 'Ontdek', location: `/${RouteParts.Discover}` },
					{
						label: 'Mijn Archief',
						location: `/${RouteParts.MyWorkspace}/${RouteParts.Collections}`,
					},
					{ label: 'Projecten', location: `/${RouteParts.Projects}` },
					{ label: 'Nieuws', location: `/${RouteParts.News}` },
				]}
				secondaryItems={[
					{ label: 'Registreren', location: `/${RouteParts.Register}` },
					{ label: 'Aanmelden', location: `/${RouteParts.Login}` },
				]}
				isOpen={menuOpen}
				handleMenuClick={toggleMenu}
			/>
			{renderRoutes()}
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
