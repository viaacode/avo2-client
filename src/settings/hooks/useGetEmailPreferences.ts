import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS } from '../../shared/constants/query-keys.js'
import { CampaignMonitorService } from '../../shared/services/campaign-monitor-service.js'

export const useGetEmailPreferences = (
  options: { enabled: boolean } = { enabled: true },
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_EMAIL_PREFERENCES],
    queryFn: () => {
      return CampaignMonitorService.fetchNewsletterPreferences()
    },
    ...options,
  })
}
