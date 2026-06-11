import { AvoUserCommonUser } from '@viaa/avo2-types';
import {
  type GetAssignmentViewCountQuery,
  type GetCollectionPlayCountQuery,
  type GetCollectionViewCountQuery,
  type GetItemPlayCountQuery,
  type GetItemViewCountQuery,
} from '../../generated/graphql-db-operations';
import {
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
} from '../../generated/graphql-db-react-query';
import {
  type EventAction,
  type EventContentType,
  type EventContentTypeSimplified,
} from './bookmarks-views-plays-service.types';

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
