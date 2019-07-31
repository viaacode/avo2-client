import React, { FunctionComponent, useEffect } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Action, Dispatch } from 'redux';

import { get } from 'lodash-es';

import { Spinner } from '@viaa/avo2-components';
import { RouteParts } from '../../routes';
import { redirectToLoginPage, redirectToPage } from '../helpers/redirect-to-idp';
import { getLoginState } from '../store/actions';
import { selectLogin, selectLoginError, selectLoginLoading } from '../store/selectors';
import { LoginAction, LoginResponse, LoginState } from '../store/types';

export interface LoginProps {
	loginState: LoginResponse | null;
	loginStateLoading: boolean;
	loginStateError: boolean;
	getLoginState: () => Dispatch;
}

const Login: FunctionComponent<LoginProps & RouteComponentProps> = ({
	location,
	loginState,
	loginStateLoading,
	loginStateError,
	getLoginState,
}) => {
	console.log(`rendering secure path`, {
		loginState,
		loginStateLoading,
		loginStateError,
	});

	useEffect(() => {
		console.log('check login');
		if (!loginState && !loginStateLoading) {
			console.log('checking login state');
			getLoginState();
		}
	}, [getLoginState, loginState, loginStateLoading]);

	console.log('login component: ', { loginState, loginStateLoading, loginStateError });
	if (!loginState || loginStateLoading) {
		// Wait for login check
		return (
			<div>
				<Spinner size="large" />
			</div>
		);
	}

	if (loginState && loginState.message === 'LOGGED_IN' && !loginStateLoading) {
		// Redirect to previous requested url or home page
		const base = window.location.href.split(`/${RouteParts.Login}`)[0];
		const returnToUrl = base + get(location, 'state.from.pathname', '/');
		redirectToPage(returnToUrl);
		return null;
	}

	// Redirect to login form
	const base = window.location.href.split(`/${RouteParts.Login}`)[0];
	// Url to return to after authentication is completed and server stored auth object in session
	const returnToUrl = base + get(location, 'state.from.pathname', '/');
	redirectToLoginPage(returnToUrl);
	return null;
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
	)(Login)
);
