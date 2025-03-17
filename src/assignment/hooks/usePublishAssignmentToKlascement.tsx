import { useMutation } from '@tanstack/react-query';

import {
	type KlascementPublishAssignmentData,
	KlascementService,
} from '../../shared/services/klascement-service';

export const usePublishAssignmentToKlascement = () => {
	return useMutation(
		(publishData: KlascementPublishAssignmentData): Promise<number> =>
			KlascementService.publishAssignment(publishData)
	);
};
