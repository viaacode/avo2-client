import { Avo } from '@viaa/avo2-types';

import { fetchContentItems } from '../../../content/content.service';

import { PickerSelectItem } from '../../types';
import { parsePickerItem } from './parse-picker';

// Fetch content items from GQL
export const fetchContentPages = async (limit: number = 5): Promise<PickerSelectItem[]> => {
	const contentItems: Avo.Content.Content[] | null = await fetchContentItems(limit);

	return parseContentPages(contentItems || []);
};

// Parse raw content items to react-select options
const parseContentPages = (raw: Avo.Content.Content[]): PickerSelectItem[] => {
	const parsedContentItems = raw.map(
		(item: Avo.Content.Content): PickerSelectItem => ({
			label: item.title,
			value: parsePickerItem('CONTENT_PAGE', item.path as string), // TODO enforce path in database
		})
	);

	return parsedContentItems;
};
