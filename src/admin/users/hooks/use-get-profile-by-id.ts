import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { AvoUserCommonUser } from '@viaa/avo2-types';
import { QUERY_KEYS } from '../../../shared/constants/query-keys';

export const useGetProfileById = (
  id: string | undefined | null,
  options?: UseQueryOptions<
    AvoUserCommonUser | null,
    any,
    AvoUserCommonUser | null,
    (typeof QUERY_KEYS.GET_PROFILE_BY_ID)[]
  >,
): UseQueryResult<AvoUserCommonUser | null> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_PROFILE_BY_ID],
    queryFn: async () => {
      if (!id) {
        return null;
      }
      const { UserService } = await import('@meemoo/admin-core-ui/admin');
      return UserService.getUserById(String(id));
    },
    ...options,
  });
};
