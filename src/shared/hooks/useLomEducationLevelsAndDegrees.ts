import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AvoLomLomField } from '@viaa/avo2-types';
import { QUERY_KEYS } from '../constants/query-keys';
import { LomService } from '../services/lom.service';

export const useLomEducationLevelsAndDegrees = (): UseQueryResult<
  AvoLomLomField[],
  Error
> => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_EDUCATION_LEVELS_AND_DEGREES],
    queryFn: () => {
      return LomService.fetchEducationLevelsAndDegrees();
    },
    staleTime: Infinity,
  });
};
