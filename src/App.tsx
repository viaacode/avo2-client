import React, { Fragment, FunctionComponent } from 'react';
import { renderRoutes } from 'react-router-config';
import { BrowserRouter as Router, Link } from 'react-router-dom';

import { ROUTES } from './routes';

const App: FunctionComponent = () => {
	return (
		<Fragment>
			<h1>Archief voor Onderwijs Homepage</h1>
			<Router>
				<Link to="/search">Search</Link>
				{renderRoutes(ROUTES)}
			</Router>
		</Fragment>
	);
};

export default App;
