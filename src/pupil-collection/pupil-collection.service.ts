import { AvoAssignmentResponse, AvoCoreBlockItemBase, AvoItemItem, AvoSearchOrderDirection, } from '@viaa/avo2-types';
import { stringifyUrl } from 'query-string';
import { ITEMS_PER_PAGE } from '../admin/pupil-collection/pupil-collection.const';
import { type ItemTrimInfo } from '../item/item.types';
import { CustomError } from '../shared/helpers/custom-error';
import { getEnv } from '../shared/helpers/env';
import { type TableColumnDataType } from '../shared/types/table-column-data-type';
import { type PupilCollectionOverviewTableColumns } from './pupil-collection.types';

export class PupilCollectionService {
  static async fetchPupilCollectionsForAdmin(
    offset: number,
    limit: number,
    sortColumn: PupilCollectionOverviewTableColumns,
    sortOrder: AvoSearchOrderDirection,
    tableColumnDataType: TableColumnDataType,
    where: any = {},
  ): Promise<{
    assignmentResponses: AvoAssignmentResponse[];
    count: number;
  }> {
    let url: string | undefined = undefined;

    try {
      url = stringifyUrl({
        url: `${getEnv('PROXY_URL')}/pupil-collection`,
        query: {
          offset,
          limit: limit || ITEMS_PER_PAGE,
          sortColumn,
          sortOrder,
          tableColumnDataType,
          filters: JSON.stringify(where),
        },
      });
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return fetchWithLogoutJson(url);
    } catch (err) {
      throw new CustomError(
        'Failed to get pupil collections from the database',
        err,
        {
          url,
        },
      );
    }
  }

  static async getPupilCollectionIds(where: any = {}): Promise<string[]> {
    let url: string | undefined = undefined;

    try {
      url = stringifyUrl({
        url: `${getEnv('PROXY_URL')}/pupil-collection/collection-ids`,
        query: {
          filters: JSON.stringify(where),
        },
      });
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return fetchWithLogoutJson(url);
    } catch (err) {
      throw new CustomError(
        'Failed to get pupil collection ids from the database',
        err,
        {
          url,
        },
      );
    }
  }

  static async changePupilCollectionsAuthor(
    profileId: string,
    pupilCollectionIds: string[],
  ): Promise<number> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/pupil-collection/update-author`,
        {
          method: 'POST',
          body: JSON.stringify({
            profileId,
            pupilCollectionIds,
          }),
        },
      );
    } catch (err) {
      const error = new CustomError(
        'Failed to update author for pupil collections in the database',
        err,
        {
          profileId,
          pupilCollectionIds,
        },
      );

      console.error(error);
      throw error;
    }
  }

  static async importFragmentToPupilCollection(
    item: AvoItemItem,
    assignmentResponseId: string,
    itemTrimInfo?: ItemTrimInfo,
  ): Promise<AvoCoreBlockItemBase> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/pupil-collection/${assignmentResponseId}/import-fragment`,
        {
          method: 'POST',
          body: JSON.stringify({
            item,
            itemTrimInfo,
          }),
        },
      );
    } catch (err) {
      const error = new CustomError(
        'Failed to insert block into pupil collection',
        err,
        {
          assignmentResponseId,
          item,
          itemTrimInfo,
        },
      );

      console.error(error);
      throw error;
    }
  }
}
