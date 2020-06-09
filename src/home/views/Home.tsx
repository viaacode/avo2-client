import React, { FunctionComponent } from 'react';
import { withRouter } from 'react-router';

import { ContentPage } from '../../content-page/views';
import { ROUTE_PARTS } from '../../shared/constants';

const Home: FunctionComponent = () => {
	return <ContentPage path={`/${ROUTE_PARTS.loggedInHome}`} />;
};

export default withRouter(Home);
