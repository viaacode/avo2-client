import { useQuery } from '@tanstack/react-query';
import type { Avo } from '@viaa/avo2-types';

import { QUERY_KEYS } from '../constants/query-keys';
import { LabelsClassesService } from '../services/labels-classes';

export const useGetLabelsForProfile = (
	type?: string,
	options: Partial<{
		enabled: boolean;
	}> = {}
) => {
	return useQuery(
		[QUERY_KEYS.GET_LABELS_OR_CLASSES, type],
		(): Promise<Avo.LabelOrClass.LabelOrClass[]> => {
			return LabelsClassesService.getLabelsForProfile(type);
		},
		{
			enabled: true,
			...options,
		}
	);
};
