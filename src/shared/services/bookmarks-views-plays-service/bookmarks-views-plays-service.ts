import { AvoContentTypeEnglish, AvoUserCommonUser } from '@viaa/avo2-types';

import { compact, groupBy, noop } from 'es-toolkit';

import { WorkspaceService } from '../../../workspace/workspace.service';
import { DEFAULT_AUDIO_STILL } from '../../constants';
import {
  type DeleteAssignmentBookmarksForUserMutationVariables,
  type DeleteCollectionBookmarksForUserMutation,
  type DeleteCollectionBookmarksForUserMutationVariables,
  type DeleteItemBookmarkMutation,
  type DeleteItemBookmarkMutationVariables,
  type GetBookmarkStatusesQuery,
  type GetBookmarkStatusesQueryVariables,
  type GetItemBookmarksForUserQuery,
  type GetItemBookmarksForUserQueryVariables,
  type GetMultipleAssignmentViewCountsQuery,
  type GetMultipleAssignmentViewCountsQueryVariables,
  type GetMultipleCollectionViewCountsQuery,
  type GetMultipleCollectionViewCountsQueryVariables,
  type GetMultipleItemViewCountsQuery,
  type GetMultipleItemViewCountsQueryVariables,
  type IncrementAssignmentViewsMutation,
  type IncrementAssignmentViewsMutationVariables,
  type IncrementCollectionPlaysMutation,
  type IncrementCollectionPlaysMutationVariables,
  type IncrementCollectionViewsMutation,
  type IncrementCollectionViewsMutationVariables,
  type IncrementItemPlaysMutation,
  type IncrementItemPlaysMutationVariables,
  type IncrementItemViewsMutation,
  type IncrementItemViewsMutationVariables,
} from '../../generated/graphql-db-operations';
import {
  GetBookmarkStatusesDocument,
  GetItemBookmarksForUserDocument,
  GetMultipleAssignmentViewCountsDocument,
  GetMultipleCollectionViewCountsDocument,
  GetMultipleItemViewCountsDocument,
} from '../../generated/graphql-db-react-query';
import { CustomError } from '../../helpers/custom-error';
import { getEnv } from '../../helpers/env';
import { normalizeTimestamp } from '../../helpers/formatters/date';
import { dataService } from '../data-service';
import { trackEvents } from '../event-logging-service';

import { GET_EVENT_QUERIES } from './bookmarks-views-plays-service.const';
import {
  type AppItemBookmark,
  type BookmarkInfo,
  type BookmarkRequestInfo,
  type BookmarkStatusLookup,
  type BookmarkViewPlayCounts,
  type EventAction,
  type EventContentType,
  type EventContentTypeSimplified,
  type QueryType,
} from './bookmarks-views-plays-service.types';

export class BookmarksViewsPlaysService {
  public static async action(
    action: EventAction,
    contentType: EventContentType,
    contentUuid: string,
    commonUser: AvoUserCommonUser | null | undefined,
    silent = true,
  ): Promise<void> {
    try {
      if (action === 'play' || action === 'view') {
        await this.incrementCount(
          action,
          contentType,
          contentUuid,
          commonUser || null,
          silent,
        );
      } else {
        // Bookmark or unbookmark action
        const { query, variables } = this.getQueryAndVariables(
          action,
          'query',
          contentType,
          contentUuid,
          commonUser || null,
        );

        await dataService.query<
          DeleteItemBookmarkMutation | DeleteCollectionBookmarksForUserMutation,
          | DeleteItemBookmarkMutationVariables
          | DeleteCollectionBookmarksForUserMutationVariables
          | DeleteAssignmentBookmarksForUserMutationVariables
        >({
          query,
          variables,
        });
      }

      // Finished incrementing
    } catch (err) {
      const error = new CustomError(
        'Failed to store user action to the database',
        err,
        {
          action,
          contentType,
          contentUuid,
          commonUser,
        },
      );
      if (silent) {
        console.error(error);
      } else {
        throw error;
      }
    }
  }

