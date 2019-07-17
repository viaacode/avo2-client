import React, { ComponentType, FunctionComponent } from 'react';
import { Redirect, Route, RouteComponentProps, withRouter } from 'react-router-dom';
import authClient from '../Auth';

interface SecuredRouteProps {
	component: ComponentType<any>;
	path: string;
	exact?: boolean;
}

const SecuredRoute: FunctionComponent<SecuredRouteProps & RouteComponentProps> = ({
	component: Component,
	path,
	exact = false,
	location,
}: SecuredRouteProps & RouteComponentProps) => {
	console.log(location);
	return (
		<Route
			path={path}
			exact={exact}
			render={props =>
				authClient.isAuthenticated() ? (
					<Component />
				) : (
					<Redirect
						to={{
							pathname: '/aanmelden',
							state: { from: props.location },
						}}
					/>
				)
			}
		/>
	);
};

export default withRouter(SecuredRoute);
