import { get } from 'lodash-es';

import { ItemState } from './types';

const selectItem = ({ item }: { item: ItemState }, id: string) => {
	return get(item, [id, 'data']);
};

const selectItemLoading = ({ item }: { item: ItemState }, id: string) => {
	return get(item, [id, 'loading']);
};

const selectItemError = ({ item }: { item: ItemState }, id: string) => {
	return get(item, [id, 'error']);
};

export { selectItem, selectItemLoading, selectItemError };
