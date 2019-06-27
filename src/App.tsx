import React, { Fragment, FunctionComponent } from 'react';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';

import { Detail } from './detail/views/Detail';
import { Search } from './search/views/Search';

const App: FunctionComponent = () => {
	return (
		<Fragment>
			<h1>Archief voor Onderwijs Homepage</h1>
			<Router>
				<Link to="/search">Search</Link>
				<div>
					<Route exact path="/search" component={Search} />
					<Route exact path="/detail/:id" component={Detail} />
				</div>
			</Router>
		</Fragment>
	);
};

export default App;
