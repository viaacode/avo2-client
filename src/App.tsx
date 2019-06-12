import React, { FunctionComponent } from 'react';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';

import { Detail } from './containers/detail/Detail';
import { Home } from './containers/home/Home';
import { Search } from './containers/search/Search';

const App: FunctionComponent = () => {
	return (
		<>
			<h1>Archief voor Onderwijs Homepage</h1>
			<Router>
				<Link to="/home">Home</Link> <Link to="/search">Search</Link>
				<div>
					<Route exact path="/home" component={Home} />
					<Route exact path="/search" component={Search} />
					<Route exact path="/detail/:id" component={Detail} />
				</div>
			</Router>
		</>
	);
};

export default App;
