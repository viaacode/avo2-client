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

		dispatch(setCheckLoginStateLoading());

		try {
			const url = `${process.env.REACT_APP_PROXY_URL}/auth/check-login`;
			const response = await fetch(url, {
				method: 'GET',
				mode: 'cors',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			const data = await response.json();

			return dispatch(setCheckLoginStateSuccess(data as CheckLoginStateResponse));
		} catch (e) {
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

const setCheckLoginStateLoading = (): SetCheckLoginStateLoadingAction => ({
	type: CheckLoginStateActionTypes.SET_CHECK_LOGIN_STATE_LOADING,
	loading: true,
});

export {
	setCheckLoginStateSuccess,
	setCheckLoginStateError,
	setCheckLoginStateLoading,
	checkLoginState,
};
