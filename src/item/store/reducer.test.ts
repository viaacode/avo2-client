import { setItemError, setItemLoading, setItemSuccess } from './actions';
import initialState from './initial-state';
import { ItemActionTypes } from './types';

import { DUMMY_ITEM } from './actions.test';
import itemReducer from './reducer';

describe('item > store > reducer', () => {
	it(`Correctly handle ${ItemActionTypes.SET_ITEM_ERROR}`, () => {
		const id = DUMMY_ITEM.external_id;
		const state = itemReducer(initialState, setItemError(id));

		expect(state[id].error).toEqual(true);
	});

	it(`Correctly handle ${ItemActionTypes.SET_ITEM_LOADING}`, () => {
		const id = DUMMY_ITEM.external_id;
		const state = itemReducer(initialState, setItemLoading(id));

		expect(state[id].loading).toEqual(true);
	});

	it(`Correctly handle ${ItemActionTypes.SET_ITEM_SUCCESS}`, () => {
		const id = DUMMY_ITEM.external_id;
		const payload = DUMMY_ITEM;

		const state = itemReducer(initialState, setItemSuccess(id, payload));

		expect(state[id].data).toEqual(payload);
	});
});
