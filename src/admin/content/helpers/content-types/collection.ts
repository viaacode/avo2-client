import { Avo } from '@viaa/avo2-types';

import { CollectionService } from '../../../../collection/collection.service';
import {
	PickerSelectItem,
	PickerSelectItemGroup,
} from '../../components/ContentPicker/ContentPicker.types';

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
			value: {
				type: 'collection',
				value: item.id.toString(),
			},
		})
	);

	return {
		label: 'collections',
		options: parsedCollections,
	};
};
