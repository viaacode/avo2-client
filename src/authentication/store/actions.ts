import { Action, Dispatch } from 'redux';

import {
	LoginActionTypes,
	LoginResponse,
	SetLoginErrorAction,
	SetLoginLoadingAction,
	SetLoginSuccessAction,
} from './types';

const getLoginState = () => {
	return async (dispatch: Dispatch, getState: any): Promise<Action | null> => {
		const { loginMessage } = getState();

		// don't fetch login state if we already logged in
		if (loginMessage && loginMessage.message === 'LOGGED_IN') {
			return null;
		}

		dispatch(setLoginLoading());

		try {
			const url = `${process.env.REACT_APP_PROXY_URL}/auth/check-login`;
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
			});

			const data = await response.json();

			return dispatch(setLoginSuccess(data as LoginResponse));
		} catch (err) {
			console.error('failed to check login state', err);
			return dispatch(setLoginError());
		}
	};
};

const setLoginSuccess = (data: LoginResponse): SetLoginSuccessAction => ({
	data,
	type: LoginActionTypes.SET_LOGIN_SUCCESS,
});

const setLoginError = (): SetLoginErrorAction => ({
	type: LoginActionTypes.SET_LOGIN_ERROR,
	error: true,
});

const setLoginLoading = (): SetLoginLoadingAction => {
	return {
		type: LoginActionTypes.SET_LOGIN_LOADING,
		loading: true,
	};
};

export { setLoginSuccess, setLoginError, setLoginLoading, getLoginState };
