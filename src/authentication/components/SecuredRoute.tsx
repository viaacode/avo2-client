import React, { ComponentType, FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, RouteComponentProps, withRouter } from 'react-router';

import { RouteParts } from '../../routes';
import { selectLogin, selectLoginError, selectLoginLoading } from '../store/selectors';
import { LoginResponse } from '../store/types';

export interface SecuredRouteProps {
	component: ComponentType<any>;
	path: string;
	exact?: boolean;
	loginState: LoginResponse | null;
	loginStateLoading: boolean;
	loginStateError: boolean;
}

const SecuredRoute: FunctionComponent<SecuredRouteProps & RouteComponentProps> = props => {
	const { component, path, exact, loginState, loginStateLoading, loginStateError } = props;

	console.log('loading secure route');

	return (
		<Route
			path={path}
			exact={exact}
			render={props => {
				console.log(`rendering secure path`, {
					path,
					loginState,
					loginStateLoading,
					loginStateError,
				});
				// if (loginState && !loginStateLoading && !loginStateError) {
				// 	// Already logged in
				// 	console.log(`login state is: ${loginState.message}`);
				if (loginState && loginState.message === 'LOGGED_IN') {
					const Component = component;
					return <Component />;
				}
				return (
					<Redirect
						to={{
							pathname: `/${RouteParts.Login}`,
							state: { from: props.location },
						}}
					/>
				);
				// 	}
				//
				// 	// If error show toast and redirect to home page
				// 	if (loginStateError) {
				// 		console.error('Failed to login');
				// 		return (
				// 			<Redirect
				// 				to={{
				// 					pathname: `/`,
				// 				}}
				// 			/>
				// 		);
				// 	}
				//
				// 	// if (loginStateLoading) {
				// 	// Show spinner while we check login state with proxy
				// 	return (
				// 		<div>
				// 			{path}
				// 			<Spinner size="large" />
				// 		</div>
				// 	);
				// 	// }
				//
				// 	// if ((!loginState || loginState.message !== 'LOGGED_IN') && !loginStateLoading) {
				// 	// 	return (
				// 	// 		<Redirect
				// 	// 			to={{
				// 	// 				pathname: `/${RouteParts.Login}`,
				// 	// 				state: { from: props.location },
				// 	// 			}}
				// 	// 		/>
				// 	// 	);
				// 	// }
				// }}
				// />
			}}
		/>
	);
};

const mapStateToProps = (state: any) => ({
	loginState: selectLogin(state),
	loginStateLoading: selectLoginLoading(state),
	loginStateError: selectLoginError(state),
});

export default withRouter(connect(mapStateToProps)(SecuredRoute));
