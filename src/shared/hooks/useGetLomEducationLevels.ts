import { useQuery } from '@tanstack/react-query';

import { LomService } from '../services/lom.service';

export const useGetLomEducationLevels = (
	options: {
		enabled: boolean;
	} = { enabled: true }
) => {
	return useQuery(
		['GET_LOM_EDUCATION_LEVELS'],
		() => {
			return LomService.fetchEducationLevels();
		},
		options
	);
};
