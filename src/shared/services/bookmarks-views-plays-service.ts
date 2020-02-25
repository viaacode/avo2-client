import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { CustomError } from '../helpers';
import i18n from '../translations/i18n';
import {
	GET_COLLECTION_BOOKMARK_VIEW_PLAY_COUNTS,
	GET_ITEM_BOOKMARK_VIEW_PLAY_COUNTS,
	GET_MULTIPLE_COLLECTION_VIEW_COUNTS,
	GET_MULTIPLE_ITEM_VIEW_COUNTS,
	INCREMENT_COLLECTION_PLAYS,
	INCREMENT_COLLECTION_VIEWS,
	INCREMENT_ITEM_PLAYS,
	INCREMENT_ITEM_VIEWS,
	INIT_COLLECTION_PLAYS,
	INIT_COLLECTION_VIEWS,
	INIT_ITEM_PLAYS,
	INIT_ITEM_VIEWS,
	INSERT_COLLECTION_BOOKMARK,
	INSERT_ITEM_BOOKMARK,
	REMOVE_COLLECTION_BOOKMARK,
	REMOVE_ITEM_BOOKMARK,
} from './bookmarks-views-plays-service.gql';
import { ApolloCacheManager, dataService } from './data-service';
import toastService from './toast-service';
const { print } = require('graphql/language/printer');

export interface BookmarkViewPlayCounts {
	bookmarkCount: number;
	viewCount: number;
	playCount: number;
	isBookmarked: boolean;
}

export const DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS: BookmarkViewPlayCounts = {
	bookmarkCount: 0,
	viewCount: 0,
	playCount: 0,
	isBookmarked: false,
};

type EventAction = 'bookmark' | 'unbookmark' | 'view' | 'play';
type EventInitAction = 'viewInit' | 'playInit';
type EventActionExtended = EventAction | EventInitAction;
type EventContentTypeSimplified = 'item' | 'collection';
type EventContentType = EventContentTypeSimplified | 'bundle';

interface QueryDefinition {
	query: any;
	variables: ((uuid: string, profileId: string) => any) | ((uuid: string) => any);
}

const EVENT_QUERIES: {
	[action in EventActionExtended]: { [contentType in EventContentTypeSimplified]: QueryDefinition };
} = {
	bookmark: {
		item: {
			query: INSERT_ITEM_BOOKMARK,
			variables: (itemUuid: string, profileId: string) => ({
				bookmarkItem: {
					item_id: itemUuid,
					profile_id: profileId,
				},
			}),
		},
		collection: {
			query: INSERT_COLLECTION_BOOKMARK,
			variables: (collectionUuid: string, profileId: string) => ({
				bookmarkItem: {
					collection_uuid: collectionUuid,
					profile_id: profileId,
				},
			}),
		},
	},
	unbookmark: {
		item: {
			query: REMOVE_ITEM_BOOKMARK,
			variables: (itemUuid: string, profileId: string) => ({
				itemUuid,
				profileId,
			}),
		},
		collection: {
			query: REMOVE_COLLECTION_BOOKMARK,
			variables: (collectionUuid: string, profileId: string) => ({
				collectionUuid,
				profileId,
			}),
		},
	},
	view: {
		item: {
			query: INCREMENT_ITEM_VIEWS,
			variables: (itemUuid: string) => ({
				itemUuid,
			}),
		},
		collection: {
			query: INCREMENT_COLLECTION_VIEWS,
			variables: (collectionUuid: string) => ({
				collectionUuid,
			}),
		},
	},
	play: {
		item: {
			query: INCREMENT_ITEM_PLAYS,
			variables: (itemUuid: string) => ({
				itemUuid,
			}),
		},
		collection: {
			query: INCREMENT_COLLECTION_PLAYS,
			variables: (collectionUuid: string) => ({
				collectionUuid,
			}),
		},
	},
	viewInit: {
		item: {
			query: INIT_ITEM_VIEWS,
			variables: (itemUuid: string) => ({
				itemUuid,
			}),
		},
		collection: {
			query: INIT_COLLECTION_VIEWS,
			variables: (collectionUuid: string) => ({
				collectionUuid,
			}),
		},
	},
	playInit: {
		item: {
			query: INIT_ITEM_PLAYS,
			variables: (itemUuid: string) => ({
				itemUuid,
			}),
		},
		collection: {
			query: INIT_COLLECTION_PLAYS,
			variables: (collectionUuid: string) => ({
				collectionUuid,
			}),
		},
	},
};

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
			console.log('query', print(mutation));
			console.log('variables', variables);

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
						query: print(mutation),
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
		type: EventContentTypeSimplified,
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
