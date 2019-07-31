import { createReducer } from './../../shared/helpers/redux/create-reducer';

import initialState from './initial-state';
import {
	ItemActionTypes,
	SetItemErrorAction,
	SetItemLoadingAction,
	SetItemSuccessAction,
} from './types';

const itemReducer = createReducer(initialState, {
	[ItemActionTypes.SET_ITEM_LOADING]: (state, action: SetItemLoadingAction) => {
		console.log('item loading reducer triggered');
		return {
			...state,
			[action.id]: {
				data: null,
				loading: action.loading,
				error: false,
			},
		};
	},
	[ItemActionTypes.SET_ITEM_SUCCESS]: (state, action: SetItemSuccessAction) => {
		console.log('item loading reducer triggered');
		return {
			...state,
			[action.id]: {
				data: action.data,
				loading: false,
				error: false,
			},
		};
	},
	[ItemActionTypes.SET_ITEM_ERROR]: (state, action: SetItemErrorAction) => {
		console.log('item loading reducer triggered');
		return {
			...state,
			[action.id]: {
				data: null,
				loading: false,
				error: action.error,
			},
		};
	},
});

export default itemReducer;
