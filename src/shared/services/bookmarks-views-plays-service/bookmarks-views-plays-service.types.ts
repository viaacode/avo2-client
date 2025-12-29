import { AvoContentTypeEnglish } from '@viaa/avo2-types';

export interface BookmarkRequestInfo {
  type: EventContentTypeSimplified;
  uuid: string;
}

export type BookmarkStatusLookup = {
  [contentType in EventContentTypeSimplified]: {
    [objectUuid: string]: boolean;
  };
};

export interface BookmarkInfo {
  createdAt: number; // Bookmark created at date
  contentId: string;
  contentLinkId: string;
  contentDescription: string;
  contentType: AvoContentTypeEnglish;
  contentTitle: string;
  contentDuration?: string;
  contentThumbnailPath: string | null | undefined;
  contentCreatedAt: number | null;
  contentViews: number;
  contentOrganisation?: string | null | undefined;
}

export interface BookmarkViewPlayCounts {
  bookmarkCount: number;
  viewCount: number;
  playCount: number;
  isBookmarked: boolean;
}

export interface AppItemBookmark {
  bookmarkedItem?: {
    title: string;
    description: string;
    thumbnail_path: string;
    duration: string;
    issued: string;
    item: {
      external_id: string;
      description: string;
      item_meta: {
        organisation: {
          name: string;
        };
        type: {
          label: string;
        };
      };
    };
    view_counts: {
      count: number;
    }[];
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
    view_count: {
      count: number;
    }[];
  };
  collection_uuid: string;
  created_at: string;
}

export interface AppAssignmentBookmark {
  assignment?: {
    title: string;
    thumbnail_path?: string;
    created_at: string;
    type_id: number;
    view_count: {
      count: number;
    };
  };
  assignment_id: string;
  created_at: string;
}

export type EventAction = 'bookmark' | 'unbookmark' | 'view' | 'play';
export type QueryType = 'query' | 'get' | 'increment';
export type EventContentTypeSimplified =
  | 'item'
  | 'collection'
  | 'assignment'
  | 'quick_lane';
export type EventContentType = EventContentTypeSimplified | 'bundle';
