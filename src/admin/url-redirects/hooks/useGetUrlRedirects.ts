import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { SearchOrderDirection } from '@viaa/avo2-types/types/search';

import { OrderDirection } from '../../../search/search.const';
import { QUERY_KEYS } from '../../../shared/constants/query-keys';
import { ITEMS_PER_PAGE } from '../url-redirects.const';
import { UrlRedirectsService } from '../url-redirects.service';
import { type UrlRedirect, type UrlRedirectOverviewFilterState } from '../url-redirects.types';

export const useGetUrlRedirects = (
	params: UrlRedirectOverviewFilterState | undefined,
	options: {
		enabled?: boolean;
		refetchInterval?: number | false;
		refetchIntervalInBackground?: boolean;
	} = {}
): UseQueryResult<{
	urlRedirects: UrlRedirect[];
	count: number;
}> => {
	return useQuery(
		[QUERY_KEYS.GET_URL_REDIRECTS, params],
		async () =>
			UrlRedirectsService.fetchUrlRedirectsOverview({
				query: params?.query,
				created_at: params?.createdAt,
				updated_at: params?.updatedAt,
				old_path_pattern: params?.oldPathPattern,
				sortOrder: params?.sort_order || (OrderDirection.desc as SearchOrderDirection),
				sortColumn: params?.sort_column || 'updated_at',
				limit: ITEMS_PER_PAGE,
				offset: (params?.page || 0) * ITEMS_PER_PAGE,
			}),
		{
			refetchInterval: false,
			refetchIntervalInBackground: false,
			keepPreviousData: true,
			retry: false,
			...options,
		}
	);
};
