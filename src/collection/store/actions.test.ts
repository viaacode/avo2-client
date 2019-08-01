import { Avo } from '@viaa/avo2-types';

import { CollectionActionTypes } from './types';

import { setCollectionError, setCollectionLoading, setCollectionSuccess } from './actions';

describe('collection > store > actions', () => {
	it('Should create an action to set the collection results', () => {
		const id = '123';
		const collectionResult: Avo.Collection.Response = {
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

		const expectedAction = {
			id,
			type: CollectionActionTypes.SET_COLLECTION_SUCCESS,
			data: collectionResult,
		};

		expect(setCollectionSuccess(id, collectionResult)).toMatchObject(expectedAction);
	});

	it('Should create an action to set an error', () => {
		const id = '123';

		const expectedAction = {
			id,
			type: CollectionActionTypes.SET_COLLECTION_ERROR,
			error: true,
		};

		expect(setCollectionError(id)).toMatchObject(expectedAction);
	});

	it('Should create an action to set the loading state', () => {
		const id = '123';

		const expectedAction = {
			id,
			type: CollectionActionTypes.SET_COLLECTION_LOADING,
			loading: true,
		};

		expect(setCollectionLoading(id)).toMatchObject(expectedAction);
	});
});
