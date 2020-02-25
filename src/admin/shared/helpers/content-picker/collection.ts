import { Avo } from '@viaa/avo2-types';

import { CollectionService } from '../../../../collection/collection.service';

import { ContentPickerType, PickerSelectItem } from '../../types/content-picker';
import { parsePickerItem } from './parse-picker';

// Fetch content items from GQL
export const fetchCollections = async (
	keyword: string | null,
	limit: number = 5
): Promise<PickerSelectItem[]> => {
	const collections: Avo.Collection.Collection[] | null = await CollectionService.getCollections(
		keyword,
		limit
	);

	return parseCollections('COLLECTION', collections || []);
};

export const fetchBundles = async (
	keyword: string | null,
	limit: number = 5
): Promise<PickerSelectItem[]> => {
	const bundles: Avo.Collection.Collection[] | null = await CollectionService.getBundles(
		keyword ? `%${keyword}%` : '%',
		limit
	);

	return parseCollections('BUNDLE', bundles || []);
};

// Parse raw content items to react-select options
const parseCollections = (
	type: ContentPickerType,
	raw: Avo.Collection.Collection[]
): PickerSelectItem[] => {
	const parsedCollections = raw.map(
		(item: Avo.Collection.Collection): PickerSelectItem => ({
			label: item.title,
			value: parsePickerItem(type, item.id.toString()),
		})
	);

	return parsedCollections;
};
