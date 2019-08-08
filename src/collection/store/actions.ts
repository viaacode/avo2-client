import { Avo } from '@viaa/avo2-types';
import queryString from 'query-string';
import { Action, Dispatch } from 'redux';

import { CustomWindow } from '../../shared/types/CustomWindow';
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

const getCollection = (id: string) => {
	return async (dispatch: Dispatch, getState: any): Promise<Action | null> => {
		const { collection } = getState();

		// don't fetch a collection we already have in store
		if (collection[id]) {
			return null;
		}

		dispatch(setCollectionLoading(id));

		try {
			const url = `${(window as CustomWindow)._ENV_.PROXY_URL}/collection`;
			const response = await fetch(`${url}?${queryString.stringify({ id })}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
			});

			const data = await response.json();

			return dispatch(setCollectionSuccess(id, data as Avo.Collection.Response));
		} catch (e) {
			return dispatch(setCollectionError(id));
		}
	};
};

const getCollections = () => {
	return async (dispatch: Dispatch, getState: any): Promise<Action | null> => {
		const { collections } = getState();

		// don't fetch a collections if they are already in the store
		if (collections) {
			return null;
		}

		dispatch(setCollectionsLoading());

		try {
			const url = `${(window as CustomWindow)._ENV_.PROXY_URL}/collection`;
			const ownerId = 1; // TODO replace with actual ownerId from the store once we have SAML authentication
			const response = await fetch(`${url}?${queryString.stringify({ ownerId })}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
			});

			const data = await response.json();

			return dispatch(setCollectionsSuccess(data as Avo.Collection.Response[]));
		} catch (e) {
			return dispatch(setCollectionsError());
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

const setCollectionsSuccess = (data: Avo.Collection.Response[]): SetCollectionsSuccessAction => ({
	data,
	type: CollectionsActionTypes.SET_COLLECTIONS_SUCCESS,
});

const setCollectionsError = (): SetCollectionsErrorAction => ({
	type: CollectionsActionTypes.SET_COLLECTIONS_ERROR,
	error: true,
});

const setCollectionsLoading = (): SetCollectionsLoadingAction => ({
	type: CollectionsActionTypes.SET_COLLECTIONS_LOADING,
	loading: true,
});

export {
	setCollectionSuccess,
	setCollectionError,
	setCollectionLoading,
	getCollection,
	setCollectionsSuccess,
	setCollectionsError,
	setCollectionsLoading,
	getCollections,
};
