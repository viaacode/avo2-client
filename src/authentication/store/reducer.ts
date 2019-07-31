import { createReducer } from '../../shared/helpers/redux/create-reducer';

import initialState from './initial-state';
import {
	LoginActionTypes,
	SetLoginErrorAction,
	SetLoginLoadingAction,
	SetLoginSuccessAction,
} from './types';

const loginReducer = createReducer(initialState, {
	[LoginActionTypes.SET_LOGIN_LOADING]: (state, action: SetLoginLoadingAction) => {
		console.log('login loading reducer triggered');
		return {
			...state,
			data: null,
			loading: action.loading,
			error: false,
		};
	},
	[LoginActionTypes.SET_LOGIN_SUCCESS]: (state, action: SetLoginSuccessAction) => {
		console.log('login success reducer triggered: ', action);
		const newState = {
			...state,
			data: action.data,
			loading: false,
			error: false,
		};
		console.log('    new state is: ', newState);
		return newState;
	},
	[LoginActionTypes.SET_LOGIN_ERROR]: (state, action: SetLoginErrorAction) => {
		console.log('login error reducer triggered');
		return {
			...state,
			data: null,
			loading: false,
			error: action.error,
		};
	},
});

export default loginReducer;
