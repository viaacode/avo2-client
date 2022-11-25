import { ContentPageDb, ContentPageInfo, ContentPageService } from '@meemoo/admin-core-ui';

import { CustomError } from '../../../../../shared/helpers';
import { PickerSelectItem } from '../../../types';
import { parsePickerItem } from '../helpers/parse-picker';

// Fetch content items from GQL
export const retrieveContentPages = async (
	title: string | null,
	limit = 5
): Promise<PickerSelectItem[]> => {
	try {
		const contentItems: Pick<ContentPageDb, 'path' | 'title'>[] | null = title
			? await ContentPageService.getPublicContentItemsByTitle(`%${title}%`, limit)
			: await ContentPageService.getPublicContentItems(limit);

		return parseContentPages(contentItems || []);
	} catch (err) {
		throw new CustomError('Failed to fetch content pages for content picker', err, {
			title,
			limit,
		});
	}
};

// Fetch content items of type PROJECT from GQL
export const retrieveProjectContentPages = async (
	title: string | null,
	limit = 5
): Promise<PickerSelectItem[]> => {
	const contentItems: Partial<ContentPageInfo>[] | null = title
		? await ContentPageService.getPublicProjectContentItemsByTitle(`%${title}%`, limit)
		: await ContentPageService.getPublicProjectContentItems(limit);

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
