import { type Avo } from '@viaa/avo2-types';
import { addDays } from 'date-fns';

import { LoginMessage } from '../authentication.types';

import { setLoginError, setLoginLoading, setLoginSuccess } from './actions';
import { LoginActionTypes } from './types';

describe('login > store > actions', () => {
	it('Should create an action to set the loginState', () => {
		const loginResult: Avo.Auth.LoginResponse = {
			message: LoginMessage.LOGGED_IN,
			userInfo: {} as Avo.User.User,
			commonUserInfo: {} as Avo.User.CommonUser,
			acceptedConditions: true,
			sessionExpiresAt: addDays(new Date(), 1).toString(),
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
