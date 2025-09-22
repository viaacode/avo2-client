import { useQuery } from '@tanstack/react-query';
import type { Avo } from '@viaa/avo2-types';

import { QUERY_KEYS } from '../constants/query-keys';
import { LabelsClassesService } from '../services/labels-classes';

export const useGetLabelColors = (
	options: Partial<{
		enabled: boolean;
	}> = {}
) => {
	return useQuery(
		[QUERY_KEYS.GET_LABEL_COLORS],
		(): Promise<Avo.LabelOrClass.Color[]> => {
			return LabelsClassesService.getLabelColors();
		},
		{
			enabled: true,
			staleTime: 1000 * 60 * 60,
			...options,
		}
	);
};
