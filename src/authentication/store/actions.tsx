import { fetchWithLogoutJson } from '@meemoo/admin-core-ui';
import { Button, Spacer } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { get } from 'lodash-es';
import moment from 'moment';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Action, Dispatch } from 'redux';

import { getEnv } from '../../shared/helpers';
import { tText } from '../../shared/helpers/translate';
import { ToastService } from '../../shared/services/toast-service';
import { LoginMessage } from '../authentication.types';
import { logoutAndRedirectToLogin } from '../helpers/redirects';

import {
	LoginActionTypes,
	LoginState,
	SetAcceptConditionsAction,
	SetLoginErrorAction,
	SetLoginLoadingAction,
	SetLoginSuccessAction,
} from './types';

let checkSessionTimeoutTimerId: number | null = null;

function checkIfSessionExpires(expiresAt: string) {
	const date = moment(expiresAt);

	// Create fake location object
	const location = {
		pathname: window.location.pathname,
		state: {
			from: { pathname: window.location.pathname, search: window.location.search },
		},
	} as unknown as RouteComponentProps['location'];
	if (date.subtract(5, 'minutes').valueOf() < new Date().getTime()) {
		logoutAndRedirectToLogin(location);
	} else if (date.subtract(10, 'minutes').valueOf() < new Date().getTime()) {
		// Show warning since user is about to be logged out
		ToastService.info(
			<>
				{tText(
					'authentication/store/actions___je-sessie-gaat-over-5-min-verlopen-sla-je-werk-op-en-log-opnieuw-in'
				)}
				<Spacer margin="top-small">
					<Button
						label={tText('authentication/store/actions___ga-naar-login')}
						onClick={() => logoutAndRedirectToLogin(location)}
						type="primary"
					/>
				</Spacer>
			</>,
			{
				autoClose: false,
				position: 'bottom-left',
			}
		);
	}
}

export const getLoginStateAction = (forceRefetch = false) => {
	return async (dispatch: Dispatch, getState: any): Promise<Action | null> => {
		const state = getState();
		const loginState: LoginState = state.loginState;

		let response: Action | null = null;

		// Don't fetch login state if we already logged in
		if (loginState?.data?.message === LoginMessage.LOGGED_IN && !forceRefetch) {
			return null;
		}

		// Don't fetch login state from server if a call is already in progress
		if (loginState.loading) {
			return null;
		}

		dispatch(setLoginLoading());

		try {
			const loginStateResponse = await getLoginResponse(forceRefetch);

			// Check if session is about to expire and show warning toast
			// Redirect to login page when session actually expires
			const expiresAt = get(loginStateResponse, 'sessionExpiresAt');
			if (expiresAt) {
				if (checkSessionTimeoutTimerId) {
					clearInterval(checkSessionTimeoutTimerId);
				}
				checkSessionTimeoutTimerId = window.setInterval(
					() => checkIfSessionExpires(expiresAt),
					5 * 60 * 1000
				);
			}
			response = dispatch(setLoginSuccess(loginStateResponse));
		} catch (err) {
			console.error('failed to check login state', err);
			response = dispatch(setLoginError());
		}
		return response;
	};
};

export const acceptConditionsAction = () => {
	return async (dispatch: Dispatch): Promise<Action | null> => {
		return dispatch(setAcceptConditions());
	};
};

export const setLoginSuccess = (data: Avo.Auth.LoginResponse | null): SetLoginSuccessAction => ({
	data,
	type: LoginActionTypes.SET_LOGIN_SUCCESS,
});

export const setLoginError = (): SetLoginErrorAction => ({
	type: LoginActionTypes.SET_LOGIN_ERROR,
	error: true,
});

export const setLoginLoading = (): SetLoginLoadingAction => ({
	type: LoginActionTypes.SET_LOGIN_LOADING,
});

export const setAcceptConditions = (): SetAcceptConditionsAction => ({
	type: LoginActionTypes.SET_ACCEPT_CONDITIONS,
});

export const getLoginResponse = async (force = false): Promise<Avo.Auth.LoginResponse> => {
	try {
		const url = `${getEnv('PROXY_URL')}/auth/check-login?force=${force}`;
		return fetchWithLogoutJson<Avo.Auth.LoginResponse>(url, {
			forceLogout: false,
		});
	} catch (err) {
		console.error('failed to check login state', err);
		throw err;
	}
};
