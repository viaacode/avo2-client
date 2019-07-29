import { Avo } from '@viaa/avo2-types';

import { get } from 'lodash-es';

import {
	setCollectionError,
	setCollectionLoading,
	setCollectionsError,
	setCollectionsLoading,
	setCollectionsSuccess,
	setCollectionSuccess,
} from './actions';
import { initialCollectionsState, initialCollectionState } from './initial-state';
import { collectionReducer, collectionsReducer } from './reducer';
import { CollectionActionTypes, CollectionsActionTypes } from './types';

describe('collection > store > reducer', () => {
	it(`Correctly handle ${CollectionActionTypes.SET_COLLECTION_ERROR}`, () => {
		const id = 'test_id';
		const state = collectionReducer(initialCollectionState, setCollectionError(id));

		expect(state[id].error).toEqual(true);
	});

	it(`Correctly handle ${CollectionActionTypes.SET_COLLECTION_LOADING}`, () => {
		const id = 'test_id';
		const state = collectionReducer(initialCollectionState, setCollectionLoading(id));

		expect(state[id].loading).toEqual(true);
	});

	it(`Correctly handle ${CollectionActionTypes.SET_COLLECTION_SUCCESS}`, () => {
		const id = 'test_id';
		const payload: Avo.Collection.Response = {
			description: 'Een test collectie als het ware',
			title: 'Mijn collectie',
			is_public: false,
			id: 141,
			lom_references: [],
			type_id: 3,
			d_ownerid: 1,
			created_at: '2014-01-27',
			updated_at: '2017-02-08',
			organisation_id: '0',
			mediamosa_id: 'YEpRdLOmUcAUXQWuCWTJXwMk',
			owner: {} as Avo.User.Response,
			fragments: [],
		};

		const state = collectionReducer(initialCollectionState, setCollectionSuccess(id, payload));

		expect(state[id].data).toEqual(payload);
	});

	it(`Correctly handle ${CollectionsActionTypes.SET_COLLECTIONS_ERROR}`, () => {
		const state = collectionsReducer(initialCollectionsState, setCollectionsError());

		expect(get(state, 'error')).toEqual(true);
	});

	it(`Correctly handle ${CollectionsActionTypes.SET_COLLECTIONS_LOADING}`, () => {
		const state = collectionsReducer(initialCollectionsState, setCollectionsLoading());

		expect(get(state, 'loading')).toEqual(true);
	});

	it(`Correctly handle ${CollectionsActionTypes.SET_COLLECTIONS_SUCCESS}`, () => {
		const payload: Avo.Collection.Response[] = [
			{
				description: 'Een test collectie als het ware',
				title: 'Mijn collectie',
				is_public: false,
				id: 141,
				lom_references: [],
				type_id: 3,
				d_ownerid: 1,
				created_at: '2014-01-27',
				updated_at: '2017-02-08',
				organisation_id: '0',
				mediamosa_id: 'YEpRdLOmUcAUXQWuCWTJXwMk',
				owner: {} as Avo.User.Response,
				fragments: [],
			},
		];

		const state = collectionsReducer(initialCollectionsState, setCollectionsSuccess(payload));

		expect(get(state, 'data')).toEqual(payload);
	});
});
