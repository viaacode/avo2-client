import { UseQueryResult, useQuery } from '@tanstack/react-query';

import { type QualityLabel } from '../../collection/collection.types';
import { QUERY_KEYS } from '../constants/query-keys';
import { tHtml } from '../helpers/translate-html';
import { QualityLabelsService } from '../services/quality-labels.service';

export const useQualityLabels = (
  enabled = true,
): UseQueryResult<QualityLabel[]> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_QUALITY_LABELS],
    queryFn: QualityLabelsService.fetchQualityLabels,
    enabled,
    staleTime: Infinity,
    meta: {
      errorMessage: tHtml(
        'shared/hooks/use-quality-labels___het-ophalen-van-de-kwaliteitslabels-is-mislukt',
      ),
    },
  });
};
