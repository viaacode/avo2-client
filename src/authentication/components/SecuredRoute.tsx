import React, { ComponentType, FunctionComponent, useEffect } from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, RouteComponentProps, withRouter } from 'react-router';

import { Spinner } from '@viaa/avo2-components';
import { Dispatch } from 'redux';
import { RouteParts } from '../../constants';
import { getLoginState } from '../store/actions';
import { selectLogin, selectLoginError, selectLoginLoading } from '../store/selectors';
import { LoginResponse } from '../store/types';

export interface SecuredRouteProps {
	component: ComponentType<any>;
	path?: string;
	exact?: boolean;
	loginState: LoginResponse | null;
	loginStateLoading: boolean;
	loginStateError: boolean;
	getLoginState: () => Dispatch;
}

const SecuredRoute: FunctionComponent<SecuredRouteProps & RouteComponentProps> = ({
	history,
	component,
	path,
	exact,
	loginState,
	loginStateLoading,
	loginStateError,
	getLoginState,
}) => {
	useEffect(() => {
		if (!loginState && !loginStateLoading && !loginStateError) {
			getLoginState();
		}
	}, [getLoginState, loginState, loginStateLoading, loginStateError]);

	if (!loginState || loginStateLoading) {
		// Wait for login check
		return (
			<div
				style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}
			>
				<Spinner size="large" />
			</div>
		);
	}

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

				// On errors or not logged in => redirect to login or register page
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
	loginStateLoading: selectLoginLoading(state),
	loginStateError: selectLoginError(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		getLoginState: () => dispatch(getLoginState() as any),
	};
};

export default withRouter(
	connect(
		mapStateToProps,
		mapDispatchToProps
	)(SecuredRoute)
);
