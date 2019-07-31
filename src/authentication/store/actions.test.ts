import { LoginActionTypes, LoginResponse } from './types';

import { setLoginError, setLoginLoading, setLoginSuccess } from './actions';

describe('login > store > actions', () => {
	it('Should create an action to set the loginState', () => {
		const loginResult: LoginResponse = {
			message: 'LOGGED_IN',
		};

		const expectedAction = {
			type: LoginActionTypes.SET_LOGIN_SUCCESS,
			data: loginResult,
		};

		expect(setLoginSuccess(loginResult)).toMatchObject(expectedAction);
	});

	it('Should create an action to set an error', () => {
		const expectedAction = {
			type: LoginActionTypes.SET_LOGIN_ERROR,
			error: true,
		};

		expect(setLoginError()).toMatchObject(expectedAction);
	});

	it('Should create an action to set the loading state', () => {
		const expectedAction = {
			type: LoginActionTypes.SET_LOGIN_LOADING,
			loading: true,
		};

		expect(setLoginLoading()).toMatchObject(expectedAction);
	});
});
