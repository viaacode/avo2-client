import { useMutation } from '@tanstack/react-query';

import {
	type KlascementPublishData,
	KlascementService,
} from '../../shared/services/klascement-service';

export const usePublishCollectionToKlascement = () => {
	return useMutation((publishData: KlascementPublishData) =>
		KlascementService.publishCollection(publishData)
	);
};
