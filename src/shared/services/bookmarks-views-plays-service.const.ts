import {
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

export interface BookmarkInfo {
	createdAt: number;
	contentId: string;
	contentLinkId: string;
	contentType: EventContentType;
	contentTitle: string;
	contentThumbnailPath: string | null | undefined;
	contentCreatedAt: number;
	contentViews: number;
}

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

export interface GetBookmarksForUserResponse {
	data: {
		app_item_bookmarks: AppItemBookmark[];
		app_collection_bookmarks: AppCollectionBookmark[];
	};
}

export interface AppItemBookmark {
	bookmarkedItem?: {
		title: string;
		thumbnail_path: string;
		issued: string;
		item: {
			external_id: string;
		};
	};
	item_id: string;
	created_at: string;
}

export interface AppCollectionBookmark {
	bookmarkedCollection?: {
		title: string;
		thumbnail_path?: string;
		created_at: string;
		type_id: number;
	};
	collection_uuid: string;
	created_at: string;
}

export type EventAction = 'bookmark' | 'unbookmark' | 'view' | 'play';
export type EventInitAction = 'viewInit' | 'playInit';
export type EventActionExtended = EventAction | EventInitAction;
export type EventContentTypeSimplified = 'item' | 'collection';
export type EventContentType = EventContentTypeSimplified | 'bundle';

export interface QueryDefinition {
	query: any;
	variables: ((uuid: string, profileId: string) => any) | ((uuid: string) => any);
}

export const EVENT_QUERIES: {
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
