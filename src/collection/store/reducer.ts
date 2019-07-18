import { createReducer } from '../../shared/helpers/redux/create-reducer';

import initialState from './initial-state';
import {
	CollectionActionTypes,
	SetCollectionErrorAction,
	SetCollectionLoadingAction,
	SetCollectionSuccessAction,
} from './types';

const collectionReducer = createReducer(initialState, {
	[CollectionActionTypes.SET_COLLECTION_LOADING]: (state, action: SetCollectionLoadingAction) => ({
		...state,
		[action.id]: {
			data: null,
			loading: action.loading,
			error: false,
		},
	}),
	[CollectionActionTypes.SET_COLLECTION_SUCCESS]: (state, action: SetCollectionSuccessAction) => ({
		...state,
		[action.id]: {
			data: action.data,
			loading: false,
			error: false,
		},
	}),
	[CollectionActionTypes.SET_COLLECTION_ERROR]: (state, action: SetCollectionErrorAction) => ({
		...state,
		[action.id]: {
			data: null,
			loading: false,
			error: action.error,
		},
	}),
});

export default collectionReducer;
