import { type ContentPageInfo, ContentPageService } from '@meemoo/admin-core-ui';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../../shared/constants/query-keys';

export const useGetContentPageByPath = (
	path: string | undefined,
	options?: UseQueryOptions<
		ContentPageInfo | null,
		any,
		ContentPageInfo | null,
		QUERY_KEYS.GET_CONTENT_PAGE_BY_PATH[]
	>
) => {
	return useQuery(
		[QUERY_KEYS.GET_CONTENT_PAGE_BY_PATH],
		() => {
			if (!path) {
				return null;
			}
			return ContentPageService.getContentPageByPath(path);
		},
		options
	);
};
