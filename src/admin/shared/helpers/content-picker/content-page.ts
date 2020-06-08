import { ContentService } from '../../../content/content.service';
import { ContentPageInfo } from '../../../content/content.types';
import { PickerSelectItem } from '../../types';

import { parsePickerItem } from './parse-picker';

// Fetch content items from GQL
export const retrieveContentPages = async (
	title: string | null,
	limit: number = 5
): Promise<PickerSelectItem[]> => {
	const contentItems: ContentPageInfo[] | null = title
		? await ContentService.getContentItemsByTitle(`%${title}%`, limit)
		: await ContentService.getContentItems(limit);

	return parseContentPages(contentItems || []);
};

// Fetch content items of type PROJECT from GQL
export const retrieveProjectContentPages = async (
	title: string | null,
	limit: number = 5
): Promise<PickerSelectItem[]> => {
	const contentItems: Partial<ContentPageInfo>[] | null = title
		? await ContentService.getProjectContentItemsByTitle(`%${title}%`, limit)
		: await ContentService.getProjectContentItems(limit);

	return parseContentPages(contentItems || []);
};

// Parse raw content items to react-select options
const parseContentPages = (raw: Partial<ContentPageInfo>[]): PickerSelectItem[] => {
	return raw.map(
		(item: Partial<ContentPageInfo>): PickerSelectItem => ({
			label: item.title || '',
			value: parsePickerItem('CONTENT_PAGE', item.path as string), // TODO enforce path in database
		})
	);
};
