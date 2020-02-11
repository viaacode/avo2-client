import { Avo } from '@viaa/avo2-types';

import { CollectionService } from '../../../../collection/collection.service';

import {
	ContentPickerType,
	PickerSelectItem,
	PickerSelectItemGroup,
} from '../../types/content-picker';
import { parsePickerItem } from './parse-picker';

// Fetch content items from GQL
export const fetchCollections = async (limit: number = 5): Promise<PickerSelectItemGroup> => {
	const collections: Avo.Collection.Collection[] | null = await CollectionService.getCollections(
		limit
	);

	return parseCollections('COLLECTION', collections || [], 'Collecties');
};

export const fetchBundles = async (limit: number = 5): Promise<PickerSelectItemGroup> => {
	const bundles: Avo.Collection.Collection[] | null = await CollectionService.getBundles(limit);

	return parseCollections('BUNDLE', bundles || [], 'Bundels');
};

// Parse raw content items to react-select options
const parseCollections = (
	type: ContentPickerType,
	raw: Avo.Collection.Collection[],
	label: string
): PickerSelectItemGroup => {
	const parsedCollections = raw.map(
		(item: Avo.Collection.Collection): PickerSelectItem => ({
			label: item.title,
			value: parsePickerItem(type, item.id.toString()),
		})
	);

	return {
		label,
		options: parsedCollections,
	};
};
