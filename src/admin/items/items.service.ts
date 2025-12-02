import { type Avo } from '@viaa/avo2-types';
import { compact } from 'es-toolkit';
import queryString, { stringifyUrl } from 'query-string';

import type {
  DeleteItemFromCollectionBookmarksAndAssignmentsMutation,
  DeleteItemFromCollectionBookmarksAndAssignmentsMutationVariables,
  GetDistinctSeriesQuery,
  GetDistinctSeriesQueryVariables,
  GetItemDepublishReasonByExternalIdQuery,
  GetItemDepublishReasonByExternalIdQueryVariables,
  GetItemsByExternalIdQuery,
  GetItemsByExternalIdQueryVariables,
  GetPublicItemsByTitleOrExternalIdQuery,
  GetPublicItemsByTitleOrExternalIdQueryVariables,
  GetPublicItemsQuery,
  GetPublicItemsQueryVariables,
  GetUnpublishedItemPidsQuery,
  GetUnpublishedItemPidsQueryVariables,
  GetUnpublishedItemsWithFiltersQuery,
  GetUnpublishedItemsWithFiltersQueryVariables,
  GetUserWithEitherBookmarkQuery,
  GetUserWithEitherBookmarkQueryVariables,
  ReplaceItemInCollectionsBookmarksAndAssignmentsMutation,
  ReplaceItemInCollectionsBookmarksAndAssignmentsMutationVariables,
  SetSharedItemsStatusMutation,
  SetSharedItemsStatusMutationVariables,
  UpdateItemDepublishReasonMutation,
  UpdateItemDepublishReasonMutationVariables,
  UpdateItemNotesMutation,
  UpdateItemNotesMutationVariables,
  UpdateItemPublishedStateMutation,
  UpdateItemPublishedStateMutationVariables,
} from '../../shared/generated/graphql-db-operations';
import {
  DeleteItemFromCollectionBookmarksAndAssignmentsDocument,
  GetDistinctSeriesDocument,
  GetItemDepublishReasonByExternalIdDocument,
  GetItemsByExternalIdDocument,
  GetPublicItemsByTitleOrExternalIdDocument,
  GetPublicItemsDocument,
  GetUnpublishedItemPidsDocument,
  GetUnpublishedItemsWithFiltersDocument,
  GetUserWithEitherBookmarkDocument,
  ReplaceItemInCollectionsBookmarksAndAssignmentsDocument,
  SetSharedItemsStatusDocument,
  UpdateItemDepublishReasonDocument,
  UpdateItemNotesDocument,
  UpdateItemPublishedStateDocument,
} from '../../shared/generated/graphql-db-react-query';
import { Lookup_Enum_Relation_Types_Enum } from '../../shared/generated/graphql-db-types';
import { CustomError } from '../../shared/helpers/custom-error';
import { addDefaultAudioStillToItem } from '../../shared/helpers/default-still';
import { getEnv } from '../../shared/helpers/env';
import { dataService } from '../../shared/services/data-service';
import { RelationService } from '../../shared/services/relation-service/relation.service';
import { type UnpublishableItem } from '../../shared/types';

import { ITEMS_PER_PAGE } from './items.const';
import {
  type ItemsOverviewTableCols,
  type ItemUsedByResponse,
  type UnpublishedItem,
  type UnpublishedItemsOverviewTableCols,
} from './items.types';

