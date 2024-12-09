import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '../constants/query-keys';
import { getAllNavItems, type NavItemMap } from '../services/navigation-items-service';

export const useAllGetNavItems = (
	options: Partial<{
		enabled: boolean;
	}> = {}
) => {
	return useQuery(
		[QUERY_KEYS.GET_NAV_ITEMS],
		(): Promise<NavItemMap> => {
			return getAllNavItems();
		},
		{
			enabled: true,
			cacheTime: Infinity,
			staleTime: Infinity,
			...options,
		}
	);
};
