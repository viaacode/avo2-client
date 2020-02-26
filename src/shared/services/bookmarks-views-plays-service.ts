import { compact, get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { ContentTypeNumber } from '../../collection/collection.types';
import { CustomError, normalizeTimestamp } from '../helpers';
import i18n from '../translations/i18n';
import {
	AppCollectionBookmark,
	AppItemBookmark,
	BookmarkInfo,
	BookmarkViewPlayCounts,
	EVENT_QUERIES,
	EventAction,
	EventContentType,
	EventContentTypeSimplified,
	EventInitAction,
	GetBookmarksForUserResponse,
} from './bookmarks-views-plays-service.const';
import {
	GET_BOOKMARKS_FOR_USER,
	GET_COLLECTION_BOOKMARK_VIEW_PLAY_COUNTS,
	GET_ITEM_BOOKMARK_VIEW_PLAY_COUNTS,
	GET_MULTIPLE_COLLECTION_VIEW_COUNTS,
	GET_MULTIPLE_ITEM_VIEW_COUNTS,
} from './bookmarks-views-plays-service.gql';
import { ApolloCacheManager, dataService } from './data-service';
import toastService from './toast-service';

export class BookmarksViewsPlaysService {
	public static async action(
		action: EventAction,
		contentType: EventContentType,
		contentUuid: string,
		user?: Avo.User.User,
		silent: boolean = true
	): Promise<void> {
		try {
			// bundle is handled the same way as a collection
			const contentTypeSimplified = contentType === 'bundle' ? 'collection' : contentType;

			const mutation = get(EVENT_QUERIES, [action, contentTypeSimplified, 'query']);
			const variables = get(EVENT_QUERIES, [action, contentTypeSimplified, 'variables'], () => {})(
				contentUuid,
				get(user, 'profile.id')
			);
			if (!mutation || !variables) {
				throw new CustomError('Failed to find query/variables in query lookup table');
			}

			const response = await dataService.mutate({
				mutation,
				variables,
				update: ApolloCacheManager.clearBookmarksViewsPlays,
			});

			if (response.errors) {
				throw new CustomError('Graphql errors', null, { errors: response.errors });
			}

			if (
				response.data &&
				get(response, ['data', Object.keys(response.data)[0], 'affected_rows']) === 0
			) {
				if (action === 'play' || action === 'view') {
					// No row exists yet that can be increased, we should add a row with count = 1
					this.insertInitialCount(
						`${action}Init` as EventInitAction,
						contentType,
						contentUuid,
						user,
						silent
					);
				} else {
					// Bookmark related action failed
					console.error('Failed to store action into the database', null, {
						response,
						variables,
					});
					toastService.danger(
						action === 'bookmark'
							? i18n.t('Het aanmaken van de bladwijzer is mislukt')
							: i18n.t('Het verwijderen van de bladwijzer is mislukt')
					);
				}
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
		const response = await dataService.query({
			query: GET_ITEM_BOOKMARK_VIEW_PLAY_COUNTS,
			variables: { itemUuid, profileId: get(user, 'profile.id', null) },
		});
		const isBookmarked = !!get(response, 'data.app_item_bookmarks[0]');
		const bookmarkCount = get(response, 'data.app_item_bookmarks_aggregate.aggregate.count', 0);
		const viewCount = get(response, 'data.app_item_views[0].count', 0);
		const playCount = get(response, 'data.app_item_plays[0].count', 0);
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
		const response = await dataService.query({
			query: GET_COLLECTION_BOOKMARK_VIEW_PLAY_COUNTS,
			variables: { collectionUuid, profileId: get(user, 'profile.id', null) },
		});
		const isBookmarked = !!get(response, 'data.app_collection_bookmarks[0]');
		const bookmarkCount = get(
			response,
			'data.app_collection_bookmarks_aggregate.aggregate.count',
			0
		);
		const viewCount = get(response, 'data.app_collection_views[0].count', 0);
		const playCount = get(response, 'data.app_collection_plays[0].count', 0);
		return {
			bookmarkCount,
			viewCount,
			playCount,
			isBookmarked,
		};
	}

	/**
	 * Toggles the bookmark for the provided item or collection or bundle
	 * @param contentId
	 * @param user
	 * @param type
	 * @param isBookmarked
	 * @return {boolean} returns true of the operation was successful, otherwise false
	 */
	public static async toggleBookmark(
		contentId: string,
		user: Avo.User.User,
		type: EventContentType,
		isBookmarked: boolean
	): Promise<boolean> {
		try {
			if (!contentId) {
				throw new CustomError(
					`Failed to bookmark ${type} because the ${type} doesn't seem to be loaded yet`,
					null,
					{ contentId }
				);
			}
			if (isBookmarked) {
				await BookmarksViewsPlaysService.action('unbookmark', type, contentId, user, false);
			} else {
				await BookmarksViewsPlaysService.action('bookmark', type, contentId, user, false);
			}
			return true;
		} catch (err) {
			console.error('Failed to bookmark/unbookmark the item', err, { contentId });
			toastService.danger(
				isBookmarked
					? i18n.t('Het aanmaken van de bladwijzer is mislukt')
					: i18n.t('Het verwijderen van de bladwijzer is mislukt')
			);
			return false;
		}
	}

	/**
	 * Gets all bookmarks for user without pagination
	 * since we cannot order items across both tables: item_bookmarks and collection_bookmarks
	 * @param user
	 */
	public static async getAllBookmarksForUser(user: Avo.User.User): Promise<BookmarkInfo[]> {
		const response: GetBookmarksForUserResponse = await dataService.query({
			query: GET_BOOKMARKS_FOR_USER,
			variables: { profileId: get(user, 'profile.id') },
		});
		const itemBookmarks: AppItemBookmark[] = get(response, 'data.app_item_bookmarks', []);
		const collectionBookmarks: AppCollectionBookmark[] = get(
			response,
			'data.app_collection_bookmarks',
			[]
		);
		const itemViews = await this.getMultipleViewCounts(
			itemBookmarks.map(b => b.item_id),
			'item'
		);
		const collectionViews = await this.getMultipleViewCounts(
			collectionBookmarks.map(b => b.collection_uuid),
			'collection'
		);
		const itemBookmarkInfos: (BookmarkInfo | null)[] = itemBookmarks.map(
			(itemBookmark): BookmarkInfo | null => {
				if (!itemBookmark.bookmarkedItem) {
					return null;
				}
				return {
					contentId: itemBookmark.item_id,
					contentType: 'item',
					createdAt: normalizeTimestamp(itemBookmark.created_at)
						.toDate()
						.getTime(),
					contentTitle: itemBookmark.bookmarkedItem.title,
					contentThumbnailPath: itemBookmark.bookmarkedItem.thumbnail_path,
					contentCreatedAt: normalizeTimestamp(itemBookmark.bookmarkedItem.issued)
						.toDate()
						.getTime(),
					contentViews: itemViews[itemBookmark.item_id] || 0,
				};
			}
		);
		const collectionBookmarkInfos: (BookmarkInfo | null)[] = collectionBookmarks.map(
			(collectionBookmark): BookmarkInfo | null => {
				if (!collectionBookmark.bookmarkedCollection) {
					return null;
				}
				return {
					contentId: collectionBookmark.collection_uuid,
					contentType:
						collectionBookmark.bookmarkedCollection.type_id === ContentTypeNumber.collection
							? 'collection'
							: 'bundle',
					createdAt: normalizeTimestamp(collectionBookmark.created_at)
						.toDate()
						.getTime(),
					contentTitle: collectionBookmark.bookmarkedCollection.title,
					contentThumbnailPath: collectionBookmark.bookmarkedCollection.thumbnail_path,
					contentCreatedAt: normalizeTimestamp(collectionBookmark.bookmarkedCollection.created_at)
						.toDate()
						.getTime(),
					contentViews: collectionViews[collectionBookmark.collection_uuid] || 0,
				};
			}
		);
		return [...compact(itemBookmarkInfos), ...compact(collectionBookmarkInfos)];
	}

	public static async getMultipleViewCounts(
		contentIds: string[],
		type: EventContentTypeSimplified
	): Promise<{ [uuid: string]: number }> {
		const response = await dataService.query({
			query: type === 'item' ? GET_MULTIPLE_ITEM_VIEW_COUNTS : GET_MULTIPLE_COLLECTION_VIEW_COUNTS,
			variables: { uuids: contentIds },
		});
		const items = get(response, 'data.items', []);
		return Object.fromEntries(
			items.map((item: { id: string; count: number }) => [item.id, item.count])
		);
	}

	private static async insertInitialCount(
		action: EventInitAction,
		contentType: EventContentType,
		contentUuid: string,
		user?: Avo.User.User,
		silent: boolean = true
	) {
		try {
			// bundle is handled the same way as a collection
			const contentTypeSimplified = contentType === 'bundle' ? 'collection' : contentType;

			const mutation = get(EVENT_QUERIES, [action, contentTypeSimplified, 'query']);
			const geVariablesFunc = get(
				EVENT_QUERIES,
				[action, contentTypeSimplified, 'variables'],
				() => {}
			) as (uuid: string) => any;
			const variables = geVariablesFunc(contentUuid);
			if (!mutation || !variables) {
				throw new CustomError('Failed to find query/variables in query lookup table');
			}

			const response = await dataService.mutate({
				mutation,
				variables,
				update: ApolloCacheManager.clearBookmarksViewsPlays,
			});

			if (response.errors) {
				throw new CustomError('Graphql errors', null, { errors: response.errors });
			}
		} catch (err) {
			const error = new CustomError('Failed to initialize view/play count in the database', err, {
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
}