export class ItemsService {
  public static async fetchItemsWithFilters(
    offset: number,
    limit: number,
    sortColumn: ItemsOverviewTableCols,
    sortOrder: Avo.Search.OrderDirection,
    filters: any,
  ): Promise<{ items: Avo.Item.Item[]; total: number }> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/admin'
      );
      return await fetchWithLogoutJson<{
        items: Avo.Item.Item[];
        total: number;
      }>(
        stringifyUrl({
          url: `${getEnv('PROXY_URL')}/items/admin/overview`,
          query: {
            offset,
            limit,
            sortColumn,
            sortOrder,
            filters: JSON.stringify(filters),
          },
        }),
      );
    } catch (err) {
      throw new CustomError(
        'Failed to get items overview from the database',
        err,
        {
          offset,
          limit,
          sortColumn,
          sortOrder,
          filters,
        },
      );
    }
  }

  public static async fetchUnpublishedItemsWithFilters(
    page: number,
    sortColumn: UnpublishedItemsOverviewTableCols,
    sortOrder: Avo.Search.OrderDirection,
    where: GetUnpublishedItemsWithFiltersQueryVariables['where'],
  ): Promise<[UnpublishedItem[], number]> {
    let variables: GetUnpublishedItemsWithFiltersQueryVariables | null = null;
    try {
      variables = {
        where,
        offset: ITEMS_PER_PAGE * page,
        limit: ITEMS_PER_PAGE,
        orderBy: [{ [sortColumn]: sortOrder }],
      };

      const response = await dataService.query<
        GetUnpublishedItemsWithFiltersQuery,
        GetUnpublishedItemsWithFiltersQueryVariables
      >({
        variables,
        query: GetUnpublishedItemsWithFiltersDocument,
      });

      const items = response.shared_items;
      const itemCount = response.shared_items_aggregate.aggregate?.count ?? 0;

      if (!items) {
        throw new CustomError('Response does not contain any items', null, {
          response,
        });
      }

      return [items as UnpublishedItem[], itemCount];
    } catch (err) {
      throw new CustomError(
        'Failed to get shared items from the database',
        err,
        {
          variables,
          query: 'GET_UNPUBLISHED_ITEMS_WITH_FILTERS',
        },
      );
    }
  }

  public static async fetchItemByUuid(
    uuid: string,
    withRelations: boolean,
  ): Promise<Avo.Item.Item> {
    let url: string | null = null;
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      url = stringifyUrl({
        url: `${getEnv('PROXY_URL')}/items/${uuid}`,
        query: {
          withRelations,
        },
      });
      return await fetchWithLogoutJson<Avo.Item.Item>(url);
    } catch (err) {
      throw new CustomError('Failed to get the item from the database', err, {
        uuid,
      });
    }
  }

  static async setItemPublishedState(
    itemUuid: string,
    isPublished: boolean,
  ): Promise<void> {
    let variables: UpdateItemPublishedStateMutationVariables | null = null;
    try {
      variables = {
        itemUuid,
        isPublished,
      };
      await dataService.query<
        UpdateItemPublishedStateMutation,
        UpdateItemPublishedStateMutationVariables
      >({
        query: UpdateItemPublishedStateDocument,
        variables,
      });
    } catch (err) {
      throw new CustomError(
        'Failed to update is_published field for item in the database',
        err,
        {
          variables,
          query: 'UPDATE_ITEM_PUBLISH_STATE',
        },
      );
    }
  }

  static async setItemDepublishReason(
    itemUuid: string,
    reason: null | string,
  ): Promise<void> {
    let variables: UpdateItemDepublishReasonMutationVariables | null = null;
    try {
      variables = {
        itemUuid,
        reason,
      };
      await dataService.query<
        UpdateItemDepublishReasonMutation,
        UpdateItemDepublishReasonMutationVariables
      >({
        variables,
        query: UpdateItemDepublishReasonDocument,
      });
    } catch (err) {
      throw new CustomError(
        'Failed to update depublish_reason field for item in the database',
        err,
        {
          variables,
          query: 'UPDATE_ITEM_DEPUBLISH_REASON',
        },
      );
    }
  }

  static async setItemNotes(
    itemUuid: string,
    note: string | null,
  ): Promise<void> {
    let variables: UpdateItemNotesMutationVariables | null = null;
    try {
      variables = {
        itemUuid,
        note,
      };
      await dataService.query<
        UpdateItemNotesMutation,
        UpdateItemNotesMutationVariables
      >({
        variables,
        query: UpdateItemNotesDocument,
      });
    } catch (err) {
      throw new CustomError(
        'Failed to update note field for item in the database',
        err,
        {
          variables,
          query: 'UPDATE_ITEM_NOTES',
        },
      );
    }
  }

  public static async fetchPublicItems(
    limit: number,
  ): Promise<GetPublicItemsQuery['app_item_meta'] | null> {
    const variables: GetPublicItemsQueryVariables = { limit };

    const response = await dataService.query<
      GetPublicItemsQuery,
      GetPublicItemsQueryVariables
    >({
      query: GetPublicItemsDocument,
      variables,
    });

    return response.app_item_meta;
  }

  private static async fetchDepublishReasonByExternalId(
    externalId: string,
  ): Promise<string | null> {
    const variables: GetItemDepublishReasonByExternalIdQueryVariables = {
      externalId,
    };
    const response = await dataService.query<
      GetItemDepublishReasonByExternalIdQuery,
      GetItemDepublishReasonByExternalIdQueryVariables
    >({
      query: GetItemDepublishReasonByExternalIdDocument,
      variables,
    });
    return response.app_item_meta[0]?.depublish_reason || null;
  }

  public static async fetchItemByExternalId(
    externalId: string,
  ): Promise<UnpublishableItem> {
    return (await this.fetchItemsByExternalIds([externalId]))[0] || null;
  }

  public static async fetchItemsByExternalIds(
    externalIds: string[],
  ): Promise<Array<UnpublishableItem>> {
    if (externalIds.length < 1) {
      return [];
    }

    try {
      const response = await dataService.query<
        GetItemsByExternalIdQuery,
        GetItemsByExternalIdQueryVariables
      >({
        query: GetItemsByExternalIdDocument,
        variables: {
          externalIds,
        },
      });

      const items = response.app_item_meta ?? [];

      return Promise.all(
        externalIds.map((externalId) => {
          // Return item if an item is found that is published and not deleted
          const item = items.find((item) => item.external_id === externalId);

          if (item) {
            return (
              addDefaultAudioStillToItem(item as unknown as Avo.Item.Item) ||
              null
            );
          }

          return this.fetchItemReplacementByExternalId(externalId);
        }),
      );
    } catch (err) {
      throw new CustomError('Failed to get items by external id', err, {
        externalIds,
        query: 'GET_ITEMS_BY_EXTERNAL_ID',
      });
    }
  }

  public static async fetchItemReplacementByExternalId(
    externalId: string,
  ): Promise<UnpublishableItem> {
    // Return the replacement item if a REPLACED_BY relation is found for the current item
    // TODO replace with single query to fetch depublish_reason and relations after task is done: https://meemoo.atlassian.net/browse/DEV-1166
    const itemUid = await ItemsService.fetchItemUuidByExternalId(externalId);

    if (itemUid) {
      const relations = await RelationService.fetchRelationsBySubject(
        'item',
        [itemUid],
        Lookup_Enum_Relation_Types_Enum.IsReplacedBy,
      );

      const replacedByItemUid = relations?.[0]?.object || null;

      if (replacedByItemUid) {
        const replacementItem = await ItemsService.fetchItemByUuid(
          replacedByItemUid,
          false,
        );
        return { ...replacementItem, replacement_for: externalId };
      }
    }

    // Return the depublish reason if the item has a depublish reason
    const depublishReason =
      await this.fetchDepublishReasonByExternalId(externalId);

    if (depublishReason) {
      return {
        depublish_reason: depublishReason,
      } as Avo.Item.Item;
    }

    // otherwise return null
    return null;
  }

  public static async fetchItemExternalIdByMediamosaId(
    mediamosaId: string,
  ): Promise<string | null> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );

      const response = await fetchWithLogoutJson<{ externalId: string } | null>(
        `${getEnv(
          'PROXY_URL',
        )}/collections/fetch-external-id-by-mediamosa-id?${queryString.stringify(
          {
            id: mediamosaId,
          },
        )}`,
      );

      return response?.externalId || null;
    } catch (err) {
      throw new CustomError(
        'Failed to get external_id by mediamosa id (avo1 id)',
        err,
        {
          mediamosaId,
        },
      );
    }
  }

  public static async fetchItemUuidByExternalId(
    externalId: string,
  ): Promise<string | null> {
    try {
      const { fetchWithLogout } = await import('@meemoo/admin-core-ui/admin');
      const response = await fetchWithLogout(
        stringifyUrl({
          url: `${getEnv('PROXY_URL')}/admin/items/ids`,
          query: {
            externalId,
          },
        }),
      );
      if (response.ok) {
        return (await response.text()) || null;
      }
      return null;
    } catch (err) {
      throw new CustomError('Failed to fetch item uuid by external id', err, {
        externalId,
      });
    }
  }

  public static async fetchPublicItemsByTitleOrExternalId(
    titleOrExternalId: string,
    limit: number,
  ): Promise<
    | GetPublicItemsByTitleOrExternalIdQuery['itemsByExternalId']
    | GetPublicItemsByTitleOrExternalIdQuery['itemsByTitle']
  > {
    try {
      const variables: GetPublicItemsByTitleOrExternalIdQueryVariables = {
        limit,
        title: `%${titleOrExternalId}%`,
        externalId: titleOrExternalId,
      };

      const response = await dataService.query<
        GetPublicItemsByTitleOrExternalIdQuery,
        GetPublicItemsByTitleOrExternalIdQueryVariables
      >({
        query: GetPublicItemsByTitleOrExternalIdDocument,
        variables,
      });

      let items = response.itemsByExternalId || [];

      if (items.length === 0) {
        items = response.itemsByTitle || [];
      }

      return items;
    } catch (err) {
      throw new CustomError(
        'Failed to fetch items by title or external id',
        err,
        {
          titleOrExternalId,
          limit,
          query: 'GET_PUBLIC_ITEMS_BY_TITLE_OR_EXTERNAL_ID',
        },
      );
    }
  }

  public static async fetchAllSeries(): Promise<string[]> {
    try {
      const response = await dataService.query<
        GetDistinctSeriesQuery,
        GetDistinctSeriesQueryVariables
      >({
        query: GetDistinctSeriesDocument,
      });

      return compact((response.app_item_meta || []).map((item) => item.series));
    } catch (err) {
      throw new CustomError(
        'Failed to fetch distinct series from the database',
        err,
        {
          query: 'GET_DISTINCT_SERIES',
        },
      );
    }
  }

  public static async deleteItemFromCollectionsAndBookmarks(
    itemUid: string,
    itemExternalId: string,
  ): Promise<void> {
    try {
      await dataService.query<
        DeleteItemFromCollectionBookmarksAndAssignmentsMutation,
        DeleteItemFromCollectionBookmarksAndAssignmentsMutationVariables
      >({
        query: DeleteItemFromCollectionBookmarksAndAssignmentsDocument,
        variables: {
          itemUid,
          itemExternalId,
        },
      });
    } catch (err) {
      throw new CustomError(
        'Failed to delete item from collections and bookmarks in the database',
        err,
        {
          query: 'DELETE_ITEM_FROM_COLLECTIONS_BOOKMARKS',
        },
      );
    }
  }

  public static async replaceItemInCollectionsAndBookmarks(
    oldItemUid: string,
    oldItemExternalId: string,
    newItemUid: string,
    newItemExternalId: string,
  ): Promise<void> {
    try {
      const variables: GetUserWithEitherBookmarkQueryVariables = {
        oldItemUid,
        newItemUid,
      };

      const response = await dataService.query<
        GetUserWithEitherBookmarkQuery,
        GetUserWithEitherBookmarkQueryVariables
      >({
        query: GetUserWithEitherBookmarkDocument,
        variables,
      });

      const usersWithBothBookmarks = response.users_profiles
        .filter(
          (result) =>
            (result.item_bookmarks_aggregate.aggregate?.count || 0) >= 2,
        )
        .map((profile) => profile.id);

      const variablesReplace: ReplaceItemInCollectionsBookmarksAndAssignmentsMutationVariables =
        {
          oldItemUid,
          oldItemExternalId,
          newItemUid,
          newItemExternalId,
          usersWithBothBookmarks,
        };
      await dataService.query<
        ReplaceItemInCollectionsBookmarksAndAssignmentsMutation,
        ReplaceItemInCollectionsBookmarksAndAssignmentsMutationVariables
      >({
        query: ReplaceItemInCollectionsBookmarksAndAssignmentsDocument,
        variables: variablesReplace,
      });
    } catch (err) {
      throw new CustomError(
        'Failed to replace item in collections, bookmarks and assignments in the database',
        err,
        {
          query: 'REPLACE_ITEM_IN_COLLECTIONS_BOOKMARKS_AND_ASSIGNMENTS',
        },
      );
    }
  }

  public static async setSharedItemsStatus(
    pids: string[],
    status: string,
  ): Promise<void> {
    try {
      await dataService.query<
        SetSharedItemsStatusMutation,
        SetSharedItemsStatusMutationVariables
      >({
        query: SetSharedItemsStatusDocument,
        variables: {
          pids,
          status,
        },
      });
    } catch (err) {
      throw new CustomError(
        'Failed to update status for shared items in the database',
        err,
        {
          query: 'SET_SHARED_ITEMS_STATUS',
        },
      );
    }
  }

  /**
   * Returns result of request of MAM sync
   * either:
   * - started
   * - running
   */
  public static async triggerMamSync(): Promise<'SCHEDULED' | string> {
    let url: string | undefined = undefined;
    try {
      const { fetchWithLogout } = await import('@meemoo/admin-core-ui/admin');
      url = `${getEnv('PROXY_URL')}/mam-syncrator/trigger-delta-sync`;
      const response = await fetchWithLogout(url, {
        method: 'POST',
      });

      const body = await response.text();
      if (response.status < 200 || response.status >= 400) {
        throw new CustomError('Response code indicates failure', null, {
          response,
          body,
        });
      }
      return body;
    } catch (err) {
      throw new CustomError('Failed to trigger MAM sync', err, {
        url,
      });
    }
  }

  static async getUnpublishedItemPids(where: any = {}): Promise<string[]> {
    let variables: GetUnpublishedItemPidsQueryVariables | null = null;
    try {
      variables = {
        where: where || undefined,
      };
      const response = await dataService.query<
        GetUnpublishedItemPidsQuery,
        GetUnpublishedItemPidsQueryVariables
      >({
        query: GetUnpublishedItemPidsDocument,
        variables,
      });
      return compact(response.shared_items.map((item) => item?.pid));
    } catch (err) {
      throw new CustomError(
        'Failed to get unpublished item pids from the database',
        err,
        {
          variables,
          query: 'GET_UNPUBLISHED_ITEM_PIDS',
        },
      );
    }
  }

  static async getItemUsedBy(
    itemUuid: string,
    sortProp: string | undefined,
    sortDirection: string | undefined,
  ): Promise<ItemUsedByResponse> {
    let url: string | null = null;
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      url = stringifyUrl({
        url: `${getEnv('PROXY_URL')}/items/${itemUuid}/used-by`,
        query: {
          sortProp,
          sortDirection,
        },
      });
      return await fetchWithLogoutJson<ItemUsedByResponse>(url);
    } catch (err) {
      throw new CustomError(
        'Failed to get item used by from the database',
        err,
        {
          itemUuid,
        },
      );
    }
  }
}
