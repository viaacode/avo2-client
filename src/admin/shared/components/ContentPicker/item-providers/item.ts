import { type ItemMeta } from '../../../../../shared/types/item';
import { ItemsService } from '../../../../items/items.service';
import { type PickerItem } from '../../../types/content-picker';
import { parsePickerItem } from '../helpers/parse-picker';

// Fetch content items from GQL
export const retrieveItems = async (
	titleOrExternalId: string | null,
	limit = 5
): Promise<PickerItem[]> => {
	const items: ItemMeta[] | null = titleOrExternalId
		? await ItemsService.fetchPublicItemsByTitleOrExternalId(titleOrExternalId, limit)
		: await ItemsService.fetchPublicItems(limit);

	return parseItems(items || []);
};

// Parse raw content items to react-select options
const parseItems = (raw: ItemMeta[]): PickerItem[] => {
	return raw.map((item: ItemMeta): PickerItem => {
		return {
			...parsePickerItem('ITEM', item.external_id.toString()),
			label: item.title,
		};
	});
};
