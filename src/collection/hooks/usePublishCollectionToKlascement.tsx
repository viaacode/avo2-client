import { useMutation } from '@tanstack/react-query'

import {
  type KlascementPublishCollectionData,
  KlascementService,
} from '../../shared/services/klascement-service.js'

export const usePublishCollectionToKlascement = () => {
  return useMutation((publishData: KlascementPublishCollectionData) =>
    KlascementService.publishCollection(publishData),
  )
}
