import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS } from '../../shared/constants/query-keys.js'
import { CampaignMonitorService } from '../../shared/services/campaign-monitor-service.js'

export const useGetEmailPreferences = (
  options: { enabled: boolean } = { enabled: true },
) => {
  return useQuery(
    [QUERY_KEYS.GET_EMAIL_PREFERENCES],
    () => {
      return CampaignMonitorService.fetchNewsletterPreferences()
    },
    { ...options, keepPreviousData: true },
  )
}
