import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/client';

import { AvoSearchFilters, AvoSearchResultItem } from '@viaa/avo2-types';
import { stringify } from 'query-string';
import { DEFAULT_AUDIO_STILL } from '../constants';
import { CustomError } from '../helpers/custom-error';
import { getEnv } from '../helpers/env';

export enum ObjectTypes {
  items = 'items',
  collections = 'collections',
  bundles = 'bundles',
  assignments = 'assignments',
}

export enum ObjectTypesAll {
  items = 'items',
  collections = 'collections',
  bundels = 'bundles',
  assignments = 'assignments',
  all = 'all',
}

export async function getRelatedItems(
  id: string | number,
  type: ObjectTypes,
  returnType: ObjectTypesAll = ObjectTypesAll.all,
  limit = 5,
  filters?: Partial<AvoSearchFilters>,
): Promise<AvoSearchResultItem[]> {
  let url: string | undefined;
  let body: any | undefined;
  try {
    url = `${getEnv('PROXY_URL')}/search/related?${stringify({
      id,
      type,
      returnType,
      limit,
      filters: JSON.stringify(filters || {}),
    })}`;
    const resolvedResponse = await fetchWithLogoutJson<{
      results: AvoSearchResultItem[];
    }>(url);

    // Apply default audio stills
    return (resolvedResponse.results || []).map(
      (result: AvoSearchResultItem) => {
        if (result.administrative_type === 'audio') {
          result.thumbnail_path = DEFAULT_AUDIO_STILL;
        }

        return result;
      },
    );
  } catch (err) {
    throw new CustomError('Failed to get related items', err, {
      id,
      url,
      body,
      limit,
    });
  }
}
