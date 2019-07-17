import React, { FunctionComponent } from 'react';
import { Provider } from 'react-redux';

import { renderRoutes } from 'react-router-config';
import { BrowserRouter as Router, Link } from 'react-router-dom';

import SecuredRoute from './authentication/components/SecuredRoute';
import { ROUTES } from './routes';
import Search from './search/views/Search';
import store from './store';

interface AppProps {}

const App: FunctionComponent = ({  }: AppProps) => {
	return (
		<Provider store={store}>
			<h1>Archief voor Onderwijs Homepage</h1>
			<Router>
				<Link to="/search">Search</Link>&nbsp;
				<Link to="/collection/1725151">Collection</Link>&nbsp;
				<Link to="/register">Registreren</Link>&nbsp;
				<Link to="/aanmelden">Aanmelden</Link>&nbsp;
				<SecuredRoute component={Search} path="/search" />
				{/*{renderRoutes(ROUTES)}*/}
			</Router>
		</Provider>
	);
};

export default App;
