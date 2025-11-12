import { type Avo } from '@viaa/avo2-types'
import { compact, groupBy, noop } from 'es-toolkit'

import { WorkspaceService } from '../../../workspace/workspace.service.js'
import { DEFAULT_AUDIO_STILL } from '../../constants/index.js'
import {
  type DeleteAssignmentBookmarksForUserMutationVariables,
  type DeleteCollectionBookmarksForUserMutation,
  type DeleteCollectionBookmarksForUserMutationVariables,
  type DeleteItemBookmarkMutation,
  type DeleteItemBookmarkMutationVariables,
  type GetAssignmentBookmarkViewCountsQuery,
  type GetAssignmentBookmarkViewCountsQueryVariables,
  type GetBookmarkStatusesQuery,
  type GetBookmarkStatusesQueryVariables,
  type GetCollectionBookmarkViewPlayCountsQuery,
  type GetCollectionBookmarkViewPlayCountsQueryVariables,
  type GetItemBookmarksForUserQuery,
  type GetItemBookmarksForUserQueryVariables,
  type GetItemBookmarkViewPlayCountsQuery,
  type GetItemBookmarkViewPlayCountsQueryVariables,
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
  type InsertCollectionBookmarkMutation,
  type InsertCollectionBookmarkMutationVariables,
  type InsertItemBookmarkMutation,
  type InsertItemBookmarkMutationVariables,
} from '../../generated/graphql-db-operations.js'
import {
  GetAssignmentBookmarkViewCountsDocument,
  GetBookmarkStatusesDocument,
  GetCollectionBookmarkViewPlayCountsDocument,
  GetItemBookmarksForUserDocument,
  GetItemBookmarkViewPlayCountsDocument,
  GetMultipleAssignmentViewCountsDocument,
  GetMultipleCollectionViewCountsDocument,
  GetMultipleItemViewCountsDocument,
} from '../../generated/graphql-db-react-query.js'
import { CustomError } from '../../helpers/custom-error.js'
import { normalizeTimestamp } from '../../helpers/formatters/date.js'
import { dataService } from '../data-service.js'
import { trackEvents } from '../event-logging-service.js'

import { GET_EVENT_QUERIES } from './bookmarks-views-plays-service.const.js'
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
} from './bookmarks-views-plays-service.types.js'

