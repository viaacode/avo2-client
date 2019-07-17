import React, { Component, ComponentType, FunctionComponent } from 'react';
import { Redirect, Route, RouteComponentProps, withRouter } from 'react-router-dom';
import authClient from '../Auth';

interface SecuredRouteProps {
	component: ComponentType<any>;
	path: string;
}

const SecuredRoute: FunctionComponent<SecuredRouteProps & RouteComponentProps> = ({
	component: Component,
	path,
}: SecuredRouteProps) => {
	return (
		<Route
			path={path}
			render={props =>
				authClient.isAuthenticated() ? (
					<Component />
				) : (
					<Redirect
						to={{
							pathname: '/login',
							state: { from: props.location },
						}}
					/>
				)
			}
		/>
	);
};

export default withRouter(SecuredRoute);
