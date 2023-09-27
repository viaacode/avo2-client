import type { Avo } from '@viaa/avo2-types';
import { compact, fromPairs, get, groupBy, noop } from 'lodash-es';

import { ContentTypeNumber } from '../../../collection/collection.types';
import { DEFAULT_AUDIO_STILL } from '../../constants';
import {
	DeleteAssignmentBookmarksForUserMutationVariables,
	DeleteCollectionBookmarksForUserMutation,
	DeleteCollectionBookmarksForUserMutationVariables,
	DeleteItemBookmarkMutation,
	DeleteItemBookmarkMutationVariables,
	GetAssignmentBookmarkViewCountsDocument,
	GetAssignmentBookmarkViewCountsQuery,
	GetAssignmentBookmarkViewCountsQueryVariables,
	GetBookmarksForUserDocument,
	GetBookmarksForUserQuery,
	GetBookmarksForUserQueryVariables,
	GetBookmarkStatusesDocument,
	GetBookmarkStatusesQuery,
	GetBookmarkStatusesQueryVariables,
	GetCollectionBookmarkViewPlayCountsDocument,
	GetCollectionBookmarkViewPlayCountsQuery,
	GetCollectionBookmarkViewPlayCountsQueryVariables,
	GetItemBookmarksForUserDocument,
	GetItemBookmarksForUserQuery,
	GetItemBookmarksForUserQueryVariables,
	GetItemBookmarkViewPlayCountsDocument,
	GetItemBookmarkViewPlayCountsQuery,
	GetItemBookmarkViewPlayCountsQueryVariables,
	GetMultipleCollectionViewCountsDocument,
	GetMultipleCollectionViewCountsQuery,
	GetMultipleCollectionViewCountsQueryVariables,
	GetMultipleItemViewCountsDocument,
	GetMultipleItemViewCountsQuery,
	GetMultipleItemViewCountsQueryVariables,
	IncrementCollectionPlaysMutation,
	IncrementCollectionPlaysMutationVariables,
	IncrementCollectionViewsMutation,
	IncrementCollectionViewsMutationVariables,
	IncrementItemPlaysMutation,
	IncrementItemPlaysMutationVariables,
	IncrementItemViewsMutation,
	IncrementItemViewsMutationVariables,
	InsertCollectionBookmarkMutation,
	InsertCollectionBookmarkMutationVariables,
	InsertItemBookmarkMutation,
	InsertItemBookmarkMutationVariables,
} from '../../generated/graphql-db-types';
import { CustomError, normalizeTimestamp } from '../../helpers';
import { dataService } from '../data-service';
import { trackEvents } from '../event-logging-service';

import { GET_EVENT_QUERIES } from './bookmarks-views-plays-service.const';
import {
	AppAssignmentBookmark,
	AppCollectionBookmark,
	AppItemBookmark,
	BookmarkInfo,
	BookmarkRequestInfo,
	BookmarkStatusLookup,
	BookmarkViewPlayCounts,
	EventAction,
	EventContentType,
	EventContentTypeSimplified,
	QueryType,
} from './bookmarks-views-plays-service.types';

export class BookmarksViewsPlaysService {
	public static async action(
		action: EventAction,
		contentType: EventContentType,
		contentUuid: string,
		user?: Avo.User.User | Avo.User.CommonUser,
		silent = true
	): Promise<void> {
		try {
			if (action === 'play' || action === 'view') {
				await this.incrementCount(action, contentType, contentUuid, user, silent);
			} else {
				// Bookmark or unbookmark action
				const { query, variables } = this.getQueryAndVariables(
					action,
					'query',
					contentType,
					contentUuid,
					user
				);

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
				});
			}

