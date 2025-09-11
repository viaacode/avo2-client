import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../../shared/constants/query-keys';
import { INITIAL_URL_REDIRECT } from '../url-redirects.const';
import { UrlRedirectsService } from '../url-redirects.service';
import { type UrlRedirect } from '../url-redirects.types';

export const useGetUrlRedirectById = (
	urlRedirectId: number,
	options: {
		enabled?: boolean;
		refetchInterval?: number | false;
		refetchIntervalInBackground?: boolean;
	} = {}
): UseQueryResult<UrlRedirect> => {
	return useQuery(
		[QUERY_KEYS.GET_URL_REDIRECTS, urlRedirectId],
		async () => {
			if (!urlRedirectId) {
				return INITIAL_URL_REDIRECT();
			}
			return UrlRedirectsService.fetchSingleUrlRedirect(urlRedirectId);
		},
		{
			refetchInterval: false,
			refetchIntervalInBackground: false,
			keepPreviousData: true,
			retry: false,
			...options,
		}
	);
};
