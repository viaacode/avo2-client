import { createReducer } from './../../shared/helpers/redux/create-reducer';

import initialState from './initial-state';
import {
	DetailActionTypes,
	SetDetailErrorAction,
	SetDetailLoadingAction,
	SetDetailSuccessAction,
} from './types';

const detailReducer = createReducer(initialState, {
	[DetailActionTypes.SET_DETAIL_LOADING]: (state, action: SetDetailLoadingAction) => ({
		...state,
		[action.id]: {
			data: null,
			loading: action.loading,
			error: false,
		},
	}),
	[DetailActionTypes.SET_DETAIL_SUCCESS]: (state, action: SetDetailSuccessAction) => ({
		...state,
		[action.id]: {
			data: action.data,
			loading: false,
			error: false,
		},
	}),
	[DetailActionTypes.SET_DETAIL_ERROR]: (state, action: SetDetailErrorAction) => ({
		...state,
		[action.id]: {
			data: null,
			loading: false,
			error: action.error,
		},
	}),
});

export default detailReducer;
