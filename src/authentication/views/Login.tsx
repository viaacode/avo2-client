import React, { FunctionComponent, useEffect } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Dispatch } from 'redux';

import { get } from 'lodash-es';

import { Button, Spinner } from '@viaa/avo2-components';
import NotFound from '../../404/views/NotFound';
import { RouteParts } from '../../constants';
import { redirectToLoginPage } from '../helpers/redirect-to-idp';
import { getLoginState } from '../store/actions';
import { selectLogin, selectLoginError, selectLoginLoading } from '../store/selectors';
import { LoginResponse } from '../store/types';

export interface LoginProps extends RouteComponentProps {
	loginState: LoginResponse | null;
	loginStateLoading: boolean;
	loginStateError: boolean;
	getLoginState: () => Dispatch;
}

const LOGIN_ATTEMPT_KEY = 'AVO_LOGIN_ATTEMPT';

const Login: FunctionComponent<LoginProps> = ({
	history,
	location,
	loginState,
	loginStateLoading,
	loginStateError,
	getLoginState,
}) => {
	const getLastLoginAttempt = (): null | Date => {
		try {
			const lastLoginAttempt = localStorage.getItem(LOGIN_ATTEMPT_KEY) || '';
			if (!lastLoginAttempt || lastLoginAttempt.trim().length < 3) {
				return null;
			}
			return new Date(lastLoginAttempt);
		} catch (err) {
			console.error('Failed to check recent login attempts');
			return null;
		}
	};

	const addLoginAttempt = () => {
		localStorage.setItem(LOGIN_ATTEMPT_KEY, new Date().toISOString());
	};

	const hasRecentLoginAttempt = () => {
		const lastAttempt = getLastLoginAttempt();
		return lastAttempt && lastAttempt.getTime() > new Date().getTime() - 5 * 1000;
	};

	useEffect(() => {
		if (!loginState && !loginStateLoading && !loginStateError) {
			getLoginState();
			return;
		}

		// Redirect to previous requested path or home page
		if (loginState && loginState.message === 'LOGGED_IN' && !loginStateLoading) {
			history.push(get(location, 'state.from.pathname', '/'));
			return;
		}

		if (
			loginState &&
			loginState.message === 'LOGGED_OUT' &&
			!loginStateLoading &&
			!loginStateError &&
			!hasRecentLoginAttempt()
		) {
			addLoginAttempt();
			// Redirect to login form
			const base = window.location.href.split(`/${RouteParts.LoginAvo}`)[0];
			// Url to return to after authentication is completed and server stored auth object in session
			const returnToUrl = base + get(location, 'state.from.pathname', `/${RouteParts.Search}`);
			redirectToLoginPage(returnToUrl);
		}
	}, [getLoginState, loginState, loginStateLoading, loginStateError]);

	const tryLoginAgainManually = () => {
		localStorage.removeItem(LOGIN_ATTEMPT_KEY);
		getLoginState();
	};

	if (loginStateError || hasRecentLoginAttempt()) {
		return (
			<>
				<NotFound message="Het inloggen is mislukt" icon="lock">
					<Button type="link" onClick={tryLoginAgainManually} label="Probeer opnieuw" />
				</NotFound>
			</>
		);
	}

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
