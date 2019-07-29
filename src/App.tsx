import React, { FunctionComponent } from 'react';
import { Provider } from 'react-redux';

import { BrowserRouter as Router, Link } from 'react-router-dom';

import { renderRoutes, RouteParts } from './routes';
import store from './store';

const App: FunctionComponent = () => {
	return (
		<Provider store={store}>
			<h1>Archief voor Onderwijs Homepage</h1>
			<Router>
				<Link to="/">Home</Link>&nbsp;
				<Link to={`/${RouteParts.Search}`}>Zoeken</Link>&nbsp;
				<Link to={`/${RouteParts.Collection}/1725151`}>Collectie</Link>&nbsp;
				<Link to={`/${RouteParts.MyWorkspace}/${RouteParts.Collections}`}>Mijn Werkruimte</Link>
				&nbsp;
				<Link to={`/${RouteParts.Register}`}>Registreren</Link>&nbsp;
				<Link to={`/${RouteParts.Login}`}>Aanmelden</Link>&nbsp;
				<Link to={`/${RouteParts.Logout}`}>Afmelden</Link>&nbsp;
				{renderRoutes()}
			</Router>
		</Provider>
	);
};

export default App;
