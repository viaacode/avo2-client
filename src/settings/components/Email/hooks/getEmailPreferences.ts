import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../../../shared/constants/query-keys.js';
import { CampaignMonitorService } from '../../../../shared/services/campaign-monitor-service.js';

export const useGetEmailPreferences = (
	preferenceCenterKey: string,
	options: {
		enabled?: boolean;
	} = {}
) => {
	return useQuery(
		[QUERY_KEYS.GET_EMAIL_PREFERENCES, preferenceCenterKey],
		() => {
			return CampaignMonitorService.fetchNewsletterPreferences(preferenceCenterKey);
		},
		{
			enabled: true,
			cacheTime: 0,
			...options,
		}
	);
};
