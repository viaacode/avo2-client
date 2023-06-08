import { useQuery } from '@tanstack/react-query';

import { LomService } from '../services/lom.service';

export const useGetLomThemes = (
	lomIds: string[],
	options: {
		enabled: boolean;
	} = { enabled: true }
) => {
	return useQuery(
		['GET_LOM_THEMES', lomIds],
		() => {
			return LomService.fetchThemes(lomIds);
		},
		options
	);
};
