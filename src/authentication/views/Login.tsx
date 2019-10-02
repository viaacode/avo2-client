import React, { Fragment, FunctionComponent, useEffect } from 'react';
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

const Login: FunctionComponent<LoginProps> = ({
	history,
	location,
	loginState,
	loginStateLoading,
	loginStateError,
	getLoginState,
}) => {
	useEffect(() => {
		if (!loginState && !loginStateLoading && !loginStateError) {
			getLoginState();
		}
	}, [getLoginState, loginState, loginStateLoading]);

	if (loginStateError) {
		return (
			<Fragment>
				<NotFound message="Het inloggen is mislukt" icon="lock">
					<Button type="link" onClick={getLoginState} label="Probeer opnieuw" />
				</NotFound>
			</Fragment>
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

	if (loginState && loginState.message === 'LOGGED_IN' && !loginStateLoading) {
		// Redirect to previous requested path or home page
		history.push(get(location, 'state.from.pathname', '/'));
		return null;
	}

	// Redirect to login form
	const base = window.location.href.split(`/${RouteParts.Login}`)[0];
	// Url to return to after authentication is completed and server stored auth object in session
	const returnToUrl = base + get(location, 'state.from.pathname', `/${RouteParts.Search}`);
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
