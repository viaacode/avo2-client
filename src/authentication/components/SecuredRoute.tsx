import React, { ComponentType, FunctionComponent, useEffect } from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, RouteComponentProps, withRouter } from 'react-router';
import { Dispatch } from 'redux';

import { Flex, Spacer, Spinner } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { APP_PATH } from '../../constants';

import { isProfileComplete } from '../helpers/get-profile-info';
import { getLoginStateAction } from '../store/actions';
import { selectLogin, selectLoginError, selectLoginLoading } from '../store/selectors';
import { LoginMessage } from '../store/types';

export interface SecuredRouteProps {
	component: ComponentType<any>;
	path?: string;
	exact?: boolean;
	loginState: Avo.Auth.LoginResponse | null;
	loginStateLoading: boolean;
	loginStateError: boolean;
	getLoginState: () => Dispatch;
}

const SecuredRoute: FunctionComponent<SecuredRouteProps & RouteComponentProps> = ({
	component,
	path,
	exact,
	loginState,
	loginStateLoading,
	loginStateError,
	getLoginState,
	history,
	location,
	match,
}) => {
	useEffect(() => {
		if (!loginState && !loginStateLoading && !loginStateError) {
			getLoginState();
		}
	}, [getLoginState, loginState, loginStateLoading, loginStateError]);

	if (!loginState || loginStateLoading) {
		// Wait for login check
		return (
			<Spacer margin={['top-large', 'bottom-large']}>
				<Flex center>
					<Spinner size="large" />
				</Flex>
			</Spacer>
		);
	}

	return (
		<Route
			{...(path ? { path } : {})}
			exact={exact}
			render={props => {
				// Already logged in
				if (loginState && loginState.message === LoginMessage.LOGGED_IN) {
					// TODO enable this once we can save profile info
					// if (isProfileComplete()) {
					const Component = component;
					return <Component history={history} location={location} match={match} />;
					// } else {
					// 	// Force user to complete their profile before letting them in
					// 	return (
					// 		<Redirect
					// 			to={{
					// 				pathname: APP_PATH.COMPLETE_PROFILE,
					// 				state: { from: props.location },
					// 			}}
					// 		/>
					// 	);
					// }
				}

				// On errors or not logged in => redirect to login or register page
				return (
					<Redirect
						to={{
							pathname: APP_PATH.REGISTER_OR_LOGIN,
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
		getLoginState: () => dispatch(getLoginStateAction() as any),
	};
};

export default withRouter(
	connect(
		mapStateToProps,
		mapDispatchToProps
	)(SecuredRoute)
);
