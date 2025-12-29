import { AvoUserCommonUser } from '@viaa/avo2-types';
import {
  type DeleteAssignmentBookmarksForUserMutationVariables,
  type DeleteCollectionBookmarksForUserMutationVariables,
  type DeleteItemBookmarkMutationVariables,
  type GetAssignmentViewCountQuery,
  type GetCollectionPlayCountQuery,
  type GetCollectionViewCountQuery,
  type GetItemPlayCountQuery,
  type GetItemViewCountQuery,
  type InsertAssignmentBookmarkMutationVariables,
} from '../../generated/graphql-db-operations';
import {
  DeleteAssignmentBookmarksForUserDocument,
  DeleteCollectionBookmarksForUserDocument,
  DeleteItemBookmarkDocument,
  GetAssignmentViewCountDocument,
  GetCollectionPlayCountDocument,
  GetCollectionViewCountDocument,
  GetItemPlayCountDocument,
  GetItemViewCountDocument,
  IncrementAssignmentViewsDocument,
  IncrementCollectionPlaysDocument,
  IncrementCollectionViewsDocument,
  IncrementItemPlaysDocument,
  IncrementItemViewsDocument,
  InsertAssignmentBookmarkDocument,
  InsertCollectionBookmarkDocument,
  InsertItemBookmarkDocument,
} from '../../generated/graphql-db-react-query';
import {
  type BookmarkViewPlayCounts,
  type EventAction,
  type EventContentType,
  type EventContentTypeSimplified,
} from './bookmarks-views-plays-service.types';

export const DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS: BookmarkViewPlayCounts = {
  bookmarkCount: 0,
  viewCount: 0,
  playCount: 0,
  isBookmarked: false,
};

interface QueryDefinition {
  query?: string;
  get?: string;
  increment?: string;
  variables: (uuid: string, commonUser: AvoUserCommonUser | null) => any;
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
      variables: (itemUuid: string, commonUser: AvoUserCommonUser | null) => ({
        bookmarkItem: {
          item_id: itemUuid,
          profile_id: commonUser?.profileId || null,
        },
      }),
    },
    collection: {
      query: InsertCollectionBookmarkDocument,
      variables: (
        collectionUuid: string,
        commonUser: AvoUserCommonUser | null,
      ) => ({
        bookmarkItem: {
          collection_uuid: collectionUuid,
          profile_id: commonUser?.profileId || null,
        },
      }),
    },
    assignment: {
      query: InsertAssignmentBookmarkDocument,
      variables: (
        assignmentUuid: string,
        commonUser: AvoUserCommonUser | null,
      ): InsertAssignmentBookmarkMutationVariables => ({
        bookmarkAssignment: {
          assignment_id: assignmentUuid,
          profile_id: commonUser?.profileId || null,
        },
      }),
    },
    quick_lane: {
      // We can't bookmark quick lanes
      variables: () => ({}),
    },
  },
  unbookmark: {
    item: {
      query: DeleteItemBookmarkDocument,
      variables: (
        itemUuid: string,
        commonUser: AvoUserCommonUser | null,
      ): DeleteItemBookmarkMutationVariables => ({
        itemUuid,
        profileId: commonUser?.profileId || null,
      }),
    },
    collection: {
      query: DeleteCollectionBookmarksForUserDocument,
      variables: (
        collectionUuid: string,
        commonUser: AvoUserCommonUser | null,
      ): DeleteCollectionBookmarksForUserMutationVariables => ({
        collectionUuid: collectionUuid,
        profileId: commonUser?.profileId || null,
      }),
    },
    assignment: {
      query: DeleteAssignmentBookmarksForUserDocument,
      variables: (
        assignmentUuid: string,
        commonUser: AvoUserCommonUser | null,
      ): DeleteAssignmentBookmarksForUserMutationVariables => ({
        assignmentUuid,
        profileId: commonUser?.profileId || null,
      }),
    },
    quick_lane: {
      // We can't unbookmark quick lanes
      variables: () => ({}),
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
        response.app_item_meta[0]?.view_count?.count || 0,
    },
    collection: {
      get: GetCollectionViewCountDocument,
      increment: IncrementCollectionViewsDocument,
      variables: (collectionUuid: string) => ({
        collectionUuid,
      }),
      getResponseCount: (response: GetCollectionViewCountQuery): number =>
        response.app_collections[0]?.view_count?.count || 0,
    },
    assignment: {
      get: GetAssignmentViewCountDocument,
      increment: IncrementAssignmentViewsDocument,
      variables: (assignmentUuid: string) => ({
        assignmentUuid,
      }),
      getResponseCount: (response: GetAssignmentViewCountQuery): number =>
        response.app_assignments_v2[0]?.view_count?.count || 0,
    },
    quick_lane: {
      // We don't track totals for quick lanes, only tracking view events
      // https://meemoo.atlassian.net/browse/AVO-1827
      variables: () => ({}),
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
        response.app_item_meta[0]?.play_count?.count || 0,
    },
    collection: {
      get: GetCollectionPlayCountDocument,
      increment: IncrementCollectionPlaysDocument,
      variables: (collectionUuid: string) => ({
        collectionUuid,
      }),
      getResponseCount: (response: GetCollectionPlayCountQuery): number =>
        response.app_collections[0]?.play_count?.count || 0,
    },
    assignment: {
      variables: (assignmentUuid: string) => ({
        assignmentUuid,
      }),
    },
    quick_lane: {
      // We don't track totals for quick lanes, only tracking view events
      // https://meemoo.atlassian.net/browse/AVO-1827
      variables: () => ({}),
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

export const CONTENT_TYPE_TO_EVENT_CONTENT_TYPE: {
  [type: string]: EventContentType;
} = {
  item: 'item',
  video: 'item',
  audio: 'item',
  ITEM: 'item',
  collection: 'collection',
  collectie: 'collection',
  assignment: 'assignment',
  opdracht: 'assignment',
  bundle: 'bundle',
  bundel: 'bundle',
  map: 'bundle',
};
