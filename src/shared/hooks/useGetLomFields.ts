import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '../constants/query-keys';
import { LomService } from '../services/lom.service';

export const useGetLomFields = (
	type: 'structure' | 'subject' | 'theme',
	options: {
		enabled: boolean;
	} = { enabled: true }
) => {
	return useQuery(
		[QUERY_KEYS.GET_LOM_FIELDS, type, options],
		() => {
			return LomService.fetchLomFields(type);
		},
		options
	);
};
