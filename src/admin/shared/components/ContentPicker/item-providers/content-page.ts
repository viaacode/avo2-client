import {
	type ContentPageInfo,
	ContentPageService,
	type DbContentPage,
} from '@meemoo/admin-core-ui';

import { CustomError } from '../../../../../shared/helpers';
import { type PickerItem } from '../../../types';
import { parsePickerItem } from '../helpers/parse-picker';

// Fetch content items from GQL
export const retrieveContentPages = async (
	title: string | null,
	limit = 5
): Promise<PickerItem[]> => {
	try {
		const contentItems: Pick<DbContentPage, 'path' | 'title'>[] | null = title
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
): Promise<PickerItem[]> => {
	const contentItems: Partial<ContentPageInfo>[] | null = title
		? await ContentPageService.getPublicProjectContentItemsByTitle(`%${title}%`, limit)
		: await ContentPageService.getPublicProjectContentItems(limit);

	return parseContentPages(contentItems || []);
};

// Parse raw content items to react-select options
const parseContentPages = (raw: Partial<ContentPageInfo>[]): PickerItem[] => {
	return raw.map(
		(item: Partial<ContentPageInfo>): PickerItem => ({
			...parsePickerItem('CONTENT_PAGE', item.path as string),
			label: item.title || '',
		})
	);
};