export class BookmarksViewsPlaysService {
  public static async action(
    action: EventAction,
    contentType: EventContentType,
    contentUuid: string,
    commonUser: Avo.User.CommonUser | null | undefined,
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
        )
      } else {
        // Bookmark or unbookmark action
        const { query, variables } = this.getQueryAndVariables(
          action,
          'query',
          contentType,
          contentUuid,
          commonUser || null,
        )

        await dataService.query<
          | InsertItemBookmarkMutation
          | InsertCollectionBookmarkMutation
          | DeleteItemBookmarkMutation
          | DeleteCollectionBookmarksForUserMutation,
          | InsertItemBookmarkMutationVariables
          | InsertCollectionBookmarkMutationVariables
          | DeleteItemBookmarkMutationVariables
          | DeleteCollectionBookmarksForUserMutationVariables
          | DeleteAssignmentBookmarksForUserMutationVariables
        >({
          query,
          variables,
        })
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
      )
      if (silent) {
        console.error(error)
      } else {
        throw error
      }
    }
  }

  public static async getItemCounts(
    itemUuid: string,
    commonUser?: Avo.User.CommonUser | null,
  ): Promise<BookmarkViewPlayCounts> {
    const response = await dataService.query<
      GetItemBookmarkViewPlayCountsQuery,
      GetItemBookmarkViewPlayCountsQueryVariables
    >({
      query: GetItemBookmarkViewPlayCountsDocument,
      variables: { itemUuid, profileId: commonUser?.profileId || null },
    })
    const isBookmarked = !!response.app_item_bookmarks[0]
    const bookmarkCount =
      response.app_item_bookmarks_aggregate.aggregate?.count ?? 0
    const viewCount = response.app_item_views[0]?.count ?? 0
    const playCount = response.app_item_plays[0]?.count ?? 0
    return {
      bookmarkCount,
      viewCount,
      playCount,
      isBookmarked,
    }
  }

  public static async getCollectionCounts(
    collectionUuid: string,
    commonUser: Avo.User.CommonUser | undefined | null,
  ): Promise<BookmarkViewPlayCounts> {
    const response = await dataService.query<
      GetCollectionBookmarkViewPlayCountsQuery,
      GetCollectionBookmarkViewPlayCountsQueryVariables
    >({
      query: GetCollectionBookmarkViewPlayCountsDocument,
      variables: { collectionUuid, profileId: commonUser?.profileId || null },
    })
    const isBookmarked = !!response.app_collection_bookmarks[0]
    const bookmarkCount =
      response.app_collection_bookmarks_aggregate.aggregate?.count || 0
    const viewCount = response.app_collection_views[0]?.count ?? 0
    const playCount = response.app_collection_plays[0]?.count ?? 0
    return {
      bookmarkCount,
      viewCount,
      playCount,
      isBookmarked,
    }
  }

  public static async getAssignmentCounts(
    assignmentUuid: string,
    commonUser: Avo.User.CommonUser | null | undefined,
  ) {
    const response = await dataService.query<
      GetAssignmentBookmarkViewCountsQuery,
      GetAssignmentBookmarkViewCountsQueryVariables
    >({
      query: GetAssignmentBookmarkViewCountsDocument,
      variables: {
        assignmentUuid,
        profileId: commonUser?.profileId || null,
      },
    })

    const isBookmarked = !!response.app_assignments_v2_bookmarks[0]
    const bookmarkCount =
      response.app_assignments_v2_bookmarks_aggregate.aggregate?.count || 0
    const viewCount = response.app_assignment_v2_views[0]?.count ?? 0
    const playCount = 0

    return {
      bookmarkCount,
      viewCount,
      isBookmarked,
      playCount,
    }
  }

  /**
   * Toggles the bookmark for the provided item or collection or bundle
   * @param contentId
   * @param commonUser
   * @param type
   * @param isBookmarked current state of the bookmark toggle before the desired action is executed
   * @return {boolean} returns true of the operation was successful, otherwise false
   */
  public static async toggleBookmark(
    contentId: string,
    commonUser: Avo.User.CommonUser | null | undefined,
    type: EventContentType,
    isBookmarked: boolean,
  ): Promise<void> {
    try {
      if (!contentId) {
        throw new CustomError(
          `Failed to bookmark ${type} because the ${type} doesn't seem to be loaded yet`,
          null,
          { contentId },
        )
      }
      await BookmarksViewsPlaysService.action(
        isBookmarked ? 'unbookmark' : 'bookmark',
        type,
        contentId,
        commonUser,
        false,
      )

      if (!isBookmarked) {
        trackEvents(
          {
            object: contentId,
            object_type: type,
            action: 'bookmark',
          },
          commonUser,
        )
      }
    } catch (err) {
      throw new CustomError('Failed to bookmark/unbookmark the item', err, {
        contentId,
      })
    }
  }

  private static getItemBookmarkInfos(
    itemBookmarks: AppItemBookmark[],
  ): (BookmarkInfo | null)[] {
    return itemBookmarks.map((itemBookmark): BookmarkInfo | null => {
      if (!itemBookmark.bookmarkedItem) {
        return null
      }

      const thumbnailPath =
        itemBookmark.bookmarkedItem.item.item_meta.type.label === 'audio'
          ? DEFAULT_AUDIO_STILL
          : itemBookmark.bookmarkedItem.thumbnail_path

      return {
        contentId: itemBookmark.item_id,
        contentLinkId: itemBookmark.bookmarkedItem.item.external_id,
        contentType: itemBookmark.bookmarkedItem.item.item_meta.type
          .label as Avo.ContentType.English,
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
      }
    })
  }

  public static async getItemBookmarksForUser(
    commonUser: Avo.User.CommonUser,
    filterString: string,
    orderObject: GetItemBookmarksForUserQueryVariables['order'],
  ): Promise<BookmarkInfo[]> {
    const variables: GetItemBookmarksForUserQueryVariables = {
      profileId: commonUser?.profileId,
      filter: [{ bookmarkedItem: { title: { _ilike: `%${filterString}%` } } }],
      order: orderObject,
    }
    const response = await dataService.query<
      GetItemBookmarksForUserQuery,
      GetItemBookmarksForUserQueryVariables
    >({
      query: GetItemBookmarksForUserDocument,
      variables,
    })
    const itemBookmarks: AppItemBookmark[] =
      response.app_item_bookmarks as AppItemBookmark[]
    const itemBookmarkInfos: (BookmarkInfo | null)[] =
      BookmarksViewsPlaysService.getItemBookmarkInfos(itemBookmarks)
    return compact(itemBookmarkInfos)
  }

  /**
   * Gets all bookmarks for user without pagination
   * since we cannot order items across both tables: item_bookmarks and collection_bookmarks
   */
  public static async getAllBookmarksForUser(): Promise<BookmarkInfo[]> {
    const bookmarks = await WorkspaceService.getAllBookmarksForUser()

    return bookmarks.map((item) => ({
      ...item,
      contentThumbnailPath:
        item.contentType === 'audio'
          ? DEFAULT_AUDIO_STILL
          : item.contentThumbnailPath,
    }))
  }

  private static getQueryAndVariables(
    action: EventAction,
    queryType: QueryType,
    contentType: EventContentType,
    contentUuid: string,
    commonUser: Avo.User.CommonUser | null,
  ): {
    query: string
    variables: any
    getResponseCount?: (response: any) => number
  } {
    // bundle is handled the same way as a collection
    const contentTypeSimplified =
      contentType === 'bundle' ? 'collection' : contentType

    const eventQueries = GET_EVENT_QUERIES()
    const query = eventQueries?.[action]?.[contentTypeSimplified]?.[queryType]
    const getVariablesFunc =
      GET_EVENT_QUERIES()?.[action]?.[contentTypeSimplified]?.variables ?? noop
    const variables = getVariablesFunc(contentUuid, commonUser)
    if (!query || !variables) {
      throw new CustomError(
        'Failed to find query/variables in query lookup table',
      )
    }
    const getResponseCount =
      eventQueries?.[action]?.[contentTypeSimplified]?.getResponseCount
    return { query, variables, getResponseCount }
  }

  public static async getMultipleViewCounts(
    contentIds: string[],
    type: EventContentTypeSimplified,
  ): Promise<{ [uuid: string]: number }> {
    const variables:
      | GetMultipleItemViewCountsQueryVariables
      | GetMultipleCollectionViewCountsQueryVariables
      | GetMultipleAssignmentViewCountsQueryVariables = { uuids: contentIds }
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
    })
    const items = response.items
    return Object.fromEntries(items.map((item) => [item.id, item.count]))
  }

  private static async incrementCount(
    action: EventAction,
    contentType: EventContentType,
    contentUuid: string,
    commonUser: Avo.User.CommonUser | null,
    silent = true,
  ) {
    try {
      const { query, variables } = this.getQueryAndVariables(
        action,
        'increment',
        contentType,
        contentUuid,
        commonUser,
      )

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
      })
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
      )
      if (silent) {
        console.error(error)
      } else {
        throw error
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
        [type: string]: BookmarkRequestInfo[]
      } = groupBy(objectInfos, (info) => info.type)
      const itemObjectInfos: BookmarkRequestInfo[] =
        groupedObjectInfos['item'] || []
      const collectionObjectInfos: BookmarkRequestInfo[] =
        groupedObjectInfos['collection'] || []
      const assignmentObjectInfos: BookmarkRequestInfo[] =
        groupedObjectInfos['assignment'] || []
      // Get list of item ids and collection ids from the object infos
      const itemUuids: string[] = itemObjectInfos.map(
        (objectInfo) => objectInfo.uuid,
      )
      const collectionUuids: string[] = collectionObjectInfos.map(
        (objectInfo) => objectInfo.uuid,
      )
      const assignmentUuids: string[] = assignmentObjectInfos.map(
        (objectInfo) => objectInfo.uuid,
      )

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
      })

      // Extract the ids of the bookmark items that were found
      const itemBookmarkIds = (response.app_item_bookmarks ?? []).map(
        (itemBookmark: { item_id: string }) => itemBookmark.item_id,
      )
      const collectionBookmarkIds = (
        response.app_collection_bookmarks ?? []
      ).map(
        (itemBookmark: { collection_uuid: string }) =>
          itemBookmark.collection_uuid,
      )
      const assignmentBookmarkIds = (
        response.app_assignments_v2_bookmarks ?? []
      ).map(
        (itemBookmark: { assignment_id: string }) => itemBookmark.assignment_id,
      )
      // Map the ids that were found to the original id
      // if the id was found we set the isBookmarked status to true
      // if the id was not found we set the isBookmarked status to false
      const itemBookmarkStatuses: { [uuid: string]: boolean } =
        Object.fromEntries(
          itemObjectInfos.map((objectInfo) => {
            return [objectInfo.uuid, itemBookmarkIds.includes(objectInfo.uuid)]
          }),
        )
      const collectionBookmarkStatuses: { [uuid: string]: boolean } =
        Object.fromEntries(
          collectionObjectInfos.map((objectInfo) => {
            return [
              objectInfo.uuid,
              collectionBookmarkIds.includes(objectInfo.uuid),
            ]
          }),
        )

      const assignmentBookmarkStatuses: { [uuid: string]: boolean } =
        Object.fromEntries(
          assignmentObjectInfos.map((objectInfo) => {
            return [
              objectInfo.uuid,
              assignmentBookmarkIds.includes(objectInfo.uuid),
            ]
          }),
        )

      return {
        item: itemBookmarkStatuses,
        collection: collectionBookmarkStatuses,
        assignment: assignmentBookmarkStatuses,
        quick_lane: {}, // Quick lanes cannot be bookmarked
      }
    } catch (err) {
      throw new CustomError('Failed to get bookmark statuses', err, {
        profileId,
        objectInfos,
        query: 'GET_BOOKMARK_STATUSES',
      })
    }
  }
}
