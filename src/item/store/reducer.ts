import { createReducer } from './../../shared/helpers/redux/create-reducer';

import initialState from './initial-state';
import {
	ItemActionTypes,
	SetItemErrorAction,
	SetItemLoadingAction,
	SetItemSuccessAction,
} from './types';

const itemReducer = createReducer(initialState, {
	[ItemActionTypes.SET_DETAIL_LOADING]: (state, action: SetItemLoadingAction) => ({
		...state,
		[action.id]: {
			data: null,
			loading: action.loading,
			error: false,
		},
	}),
	[ItemActionTypes.SET_DETAIL_SUCCESS]: (state, action: SetItemSuccessAction) => ({
		...state,
		[action.id]: {
			data: action.data,
			loading: false,
			error: false,
		},
	}),
	[ItemActionTypes.SET_DETAIL_ERROR]: (state, action: SetItemErrorAction) => ({
		...state,
		[action.id]: {
			data: null,
			loading: false,
			error: action.error,
		},
	}),
});

export default itemReducer;
