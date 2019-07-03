import { Avo } from '@viaa/avo2-types';

import { selectDetail, selectDetailError, selectDetailLoading } from './selectors';

describe('detail > store > selectors', () => {
	const store = {
		detail: {
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

	it('Should get the detail error-state from the store', () => {
		expect(selectDetailError(store, 'test_id')).toEqual(false);
	});

	it('Should get the detail loading-state from the store', () => {
		expect(selectDetailLoading(store, 'test_id')).toEqual(false);
	});

	it('Should get the detail data from the store', () => {
		expect(selectDetail(store, 'test_id')).toMatchObject(store.detail.test_id.data);
	});
});
