import { Avo } from '@viaa/avo2-types';
import type { QueryParamConfig } from 'use-query-params';
import {
  decodeString,
  encodeString,
} from '../../../shared/helpers/routing/use-query-params-ssr.ts';

const QUERY_PARAM_SORT_DIRECTIONS = [
  Avo.Search.OrderDirection.ASC,
  Avo.Search.OrderDirection.DESC,
] as const;

export function isSortDirection(
  value: string,
): value is Avo.Search.OrderDirection {
  return QUERY_PARAM_SORT_DIRECTIONS.includes(
    value as Avo.Search.OrderDirection,
  );
}

// Define a query parameter config for `use-query-params` to enforce "asc" & "desc" values
export const SortDirectionParam: QueryParamConfig<
  Avo.Search.OrderDirection,
  string | undefined
> = {
  encode: (input: string): Avo.Search.OrderDirection | null | undefined => {
    if (isSortDirection(input)) {
      return encodeString(input) as Avo.Search.OrderDirection;
    }

    return undefined;
  },

  decode: (
    input: string | (string | null)[] | null | undefined,
  ): Avo.Search.OrderDirection | undefined => {
    if (typeof input === 'string' && isSortDirection(input)) {
      const decoded = decodeString(input);

      if (decoded) {
        return decoded as Avo.Search.OrderDirection;
      }
    }

    return undefined;
  },
};
