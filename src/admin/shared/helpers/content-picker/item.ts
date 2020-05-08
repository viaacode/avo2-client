import { Avo } from '@viaa/avo2-types';

import { getItems, getItemsByTitleOrExternalId } from '../../../../item/item.service';
import { PickerSelectItem } from '../../types';

import { parsePickerItem } from './parse-picker';

// Fetch content items from GQL
export const retrieveItems = async (
	titleOrExternalId: string | null,
	limit: number = 5
): Promise<PickerSelectItem[]> => {
	const items: Avo.Item.Item[] | null = titleOrExternalId
		? await getItemsByTitleOrExternalId(titleOrExternalId, limit)
		: await getItems(limit);

	return parseItems(items || []);
};

// Parse raw content items to react-select options
const parseItems = (raw: Avo.Item.Item[]): PickerSelectItem[] => {
	return raw.map(
		(item: Avo.Item.Item): PickerSelectItem => {
			return {
				label: item.title,
				value: parsePickerItem('ITEM', item.external_id.toString()),
			};
		}
	);
};
