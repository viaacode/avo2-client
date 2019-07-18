import { CheckLoginStateActionTypes, CheckLoginStateResponse } from './types';

import {
	setCheckLoginStateError,
	setCheckLoginStateLoading,
	setCheckLoginStateSuccess,
} from './actions';

describe('checkLoginState > store > actions', () => {
	it('Should create an action to set the loginState', () => {
		const checkLoginStateResult: CheckLoginStateResponse = {
			message: 'LOGGED_IN',
		};

		const expectedAction = {
			type: CheckLoginStateActionTypes.SET_CHECK_LOGIN_STATE_SUCCESS,
			data: checkLoginStateResult,
		};

		expect(setCheckLoginStateSuccess(checkLoginStateResult)).toMatchObject(expectedAction);
	});

	it('Should create an action to set an error', () => {
		const expectedAction = {
			type: CheckLoginStateActionTypes.SET_CHECK_LOGIN_STATE_ERROR,
			error: true,
		};

		expect(setCheckLoginStateError()).toMatchObject(expectedAction);
	});

	it('Should create an action to set the loading state', () => {
		const expectedAction = {
			type: CheckLoginStateActionTypes.SET_CHECK_LOGIN_STATE_LOADING,
			loading: true,
		};

		expect(setCheckLoginStateLoading()).toMatchObject(expectedAction);
	});
});
