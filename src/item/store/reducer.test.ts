import { Avo } from '@viaa/avo2-types';

import { setItemError, setItemLoading, setItemSuccess } from './actions';
import initialState from './initial-state';
import { ItemActionTypes } from './types';

import itemReducer from './reducer';

describe('item > store > reducer', () => {
	it(`Correctly handle ${ItemActionTypes.SET_DETAIL_ERROR}`, () => {
		const id = 'test_id';
		const state = itemReducer(initialState, setItemError(id));

		expect(state[id].error).toEqual(true);
	});

	it(`Correctly handle ${ItemActionTypes.SET_DETAIL_LOADING}`, () => {
		const id = 'test_id';
		const state = itemReducer(initialState, setItemLoading(id));

		expect(state[id].loading).toEqual(true);
	});

	it(`Correctly handle ${ItemActionTypes.SET_DETAIL_SUCCESS}`, () => {
		const id = 'test_id';
		const payload = {
			id,
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
		};

		const state = itemReducer(initialState, setItemSuccess(id, payload));

		expect(state[id].data).toEqual(payload);
	});
});
