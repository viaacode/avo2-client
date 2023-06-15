import { useQuery } from '@tanstack/react-query';

import { QualityLabelsService } from '../services/quality-labels.service';

export const useGetQualityLabels = (
	options: {
		enabled: boolean;
	} = { enabled: true }
) => {
	return useQuery(
		['GET_QUALITY_LABELS'],
		() => {
			return QualityLabelsService.fetchQualityLabels();
		},
		options
	);
};
