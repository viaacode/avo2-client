import { Avo } from '@viaa/avo2-types';

import { selectCollection, selectCollectionError, selectCollectionLoading } from './selectors';

describe('collection > store > selectors', () => {
	const store = {
		collection: {
			test_id: {
				data: {
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
					external_id: 'test_id',
					collection_fragments: [],
				},
				loading: false,
				error: false,
			},
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
});
