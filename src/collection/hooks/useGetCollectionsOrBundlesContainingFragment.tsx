import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../shared/constants/query-keys';
import { CollectionService } from '../collection.service';

export const useGetCollectionsOrBundlesContainingFragment = (
	fragmentId: string,
	options: Partial<{
		enabled: boolean;
		refetchInterval: number | false;
		refetchIntervalInBackground?: boolean;
	}> = {}
) => {
	return useQuery<{ id: string; title: string }[]>(
		[QUERY_KEYS.GET_COLLECTIONS_OR_BUNDLES_CONTAINING_FRAGMENT, fragmentId],
		() => {
			return CollectionService.getPublishedCollectionsOrBundlesContainingFragment(fragmentId);
		},
		{
			enabled: true,
			refetchInterval: false,
			refetchIntervalInBackground: false,
			...options,
		}
	);
};
