import { createReducer } from '../../shared/helpers/redux/create-reducer';

import { initialCollectionsState, initialCollectionState } from './initial-state';
import {
	CollectionActionTypes,
	CollectionsActionTypes,
	SetCollectionErrorAction,
	SetCollectionLoadingAction,
	SetCollectionsErrorAction,
	SetCollectionsLoadingAction,
	SetCollectionsSuccessAction,
	SetCollectionSuccessAction,
} from './types';

const collectionReducer = createReducer(initialCollectionState, {
	[CollectionActionTypes.SET_COLLECTION_LOADING]: (state, action: SetCollectionLoadingAction) => {
		console.log('collection loading reducer triggered');
		return {
			...state,
			[action.id]: {
				data: null,
				loading: action.loading,
				error: false,
			},
		};
	},
	[CollectionActionTypes.SET_COLLECTION_SUCCESS]: (state, action: SetCollectionSuccessAction) => {
		console.log('collection success reducer triggered');
		return {
			...state,
			[action.id]: {
				data: action.data,
				loading: false,
				error: false,
			},
		};
	},
	[CollectionActionTypes.SET_COLLECTION_ERROR]: (state, action: SetCollectionErrorAction) => {
		console.log('collection error reducer triggered');
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

const collectionsReducer = createReducer(initialCollectionsState, {
	[CollectionsActionTypes.SET_COLLECTIONS_LOADING]: (
		state,
		action: SetCollectionsLoadingAction
	) => ({
		...state,
		data: null,
		loading: action.loading,
		error: false,
	}),
	[CollectionsActionTypes.SET_COLLECTIONS_SUCCESS]: (
		state,
		action: SetCollectionsSuccessAction
	) => ({
		...state,
		data: action.data,
		loading: false,
		error: false,
	}),
	[CollectionsActionTypes.SET_COLLECTIONS_ERROR]: (state, action: SetCollectionsErrorAction) => ({
		...state,
		data: null,
		loading: false,
		error: action.error,
	}),
});

export { collectionReducer, collectionsReducer };
