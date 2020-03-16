import { Avo } from '@viaa/avo2-types';

import { ContentService } from '../../../content/content.service';
import { PickerSelectItem } from '../../types';

import { parsePickerItem } from './parse-picker';

// Fetch content items from GQL
export const retrieveContentPages = async (
	title: string | null,
	limit: number = 5
): Promise<PickerSelectItem[]> => {
	const contentItems: Avo.Content.Content[] | null = title
		? await ContentService.getContentItemsByTitle(`%${title}`, limit)
		: await ContentService.getContentItems(limit);

	return parseContentPages(contentItems || []);
};

// Parse raw content items to react-select options
const parseContentPages = (raw: Avo.Content.Content[]): PickerSelectItem[] => {
	return raw.map(
		(item: Avo.Content.Content): PickerSelectItem => ({
			label: item.title,
			value: parsePickerItem('CONTENT_PAGE', item.path as string), // TODO enforce path in database
		})
	);
};
