import { Avo } from '@viaa/avo2-types';

import { ItemActionTypes } from './types';

import { setItemError, setItemLoading, setItemSuccess } from './actions';

export const DUMMY_ITEM = {
	bookmarks: null,
	browse_path: 'test',
	created_at: 'test',
	depublish_at: null,
	description: 'test',
	duration: 'test',
	expiry_date: null,
	external_id: '123',
	id: 123,
	is_deleted: false,
	is_orphaned: false,
	is_published: true,
	issued: 'test',
	issued_edtf: 'test',
	lom_classification: [],
	lom_context: [],
	lom_intendedenduserrole: [],
	lom_keywords: [],
	lom_languages: [],
	lom_typicalagerange: [],
	org_id: 'test',
	publish_at: null,
	series: 'test',
	thumbnail_path: 'test',
	title: 'test',
	type: 'video' as Avo.Core.ContentType,
	type_id: 2,
	updated_at: 'test',
	views: null,
};

describe('item > store > actions', () => {
	it('Should create an action to set the item results', () => {
		const externalId = DUMMY_ITEM.external_id;
		const itemResults = DUMMY_ITEM;

		const expectedAction = {
			id: externalId,
			type: ItemActionTypes.SET_ITEM_SUCCESS,
			data: itemResults,
		};

		expect(setItemSuccess(externalId, itemResults)).toMatchObject(expectedAction);
	});

	it('Should create an action to set an error', () => {
		const externalId = DUMMY_ITEM.external_id;

		const expectedAction = {
			id: externalId,
			type: ItemActionTypes.SET_ITEM_ERROR,
			error: true,
		};

		expect(setItemError(externalId)).toMatchObject(expectedAction);
	});

	it('Should create an action to set the loading state', () => {
		const externalId = DUMMY_ITEM.external_id;

		const expectedAction = {
			id: externalId,
			type: ItemActionTypes.SET_ITEM_LOADING,
			loading: true,
		};

		expect(setItemLoading(externalId)).toMatchObject(expectedAction);
	});
});
