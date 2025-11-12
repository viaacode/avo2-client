import { useMutation } from '@tanstack/react-query'

import { KlascementService } from '../../shared/services/klascement-service.js'

export const usePublishAssignmentToKlascement = () => {
  return useMutation({
    mutationFn: (publishData: string): Promise<number> =>
      KlascementService.publishAssignment(publishData),
  })
}
