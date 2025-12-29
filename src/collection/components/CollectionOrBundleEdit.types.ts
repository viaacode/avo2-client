import { AvoCollectionCollection, AvoCollectionFragment, } from '@viaa/avo2-types';
import type { ValueOf } from '../../shared/types';
import { type CollectionOrBundle } from '../collection.types';

export enum ReorderType {
  COLLECTION_FRAGMENTS = 'COLLECTION_FRAGMENTS',
  BUNDLE_COLLECTION_FRAGMENTS = 'BUNDLE_COLLECTION_FRAGMENTS',
  BUNDLE_ASSIGNMENT_FRAGMENTS = 'BUNDLE_ASSIGNMENT_FRAGMENTS',
}

export interface MarcomNoteInfo {
  id?: string | null;
  note: string;
}

export type FragmentPropUpdateAction = {
  type: 'UPDATE_FRAGMENT_PROP';
  index: number;
  fragmentProp: keyof AvoCollectionFragment;
  fragmentPropValue: ValueOf<AvoCollectionFragment>;
};

export type FragmentSwapAction = {
  type: 'SWAP_FRAGMENTS';
  index: number;
  direction: 'up' | 'down';
};

export type FragmentInsertAction = {
  type: 'INSERT_FRAGMENT';
  index: number;
  fragment: AvoCollectionFragment;
};

export type FragmentDeleteAction = {
  type: 'DELETE_FRAGMENT';
  index: number;
};

export type CollectionUpdateAction = {
  type: 'UPDATE_COLLECTION';
  newCollection: AvoCollectionCollection | null;
};

export type CollectionPropUpdateAction = {
  type: 'UPDATE_COLLECTION_PROP';
  collectionProp: keyof AvoCollectionCollection | string; // nested values are also allowed
  collectionPropValue: ValueOf<AvoCollectionCollection> | MarcomNoteInfo; // marcom note only exists on collection object in the client
  updateInitialCollection?: boolean;
};

export type CollectionResetAction = {
  type: 'RESET_COLLECTION';
};

export type CollectionAction =
  | FragmentPropUpdateAction
  | FragmentSwapAction
  | FragmentInsertAction
  | FragmentDeleteAction
  | CollectionUpdateAction
  | CollectionPropUpdateAction
  | CollectionResetAction;

export interface CollectionState {
  currentCollection: AvoCollectionCollection | null;
  initialCollection: AvoCollectionCollection | null;
}

export interface CollectionOrBundleEditProps {
  type: CollectionOrBundle;
}
