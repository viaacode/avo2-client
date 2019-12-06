import { Avo } from '@viaa/avo2-types';

import { setLoginError, setLoginLoading, setLoginSuccess } from './actions';
import { LoginActionTypes, LoginMessage } from './types';

describe('login > store > actions', () => {
	it('Should create an action to set the loginState', () => {
		const loginResult: Avo.Auth.LoginResponse = {
			message: LoginMessage.LOGGED_IN,
			userInfo: {} as any,
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
