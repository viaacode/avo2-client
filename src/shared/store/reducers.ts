import { createReducer } from '../../shared/helpers/redux/create-reducer';

import { playerTokenInitialState } from './initial-state';
import {
	PlayerTokenActionTypes,
	SetPlayerTokenErrorAction,
	SetPlayerTokenLoadingAction,
	SetPlayerTokenSuccessAction,
} from './types';

export const playerTokenReducer = createReducer(playerTokenInitialState, {
	[PlayerTokenActionTypes.SET_PLAYER_TOKEN_LOADING]: (
		state,
		action: SetPlayerTokenLoadingAction
	) => ({
		...state,
		data: null,
		loading: action.loading,
		error: false,
	}),
	[PlayerTokenActionTypes.SET_PLAYER_TOKEN_SUCCESS]: (
		state,
		action: SetPlayerTokenSuccessAction
	) => ({
		...state,
		data: action.data,
		loading: false,
		error: false,
	}),
	[PlayerTokenActionTypes.SET_PLAYER_TOKEN_ERROR]: (state, action: SetPlayerTokenErrorAction) => ({
		...state,
		data: null,
		loading: false,
		error: action.error,
	}),
});
