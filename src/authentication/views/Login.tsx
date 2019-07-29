import React, { FunctionComponent, useEffect } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Dispatch } from 'redux';

import { get } from 'lodash-es';

import { Spinner } from '@viaa/avo2-components';
import { RouteParts } from '../../routes';
import { redirectToLoginPage } from '../helpers/redirect-to-idp';
import { checkLoginState } from '../store/actions';
import {
	selectCheckLoginState,
	selectCheckLoginStateError,
	selectCheckLoginStateLoading,
} from '../store/selectors';
import { CheckLoginStateResponse } from '../store/types';

export interface LoginProps {
	loginState: CheckLoginStateResponse | null;
	loginStateLoading: boolean;
	loginStateError: boolean;
	checkLoginState: () => Dispatch;
}

const Login: FunctionComponent<LoginProps & RouteComponentProps> = ({
	location,
	loginState,
	loginStateLoading,
	loginStateError,
	checkLoginState,
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
			checkLoginState();
		}
	}, [checkLoginState, loginState, loginStateLoading]);

	if (!loginState || loginStateLoading) {
		// Wait for login check
		return (
			<div>
				<Spinner size="large" />
			</div>
		);
	}

	// Redirect to login form
	const base = window.location.href.split(`/${RouteParts.Login}`)[0];
	// Url to return to after authentication is completed and server stored auth object in session
	const returnToUrl = base + get(location, 'state.from.pathname', '/');
	redirectToLoginPage(returnToUrl);
	return null;
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
	)(Login)
);
