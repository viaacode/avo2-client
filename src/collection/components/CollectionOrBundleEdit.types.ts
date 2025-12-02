import type { Avo } from '@viaa/avo2-types';

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
  fragmentProp: keyof Avo.Collection.Fragment;
  fragmentPropValue: ValueOf<Avo.Collection.Fragment>;
};

export type FragmentSwapAction = {
  type: 'SWAP_FRAGMENTS';
  index: number;
  direction: 'up' | 'down';
};

export type FragmentInsertAction = {
  type: 'INSERT_FRAGMENT';
  index: number;
  fragment: Avo.Collection.Fragment;
};

export type FragmentDeleteAction = {
  type: 'DELETE_FRAGMENT';
  index: number;
};

export type CollectionUpdateAction = {
  type: 'UPDATE_COLLECTION';
  newCollection: Avo.Collection.Collection | null;
};

export type CollectionPropUpdateAction = {
  type: 'UPDATE_COLLECTION_PROP';
  collectionProp: keyof Avo.Collection.Collection | string; // nested values are also allowed
  collectionPropValue: ValueOf<Avo.Collection.Collection> | MarcomNoteInfo; // marcom note only exists on collection object in the client
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
  currentCollection: Avo.Collection.Collection | null;
  initialCollection: Avo.Collection.Collection | null;
}

export interface CollectionOrBundleEditProps {
  type: CollectionOrBundle;
}
