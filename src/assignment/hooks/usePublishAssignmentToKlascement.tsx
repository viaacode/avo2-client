import { useMutation } from '@tanstack/react-query';

import { KlascementService } from '../../shared/services/klascement-service';

export const usePublishAssignmentToKlascement = () => {
	return useMutation(
		(publishData: string): Promise<number> => KlascementService.publishAssignment(publishData)
	);
};
