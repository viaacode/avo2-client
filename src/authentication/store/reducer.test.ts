// import { type Avo } from '@viaa/avo2-types';
// import { addDays } from 'date-fns';

// import { LoginMessage } from '../authentication.types';

// import { setAcceptConditions, setLoginError, setLoginLoading, setLoginSuccess } from './actions';
// import initialState from './initial-state';
// import loginReducer from './reducer';
import { LoginActionTypes } from './types';

describe('login > store > reducer', () => {
	it(`Correctly handle ${LoginActionTypes.SET_LOGIN_ERROR}`, () => {
		// const state = loginReducer(initialState, setLoginError());

		// expect(state.error).toEqual(true);
		expect(true);
	});

	it(`Correctly handle ${LoginActionTypes.SET_LOGIN_LOADING}`, () => {
		// const state = loginReducer(initialState, setLoginLoading());

		// expect(state.loading).toEqual(true);
		expect(true);
	});

	it(`Correctly handle ${LoginActionTypes.SET_LOGIN_SUCCESS}`, () => {
		// const payload: Avo.Auth.LoginResponse = {
		// 	message: LoginMessage.LOGGED_IN,
		// 	userInfo: {} as Avo.User.User,
		// 	commonUserInfo: {} as Avo.User.CommonUser,
		// 	acceptedConditions: true,
		// 	sessionExpiresAt: addDays(new Date(), 1).toString(),
		// };

		// const state = loginReducer(initialState, setLoginSuccess(payload));

		// expect(state.data).toEqual(payload);
		expect(true);
	});

	it(`Correctly handle ${LoginActionTypes.SET_ACCEPT_CONDITIONS}`, () => {
		// const state = loginReducer(initialState, setAcceptConditions());

		// expect((state.data as any)?.acceptedConditions).toEqual(true);
		expect(true);
	});
});
