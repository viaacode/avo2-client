import { useQuery } from '@tanstack/react-query';

import { type QualityLabel } from '../../collection/collection.types';
import { QUERY_KEYS } from '../constants/query-keys';
import { tHtml } from '../helpers/translate-html';
import { QualityLabelsService } from '../services/quality-labels.service';

export const useQualityLabels = (enabled = true) => {
	return useQuery<QualityLabel[]>(
		[QUERY_KEYS.GET_QUALITY_LABELS],
		QualityLabelsService.fetchQualityLabels,
		{
			enabled,
			cacheTime: Infinity,
			staleTime: Infinity,
			meta: {
				errorMessage: tHtml(
					'shared/hooks/use-quality-labels___het-ophalen-van-de-kwaliteitslabels-is-mislukt'
				),
			},
		}
	);
};
