import { DUMMY_ITEM } from './actions.test';
import { selectItem, selectItemError, selectItemLoading } from './selectors';

describe('item > store > selectors', () => {
	const store = {
		item: {
			[DUMMY_ITEM.external_id]: {
				data: DUMMY_ITEM,
				loading: false,
				error: false,
			},
		},
	};

	it('Should get the item error-state from the store', () => {
		expect(selectItemError(store, DUMMY_ITEM.external_id)).toEqual(false);
	});

	it('Should get the item loading-state from the store', () => {
		expect(selectItemLoading(store, DUMMY_ITEM.external_id)).toEqual(false);
	});

	it('Should get the item data from the store', () => {
		expect(selectItem(store, DUMMY_ITEM.external_id)).toMatchObject(
			store.item[DUMMY_ITEM.external_id].data
		);
	});
});
