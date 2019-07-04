import { Avo } from '@viaa/avo2-types';

import { ItemActionTypes } from './types';

import { setItemError, setItemLoading, setItemSuccess } from './actions';

describe('item > store > actions', () => {
	it('Should create an action to set the item results', () => {
		const id = '123';
		const itemResults = {
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

		const expectedAction = {
			id,
			type: ItemActionTypes.SET_DETAIL_SUCCESS,
			data: itemResults,
		};

		expect(setItemSuccess(id, itemResults)).toMatchObject(expectedAction);
	});

	it('Should create an action to set an error', () => {
		const id = '123';

		const expectedAction = {
			id,
			type: ItemActionTypes.SET_DETAIL_ERROR,
			error: true,
		};

		expect(setItemError(id)).toMatchObject(expectedAction);
	});

	it('Should create an action to set the loading state', () => {
		const id = '123';

		const expectedAction = {
			id,
			type: ItemActionTypes.SET_DETAIL_LOADING,
			loading: true,
		};

		expect(setItemLoading(id)).toMatchObject(expectedAction);
	});
});
