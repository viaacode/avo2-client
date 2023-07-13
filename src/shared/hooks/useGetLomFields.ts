import { useQuery } from '@tanstack/react-query';

import { LomService } from '../services/lom.service';

export const useGetLomFields = (
	type: 'structure' | 'subject' | 'theme',
	options: {
		enabled: boolean;
	} = { enabled: true }
) => {
	return useQuery(
		['GET_LOM_FIELDS', type, options],
		() => {
			return LomService.fetchLomFields(type);
		},
		options
	);
};
