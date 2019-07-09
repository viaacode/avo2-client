import { Avo } from '@viaa/avo2-types';

import { selectItem, selectItemError, selectItemLoading } from './selectors';

describe('item > store > selectors', () => {
	const store = {
		item: {
			test_id: {
				data: {
					id: 'test_id',
					table_name: 'test',
					dc_title: 'test',
					dc_titles_serie: 'test',
					thumbnail_path: 'test',
					original_cp: 'test',
					original_cp_id: 'test',
					lom_context: [],
					lom_keywords: [],
					lom_languages: [],
					dcterms_issued: 'test',
					dcterms_abstract: 'test',
					lom_classification: [],
					lom_typical_age_range: [],
					lom_intended_enduser_role: [],
					briefing_id: [],
					duration_time: '10',
					duration_seconds: 10,
					administrative_type: 'video' as Avo.Core.ContentType,
				},
				loading: false,
				error: false,
			},
		},
	};

	it('Should get the item error-state from the store', () => {
		expect(selectItemError(store, 'test_id')).toEqual(false);
	});

	it('Should get the item loading-state from the store', () => {
		expect(selectItemLoading(store, 'test_id')).toEqual(false);
	});

	it('Should get the item data from the store', () => {
		expect(selectItem(store, 'test_id')).toMatchObject(store.item.test_id.data);
	});
});
