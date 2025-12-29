import { AvoSearchOrderDirection } from '@viaa/avo2-types';
import type { QueryParamConfig } from 'use-query-params';
import {
  decodeString,
  encodeString,
} from '../../../shared/helpers/routing/use-query-params-ssr.ts';

const QUERY_PARAM_SORT_DIRECTIONS = [
  AvoSearchOrderDirection.ASC,
  AvoSearchOrderDirection.DESC,
] as const;

export function isSortDirection(
  value: string,
): value is AvoSearchOrderDirection {
  return QUERY_PARAM_SORT_DIRECTIONS.includes(value as AvoSearchOrderDirection);
}

// Define a query parameter config for `use-query-params` to enforce "asc" & "desc" values
export const SortDirectionParam: QueryParamConfig<
  AvoSearchOrderDirection,
  string | undefined
> = {
  encode: (input: string): AvoSearchOrderDirection | null | undefined => {
    if (isSortDirection(input)) {
      return encodeString(input) as AvoSearchOrderDirection;
    }

    return undefined;
  },

  decode: (
    input: string | (string | null)[] | null | undefined,
  ): AvoSearchOrderDirection | undefined => {
    if (typeof input === 'string' && isSortDirection(input)) {
      const decoded = decodeString(input);

      if (decoded) {
        return decoded as AvoSearchOrderDirection;
      }
    }

    return undefined;
  },
};
