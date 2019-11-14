import { createReducer } from '../../shared/helpers';

import initialState from './initial-state';
import {
	LoginActionTypes,
	SetLoginErrorAction,
	SetLoginLoadingAction,
	SetLoginSuccessAction,
} from './types';

const loginReducer = createReducer(initialState, {
	[LoginActionTypes.SET_LOGIN_LOADING]: (state, action: SetLoginLoadingAction) => ({
		...state,
		data: null,
		loading: action.loading,
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
});

export default loginReducer;
