import { Avo } from '@viaa/avo2-types';

import { CollectionService } from '../../../../collection/collection.service';

import { PickerSelectItem, PickerSelectItemGroup } from '../../types/content-picker';
import { parsePickerItem } from './parse-picker';

// Fetch content items from GQL
export const fetchCollections = async (limit: number = 5): Promise<PickerSelectItemGroup> => {
	const collections: Avo.Collection.Collection[] | null = await CollectionService.getCollections(
		limit
	);

	return parseCollections(collections || []);
};

// Parse raw content items to react-select options
const parseCollections = (raw: Avo.Collection.Collection[]): PickerSelectItemGroup => {
	const parsedCollections = raw.map(
		(item: Avo.Collection.Collection): PickerSelectItem => ({
			label: item.title,
			value: parsePickerItem('COLLECTION', item.id.toString()),
		})
	);

	return {
		label: 'Collecties',
		options: parsedCollections,
	};
};
