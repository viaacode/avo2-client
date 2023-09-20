import { type Avo } from '@viaa/avo2-types';

import {
	DeleteAssignmentBookmarksForUserMutationVariables,
	DeleteCollectionBookmarksForUserMutationVariables,
	DeleteItemBookmarkMutationVariables,
	GetCollectionPlayCountQuery,
	GetCollectionViewCountQuery,
	GetItemPlayCountQuery,
	GetItemViewCountQuery,
	InsertAssignmentBookmarkMutationVariables,
} from '../../generated/graphql-db-operations';
import {
	DeleteAssignmentBookmarksForUserDocument,
	DeleteCollectionBookmarksForUserDocument,
	DeleteItemBookmarkDocument,
	GetCollectionPlayCountDocument,
	GetCollectionViewCountDocument,
	GetItemPlayCountDocument,
	GetItemViewCountDocument,
	IncrementCollectionPlaysDocument,
	IncrementCollectionViewsDocument,
	IncrementItemPlaysDocument,
	IncrementItemViewsDocument,
	InsertAssignmentBookmarkDocument,
	InsertCollectionBookmarkDocument,
	InsertItemBookmarkDocument,
} from '../../generated/graphql-db-react-query';

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
	variables: (uuid: string, user?: Avo.User.User | Avo.User.CommonUser) => any;
	getResponseCount?: (response: any) => number;
}

export const GET_EVENT_QUERIES: () => {
	/* eslint-disable @typescript-eslint/no-unused-vars */
	[action in EventAction]: {
		[contentType in EventContentTypeSimplified]: QueryDefinition;
		/* eslint-enable @typescript-eslint/no-unused-vars */
	};
} = () => ({
	bookmark: {
		item: {
			query: InsertItemBookmarkDocument,
			variables: (itemUuid: string, user?: Avo.User.User | Avo.User.CommonUser) => ({
				bookmarkItem: {
					item_id: itemUuid,
					profile_id:
						(user as Avo.User.User)?.profile?.id ||
						(user as Avo.User.CommonUser)?.profileId ||
						null,
				},
			}),
		},
		collection: {
			query: InsertCollectionBookmarkDocument,
			variables: (collectionUuid: string, user?: Avo.User.User | Avo.User.CommonUser) => ({
				bookmarkItem: {
					collection_uuid: collectionUuid,
					profile_id:
						(user as Avo.User.User)?.profile?.id ||
						(user as Avo.User.CommonUser)?.profileId ||
						null,
				},
			}),
		},
		assignment: {
			query: InsertAssignmentBookmarkDocument,
			variables: (
				assignmentUuid: string,
				user?: Avo.User.User | Avo.User.CommonUser
			): InsertAssignmentBookmarkMutationVariables => ({
				bookmarkAssignment: {
					assignment_id: assignmentUuid,
					profile_id:
						(user as Avo.User.User)?.profile?.id ||
						(user as Avo.User.CommonUser)?.profileId ||
						null,
				},
			}),
		},
	},
	unbookmark: {
		item: {
			query: DeleteItemBookmarkDocument,
			variables: (
				itemUuid: string,
				user?: Avo.User.User | Avo.User.CommonUser
			): DeleteItemBookmarkMutationVariables => ({
				itemUuid,
				profileId:
					(user as Avo.User.User)?.profile?.id ||
					(user as Avo.User.CommonUser)?.profileId ||
					null,
			}),
		},
		collection: {
			query: DeleteCollectionBookmarksForUserDocument,
			variables: (
				collectionUuid: string,
				user?: Avo.User.User | Avo.User.CommonUser
			): DeleteCollectionBookmarksForUserMutationVariables => ({
				collectionUuid: collectionUuid,
				profileId:
					(user as Avo.User.User)?.profile?.id ||
					(user as Avo.User.CommonUser)?.profileId ||
					null,
			}),
		},
		assignment: {
			query: DeleteAssignmentBookmarksForUserDocument,
			variables: (
				assignmentUuid: string,
				user?: Avo.User.User | Avo.User.CommonUser
			): DeleteAssignmentBookmarksForUserMutationVariables => ({
				assignmentUuid,
				profileId:
					(user as Avo.User.User)?.profile?.id ||
					(user as Avo.User.CommonUser)?.profileId ||
					null,
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
			getResponseCount: (response: GetItemViewCountQuery): number =>
				response.app_item_meta[0]?.view_counts?.[0]?.count || 0,
		},
		collection: {
			get: GetCollectionViewCountDocument,
			increment: IncrementCollectionViewsDocument,
			variables: (collectionUuid: string) => ({
				collectionUuid,
			}),
			getResponseCount: (response: GetCollectionViewCountQuery): number =>
				response.app_collections[0]?.view_counts?.[0]?.count || 0,
		},
		// TODO: Add request views of an assignment https://meemoo.atlassian.net/browse/AVO-2725
		assignment: {
			get: '',
			increment: '',
			variables: (assignmentUuid: string) => ({
				assignmentUuid,
			}),
		},
	},
	play: {
		item: {
			get: GetItemPlayCountDocument,
			increment: IncrementItemPlaysDocument,
			variables: (itemUuid: string) => ({
				itemUuid,
			}),
			getResponseCount: (response: GetItemPlayCountQuery): number =>
				response.app_item_meta[0]?.play_counts?.[0]?.count || 0,
		},
		collection: {
			get: GetCollectionPlayCountDocument,
			increment: IncrementCollectionPlaysDocument,
			variables: (collectionUuid: string) => ({
				collectionUuid,
			}),
			getResponseCount: (response: GetCollectionPlayCountQuery): number =>
				response.app_collections[0]?.play_counts?.[0]?.count || 0,
		},
		// TODO: Add request plays of an assignment https://meemoo.atlassian.net/browse/AVO-2725
		assignment: {
			get: '',
			increment: '',
			variables: (assignmentUuid: string) => ({
				assignmentUuid,
			}),
		},
	},
});

export const CONTENT_TYPE_TO_EVENT_CONTENT_TYPE_SIMPLIFIED: {
	[type: string]: EventContentTypeSimplified;
} = {
	item: 'item',
	video: 'item',
	audio: 'item',
	collection: 'collection',
	collectie: 'collection',
	assignment: 'assignment',
	opdracht: 'assignment',
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
	assignment: 'assignment',
	opdracht: 'assignment',
	bundle: 'bundle',
	bundel: 'bundle',
	map: 'bundle',
};
