import { Avo } from '@viaa/avo2-types';

import { CollectionService } from '../../../../collection/collection.service';

import { ContentPickerType, PickerSelectItem } from '../../types/content-picker';
import { parsePickerItem } from './parse-picker';

// TODO: move getBundles and getBundlesByTitle to a seperate bundle service, not collection service.
const { getBundles, getBundlesByTitle, getCollections, getCollectionsByTitle } = CollectionService;

// fetch collections by title-wildcard
export const fetchCollections = async (
	title: string | null,
	limit: number = 5
): Promise<PickerSelectItem[]> => {
	const collections: Avo.Collection.Collection[] | null = title
		? await getCollectionsByTitle(`%${title}%`, limit)
		: await getCollections(limit);

	return parseCollections('COLLECTION', collections || []);
};

// fetch bundles by title-wildcard
export const fetchBundles = async (
	title: string | null,
	limit: number = 5
): Promise<PickerSelectItem[]> => {
	const bundles: Avo.Collection.Collection[] | null = title
		? await getBundlesByTitle(`%${title}%`, limit)
		: await getBundles(limit);

	return parseCollections('BUNDLE', bundles || []);
};

// parse raw data to react-select options
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
