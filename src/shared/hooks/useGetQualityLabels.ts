import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { QualityLabel } from '../../collection/collection.types.ts';
import { QUERY_KEYS } from '../constants/query-keys';
import { QualityLabelsService } from '../services/quality-labels.service';

export const useGetQualityLabels = (
  options: { enabled: boolean } = { enabled: true },
): UseQueryResult<QualityLabel[], Error> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_QUALITY_LABELS],
    queryFn: () => {
      return QualityLabelsService.fetchQualityLabels();
    },
    ...options,
  });
};
