import {
  AvoSearchFilterOption,
  AvoSearchFilters,
  AvoSearchOrderDirection,
  AvoSearchOrderProperty,
  AvoSearchResultItem,
} from '@viaa/avo2-types';
import { atom } from 'jotai';
import { type LoginState } from '../authentication/authentication.types';
import { DEFAULT_AUDIO_STILL } from '../shared/constants';
import { CustomError } from '../shared/helpers/custom-error';
import { fetchSearchResults } from './search.service';
import { type SearchState } from './search.types';

export const searchAtom = atom<SearchState>({
  data: null,
  loading: false,
  error: null,
});

export const getSearchResultsAtom = atom<
  LoginState | null,
  [
    AvoSearchOrderProperty,
    AvoSearchOrderDirection,
    number,
    number,
    Partial<AvoSearchFilters> | undefined,
    Partial<AvoSearchFilterOption> | undefined,
  ],
  void
>(
  null,
  async (
    get,
    set,
    orderProperty = 'relevance',
    orderDirection = AvoSearchOrderDirection.DESC,
    from = 0,
    size: number,
    filters,
    filterOptionSearch,
  ) => {
    set(searchAtom, {
      ...get(searchAtom),
      loading: true,
    });

    try {
      const data = await fetchSearchResults(
        orderProperty,
        orderDirection,
        from,
        size,
        filters,
        filterOptionSearch,
      );

      if ((data as any)?.statusCode) {
        console.error(
          new CustomError(
            'Failed to get search results from elasticsearch',
            data,
            {
              orderProperty,
              orderDirection,
              from,
              size,
              filters,
              filterOptionSearch,
            },
          ),
        );

        set(searchAtom, {
          ...get(searchAtom),
          error: true,
        });
      }

      const processedData = {
        ...data,
        results:
          data.results?.map((result: AvoSearchResultItem) => {
            if (result.administrative_type === 'audio') {
              result.thumbnail_path = DEFAULT_AUDIO_STILL;
            }

            return result;
          }) || [],
      };

      set(searchAtom, {
        ...get(searchAtom),
        data: processedData,
        loading: false,
        error: false,
      });
    } catch (err) {
      set(searchAtom, {
        ...get(searchAtom),
        error: err,
      });
    }
  },
);
