import { Avo } from '@viaa/avo2-types';

import { setCollectionError, setCollectionLoading, setCollectionSuccess } from './actions';
import initialState from './initial-state';
import { CollectionActionTypes } from './types';

import collectionReducer from './reducer';

describe('collection > store > reducer', () => {
	it(`Correctly handle ${CollectionActionTypes.SET_COLLECTION_ERROR}`, () => {
		const id = 'test_id';
		const state = collectionReducer(initialState, setCollectionError(id));

		expect(state[id].error).toEqual(true);
	});

	it(`Correctly handle ${CollectionActionTypes.SET_COLLECTION_LOADING}`, () => {
		const id = 'test_id';
		const state = collectionReducer(initialState, setCollectionLoading(id));

		expect(state[id].loading).toEqual(true);
	});

	it(`Correctly handle ${CollectionActionTypes.SET_COLLECTION_SUCCESS}`, () => {
		const id = 'test_id';
		const payload = {
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
			owner_id: '',
			owner: {} as Avo.User.Response,
			lom_context_id: 1,
			lom_classification_id: 1,
			publish_at: '',
			depublish_at: '',
			lom_keyword_id: 1,
			lom_intendedenduserrole_id: 1,
			external_id: id,
			collection_fragments: [],
		};

		const state = collectionReducer(initialState, setCollectionSuccess(id, payload));

		expect(state[id].data).toEqual(payload);
	});
});
