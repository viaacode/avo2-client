import { ContentPageInfo } from '@meemoo/admin-core-ui';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { ContentPageService } from '../services/content-page.service';

export const useGetContentPageByPath = (
	path: string | undefined,
	options?: UseQueryOptions<
		ContentPageInfo | null,
		any,
		ContentPageInfo | null,
		'GET_CONTENT_PAGE_BY_PATH'[]
	>
) => {
	return useQuery(
		['GET_CONTENT_PAGE_BY_PATH'],
		() => {
			if (!path) {
				return null;
			}
			return ContentPageService.getContentPageByPath(path);
		},
		options
	);
};