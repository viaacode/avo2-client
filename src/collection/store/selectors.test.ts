import { Avo } from '@viaa/avo2-types';

import {
	selectCollection,
	selectCollectionError,
	selectCollectionLoading,
	selectCollections,
	selectCollectionsError,
	selectCollectionsLoading,
} from './selectors';

describe('collection > store > selectors', () => {
	const DUMMY_COLLECTION: Avo.Collection.Response = {
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

	const store = {
		collection: {
			test_id: {
				data: DUMMY_COLLECTION,
				loading: false,
				error: false,
			},
		},
		collections: {
			data: [DUMMY_COLLECTION],
			loading: false,
			error: false,
		},
	};

	it('Should get the collection error-state from the store', () => {
		expect(selectCollectionError(store, 'test_id')).toEqual(false);
	});

	it('Should get the collection loading-state from the store', () => {
		expect(selectCollectionLoading(store, 'test_id')).toEqual(false);
	});

	it('Should get the collection data from the store', () => {
		expect(selectCollection(store, 'test_id')).toMatchObject(store.collection.test_id.data);
	});

	it('Should get the collections error-state from the store', () => {
		expect(selectCollectionsError(store)).toEqual(false);
	});

	it('Should get the collections loading-state from the store', () => {
		expect(selectCollectionsLoading(store)).toEqual(false);
	});

	it('Should get the collections data from the store', () => {
		expect(selectCollections(store)).toMatchObject(store.collection.test_id.data);
	});
});
