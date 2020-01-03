import { Action, Dispatch } from 'redux';

import { Avo } from '@viaa/avo2-types';

import { getEnv } from '../../shared/helpers';
import {
	LoginActionTypes,
	SetLoginErrorAction,
	SetLoginLoadingAction,
	SetLoginSuccessAction,
} from './types';

export const getLoginStateAction = () => {
	return async (dispatch: Dispatch, getState: any): Promise<Action | null> => {
		const { loginMessage } = getState();

		// don't fetch login state if we already logged in
		if (loginMessage && loginMessage.message === Avo.Auth.LoginMessage.LOGGED_IN) {
			return null;
		}

		dispatch(setLoginLoading());

		try {
			const url = `${getEnv('PROXY_URL')}/auth/check-login`;
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
			});

			const data = await response.json();

			return dispatch(setLoginSuccess(data as Avo.Auth.LoginResponse));
		} catch (err) {
			console.error('failed to check login state', err);
			return dispatch(setLoginError());
		}
	};
};

export const setLoginSuccess = (data: Avo.Auth.LoginResponse): SetLoginSuccessAction => ({
	data,
	type: LoginActionTypes.SET_LOGIN_SUCCESS,
});

export const setLoginError = (): SetLoginErrorAction => ({
	type: LoginActionTypes.SET_LOGIN_ERROR,
	error: true,
});

export const setLoginLoading = (): SetLoginLoadingAction => {
	return {
		type: LoginActionTypes.SET_LOGIN_LOADING,
		loading: true,
	};
};
