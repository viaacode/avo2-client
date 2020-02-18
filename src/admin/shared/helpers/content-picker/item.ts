import { Avo } from '@viaa/avo2-types';

import { getItems } from '../../../../item/item.service';

import { PickerSelectItem } from '../../types';
import { parsePickerItem } from './parse-picker';

// Fetch content items from GQL
export const fetchItems = async (limit: number = 5): Promise<PickerSelectItem[]> => {
	const items: Avo.Item.Item[] | null = await getItems(limit);

	return parseItems(items || []);
};

// Parse raw content items to react-select options
const parseItems = (raw: Avo.Item.Item[]): PickerSelectItem[] => {
	const parsedItems = raw.map(
		(item: Avo.Item.Item): PickerSelectItem => ({
			label: item.title,
			value: parsePickerItem('ITEM', item.external_id.toString()),
		})
	);

	return parsedItems;
};