			// Finished incrementing
		} catch (err) {
			const error = new CustomError('Failed to store user action to the database', err, {
				action,
				contentType,
				contentUuid,
				user,
			});
			if (silent) {
				console.error(error);
			} else {
				throw error;
			}
		}
	}

	public static async getItemCounts(
		itemUuid: string,
		user: Avo.User.User | null
	): Promise<BookmarkViewPlayCounts> {
		const response = await dataService.query<
			GetItemBookmarkViewPlayCountsQuery,
			GetItemBookmarkViewPlayCountsQueryVariables
		>({
			query: GetItemBookmarkViewPlayCountsDocument,
			variables: { itemUuid, profileId: get(user, 'profile.id', null) },
		});
		const isBookmarked = !!response.app_item_bookmarks[0];
		const bookmarkCount = response.app_item_bookmarks_aggregate.aggregate?.count ?? 0;
		const viewCount = response.app_item_views[0]?.count ?? 0;
		const playCount = response.app_item_plays[0]?.count ?? 0;
		return {
			bookmarkCount,
			viewCount,
			playCount,
			isBookmarked,
		};
	}

	public static async getCollectionCounts(
		collectionUuid: string,
		user: Avo.User.User | null
	): Promise<BookmarkViewPlayCounts> {
		const response = await dataService.query<
			GetCollectionBookmarkViewPlayCountsQuery,
			GetCollectionBookmarkViewPlayCountsQueryVariables
		>({
			query: GetCollectionBookmarkViewPlayCountsDocument,
			variables: { collectionUuid, profileId: user?.profile?.id || null },
		});
		const isBookmarked = !!response.app_collection_bookmarks[0];
		const bookmarkCount = response.app_collection_bookmarks_aggregate.aggregate?.count || 0;
		const viewCount = response.app_collection_views[0]?.count ?? 0;
		const playCount = response.app_collection_plays[0]?.count ?? 0;
		return {
			bookmarkCount,
			viewCount,
			playCount,
			isBookmarked,
		};
	}

	public static async getAssignmentCounts(assignmentUuid: string, user: Avo.User.User | null) {
		const response = await dataService.query<
			GetAssignmentBookmarkViewCountsQuery,
			GetAssignmentBookmarkViewCountsQueryVariables
		>({
			query: GetAssignmentBookmarkViewCountsDocument,
			variables: { assignmentUuid, profileId: user?.profile?.id || null },
		});

		const isBookmarked = !!response.app_assignments_v2_bookmarks[0];
		const bookmarkCount = response.app_assignments_v2_bookmarks_aggregate.aggregate?.count || 0;
		const viewCount = response.app_assignment_v2_views[0]?.count ?? 0;
		const playCount = 0;

		return {
			bookmarkCount,
			viewCount,
			isBookmarked,
			playCount,
		};
	}

	/**
	 * Toggles the bookmark for the provided item or collection or bundle
	 * @param contentId
	 * @param user
	 * @param type
	 * @param isBookmarked current state of the bookmark toggle before the desired action is executed
	 * @return {boolean} returns true of the operation was successful, otherwise false
	 */
	public static async toggleBookmark(
		contentId: string,
		user: Avo.User.User | Avo.User.CommonUser,
		type: EventContentType,
		isBookmarked: boolean
	): Promise<void> {
		try {
			if (!contentId) {
				throw new CustomError(
					`Failed to bookmark ${type} because the ${type} doesn't seem to be loaded yet`,
					null,
					{ contentId }
				);
			}
			await BookmarksViewsPlaysService.action(
				isBookmarked ? 'unbookmark' : 'bookmark',
				type,
				contentId,
				user,
				false
			);

			if (!isBookmarked) {
				trackEvents(
					{
						object: contentId,
						object_type: type,
						action: 'bookmark',
					},
					user
				);
			}
		} catch (err) {
			throw new CustomError('Failed to bookmark/unbookmark the item', err, { contentId });
		}
	}

	private static getItemBookmarkInfos(itemBookmarks: AppItemBookmark[]): (BookmarkInfo | null)[] {
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
					.label as Avo.ContentType.English,
				createdAt: normalizeTimestamp(itemBookmark.created_at).toDate().getTime(),
				contentTitle: itemBookmark.bookmarkedItem.title,
				contentDuration: itemBookmark.bookmarkedItem.duration,
				contentThumbnailPath: thumbnailPath,
				contentCreatedAt: itemBookmark.bookmarkedItem.issued
					? normalizeTimestamp(itemBookmark.bookmarkedItem.issued).toDate().getTime()
					: null,
				contentViews: get(itemBookmark, 'bookmarkedItem.view_counts[0].count') || 0,
				contentOrganisation:
					itemBookmark.bookmarkedItem?.item?.item_meta?.organisation?.name,
			};
		});
	}

	public static async getItemBookmarksForUser(
		user: Avo.User.User,
		filterString: string,
		orderObject: GetItemBookmarksForUserQueryVariables['order']
	): Promise<BookmarkInfo[]> {
		const variables: GetItemBookmarksForUserQueryVariables = {
			profileId: get(user, 'profile.id'),
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
		const itemBookmarks: AppItemBookmark[] = response.app_item_bookmarks as AppItemBookmark[];
		const itemBookmarkInfos: (BookmarkInfo | null)[] =
			BookmarksViewsPlaysService.getItemBookmarkInfos(itemBookmarks);
		return compact(itemBookmarkInfos);
	}

	/**
	 * Gets all bookmarks for user without pagination
	 * since we cannot order items across both tables: item_bookmarks and collection_bookmarks
	 * @param commonUser
	 */
	public static async getAllBookmarksForUser(
		commonUser: Avo.User.CommonUser
	): Promise<BookmarkInfo[]> {
		const variables: GetBookmarksForUserQueryVariables = { profileId: commonUser.profileId };
		const response = await dataService.query<
			GetBookmarksForUserQuery,
			GetBookmarksForUserQueryVariables
		>({
			query: GetBookmarksForUserDocument,
			variables,
		});
		const itemBookmarks: AppItemBookmark[] = response.app_item_bookmarks as AppItemBookmark[];
		const collectionBookmarks: AppCollectionBookmark[] = (response.app_collection_bookmarks ||
			[]) as AppCollectionBookmark[];
		const itemBookmarkInfos: (BookmarkInfo | null)[] =
			BookmarksViewsPlaysService.getItemBookmarkInfos(itemBookmarks);
		const assignmentBookmarks: AppAssignmentBookmark[] =
			(response.app_assignments_v2_bookmarks || []) as AppAssignmentBookmark[];

		const collectionBookmarkInfos: (BookmarkInfo | null)[] = collectionBookmarks.map(
			(collectionBookmark): BookmarkInfo | null => {
				if (!collectionBookmark.bookmarkedCollection) {
					return null;
				}
				return {
					contentId: collectionBookmark.collection_uuid,
					contentLinkId: collectionBookmark.collection_uuid,
					contentType:
						collectionBookmark.bookmarkedCollection.type_id ===
						ContentTypeNumber.collection
							? 'collection'
							: 'bundle',
					createdAt: normalizeTimestamp(collectionBookmark.created_at).toDate().getTime(),
					contentTitle: collectionBookmark.bookmarkedCollection.title,
					contentThumbnailPath: collectionBookmark.bookmarkedCollection.thumbnail_path,
					contentCreatedAt: normalizeTimestamp(
						collectionBookmark.bookmarkedCollection.created_at
					)
						.toDate()
						.getTime(),
					contentViews:
						get(collectionBookmark, 'bookmarkedCollection.view_counts[0].count') || 0,
				};
			}
		);
		const assignmentBookmarkInfos: (BookmarkInfo | null)[] = assignmentBookmarks.map(
			(assignmentBookmark): BookmarkInfo | null => {
				if (!assignmentBookmark.assignment) {
					return null;
				}
				return {
					contentId: assignmentBookmark.assignment_id,
					contentLinkId: assignmentBookmark.assignment_id,
					contentType: 'assignment',
					createdAt: normalizeTimestamp(assignmentBookmark.created_at).toDate().getTime(),
					contentTitle: assignmentBookmark.assignment.title,
					contentThumbnailPath: assignmentBookmark.assignment.thumbnail_path,
					contentCreatedAt: normalizeTimestamp(assignmentBookmark.assignment.created_at)
						.toDate()
						.getTime(),
					contentViews:
						get(assignmentBookmark, 'bookmarkedCollection.view_counts[0].count') || 0,
				};
			}
		);
		return [
			...compact(itemBookmarkInfos),
			...compact(collectionBookmarkInfos),
			...compact(assignmentBookmarkInfos),
		];
	}

	private static getQueryAndVariables(
		action: EventAction,
		queryType: QueryType,
		contentType: EventContentType,
		contentUuid: string,
		user: Avo.User.User | Avo.User.CommonUser | undefined
	) {
		// bundle is handled the same way as a collection
		const contentTypeSimplified = contentType === 'bundle' ? 'collection' : contentType;

		const eventQueries = GET_EVENT_QUERIES();
		const query = get(eventQueries, [action, contentTypeSimplified, queryType]);
		const getVariablesFunc =
			GET_EVENT_QUERIES()?.[action]?.[contentTypeSimplified]?.variables ?? noop;
		const variables = getVariablesFunc(contentUuid, user);
		if (!query || !variables) {
			throw new CustomError('Failed to find query/variables in query lookup table');
		}
		const getResponseCount = get(eventQueries, [
			action,
			contentTypeSimplified,
			'getResponseCount',
		]);
		return { query, variables, getResponseCount };
	}

	public static async getMultipleViewCounts(
		contentIds: string[],
		type: EventContentTypeSimplified
	): Promise<{ [uuid: string]: number }> {
		const variables:
			| GetMultipleItemViewCountsQueryVariables
			| GetMultipleCollectionViewCountsQueryVariables = { uuids: contentIds };
		const response = await dataService.query<
			GetMultipleItemViewCountsQuery | GetMultipleCollectionViewCountsQuery,
			GetMultipleItemViewCountsQueryVariables | GetMultipleCollectionViewCountsQueryVariables
		>({
			query:
				type === 'item'
					? GetMultipleItemViewCountsDocument
					: GetMultipleCollectionViewCountsDocument,
			variables,
		});
		const items = response.items;
		return Object.fromEntries(items.map((item) => [item.id, item.count]));
	}

	private static async incrementCount(
		action: EventAction,
		contentType: EventContentType,
		contentUuid: string,
		user?: Avo.User.User | Avo.User.CommonUser,
		silent = true
	) {
		try {
			const { query, variables } = this.getQueryAndVariables(
				action,
				'increment',
				contentType,
				contentUuid,
				user
			);

			await dataService.query<
				| IncrementItemPlaysMutation
				| IncrementItemViewsMutation
				| IncrementCollectionViewsMutation
				| IncrementCollectionPlaysMutation,
				| IncrementItemPlaysMutationVariables
				| IncrementItemViewsMutationVariables
				| IncrementCollectionViewsMutationVariables
				| IncrementCollectionPlaysMutationVariables
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
					user,
				}
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
		objectInfos: BookmarkRequestInfo[]
	): Promise<BookmarkStatusLookup> {
		try {
			const groupedObjectInfos: {
				[type: string]: BookmarkRequestInfo[];
			} = groupBy(objectInfos, 'type');
			const itemObjectInfos: BookmarkRequestInfo[] = groupedObjectInfos['item'] || [];
			const collectionObjectInfos: BookmarkRequestInfo[] =
				groupedObjectInfos['collection'] || [];
			const assignmentObjectInfos: BookmarkRequestInfo[] =
				groupedObjectInfos['assignment'] || [];
			// Get list of item ids and collection ids from the object infos
			const itemUuids: string[] = itemObjectInfos.map((objectInfo) => objectInfo.uuid);
			const collectionUuids: string[] = collectionObjectInfos.map(
				(objectInfo) => objectInfo.uuid
			);
			const assignmentUuids: string[] = assignmentObjectInfos.map(
				(objectInfo) => objectInfo.uuid
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
				(itemBookmark: { item_id: string }) => itemBookmark.item_id
			);
			const collectionBookmarkIds = (response.app_collection_bookmarks ?? []).map(
				(itemBookmark: { collection_uuid: string }) => itemBookmark.collection_uuid
			);
			const assignmentBookmarkIds = (response.app_assignments_v2_bookmarks ?? []).map(
				(itemBookmark: { assignment_id: string }) => itemBookmark.assignment_id
			);
			// Map the ids that were found to the original id
			// if the id was found we set the isBookmarked status to true
			// if the id was not found we set the isBookmarked status to false
			const itemBookmarkStatuses: { [uuid: string]: boolean } = fromPairs(
				itemObjectInfos.map((objectInfo) => {
					return [objectInfo.uuid, itemBookmarkIds.includes(objectInfo.uuid)];
				})
			);
			const collectionBookmarkStatuses: { [uuid: string]: boolean } = fromPairs(
				collectionObjectInfos.map((objectInfo) => {
					return [objectInfo.uuid, collectionBookmarkIds.includes(objectInfo.uuid)];
				})
			);

			const assignmentBookmarkStatuses: { [uuid: string]: boolean } = fromPairs(
				assignmentObjectInfos.map((objectInfo) => {
					return [objectInfo.uuid, assignmentBookmarkIds.includes(objectInfo.uuid)];
				})
			);

			return {
				item: itemBookmarkStatuses,
				collection: collectionBookmarkStatuses,
				assignment: assignmentBookmarkStatuses,
			};
		} catch (err) {
			throw new CustomError('Failed to get bookmark statuses', err, {
				profileId,
				objectInfos,
				query: 'GET_BOOKMARK_STATUSES',
			});
		}
	}
}
