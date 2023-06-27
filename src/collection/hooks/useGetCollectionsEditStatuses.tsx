import { useQuery } from '@tanstack/react-query';

import { CollectionService } from '../collection.service';

export const useGetCollectionsEditStatuses = (
	collectionsIds: string[],
	enabled: boolean,
	interval: number,
	options: {
		enabled: boolean;
		refetchInterval: number;
		refetchIntervalInBackground: boolean;
	} = {
		enabled: enabled || false,
		refetchInterval: interval || 0,
		refetchIntervalInBackground: true,
	}
) => {
	return useQuery(
		['GET_COLLECTIONS_EDIT_STATUSES', collectionsIds],
		() => {
			return CollectionService.getCollectionsEditStatuses(collectionsIds);
		},
		options
	);
};
