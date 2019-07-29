import React, { ComponentType, FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, RouteComponentProps, withRouter } from 'react-router';
import { Dispatch } from 'redux';

import { Spinner } from '@viaa/avo2-components';
import { RouteParts } from '../../routes';
import { checkLoginState } from '../store/actions';
import {
	selectCheckLoginState,
	selectCheckLoginStateError,
	selectCheckLoginStateLoading,
} from '../store/selectors';
import { CheckLoginStateResponse } from '../store/types';

export interface SecuredRouteProps {
	component: ComponentType<any>;
	path: string;
	exact?: boolean;
	loginState: CheckLoginStateResponse | null;
	loginStateLoading: boolean;
	loginStateError: boolean;
	checkLoginState: () => Dispatch;
}

const SecuredRoute: FunctionComponent<SecuredRouteProps & RouteComponentProps> = props => {
	const {
		component,
		path,
		exact,
		loginState,
		loginStateLoading,
		loginStateError,
		checkLoginState,
	} = props;

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
	loginState: selectCheckLoginState(state),
	loginStateLoading: selectCheckLoginStateLoading(state),
	loginStateError: selectCheckLoginStateError(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		checkLoginState: () => dispatch(checkLoginState() as any),
	};
};

export default withRouter(
	connect(
		mapStateToProps,
		mapDispatchToProps
	)(SecuredRoute)
);
