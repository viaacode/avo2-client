import { useQuery } from '@tanstack/react-query';

import { CollectionService } from '../collection.service';

export const useGetCollectionsEditStatuses = (
	collectionsIds: string[],
	interval: number,
	options: {
		enabled: boolean;
		refetchInterval: number;
		refetchIntervalInBackground: boolean;
	} = { enabled: true, refetchInterval: interval || 0, refetchIntervalInBackground: true }
) => {
	return useQuery(
		['GET_COLLECTIONS_EDIT_STATUSES', collectionsIds],
		() => {
			return CollectionService.getCollectionsEditStatuses(collectionsIds);
		},
		options
	);
};
