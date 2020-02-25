import { Avo } from '@viaa/avo2-types';

import { getContentItems, getContentItemsByTitle } from '../../../content/content.service';

import { PickerSelectItem } from '../../types';
import { parsePickerItem } from './parse-picker';

// Fetch content items from GQL
export const fetchContentPages = async (
	title: string | null,
	limit: number = 5
): Promise<PickerSelectItem[]> => {
	const contentItems: Avo.Content.Content[] | null = title
		? await getContentItemsByTitle(`%${title}`, limit)
		: await getContentItems(limit);

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
