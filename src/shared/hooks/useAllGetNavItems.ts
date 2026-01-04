import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '../constants/query-keys';
import {
  getAllNavItems,
  type NavItemMap,
} from '../services/navigation-items-service';

export const useAllGetNavItems = (
  options: Partial<{
    enabled: boolean;
  }> = {},
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_NAV_ITEMS],
    queryFn: (): Promise<NavItemMap> => {
      return getAllNavItems();
    },
    enabled: true,
    staleTime: Infinity,
    ...options,
  });
};
