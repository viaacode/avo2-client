import {useQuery} from '@tanstack/react-query';
import {Avo} from '@viaa/avo2-types';

import {QUERY_KEYS} from '../constants/query-keys.js';
import {LomService} from '../services/lom.service.js';

export const useLomEducationLevelsAndDegrees = () => {
	return useQuery<Avo.Lom.LomField[]>(
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
