import { Action, Dispatch } from 'redux';

import {
	CheckLoginStateActionTypes,
	CheckLoginStateResponse,
	SetCheckLoginStateErrorAction,
	SetCheckLoginStateLoadingAction,
	SetCheckLoginStateSuccessAction,
} from './types';

const checkLoginState = () => {
	return async (dispatch: Dispatch, getState: any): Promise<Action | null> => {
		const { loginMessage } = getState();

		// don't fetch login state if we already logged in
		if (loginMessage && loginMessage.message === 'LOGGED_IN') {
			return null;
		}

		dispatch(setCheckLoginStateLoading(true));

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

			console.error('check login state success', data);
			dispatch(setCheckLoginStateLoading(false));
			return dispatch(setCheckLoginStateSuccess(data as CheckLoginStateResponse));
		} catch (err) {
			console.error('failed to check login state', err);
			dispatch(setCheckLoginStateLoading(false));
			return dispatch(setCheckLoginStateError());
		}
	};
};

const setCheckLoginStateSuccess = (
	data: CheckLoginStateResponse
): SetCheckLoginStateSuccessAction => ({
	data,
	type: CheckLoginStateActionTypes.SET_CHECK_LOGIN_STATE_SUCCESS,
});

const setCheckLoginStateError = (): SetCheckLoginStateErrorAction => ({
	type: CheckLoginStateActionTypes.SET_CHECK_LOGIN_STATE_ERROR,
	error: true,
});

const setCheckLoginStateLoading = (isLoading: boolean): SetCheckLoginStateLoadingAction => {
	console.log('set login state loading: ', true);
	return {
		type: CheckLoginStateActionTypes.SET_CHECK_LOGIN_STATE_LOADING,
		loading: isLoading,
	};
};

export {
	setCheckLoginStateSuccess,
	setCheckLoginStateError,
	setCheckLoginStateLoading,
	checkLoginState,
};
