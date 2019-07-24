import React, { FunctionComponent, useState } from 'react';
import { Provider } from 'react-redux';

import { renderRoutes } from 'react-router-config';
import { BrowserRouter as Router, Link } from 'react-router-dom';

import { Navigation } from './shared/components/Navigation/Navigation';

import { ROUTES } from './routes';
import store from './store';

const App: FunctionComponent = () => {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<Provider store={store}>
			<Router>
				<Navigation
					primaryItems={[
						{ label: 'Home', location: '/' },
						{ label: 'Zoeken', location: 'search' },
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
					handleMenuClick={() => setMenuOpen(!menuOpen)}
				/>
				{renderRoutes(ROUTES)}
			</Router>
		</Provider>
	);
};

export default App;
