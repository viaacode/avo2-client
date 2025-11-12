import { useMutation } from '@tanstack/react-query'

import { type CustomError } from '../../shared/helpers/custom-error.js'
import {
  CampaignMonitorService,
  type NewsletterPreferences,
} from '../../shared/services/campaign-monitor-service.js'

export const useUpdateEmailPreferences = () => {
  return useMutation<
    void,
    CustomError,
    {
      newEmailPreferences: Partial<NewsletterPreferences> | null // null means no change to the newsletter preferences, but do create the user if they don't exist yet
      preferencesCenterKey: string | undefined
    }
  >({
    mutationFn: async ({ newEmailPreferences, preferencesCenterKey }) => {
      return CampaignMonitorService.updateNewsletterPreferences(
        newEmailPreferences,
        preferencesCenterKey,
      )
    },
  })
}
