import { type Avo } from '@viaa/avo2-types';

import { createReducer } from '../../shared/helpers';

import initialState from './initial-state';
import { LoginActionTypes, SetLoginErrorAction, SetLoginSuccessAction } from './types';

const loginReducer = createReducer(initialState, {
	[LoginActionTypes.SET_LOGIN_LOADING]: (state) => ({
		...state,
		data: null,
		loading: true,
		error: false,
	}),
	[LoginActionTypes.SET_LOGIN_SUCCESS]: (state, action: SetLoginSuccessAction) => ({
		...state,
		data: action.data,
		loading: false,
		error: false,
	}),
	[LoginActionTypes.SET_LOGIN_ERROR]: (state, action: SetLoginErrorAction) => ({
		...state,
		data: null,
		loading: false,
		error: action.error,
	}),
	[LoginActionTypes.SET_ACCEPT_CONDITIONS]: (state) => ({
		...state,
		data: {
			...state.data,
			acceptedConditions: true,
		} as Avo.Auth.LoginResponse,
	}),
});

export default loginReducer;
