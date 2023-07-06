import { useQuery } from '@tanstack/react-query';

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
