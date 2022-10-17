import { Avo } from '@viaa/avo2-types';
import { get } from 'lodash-es';

import {
	DeleteCollectionBookmarksForUserDocument,
	DeleteCollectionBookmarksForUserMutationVariables,
	DeleteItemBookmarkDocument,
	DeleteItemBookmarkMutationVariables,
	GetCollectionPlayCountDocument,
	GetCollectionViewCountDocument,
	GetItemPlayCountDocument,
	GetItemViewCountDocument,
	IncrementCollectionPlaysDocument,
	IncrementCollectionViewsDocument,
	IncrementItemPlaysDocument,
	IncrementItemViewsDocument,
	InsertCollectionBookmarkDocument,
	InsertItemBookmarkDocument,
} from '../../generated/graphql-db-types';

import {
	BookmarkViewPlayCounts,
	EventAction,
	EventContentType,
	EventContentTypeSimplified,
} from './bookmarks-views-plays-service.types';

export const DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS: BookmarkViewPlayCounts = {
	bookmarkCount: 0,
	viewCount: 0,
	playCount: 0,
	isBookmarked: false,
};

export interface QueryDefinition {
	query?: string;
	get?: string;
	increment?: string;
	variables: (uuid: string, user?: Avo.User.User) => any;
	responsePath?: string;
}

export const EVENT_QUERIES: {
	/* eslint-disable @typescript-eslint/no-unused-vars */
	[action in EventAction]: {
		[contentType in EventContentTypeSimplified]: QueryDefinition;
		/* eslint-enable @typescript-eslint/no-unused-vars */
	};
} = {
	bookmark: {
		item: {
			query: InsertItemBookmarkDocument,
			variables: (itemUuid: string, user?: Avo.User.User) => ({
				bookmarkItem: {
					item_id: itemUuid,
					profile_id: get(user, 'profile.id', null),
				},
			}),
		},
		collection: {
			query: InsertCollectionBookmarkDocument,
			variables: (collectionUuid: string, user?: Avo.User.User) => ({
				bookmarkItem: {
					collection_uuid: collectionUuid,
					profile_id: get(user, 'profile.id', null),
				},
			}),
		},
	},
	unbookmark: {
		item: {
			query: DeleteItemBookmarkDocument,
			variables: (
				itemUuid: string,
				user?: Avo.User.User
			): DeleteItemBookmarkMutationVariables => ({
				itemUuid,
				profileId: user?.profile?.id || null,
			}),
		},
		collection: {
			query: DeleteCollectionBookmarksForUserDocument,
			variables: (
				collectionUuid: string,
				user?: Avo.User.User
			): DeleteCollectionBookmarksForUserMutationVariables => ({
				collectionUuid,
				profileId: user?.profile?.id || null,
			}),
		},
	},
	view: {
		item: {
			get: GetItemViewCountDocument,
			increment: IncrementItemViewsDocument,
			variables: (itemUuid: string) => ({
				itemUuid,
			}),
			responsePath: 'data.app_item_meta[0].view_counts[0].count',
		},
		collection: {
			get: GetCollectionViewCountDocument,
			increment: IncrementCollectionViewsDocument,
			variables: (collectionUuid: string) => ({
				collectionUuid,
			}),
			responsePath: 'data.app_collections[0].view_counts[0].count',
		},
	},
	play: {
		item: {
			get: GetItemPlayCountDocument,
			increment: IncrementItemPlaysDocument,
			variables: (itemUuid: string) => ({
				itemUuid,
			}),
			responsePath: 'data.app_item_meta[0].play_counts[0].count',
		},
		collection: {
			get: GetCollectionPlayCountDocument,
			increment: IncrementCollectionPlaysDocument,
			variables: (collectionUuid: string) => ({
				collectionUuid,
			}),
			responsePath: 'data.app_collections[0].play_counts[0].count',
		},
	},
};

export const CONTENT_TYPE_TO_EVENT_CONTENT_TYPE_SIMPLIFIED: {
	[type: string]: EventContentTypeSimplified;
} = {
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
