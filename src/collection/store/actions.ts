import { Avo } from '@viaa/avo2-types';
import queryString from 'query-string';
import { Action, Dispatch } from 'redux';

import {
	CollectionActionTypes,
	SetCollectionErrorAction,
	SetCollectionLoadingAction,
	SetCollectionSuccessAction,
} from './types';

const getCollection = (id: string) => {
	return async (dispatch: Dispatch, getState: any): Promise<Action | null> => {
		const { collection } = getState();

		// don't fetch a collection we already have in store
		if (collection[id]) {
			return null;
		}

		dispatch(setCollectionLoading(id));

		try {
			const url = `${process.env.REACT_APP_PROXY_URL}/collection`;
			const response = await fetch(`${url}?${queryString.stringify({ id })}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			const data = await response.json();

			return dispatch(setCollectionSuccess(id, data as Avo.Collection.Response));
		} catch (e) {
			return dispatch(setCollectionError(id));
		}
	};
};

const setCollectionSuccess = (
	id: string,
	data: Avo.Collection.Response
): SetCollectionSuccessAction => ({
	id,
	data,
	type: CollectionActionTypes.SET_COLLECTION_SUCCESS,
});

const setCollectionError = (id: string): SetCollectionErrorAction => ({
	id,
	type: CollectionActionTypes.SET_COLLECTION_ERROR,
	error: true,
});

const setCollectionLoading = (id: string): SetCollectionLoadingAction => ({
	id,
	type: CollectionActionTypes.SET_COLLECTION_LOADING,
	loading: true,
});

export { setCollectionSuccess, setCollectionError, setCollectionLoading, getCollection };