  public static async getItemCounts(
    itemUuid: string,
  ): Promise<BookmarkViewPlayCounts> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/items/${itemUuid}/counts`,
        { method: 'GET' },
      );
    } catch (err) {
      const error = new CustomError('Failed to fetch item counts', err, {
        itemUuid,
      });
      console.error(error);
      throw error;
    }
  }

  public static async getItemIsBookmarked(
    itemUuid: string,
    commonUser?: AvoUserCommonUser | null,
  ): Promise<boolean> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/items/${itemUuid}/bookmarked`,
        { method: 'GET' },
      );
    } catch (err) {
      const error = new CustomError(
        'Failed to fetch item bookmark status',
        err,
        {
          itemUuid,
          commonUser,
        },
      );
      console.error(error);
      throw error;
    }
  }

  public static async getCollectionCounts(
    collectionUuid: string,
  ): Promise<BookmarkViewPlayCounts> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/collections/${collectionUuid}/counts`,
        { method: 'GET' },
      );
    } catch (err) {
      const error = new CustomError('Failed to fetch collection counts', err, {
        collectionUuid,
      });
      console.error(error);
      throw error;
    }
  }

  public static async getIsCollectionBookmarked(
    collectionUuid: string,
    commonUser: AvoUserCommonUser | undefined | null,
  ): Promise<boolean> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/collections/${collectionUuid}/bookmarked`,
        { method: 'GET' },
      );
    } catch (err) {
      const error = new CustomError(
        'Failed to fetch collection bookmark status',
        err,
        { collectionUuid, commonUser },
      );
      console.error(error);
      throw error;
    }
  }

  public static async getAssignmentCounts(
    assignmentUuid: string,
  ): Promise<BookmarkViewPlayCounts> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/assignments/${assignmentUuid}/counts`,
        { method: 'GET' },
      );
    } catch (err) {
      const error = new CustomError('Failed to fetch assignment counts', err, {
        assignmentUuid,
      });
      console.error(error);
      throw error;
    }
  }

  public static async getAssignmentIsBookmarked(
    assignmentUuid: string,
    commonUser: AvoUserCommonUser | null | undefined,
  ): Promise<boolean> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      return await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/assignments/${assignmentUuid}/bookmarked`,
        { method: 'GET' },
      );
    } catch (err) {
      const error = new CustomError(
        'Failed to fetch assignment bookmark status',
        err,
        { assignmentUuid, commonUser },
      );
      console.error(error);
      throw error;
    }
  }

  /**
   * Toggles the bookmark for the provided item or collection or bundle
   * @param contentId
   * @param shouldBeBookmarked the new state of the bookmark
   * @param type
   * @param commonUser
   * @return {boolean} returns true of the operation was successful, otherwise false
   */
  public static async toggleBookmark(
    contentId: string,
    shouldBeBookmarked: boolean,
    type: EventContentType,
    commonUser: AvoUserCommonUser,
  ): Promise<boolean> {
    try {
      if (!contentId) {
        throw new CustomError(
          `Failed to bookmark ${type} because the ${type} doesn't seem to be loaded yet`,
          null,
          { contentId },
        );
      }
      switch (type) {
        case 'item':
          await this.toggleItemBookmark(contentId, shouldBeBookmarked);
          break;

        case 'collection':
        case 'bundle':
          await this.toggleCollectionBookmark(contentId, shouldBeBookmarked);
          break;

        case 'assignment':
          await this.toggleAssignmentBookmark(contentId, shouldBeBookmarked);
          break;
      }

      if (shouldBeBookmarked) {
        trackEvents(
          {
            object: contentId,
            object_type: type,
            action: 'bookmark',
          },
          commonUser,
        );
      }
      return true;
    } catch (err) {
      throw new CustomError('Failed to bookmark/unbookmark the item', err, {
        contentId,
      });
    }
  }

  private static getItemBookmarkInfos(
    itemBookmarks: AppItemBookmark[],
  ): (BookmarkInfo | null)[] {
    return itemBookmarks.map((itemBookmark): BookmarkInfo | null => {
      if (!itemBookmark.bookmarkedItem) {
        return null;
      }

      const thumbnailPath =
        itemBookmark.bookmarkedItem.item.item_meta.type.label === 'audio'
          ? DEFAULT_AUDIO_STILL
          : itemBookmark.bookmarkedItem.thumbnail_path;

      return {
        contentId: itemBookmark.item_id,
        contentLinkId: itemBookmark.bookmarkedItem.item.external_id,
        contentType: itemBookmark.bookmarkedItem.item.item_meta.type
          .label as AvoContentTypeEnglish,
        contentDescription: '',
        createdAt: normalizeTimestamp(itemBookmark.created_at).getTime(),
        contentTitle: itemBookmark.bookmarkedItem.title,
        contentDuration: itemBookmark.bookmarkedItem.duration,
        contentThumbnailPath: thumbnailPath,
        contentCreatedAt: itemBookmark.bookmarkedItem.issued
          ? normalizeTimestamp(itemBookmark.bookmarkedItem.issued).getTime()
          : null,
        contentViews:
          itemBookmark?.bookmarkedItem?.view_counts?.[0]?.count || 0,
        contentOrganisation:
          itemBookmark.bookmarkedItem?.item?.item_meta?.organisation?.name,
      };
    });
  }

  public static async getItemBookmarksForUser(
    commonUser: AvoUserCommonUser,
    filterString: string,
    orderObject: GetItemBookmarksForUserQueryVariables['order'],
  ): Promise<BookmarkInfo[]> {
    const variables: GetItemBookmarksForUserQueryVariables = {
      profileId: commonUser?.profileId,
      filter: [{ bookmarkedItem: { title: { _ilike: `%${filterString}%` } } }],
      order: orderObject,
    };
    const response = await dataService.query<
      GetItemBookmarksForUserQuery,
      GetItemBookmarksForUserQueryVariables
    >({
      query: GetItemBookmarksForUserDocument,
      variables,
    });
    const itemBookmarks: AppItemBookmark[] =
      response.app_item_bookmarks as AppItemBookmark[];
    const itemBookmarkInfos: (BookmarkInfo | null)[] =
      BookmarksViewsPlaysService.getItemBookmarkInfos(itemBookmarks);
    return compact(itemBookmarkInfos);
  }

  /**
   * Gets all bookmarks for user without pagination
   * since we cannot order items across both tables: item_bookmarks and collection_bookmarks
   */
  public static async getAllBookmarksForUser(): Promise<BookmarkInfo[]> {
    const bookmarks = await WorkspaceService.getAllBookmarksForUser();

    return bookmarks.map((item) => ({
      ...item,
      contentThumbnailPath:
        item.contentType === 'audio'
          ? DEFAULT_AUDIO_STILL
          : item.contentThumbnailPath,
    }));
  }

  private static getQueryAndVariables(
    action: EventAction,
    queryType: QueryType,
    contentType: EventContentType,
    contentUuid: string,
    commonUser: AvoUserCommonUser | null,
  ): {
    query: string;
    variables: any;
    getResponseCount?: (response: any) => number;
  } {
    // bundle is handled the same way as a collection
    const contentTypeSimplified =
      contentType === 'bundle' ? 'collection' : contentType;

    const eventQueries = GET_EVENT_QUERIES();
    const query = eventQueries?.[action]?.[contentTypeSimplified]?.[queryType];
    const getVariablesFunc =
      GET_EVENT_QUERIES()?.[action]?.[contentTypeSimplified]?.variables ?? noop;
    const variables = getVariablesFunc(contentUuid, commonUser);
    if (!query || !variables) {
      throw new CustomError(
        'Failed to find query/variables in query lookup table',
      );
    }
    const getResponseCount =
      eventQueries?.[action]?.[contentTypeSimplified]?.getResponseCount;
    return { query, variables, getResponseCount };
  }

  public static async getMultipleViewCounts(
    contentIds: string[],
    type: EventContentTypeSimplified,
  ): Promise<{ [uuid: string]: number }> {
    const variables:
      | GetMultipleItemViewCountsQueryVariables
      | GetMultipleCollectionViewCountsQueryVariables
      | GetMultipleAssignmentViewCountsQueryVariables = { uuids: contentIds };
    const response = await dataService.query<
      | GetMultipleItemViewCountsQuery
      | GetMultipleCollectionViewCountsQuery
      | GetMultipleAssignmentViewCountsQuery,
      | GetMultipleItemViewCountsQueryVariables
      | GetMultipleCollectionViewCountsQueryVariables
      | GetMultipleAssignmentViewCountsQueryVariables
    >({
      query: {
        item: GetMultipleItemViewCountsDocument,
        collection: GetMultipleCollectionViewCountsDocument,
        assignment: GetMultipleAssignmentViewCountsDocument,
        quick_lane: '', // We don't track total view counts for quick lanes
      }[type],
      variables,
    });
    const items = response.items;
    return Object.fromEntries(items.map((item) => [item.id, item.count]));
  }

  private static async incrementCount(
    action: EventAction,
    contentType: EventContentType,
    contentUuid: string,
    commonUser: AvoUserCommonUser | null,
    silent = true,
  ) {
    try {
      const { query, variables } = this.getQueryAndVariables(
        action,
        'increment',
        contentType,
        contentUuid,
        commonUser,
      );

      await dataService.query<
        | IncrementAssignmentViewsMutation
        | IncrementCollectionPlaysMutation
        | IncrementCollectionViewsMutation
        | IncrementItemPlaysMutation
        | IncrementItemViewsMutation,
        | IncrementAssignmentViewsMutationVariables
        | IncrementCollectionPlaysMutationVariables
        | IncrementCollectionViewsMutationVariables
        | IncrementItemPlaysMutationVariables
        | IncrementItemViewsMutationVariables
      >({
        query,
        variables,
      });
    } catch (err) {
      const error = new CustomError(
        'Failed to increment view/play count in the database',
        err,
        {
          action,
          contentType,
          contentUuid,
          user: commonUser,
        },
      );
      if (silent) {
        console.error(error);
      } else {
        throw error;
      }
    }
  }

  /**
   * Checks the database if for the provided items and collections there is a bookmark for the current user
   * @param profileId the profile id of the current user
   * @param objectInfos a list of object infos containing the type: item or collection and the uuid of the item
   * @return Promise<lookup> dictionary for looking up the "isBookmarked" status for a specific item or collection
   *     {
   *       item: {
   *         id1: true,
   *         id2: false,
   *       },
   *       collection: {
   *         id5: true,
   *         id6: true,
   *         id8: false
   *       }
   *     }
   */
  public static async getBookmarkStatuses(
    profileId: string,
    objectInfos: BookmarkRequestInfo[],
  ): Promise<BookmarkStatusLookup> {
    try {
      const groupedObjectInfos: {
        [type: string]: BookmarkRequestInfo[];
      } = groupBy(objectInfos, (info) => info.type);
      const itemObjectInfos: BookmarkRequestInfo[] =
        groupedObjectInfos['item'] || [];
      const collectionObjectInfos: BookmarkRequestInfo[] =
        groupedObjectInfos['collection'] || [];
      const assignmentObjectInfos: BookmarkRequestInfo[] =
        groupedObjectInfos['assignment'] || [];
      // Get list of item ids and collection ids from the object infos
      const itemUuids: string[] = itemObjectInfos.map(
        (objectInfo) => objectInfo.uuid,
      );
      const collectionUuids: string[] = collectionObjectInfos.map(
        (objectInfo) => objectInfo.uuid,
      );
      const assignmentUuids: string[] = assignmentObjectInfos.map(
        (objectInfo) => objectInfo.uuid,
      );

      const response = await dataService.query<
        GetBookmarkStatusesQuery,
        GetBookmarkStatusesQueryVariables
      >({
        query: GetBookmarkStatusesDocument,
        variables: {
          profileId,
          itemUuids,
          collectionUuids,
          assignmentUuids,
        },
      });

      // Extract the ids of the bookmark items that were found
      const itemBookmarkIds = (response.app_item_bookmarks ?? []).map(
        (itemBookmark: { item_id: string }) => itemBookmark.item_id,
      );
      const collectionBookmarkIds = (
        response.app_collection_bookmarks ?? []
      ).map(
        (itemBookmark: { collection_uuid: string }) =>
          itemBookmark.collection_uuid,
      );
      const assignmentBookmarkIds = (
        response.app_assignments_v2_bookmarks ?? []
      ).map(
        (itemBookmark: { assignment_id: string }) => itemBookmark.assignment_id,
      );
      // Map the ids that were found to the original id
      // if the id was found we set the isBookmarked status to true
      // if the id was not found we set the isBookmarked status to false
      const itemBookmarkStatuses: { [uuid: string]: boolean } =
        Object.fromEntries(
          itemObjectInfos.map((objectInfo) => {
            return [objectInfo.uuid, itemBookmarkIds.includes(objectInfo.uuid)];
          }),
        );
      const collectionBookmarkStatuses: { [uuid: string]: boolean } =
        Object.fromEntries(
          collectionObjectInfos.map((objectInfo) => {
            return [
              objectInfo.uuid,
              collectionBookmarkIds.includes(objectInfo.uuid),
            ];
          }),
        );

      const assignmentBookmarkStatuses: { [uuid: string]: boolean } =
        Object.fromEntries(
          assignmentObjectInfos.map((objectInfo) => {
            return [
              objectInfo.uuid,
              assignmentBookmarkIds.includes(objectInfo.uuid),
            ];
          }),
        );

      return {
        item: itemBookmarkStatuses,
        collection: collectionBookmarkStatuses,
        assignment: assignmentBookmarkStatuses,
        quick_lane: {}, // Quick lanes cannot be bookmarked
      };
    } catch (err) {
      throw new CustomError('Failed to get bookmark statuses', err, {
        profileId,
        objectInfos,
        query: 'GET_BOOKMARK_STATUSES',
      });
    }
  }

  public static async toggleItemBookmark(
    itemUuid: string,
    bookmarked: boolean,
  ): Promise<void> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/items/${itemUuid}/bookmark`,
        {
          method: 'PUT',
          body: JSON.stringify({ bookmarked }),
        },
      );
    } catch (err) {
      const error = new CustomError('Failed to toggle item bookmark', err, {
        itemUuid,
        bookmarked,
      });
      console.error(error);
      throw error;
    }
  }

  public static async toggleCollectionBookmark(
    collectionUuid: string,
    bookmarked: boolean,
  ): Promise<void> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/collections/${collectionUuid}/bookmark`,
        {
          method: 'PUT',
          body: JSON.stringify({ bookmarked }),
        },
      );
    } catch (err) {
      const error = new CustomError(
        'Failed to toggle collection bookmark',
        err,
        {
          collectionUuid,
          bookmarked,
        },
      );
      console.error(error);
      throw error;
    }
  }

  public static async toggleAssignmentBookmark(
    assignmentUuid: string,
    bookmarked: boolean,
  ): Promise<void> {
    try {
      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      );
      await fetchWithLogoutJson(
        `${getEnv('PROXY_URL')}/assignments/${assignmentUuid}/bookmark`,
        {
          method: 'PUT',
          body: JSON.stringify({ bookmarked }),
        },
      );
    } catch (err) {
      const error = new CustomError(
        'Failed to toggle assignment bookmark',
        err,
        {
          assignmentUuid,
          bookmarked,
        },
      );
      console.error(error);
      throw error;
    }
  }
}
