import { Avo } from '@viaa/avo2-types';

import { fetchContentItems } from '../../content.service';
import { PickerSelectItem, PickerSelectItemGroup } from '../../content.types';

// Fetch content items from GQL
export const fetchContent = async (limit: number = 5): Promise<PickerSelectItemGroup> => {
	const contentItems: Avo.Content.Content[] | null = await fetchContentItems(limit);

	return parseContentItems(contentItems || []);
};

// Parse raw content items to react-select options
const parseContentItems = (raw: Avo.Content.Content[]): PickerSelectItemGroup => {
	const parsedContentItems = raw.map(
		(item: Avo.Content.Content): PickerSelectItem => ({
			label: item.title,
			value: {
				type: 'content',
				value: item.path,
			},
		})
	);

	return {
		label: 'content',
		options: parsedContentItems,
	};
};
