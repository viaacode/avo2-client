import { createReducer } from '../../shared/helpers/redux/create-reducer';

import initialState from './initial-state';
import {
	CheckLoginStateActionTypes,
	SetCheckLoginStateErrorAction,
	SetCheckLoginStateLoadingAction,
	SetCheckLoginStateSuccessAction,
} from './types';

const checkLoginStateReducer = createReducer(initialState, {
	[CheckLoginStateActionTypes.SET_CHECK_LOGIN_STATE_LOADING]: (
		state,
		action: SetCheckLoginStateLoadingAction
	) => ({
		...state,
		data: null,
		loading: action.loading,
		error: false,
	}),
	[CheckLoginStateActionTypes.SET_CHECK_LOGIN_STATE_SUCCESS]: (
		state,
		action: SetCheckLoginStateSuccessAction
	) => ({
		...state,
		data: action.data,
		loading: false,
		error: false,
	}),
	[CheckLoginStateActionTypes.SET_CHECK_LOGIN_STATE_ERROR]: (
		state,
		action: SetCheckLoginStateErrorAction
	) => ({
		...state,
		data: null,
		loading: false,
		error: action.error,
	}),
});

export default checkLoginStateReducer;
