import { useQuery } from '@tanstack/react-query';
import { type LomFieldSchema } from '@viaa/avo2-types/types/lom';

import { QUERY_KEYS } from '../constants/query-keys';
import { LomService } from '../services/lom.service';

export const useLomEducationLevelsAndDegrees = () => {
	return useQuery<LomFieldSchema[]>(
		[QUERY_KEYS.GET_EDUCATION_LEVELS_AND_DEGREES],
		() => {
			return LomService.fetchEducationLevelsAndDegrees();
		},
		{
			staleTime: Infinity,
			cacheTime: Infinity,
		}
	);
};
