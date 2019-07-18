import {
	setCheckLoginStateError,
	setCheckLoginStateLoading,
	setCheckLoginStateSuccess,
} from './actions';
import initialState from './initial-state';
import { CheckLoginStateActionTypes, CheckLoginStateResponse } from './types';

import checkLoginStateReducer from './reducer';

describe('checkLoginState > store > reducer', () => {
	it(`Correctly handle ${CheckLoginStateActionTypes.SET_CHECK_LOGIN_STATE_ERROR}`, () => {
		const state = checkLoginStateReducer(initialState, setCheckLoginStateError());

		expect(state.error).toEqual(true);
	});

	it(`Correctly handle ${CheckLoginStateActionTypes.SET_CHECK_LOGIN_STATE_LOADING}`, () => {
		const state = checkLoginStateReducer(initialState, setCheckLoginStateLoading());

		expect(state.loading).toEqual(true);
	});

	it(`Correctly handle ${CheckLoginStateActionTypes.SET_CHECK_LOGIN_STATE_SUCCESS}`, () => {
		const payload: CheckLoginStateResponse = { message: 'LOGGED_IN' };

		const state = checkLoginStateReducer(initialState, setCheckLoginStateSuccess(payload));

		expect(state.data).toEqual(payload);
	});
});
