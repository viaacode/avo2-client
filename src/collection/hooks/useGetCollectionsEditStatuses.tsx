import { useQuery } from '@tanstack/react-query';
import { type Avo } from '@viaa/avo2-types';

import { QUERY_KEYS } from '../../shared/constants/query-keys.js';
import { CollectionService } from '../collection.service.js';

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
	return useQuery<Avo.Share.EditStatusResponse>(
		[QUERY_KEYS.GET_COLLECTIONS_EDIT_STATUSES, collectionsIds],
		() => {
			return CollectionService.getCollectionsEditStatuses(collectionsIds);
		},
		options
	);
};
