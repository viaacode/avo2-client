import React, { type FC } from 'react';
import { Redirect } from 'react-router';
import { type RouteComponentProps, withRouter } from 'react-router-dom';

const AdminRedirect: FC<RouteComponentProps> = ({ location }) => {
	return <Redirect to={location.pathname.replace(/^\/beheer/g, '/admin') + location.search} />;
};

export default withRouter(AdminRedirect) as unknown as FC;
