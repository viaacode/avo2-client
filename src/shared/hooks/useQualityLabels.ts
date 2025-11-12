import {useQuery, UseQueryResult} from '@tanstack/react-query';

import {type QualityLabel} from '../../collection/collection.types.js';
import {QUERY_KEYS} from '../constants/query-keys.js';
import {tHtml} from '../helpers/translate-html.js';
import {QualityLabelsService} from '../services/quality-labels.service.js';

export const useQualityLabels = (enabled = true): UseQueryResult<QualityLabel[]> => {
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
