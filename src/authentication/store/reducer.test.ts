import { setLoginError, setLoginLoading, setLoginSuccess } from './actions';
import initialState from './initial-state';
import { LoginActionTypes, LoginResponse } from './types';

import loginReducer from './reducer';

describe('login > store > reducer', () => {
	it(`Correctly handle ${LoginActionTypes.SET_LOGIN_ERROR}`, () => {
		const state = loginReducer(initialState, setLoginError());

		expect(state.error).toEqual(true);
	});

	it(`Correctly handle ${LoginActionTypes.SET_LOGIN_LOADING}`, () => {
		const state = loginReducer(initialState, setLoginLoading());

		expect(state.loading).toEqual(true);
	});

	it(`Correctly handle ${LoginActionTypes.SET_LOGIN_SUCCESS}`, () => {
		const payload: LoginResponse = { message: 'LOGGED_IN' };

		const state = loginReducer(initialState, setLoginSuccess(payload));

		expect(state.data).toEqual(payload);
	});
});
