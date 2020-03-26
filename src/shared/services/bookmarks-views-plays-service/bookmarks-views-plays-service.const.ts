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
import {
	BookmarkViewPlayCounts,
	EventActionExtended, EventContentType,
	EventContentTypeSimplified,
} from './bookmarks-views-plays-service.types';

export const DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS: BookmarkViewPlayCounts = {
	bookmarkCount: 0,
	viewCount: 0,
	playCount: 0,
	isBookmarked: false,
};

export interface QueryDefinition {
	query: any;
	variables: ((uuid: string, profileId: string) => any) | ((uuid: string) => any);
}

export const EVENT_QUERIES: {
	[action in EventActionExtended]: {
		[contentType in EventContentTypeSimplified]: QueryDefinition;
	};
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

export const CONTENT_TYPE_TO_EVENT_CONTENT_TYPE_SIMPLIFIED: { [type: string]: EventContentTypeSimplified } = {
	item: 'item',
	video: 'item',
	audio: 'item',
	collection: 'collection',
	collectie: 'collection',
	bundle: 'collection',
	bundel: 'collection',
	map: 'collection',
};

export const CONTENT_TYPE_TO_EVENT_CONTENT_TYPE: { [type: string]: EventContentType } = {
	item: 'item',
	video: 'item',
	audio: 'item',
	collection: 'collection',
	collectie: 'collection',
	bundle: 'bundle',
	bundel: 'bundle',
	map: 'bundle',
};
