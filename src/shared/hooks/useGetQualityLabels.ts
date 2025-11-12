import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '../constants/query-keys.js';
import { QualityLabelsService } from '../services/quality-labels.service.js';

export const useGetQualityLabels = (
	options: {
		enabled: boolean;
	} = { enabled: true }
) => {
	return useQuery(
		[QUERY_KEYS.GET_QUALITY_LABELS],
		() => {
			return QualityLabelsService.fetchQualityLabels();
		},
		options
	);
};
