import React, { ComponentType, FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, RouteComponentProps, withRouter } from 'react-router';

import { RouteParts } from '../../constants';
import { selectLogin } from '../store/selectors';
import { LoginResponse } from '../store/types';

export interface SecuredRouteProps {
	component: ComponentType<any>;
	path?: string;
	exact?: boolean;
	loginState: LoginResponse | null;
}

const SecuredRoute: FunctionComponent<SecuredRouteProps & RouteComponentProps> = props => {
	const { component, path, exact, loginState } = props;

	return (
		<Route
			{...(path ? { path } : {})}
			exact={exact}
			render={props => {
				// Already logged in
				if (loginState && loginState.message === 'LOGGED_IN') {
					const Component = component;
					return <Component />;
				}
				return (
					<Redirect
						to={{
							pathname: `/${RouteParts.RegisterOrLogin}`,
							state: { from: props.location },
						}}
					/>
				);
			}}
		/>
	);
};

const mapStateToProps = (state: any) => ({
	loginState: selectLogin(state),
});

export default withRouter(connect(mapStateToProps)(SecuredRoute));
