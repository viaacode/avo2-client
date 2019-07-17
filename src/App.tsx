import React, { FunctionComponent } from 'react';
import { Provider } from 'react-redux';

import { BrowserRouter as Router, Link } from 'react-router-dom';

import { renderRoutes } from './routes';
import store from './store';

const App: FunctionComponent = () => {
	return (
		<Provider store={store}>
			<h1>Archief voor Onderwijs Homepage</h1>
			<Router>
				<Link to="/search">Zoeken</Link>&nbsp;
				<Link to="/collection/1725151">Collectie</Link>&nbsp;
				<Link to="/registreren">Registreren</Link>&nbsp;
				<Link to="/aanmelden">Aanmelden</Link>&nbsp;
				{renderRoutes()}
			</Router>
		</Provider>
	);
};

export default App;
