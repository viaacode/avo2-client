import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { AvoShareEditStatusResponse } from '@viaa/avo2-types';
import { QUERY_KEYS } from '../../shared/constants/query-keys';
import { CollectionService } from '../collection.service';

export const useGetCollectionsEditStatuses = (
  collectionsIds: string[],
  options: {
    enabled: boolean;
    refetchInterval: number | false;
    refetchIntervalInBackground?: boolean;
  } = {
    enabled: true,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  },
): UseQueryResult<AvoShareEditStatusResponse> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_COLLECTIONS_EDIT_STATUSES, collectionsIds],
    queryFn: () => {
      return CollectionService.getCollectionsEditStatuses(collectionsIds);
    },
    ...options,
  });
};
