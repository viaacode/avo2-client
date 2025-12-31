import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../../../shared/constants/query-keys';
import { CampaignMonitorService } from '../../../../shared/services/campaign-monitor-service';

export const useGetEmailPreferences = (
  preferenceCenterKey: string,
  options: {
    enabled?: boolean;
  } = {},
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_EMAIL_PREFERENCES, preferenceCenterKey],
    queryFn: () => {
      return CampaignMonitorService.fetchNewsletterPreferences(
        preferenceCenterKey,
      );
    },
    enabled: true,
    staleTime: 0,
    ...options,
  });
};
