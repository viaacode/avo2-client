import React, { FunctionComponent } from 'react';
import { Provider } from 'react-redux';

import { renderRoutes, RouteConfig } from 'react-router-config';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { ROUTES } from './routes';
import store from './store';

const App: FunctionComponent = () => {
	return (
		<Provider store={store}>
			<ToastContainer />
			<h1>Archief voor Onderwijs Homepage</h1>
			<Router>
				<Link to="/">Home</Link>&nbsp;
				<Link to="/search">Search</Link>&nbsp;
				<Link to="/collection/1725151">Collection</Link>&nbsp;
				<Link to="/mijn-werkruimte/collecties">Mijn Werkruimte</Link>
				{renderRoutes(ROUTES as RouteConfig[])}
			</Router>
		</Provider>
	);
};

export default App;
