import { get } from 'lodash-es';
import React, { ComponentType, FunctionComponent, useEffect } from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, RouteComponentProps } from 'react-router';
import { Dispatch } from 'redux';

import { Flex, Spacer, Spinner } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { APP_PATH } from '../../constants';
import { Profile } from '../../settings/components';

import { isProfileComplete } from '../helpers/get-profile-info';
import { getLoginStateAction } from '../store/actions';
import { selectLogin, selectLoginError, selectLoginLoading, selectUser } from '../store/selectors';

export interface SecuredRouteProps {
	component: ComponentType<any>;
	exact?: boolean;
	getLoginState: () => Dispatch;
	loginState: Avo.Auth.LoginResponse | null;
	loginStateError: boolean;
	loginStateLoading: boolean;
	path?: string;
	user: Avo.User.User;
}

export interface DefaultSecureRouteProps<T = {}> extends RouteComponentProps<T> {
	user: Avo.User.User;
}

const SecuredRoute: FunctionComponent<SecuredRouteProps> = ({
	component,
	exact,
	getLoginState,
	loginState,
	loginStateError,
	loginStateLoading,
	path,
	user,
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
				if (loginState && loginState.message === 'LOGGED_IN' && user) {
					// TODO enable this once we can save profile info
					if (path === APP_PATH.COMPLETE_PROFILE) {
						// Force user to complete their profile before letting them in
						// This has to happen in the secure route component so we can pass the user object to the profile component
						return (
							<Profile
								{...props}
								user={user}
								isCompleteProfileStep
								redirectTo={get(props, 'location.from.path')}
							/>
						);
					}
					if (isProfileComplete(user)) {
						const Component = component;
						return <Component {...props} user={user} />;
					}
					// Redirect to the complete profile route
					// So we can redirect to the originally requested route once the user completes their profile info
					return (
						<Redirect
							to={{
								pathname: APP_PATH.COMPLETE_PROFILE,
								state: { from: props.location },
							}}
						/>
					);
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
	user: selectUser(state),
	loginState: selectLogin(state),
	loginStateLoading: selectLoginLoading(state),
	loginStateError: selectLoginError(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		getLoginState: () => dispatch(getLoginStateAction() as any),
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SecuredRoute);
