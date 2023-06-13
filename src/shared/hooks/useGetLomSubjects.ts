import { useQuery } from '@tanstack/react-query';

import { LomService } from '../services/lom.service';

export const useGetLomSubjects = (
	educationLevelIds: string[],
	options: {
		enabled: boolean;
	} = { enabled: true }
) => {
	return useQuery(
		['GET_LOM_SUBJECTS', educationLevelIds],
		() => {
			return LomService.fetchSubjects(educationLevelIds);
		},
		options
	);
};
