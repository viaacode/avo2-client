import { useQuery } from '@tanstack/react-query';

import { CollectionService } from '../collection.service';

export const useGetCollectionsEditStatuses = (
	collectionsIds: string[],
	options: {
		enabled: boolean;
		refetchInterval: number;
		refetchIntervalInBackground?: boolean;
	} = {
		enabled: false,
		refetchInterval: 0,
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
